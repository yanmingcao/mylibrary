import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logAdminAction, requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("response" in auth) {
    return auth.response;
  }

  const { id } = await params;

  const family = await prisma.family.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          users: true,
        },
      },
    },
  });

  if (!family) {
    return NextResponse.json({ error: "Family not found" }, { status: 404 });
  }

  if (family._count.users > 0) {
    return NextResponse.json(
      { error: "Family has members" },
      { status: 400 }
    );
  }

  const books = await prisma.book.findMany({
    where: { familyId: id },
    select: { id: true },
  });
  const bookIds = books.map((book) => book.id);

  const operations: Prisma.PrismaPromise<unknown>[] = [];

  if (bookIds.length > 0) {
    operations.push(
      prisma.borrowing.deleteMany({
        where: {
          bookId: { in: bookIds },
        },
      })
    );
  }

  operations.push(
    prisma.book.deleteMany({
      where: { familyId: id },
    })
  );
  operations.push(
    prisma.familyInvite.deleteMany({
      where: { familyId: id },
    })
  );
  operations.push(
    prisma.family.deleteMany({
      where: { id },
    })
  );

  await prisma.$transaction(operations);

  await logAdminAction({
    actorUserId: auth.user.id,
    action: "DELETE_EMPTY_FAMILY",
    targetFamilyId: id,
    metadata: { name: family.name },
  });

  return NextResponse.json({ status: "ok" });
}
