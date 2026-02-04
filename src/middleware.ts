import { NextResponse, type NextRequest } from "next/server";

const publicRoutes = new Set(["/", "/login", "/register", "/forgot-password", "/reset-password"]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicRoutes.has(pathname)) {
    return NextResponse.next();
  }

  const sessionCookieName =
    process.env.SESSION_COOKIE_NAME ?? "session";
  const cookieHeader = request.headers.get("cookie") ?? "";
  const sessionCookie = request.cookies.get(sessionCookieName)?.value;

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const verifyUrl = new URL("/api/auth/verify", request.url);
  try {
    const verifyResponse = await fetch(verifyUrl, {
      headers: {
        cookie: cookieHeader,
      },
    });

    if (verifyResponse.ok) {
      return NextResponse.next();
    }
  } catch (error) {
    // fall through to redirect
  }

  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete(sessionCookieName);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
