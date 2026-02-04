import { NextResponse } from "next/server";
import { getSessionCookie, getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "MEMBER";
  isActive: boolean;
  familyId: string;
};

type AuthResult =
  | { user: AuthUser }
  | { response: NextResponse };

type AdminAuthResult = AuthResult;

export async function requireAuth(): Promise<AuthResult> {
  const sessionCookie = await getSessionCookie();

  if (!sessionCookie) {
    return {
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  try {
    const user = await getSessionUser(sessionCookie);
    if (!user) {
      return {
        response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      };
    }

    return { user };
  } catch (error) {
    return {
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
}

export async function requireAdmin(): Promise<AdminAuthResult> {
  const result = await requireAuth();
  if ("response" in result) return result;

  if (result.user.role !== "ADMIN") {
    return {
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return result;
}

export async function logAdminAction(params: {
  actorUserId: string;
  action:
    | "PROMOTE_USER"
    | "DEMOTE_USER"
    | "DEACTIVATE_USER"
    | "REACTIVATE_USER"
    | "DELETE_EMPTY_FAMILY"
    | "DELETE_BOOK";
  targetUserId?: string;
  targetFamilyId?: string;
  targetBookId?: string;
  metadata?: Record<string, string | number | boolean | null>;
}) {
  await prisma.adminAudit.create({
    data: {
      actorUserId: params.actorUserId,
      action: params.action,
      targetUserId: params.targetUserId,
      targetFamilyId: params.targetFamilyId,
      targetBookId: params.targetBookId,
      metadata: params.metadata,
    },
  });
}
