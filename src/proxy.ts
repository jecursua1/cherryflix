import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "@/auth.config";

// Edge-safe Auth.js instance for route protection (no DB adapter).
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const path = nextUrl.pathname;
  const isLoggedIn = !!req.auth?.user;
  const isAdmin = Boolean(req.auth?.user?.isAdmin);

  const isPublic =
    path === "/" ||
    path === "/login" ||
    path === "/admin-login" ||
    path.startsWith("/api/auth") ||
    // Static SEO / verification files served from /public
    path.endsWith(".html") ||
    path.endsWith(".txt") ||
    path.endsWith(".xml");

  if (isPublic) {
    if (isLoggedIn && path === "/login") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    if (isLoggedIn && path === "/admin-login") {
      // Already signed in — send admins to the dashboard, others home.
      return NextResponse.redirect(new URL(isAdmin ? "/admin" : "/", nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    const url = new URL("/login", nextUrl);
    if (path !== "/") url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }

  if (path.startsWith("/admin") && !isAdmin) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Run on everything except Next internals and static image files.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)",
  ],
};
