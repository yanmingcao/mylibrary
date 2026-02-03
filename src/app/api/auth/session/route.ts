import { NextResponse } from "next/server";
import {
  getAdminAuth,
  sessionCookieExpiresInMs,
  sessionCookieName,
} from "@/lib/firebase/admin";

export const runtime = "nodejs";

type SessionRequest = {
  idToken?: string;
};

export async function POST(request: Request) {
  let body: SessionRequest;

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 }
    );
  }

  if (!body?.idToken) {
    return NextResponse.json({ error: "Missing idToken." }, { status: 400 });
  }

  try {
    const adminAuth = getAdminAuth();
    const sessionCookie = await adminAuth.createSessionCookie(body.idToken, {
      expiresIn: sessionCookieExpiresInMs,
    });

    const response = NextResponse.json({ status: "ok" });
    response.cookies.set(sessionCookieName, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: Math.floor(sessionCookieExpiresInMs / 1000),
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
}
