import type { TableRow } from "@/lib/supabase/database.types";

export type AppRole = TableRow<"user_roles">["role"];

export type UserContext = {
  authUserId: string | null;
  companyId: string | null;
  employeeId: string | null;
  roles: readonly AppRole[];
  scopedDepartmentIds: readonly string[];
  scopedTeamIds: readonly string[];
};

export function hasRole(context: UserContext, role: AppRole) {
  return context.roles.includes(role);
}

export function hasAnyRole(context: UserContext, roles: AppRole[]) {
  return roles.some((role) => hasRole(context, role));
}

export const SENIOR_ROLES: AppRole[] = ["ceo", "cfo", "hr_admin", "auditor"];

export function canAccessFinance(context: UserContext) {
  return hasAnyRole(context, ["ceo", "cfo", "auditor"]);
}

export function canManagePeople(context: UserContext) {
  return hasAnyRole(context, ["ceo", "hr_admin"]);
}

export function canManageGovernance(context: UserContext) {
  return hasAnyRole(context, SENIOR_ROLES);
}

export function canAccessDepartment(context: UserContext, departmentId: string | null) {
  if (!departmentId) return hasAnyRole(context, SENIOR_ROLES);
  if (hasAnyRole(context, SENIOR_ROLES)) return true;
  return context.scopedDepartmentIds.includes(departmentId);
}

// True when the user is a dept_head without any overriding senior role.
// Senior roles (ceo/cfo/hr_admin/auditor) always see all data.
export function isScopedDeptHead(context: UserContext) {
  return hasRole(context, "dept_head") && !hasAnyRole(context, SENIOR_ROLES);
}

// True when the user is a team_lead without dept_head or senior roles.
export function isScopedTeamLead(context: UserContext) {
  return (
    hasRole(context, "team_lead") &&
    !hasAnyRole(context, [...SENIOR_ROLES, "dept_head"])
  );
}

// Returns the dept IDs the user is scoped to, or null if they can see everything.
export function deptScopeFilter(context: UserContext): readonly string[] | null {
  if (isScopedDeptHead(context)) return context.scopedDepartmentIds;
  return null;
}

// Returns the team IDs the user is scoped to, or null if they can see everything.
export function teamScopeFilter(context: UserContext): readonly string[] | null {
  if (isScopedTeamLead(context)) return context.scopedTeamIds;
  return null;
}

// True when the user is a plain employee without any lead/head/senior role.
export function isScopedEmployee(context: UserContext) {
  return (
    hasRole(context, "employee") &&
    !hasAnyRole(context, [...SENIOR_ROLES, "dept_head", "team_lead"])
  );
}

// Returns true if the viewer can see salary fields for the given employee.
// Allowed: CEO, CFO, HR admin, or the employee themselves.
export function canViewSalary(context: UserContext, targetEmployeeId: string | null) {
  if (hasAnyRole(context, ["ceo", "cfo", "hr_admin"])) return true;
  return targetEmployeeId !== null && context.employeeId === targetEmployeeId;
}
