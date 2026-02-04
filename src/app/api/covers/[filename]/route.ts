import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

/**
 * GET /api/covers/:filename
 * Serves cover images from the uploads/covers directory.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  // Sanitize filename — only allow alphanumeric, hyphens, dots
  if (!/^[\w\-]+\.(jpg|jpeg|png|webp)$/i.test(filename)) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), "uploads", "covers", filename);

  try {
    const buffer = await readFile(filePath);
    const ext = path.extname(filename).toLowerCase();
    const contentType =
      ext === ".png"
        ? "image/png"
        : ext === ".webp"
          ? "image/webp"
          : "image/jpeg";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Cover not found" }, { status: 404 });
  }
}
