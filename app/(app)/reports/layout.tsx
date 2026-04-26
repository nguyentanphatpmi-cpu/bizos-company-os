import { requireAnyRole } from "@/lib/auth/guard";

export default async function ReportsLayout({ children }: { children: React.ReactNode }) {
  await requireAnyRole(["ceo", "cfo", "hr_admin", "dept_head", "auditor"]);
  return <>{children}</>;
}
