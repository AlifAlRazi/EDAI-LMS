import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import { redirect } from "next/navigation";
import type { UserRole } from "@/types";

/**
 * Returns the current server-side session.
 * Wraps getServerSession with our authOptions for convenience.
 */
export async function getSession() {
  return getServerSession(authOptions);
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
 */
export async function requireAdmin() {
  return requireRole("admin");
}
