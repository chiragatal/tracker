import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generatePresignedUrl } from "@/lib/r2/upload";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fileType } = await request.json();

  if (!fileType || !fileType.startsWith("image/")) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  const { uploadUrl, publicUrl } = await generatePresignedUrl(fileType);
  return NextResponse.json({ uploadUrl, publicUrl });
}
