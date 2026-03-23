import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

function getS3Client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

function getUserIdFromCookie(request: NextRequest): string | null {
  // Read the Supabase auth cookie and decode the JWT to get user ID
  // Cookie name pattern: sb-<project-ref>-auth-token
  const authCookie = request.cookies.getAll().find(c => c.name.includes("auth-token"));
  if (!authCookie) return null;

  try {
    let tokenValue = authCookie.value;

    // Supabase SSR stores as base64-encoded JSON
    if (tokenValue.startsWith("base64-")) {
      tokenValue = Buffer.from(tokenValue.slice(7), "base64").toString("utf-8");
    }

    // Parse the session JSON
    const session = JSON.parse(tokenValue);
    const accessToken = session?.access_token;
    if (!accessToken) return null;

    // Decode the JWT payload (middle part) to get user ID
    const parts = accessToken.split(".");
    if (parts.length !== 3) return null;

    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8"));
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const userId = getUserIdFromCookie(request);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!checkRateLimit(`upload:${userId}`, 20)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file || !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  }

  const ext = file.type.split("/")[1] || "jpg";
  const key = `uploads/${randomUUID()}.${ext}`;

  try {
    // Debug: check env vars for invalid characters
    const envDebug = {
      hasAccountId: !!process.env.R2_ACCOUNT_ID,
      hasAccessKey: !!process.env.R2_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.R2_SECRET_ACCESS_KEY,
      hasBucket: !!process.env.R2_BUCKET_NAME,
      hasPublicUrl: !!process.env.R2_PUBLIC_URL,
      accessKeyLength: process.env.R2_ACCESS_KEY_ID?.length,
      secretKeyLength: process.env.R2_SECRET_ACCESS_KEY?.length,
      accessKeyHasNewline: process.env.R2_ACCESS_KEY_ID?.includes("\n"),
      secretKeyHasNewline: process.env.R2_SECRET_ACCESS_KEY?.includes("\n"),
      accountIdHasNewline: process.env.R2_ACCOUNT_ID?.includes("\n"),
    };
    console.log("R2 env debug:", JSON.stringify(envDebug));

    const buffer = Buffer.from(await file.arrayBuffer());

    await getS3Client().send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    );

    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;
    return NextResponse.json({ publicUrl });
  } catch (err) {
    console.error("R2 upload error:", err);
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({
      error: message,
      debug: {
        hasAccountId: !!process.env.R2_ACCOUNT_ID,
        hasAccessKey: !!process.env.R2_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.R2_SECRET_ACCESS_KEY,
        hasBucket: !!process.env.R2_BUCKET_NAME,
        accessKeyLen: process.env.R2_ACCESS_KEY_ID?.trim().length,
        secretKeyLen: process.env.R2_SECRET_ACCESS_KEY?.trim().length,
      }
    }, { status: 500 });
  }
}
