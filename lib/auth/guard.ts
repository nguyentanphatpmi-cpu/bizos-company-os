import { notFound } from "next/navigation";
import { getAuthenticatedUser, getUserContext } from "@/lib/repositories/shared";
import { hasAnyRole } from "@/lib/auth/permissions";
import type { AppRole } from "@/lib/auth/permissions";

/**
 * Layout guard: calls notFound() when the current user lacks required roles.
 * Use in layout.tsx files for route-level protection.
 */
export async function requireAnyRole(roles: AppRole[]) {
  const user = await getAuthenticatedUser();
  const ctx = await getUserContext(user);
  if (!hasAnyRole(ctx, roles)) notFound();
  return ctx;
}

/**
 * Action guard: throws Unauthorized when the current user lacks required roles.
 * Use at the top of every write server action.
 */
export async function assertAnyRole(roles: AppRole[]) {
  const user = await getAuthenticatedUser();
  const ctx = await getUserContext(user);
  if (!hasAnyRole(ctx, roles)) throw new Error("Unauthorized");
  return ctx;
}
