import { del } from "@vercel/blob";
import { type NextRequest, NextResponse } from "next/server";

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function DELETE(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return errorResponse("Authorization token required", 401);

  try {
    const { files } = await request.json();
    if (!Array.isArray(files) || files.length === 0)
      return errorResponse("No files provided");

    await Promise.all(files.map((p: string) => del(p, { token })));
    return NextResponse.json({ success: true, deleted: files });
  } catch (err: any) {
    console.error("[Blob API][DELETE]", err);
    return errorResponse(err.message || "Failed to delete files", 500);
  }
}
