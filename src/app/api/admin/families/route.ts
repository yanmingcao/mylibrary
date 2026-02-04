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
  const emptyOnly = searchParams.get("empty") === "true";

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { address: { contains: search, mode: "insensitive" } },
    ];
  }

  if (emptyOnly) {
    where.users = { none: {} };
  }

  const families = await prisma.family.findMany({
    where,
    select: {
      id: true,
      name: true,
      address: true,
      email: true,
      phone: true,
      createdAt: true,
      _count: {
        select: {
          users: true,
          books: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ families });
}
