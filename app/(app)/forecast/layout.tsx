import { requireAnyRole } from "@/lib/auth/guard";

export default async function ForecastLayout({ children }: { children: React.ReactNode }) {
  await requireAnyRole(["ceo", "cfo", "dept_head"]);
  return <>{children}</>;
}
