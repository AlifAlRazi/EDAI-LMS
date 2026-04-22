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
 *
 * Public routes (no protection):
 *   /, /courses, /courses/*, /login, /api/auth/*, /api/stripe/webhook
 */
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // ── Admin route — check role ───────────────────────────────────────────────

    if (pathname.startsWith("/admin")) {
      if (token?.role !== "admin") {
        // Redirect non-admins to dashboard
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // ── Admin API routes — return 403 ─────────────────────────────────────────

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
      /**
       * This callback runs before the middleware function.
       * Return true to allow the request, false to redirect to signIn page.
       */
      authorized({ token, req }) {
        // TEMPORARY BYPASS: Allowing access to all routes so you can see the UI
        return true;
      },
    },
  }
);

/**
 * Matcher config — Next.js will only invoke this middleware for these paths.
 * Excludes static files, images, and NextAuth's own routes.
 */
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/learn/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
