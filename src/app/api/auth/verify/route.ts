import { NextResponse } from "next/server";
import { getSessionCookie, getSessionUser } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET() {
  const sessionCookie = await getSessionCookie();

  if (!sessionCookie) {
    return NextResponse.json(
      { authenticated: false },
      {
        status: 401,
      }
    );
  }

  try {
    const user = await getSessionUser(sessionCookie);
    if (!user) {
      return NextResponse.json(
        { authenticated: false },
        {
          status: 403,
        }
      );
    }

    return NextResponse.json({ authenticated: true, uid: user.id });
  } catch (error) {
    return NextResponse.json(
      { authenticated: false },
      {
        status: 401,
      }
    );
  }
}
