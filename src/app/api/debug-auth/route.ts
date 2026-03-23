import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // List all cookies (names only, not values for security)
  const cookies = request.cookies.getAll().map(c => ({
    name: c.name,
    valueLength: c.value.length,
    hasNewlines: c.value.includes("\n") || c.value.includes("\r"),
    hasNullBytes: c.value.includes("\0"),
    // Check for non-ASCII characters
    hasNonAscii: /[^\x20-\x7E]/.test(c.value),
    // First 20 chars for debugging
    preview: c.value.substring(0, 20) + "...",
  }));

  return NextResponse.json({
    cookieCount: cookies.length,
    cookies,
    url: request.url,
    method: request.method,
  });
}
