import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { normalizeIsbn, cleanIsbn } from "@/lib/isbn";

export const runtime = "nodejs";

interface OpenLibraryBook {
  title?: string;
  authors?: { key: string }[];
  description?: string | { value: string };
  covers?: number[];
  languages?: { key: string }[];
}

interface OpenLibraryAuthor {
  name?: string;
}

/**
 * GET /api/books/lookup?isbn=...
 * Queries Open Library by ISBN, downloads cover image, returns metadata.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawIsbn = searchParams.get("isbn")?.trim();

  if (!rawIsbn) {
    return NextResponse.json(
      { error: "isbn query parameter is required" },
      { status: 400 }
    );
  }

  const isbn13 = normalizeIsbn(rawIsbn);
  if (!isbn13) {
    return NextResponse.json(
      { error: "Invalid ISBN. Please enter a valid ISBN-10 or ISBN-13." },
      { status: 400 }
    );
  }

  try {
    // Query Open Library by ISBN
    const olRes = await fetch(
      `https://openlibrary.org/isbn/${cleanIsbn(rawIsbn)}.json`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (!olRes.ok) {
      return NextResponse.json(
        { error: "Book not found in Open Library" },
        { status: 404 }
      );
    }

    const olBook: OpenLibraryBook = await olRes.json();

    // Resolve author names
    let authorName = "";
    if (olBook.authors && olBook.authors.length > 0) {
      const authorPromises = olBook.authors.map(async (a) => {
        try {
          const authorRes = await fetch(
            `https://openlibrary.org${a.key}.json`,
            { signal: AbortSignal.timeout(5000) }
          );
          if (authorRes.ok) {
            const data: OpenLibraryAuthor = await authorRes.json();
            return data.name || "";
          }
        } catch {
          // ignore individual author fetch failures
        }
        return "";
      });
      const names = await Promise.all(authorPromises);
      authorName = names.filter(Boolean).join(", ");
    }

    // Extract description
    let description = "";
    if (olBook.description) {
      description =
        typeof olBook.description === "string"
          ? olBook.description
          : olBook.description.value || "";
    }

    // Detect language from Open Library data
    let language = "";
    if (olBook.languages && olBook.languages.length > 0) {
      const langKey = olBook.languages[0].key; // e.g. "/languages/eng"
      const langCode = langKey.split("/").pop();
      if (langCode === "eng") language = "EN";
      else if (langCode === "chi") language = "ZH_HANS";
    }

    // Download cover image if available
    let coverImagePath = "";
    if (olBook.covers && olBook.covers.length > 0) {
      const coverId = olBook.covers[0];
      try {
        const coverUrl = `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
        const coverRes = await fetch(coverUrl, {
          signal: AbortSignal.timeout(15000),
        });

        if (coverRes.ok) {
          const buffer = Buffer.from(await coverRes.arrayBuffer());

          // Only save if we got a real image (> 1KB, Open Library returns a tiny 1x1 for missing)
          if (buffer.length > 1024) {
            const uploadsDir = path.join(process.cwd(), "uploads", "covers");
            await mkdir(uploadsDir, { recursive: true });

            const filename = `${isbn13}.jpg`;
            await writeFile(path.join(uploadsDir, filename), buffer);
            coverImagePath = `/api/covers/${filename}`;
          }
        }
      } catch {
        // Cover download failed — continue without it
      }
    }

    return NextResponse.json({
      isbn: isbn13,
      title: olBook.title || "",
      author: authorName,
      description,
      language,
      coverImage: coverImagePath,
    });
  } catch (error) {
    console.error("ISBN lookup error:", error);
    return NextResponse.json(
      { error: "Failed to look up ISBN" },
      { status: 500 }
    );
  }
}
