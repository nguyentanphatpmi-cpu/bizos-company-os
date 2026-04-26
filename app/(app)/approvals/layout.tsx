import { requireAnyRole } from "@/lib/auth/guard";

export default async function ApprovalsLayout({ children }: { children: React.ReactNode }) {
  await requireAnyRole(["ceo", "cfo", "hr_admin", "dept_head", "team_lead"]);
  return <>{children}</>;
}
