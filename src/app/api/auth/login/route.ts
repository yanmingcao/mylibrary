import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, setSessionCookie } from "@/lib/auth/session";

type LoginRequest = {
  email?: string;
  password?: string;
};

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: LoginRequest;

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 }
    );
  }

  const email = body?.email?.trim().toLowerCase();
  const password = body?.password ?? "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      passwordHash: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive || !user.passwordHash) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const { token, expiresAt } = await createSession(user.id);
  const response = NextResponse.json({ status: "ok" });
  setSessionCookie(response, token, expiresAt);
  return response;
}
