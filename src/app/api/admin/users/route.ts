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
  const role = searchParams.get("role");
  const isActive = searchParams.get("isActive");

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (role === "ADMIN" || role === "MEMBER") {
    where.role = role;
  }

  if (isActive === "true" || isActive === "false") {
    where.isActive = isActive === "true";
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      family: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json({ users });
}
