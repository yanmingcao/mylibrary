import { NextResponse } from "next/server";
import { sessionCookieName } from "@/lib/firebase/admin";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ status: "ok" });
  response.cookies.set(sessionCookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
