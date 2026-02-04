import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdmin();
  if ("response" in auth) {
    return auth.response;
  }

  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [userCount, familyCount, bookCount, newUsers] = await Promise.all([
    prisma.user.count(),
    prisma.family.count(),
    prisma.book.count(),
    prisma.user.count({
      where: {
        createdAt: { gte: last24h },
      },
    }),
  ]);

  return NextResponse.json({
    stats: {
      users: userCount,
      families: familyCount,
      books: bookCount,
      newUsersLast24h: newUsers,
      errorsLast24h: 0,
    },
    backupStatus: "not_configured",
    errorTracking: "not_configured",
  });
}
