import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminAuth, sessionCookieName } from "@/lib/firebase/admin";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(sessionCookieName)?.value;

  if (!sessionCookie) {
    return NextResponse.json(
      { authenticated: false },
      {
        status: 401,
      }
    );
  }

  try {
    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
      select: { isActive: true },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { authenticated: false },
        {
          status: 403,
        }
      );
    }

    return NextResponse.json({ authenticated: true, uid: decoded.uid });
  } catch (error) {
    return NextResponse.json(
      { authenticated: false },
      {
        status: 401,
      }
    );
  }
}
