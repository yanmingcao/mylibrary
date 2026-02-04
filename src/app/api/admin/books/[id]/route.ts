import { NextRequest, NextResponse } from "next/server";
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

  const book = await prisma.book.findUnique({
    where: { id },
    select: { id: true, title: true, familyId: true },
  });

  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.borrowing.deleteMany({
      where: { bookId: id },
    }),
    prisma.book.delete({
      where: { id },
    }),
  ]);

  await logAdminAction({
    actorUserId: auth.user.id,
    action: "DELETE_BOOK",
    targetBookId: id,
    metadata: { title: book.title, familyId: book.familyId },
  });

  return NextResponse.json({ status: "ok" });
}
