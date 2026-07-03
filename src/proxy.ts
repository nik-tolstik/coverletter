import { NextResponse } from "next/server";

import { auth } from "@/auth";

const protectedPagePaths = ["/", "/profile"];
const protectedApiPathPrefixes = [
  "/api/profile",
  "/api/cover-letter",
  "/api/cover-letter-settings",
  "/api/cover-letter-history",
];

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const isAuthenticated = Boolean(request.auth?.user?.email);

  if (pathname === "/auth" && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!isAuthenticated && isProtectedPath(pathname)) {
    const signInUrl = new URL("/auth", request.url);
    signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);

    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/",
    "/profile/:path*",
    "/auth",
    "/api/profile/:path*",
    "/api/cover-letter/:path*",
    "/api/cover-letter-settings/:path*",
    "/api/cover-letter-history/:path*",
  ],
};

function isProtectedPath(pathname: string) {
  return (
    protectedPagePaths.includes(pathname) ||
    protectedApiPathPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  );
}
