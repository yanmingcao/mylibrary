import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const sessionCookieName =
  process.env.SESSION_COOKIE_NAME ?? "session";
const sessionExpiresDays = Number(process.env.SESSION_EXPIRES_DAYS ?? "5");

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function getExpiryDateFromNowMs(ms: number) {
  return new Date(Date.now() + ms);
}

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = getExpiryDateFromNowMs(
    sessionExpiresDays * 24 * 60 * 60 * 1000
  );

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return { token, expiresAt };
}

export async function deleteSession(token: string) {
  const tokenHash = hashToken(token);
  await prisma.session.deleteMany({
    where: {
      tokenHash,
    },
  });
}

export async function deleteUserSessions(userId: string) {
  await prisma.session.deleteMany({
    where: { userId },
  });
}

export async function getSessionUser(token: string) {
  const tokenHash = hashToken(token);
  const session = await prisma.session.findFirst({
    where: {
      tokenHash,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          familyId: true,
        },
      },
    },
  });

  if (!session?.user?.isActive) return null;
  return session.user;
}

export async function getSessionCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(sessionCookieName)?.value;
}

export function setSessionCookie(response: NextResponse, token: string, expiresAt: Date) {
  response.cookies.set(sessionCookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor((expiresAt.getTime() - Date.now()) / 1000),
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(sessionCookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export { sessionCookieName, sessionExpiresDays, hashToken, getExpiryDateFromNowMs };
