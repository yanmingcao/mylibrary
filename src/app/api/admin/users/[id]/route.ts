import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAdminAction, requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("response" in auth) {
    return auth.response;
  }

  const { id } = await params;
  let body: { role?: "ADMIN" | "MEMBER"; isActive?: boolean };

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (body.role && body.role !== "ADMIN" && body.role !== "MEMBER") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  if (
    typeof body.isActive !== "undefined" &&
    typeof body.isActive !== "boolean"
  ) {
    return NextResponse.json(
      { error: "Invalid isActive value" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true, isActive: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const updateData: { role?: "ADMIN" | "MEMBER"; isActive?: boolean } = {};

  if (body.role) {
    updateData.role = body.role;
  }

  if (typeof body.isActive === "boolean") {
    updateData.isActive = body.isActive;
  }

  const updated = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  if (body.role && body.role !== existing.role) {
    await logAdminAction({
      actorUserId: auth.user.id,
      action: body.role === "ADMIN" ? "PROMOTE_USER" : "DEMOTE_USER",
      targetUserId: id,
      metadata: { from: existing.role, to: body.role },
    });
  }

  if (
    typeof body.isActive === "boolean" &&
    body.isActive !== existing.isActive
  ) {
    await logAdminAction({
      actorUserId: auth.user.id,
      action: body.isActive ? "REACTIVATE_USER" : "DEACTIVATE_USER",
      targetUserId: id,
      metadata: { from: existing.isActive, to: body.isActive },
    });
  }

  return NextResponse.json({ user: updated });
}
