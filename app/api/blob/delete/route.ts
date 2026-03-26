import { del } from "@vercel/blob";
import { type NextRequest, NextResponse } from "next/server";

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function DELETE(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return errorResponse("Authorization token required", 401);

  try {
    const { urls } = await request.json();
    if (!Array.isArray(urls) || urls.length === 0)
      return errorResponse("No file URLs provided");

    await del(urls, { token });
    return NextResponse.json({ success: true, deleted: urls });
  } catch (err: any) {
    console.error("[Blob API][DELETE]", err);
    return errorResponse(err.message || "Failed to delete files", 500);
  }
}
