import { requireAnyRole } from "@/lib/auth/guard";

export default async function RecruitingLayout({ children }: { children: React.ReactNode }) {
  await requireAnyRole(["ceo", "hr_admin", "dept_head"]);
  return <>{children}</>;
}
