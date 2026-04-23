import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import {
  CUSTOMER_SESSION_COOKIE,
  verifyCustomerSessionToken,
} from "@/lib/customer-session";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/setup",
  "/verify",
  "/report",
  "/client/login",
  "/client/setup",
  "/api/auth",
  "/api/client/auth",
  "/api/incidents",
  "/favicon.ico",
];

function isPublicPath(pathname: string) {
  if (pathname.startsWith("/_next")) return true;
  if (pathname.includes(".")) return true;
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  const customerSession = verifyCustomerSessionToken(
    request.cookies.get(CUSTOMER_SESSION_COOKIE)?.value,
  );

  if (pathname.startsWith("/client")) {
    if (customerSession && (pathname === "/client/login" || pathname === "/client/setup")) {
      return NextResponse.redirect(new URL("/client", request.url));
    }

    if (!customerSession && pathname !== "/client/login" && pathname !== "/client/setup") {
      return NextResponse.redirect(new URL("/client/login", request.url));
    }

    return NextResponse.next();
  }

  if (isPublicPath(pathname)) {
    if (session && (pathname === "/login" || pathname === "/setup")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
