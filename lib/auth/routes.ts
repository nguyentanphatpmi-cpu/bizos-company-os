import type { AppRole } from "@/lib/auth/permissions";

export const ROUTE_ROLES: Record<string, AppRole[]> = {
  "/recruiting":   ["ceo", "hr_admin", "dept_head"],
  "/forecast":     ["ceo", "cfo", "dept_head"],
  "/compensation": ["ceo", "cfo", "hr_admin", "dept_head"],
  "/finance":      ["ceo", "cfo", "auditor"],
  "/reports":      ["ceo", "cfo", "hr_admin", "dept_head", "auditor"],
  "/approvals":    ["ceo", "cfo", "hr_admin", "dept_head", "team_lead"],
  "/audit":        ["ceo", "auditor", "cfo"],
  "/settings":     ["ceo", "cfo", "hr_admin"],
};
