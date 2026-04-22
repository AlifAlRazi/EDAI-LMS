import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import { redirect } from "next/navigation";
import type { UserRole } from "@/types";

/**
 * Returns the current server-side session.
 * Wraps getServerSession with our authOptions for convenience.
 *
 * @example
 * const session = await getSession();
 * console.log(session?.user.role);
 */
export async function getSession() {
  // return getServerSession(authOptions);
  // TEMPORARY BYPASS: Returning a mock session so you can see the dashboard UI
  return {
    user: {
      id: "60d5f2f1f1d1f1d1f1d1f1d1", // Valid 24-char hex ObjectId
      name: "Demo Student",
      email: "student@edai.com",
      role: "student" as any,
    }
  };
}

/**
 * Returns the current authenticated user from the session,
 * or null if not authenticated.
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

/**
 * Requires the user to be authenticated.
 * Redirects to /login if not authenticated.
 *
 * @param callbackUrl - URL to redirect to after login
 */
export async function requireAuth(callbackUrl?: string) {
  const session = await getSession();
  if (!session?.user) {
    redirect(`/login${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`);
  }
  return session;
}

/**
 * Requires the user to have a specific role.
 * Redirects to /dashboard if role doesn't match.
 *
 * @param role - Required role
 */
export async function requireRole(role: UserRole) {
  const session = await requireAuth();
  if (session.user.role !== role) {
    redirect("/dashboard");
  }
  return session;
}

/**
 * Requires admin role.
 * Convenience wrapper around requireRole('admin').
 */
export async function requireAdmin() {
  return requireRole("admin");
}
