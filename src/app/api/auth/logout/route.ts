import { NextResponse } from "next/server";
import { clearSessionCookie, deleteSession, getSessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST() {
  const sessionToken = await getSessionCookie();
  if (sessionToken) {
    await deleteSession(sessionToken);
  }

  const response = NextResponse.json({ status: "ok" });
  clearSessionCookie(response);
  return response;
}
