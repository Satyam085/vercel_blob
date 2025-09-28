// app/api/blob/route.ts

import { list, put } from "@vercel/blob";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json(
      { error: "Authorization token required" },
      { status: 401 },
    );
  }

  try {
    const { blobs } = await list({ token });
    return NextResponse.json({ blobs });
  } catch (error: any) {
    console.error("Blob List Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to list files" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json(
      { error: "Authorization token required" },
      { status: 401 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const pathname = formData.get("pathname") as string;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // Use the provided pathname or fallback to file name
    const finalPathname = pathname || file.name;

    console.log(
      "Uploading file:",
      finalPathname,
      "Size:",
      file.size,
      "Type:",
      file.type,
    );

    // Upload the file directly to Vercel Blob
    const blob = await put(finalPathname, file, {
      access: "public",
      token,
    });

    console.log("Upload successful:", blob);

    return NextResponse.json({ blob });
  } catch (error: any) {
    console.error("Blob Upload Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: 500 },
    );
  }
}
