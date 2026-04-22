import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Route protection middleware using NextAuth's withAuth wrapper.
 *
 * Rules:
 * - /dashboard/*  → require authentication → redirect to /login
 * - /learn/*      → require authentication → redirect to /login
 * - /admin/*      → require authentication + role === 'admin' → redirect to /dashboard
 * - /api/admin/*  → require admin role → return 403 JSON
 */
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Admin route — check role
    if (pathname.startsWith("/admin")) {
      if (token?.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Admin API routes — return 403
    if (pathname.startsWith("/api/admin")) {
      if (token?.role !== "admin") {
        return NextResponse.json(
          { error: "Forbidden: Admin access required" },
          { status: 403 }
        );
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const { pathname } = req.nextUrl;

        const protectedPrefixes = [
          "/dashboard",
          "/learn",
          "/admin",
          "/api/admin",
        ];

        const isProtected = protectedPrefixes.some((prefix) =>
          pathname.startsWith(prefix)
        );

        // Block access if the route is protected and no JWT token exists
        if (isProtected && !token) {
          return false;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/learn/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
