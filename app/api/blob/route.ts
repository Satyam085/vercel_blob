import { list, put } from "@vercel/blob";
import { type NextRequest, NextResponse } from "next/server";

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return errorResponse("Authorization token required", 401);

  try {
    const { blobs } = await list({ token });
    return NextResponse.json({ success: true, data: blobs });
  } catch (err: any) {
    console.error("[Blob API][LIST]", err);
    return errorResponse(err.message || "Failed to list files", 500);
  }
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return errorResponse("Authorization token required", 401);

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const pathname = (formData.get("pathname") as string) || file?.name;

    if (!file) return errorResponse("File is required");
    if (!pathname || pathname.includes(".."))
      return errorResponse("Invalid pathname");

    const blob = await put(pathname, file, { access: "public", token });
    return NextResponse.json({
      success: true,
      data: { ...blob, url: blob.url },
    });
  } catch (err: any) {
    console.error("[Blob API][UPLOAD]", err);
    return errorResponse(err.message || "Failed to upload file", 500);
  }
}
