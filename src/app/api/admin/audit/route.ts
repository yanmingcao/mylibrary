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
  const limit = Math.min(parseInt(searchParams.get("limit") || "25"), 100);

  const audits = await prisma.adminAudit.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      actorUser: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return NextResponse.json({ audits });
}
