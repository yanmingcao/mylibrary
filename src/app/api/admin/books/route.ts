import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if ("response" in auth) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";

  const where: any = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { author: { contains: search, mode: "insensitive" } },
    ];
  }

  const books = await prisma.book.findMany({
    where,
    select: {
      id: true,
      title: true,
      author: true,
      isAvailable: true,
      createdAt: true,
      family: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ books });
}
