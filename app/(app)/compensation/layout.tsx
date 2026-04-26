import { requireAnyRole } from "@/lib/auth/guard";

export default async function CompensationLayout({ children }: { children: React.ReactNode }) {
  await requireAnyRole(["ceo", "cfo", "hr_admin", "dept_head"]);
  return <>{children}</>;
}
