import { NextResponse } from "next/server";
import { getSessionCookie, getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const sessionCookie = await getSessionCookie();
  if (!sessionCookie) {
    return NextResponse.json(null, { status: 401 });
  }

  const sessionUser = await getSessionUser(sessionCookie);
  if (!sessionUser) {
    return NextResponse.json(null, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      family: {
        select: {
          id: true,
          name: true,
          address: true,
          phone: true,
          email: true,
        },
      },
    },
  });

  return NextResponse.json(user);
}
