// app/api/blob/[...pathname]/route.ts

import { del } from "@vercel/blob";
import { type NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: {
    pathname: string[];
  };
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json(
      { error: "Authorization token required" },
      { status: 401 },
    );
  }

  try {
    const pathname = params.pathname.join("/");

    if (!pathname) {
      return NextResponse.json(
        { error: "Pathname is required" },
        { status: 400 },
      );
    }

    await del(pathname, { token });
    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
      pathname,
    });
  } catch (error: any) {
    console.error("Blob Delete Error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to delete file",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const pathname = params.pathname.join("/");

    // Return the pathname for download URL construction
    // The actual blob URL would be constructed by the client
    return NextResponse.json({ pathname });
  } catch (error: any) {
    console.error("Blob Get Error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to get file info",
      },
      { status: 500 },
    );
  }
}
