import { notFound } from "next/navigation";
import { getAuthenticatedUser, getUserContext } from "@/lib/repositories/shared";
import { hasAnyRole } from "@/lib/auth/permissions";
import type { AppRole } from "@/lib/auth/permissions";
import { isDemoMode } from "@/lib/env";
import { ROUTE_ROLES } from "@/lib/auth/routes";

/**
 * Layout guard: calls notFound() when the user is not authenticated.
 * Allows bypass in Demo Mode for read-only viewing.
 */
export async function requireAuthenticated() {
  const user = await getAuthenticatedUser();
  if (!user && !isDemoMode()) notFound();
  return await getUserContext(user);
}

/**
 * Action guard: throws Unauthorized when the user is not authenticated.
 */
export async function assertAuthenticated() {
  const user = await getAuthenticatedUser();
  const ctx = await getUserContext(user);
  if (!ctx.authUserId) throw new Error("Unauthorized: Unauthenticated");
  return ctx;
}

/**
 * Layout guard: calls notFound() when the current user lacks required roles.
 * Use in layout.tsx files for route-level protection.
 */
export async function requireAnyRole(roles: AppRole[]) {
  const ctx = await requireAuthenticated();
  if (!hasAnyRole(ctx, roles)) notFound();
  return ctx;
}

/**
 * Action guard: throws Unauthorized when the current user lacks required roles.
 * Use at the top of every write server action.
 */
export async function assertAnyRole(roles: AppRole[]) {
  const ctx = await assertAuthenticated();
  if (!ctx.authUserId) throw new Error("Unauthorized: Unauthenticated action");
  if (!hasAnyRole(ctx, roles)) throw new Error("Unauthorized");
  return ctx;
}

/**
 * Route-level dynamic guard. Looks up required roles from ROUTE_ROLES.
 */
export async function requireRouteAccess(href: string) {
  const roles = ROUTE_ROLES[href];
  if (!roles) return await requireAuthenticated();
  return await requireAnyRole(roles);
}
