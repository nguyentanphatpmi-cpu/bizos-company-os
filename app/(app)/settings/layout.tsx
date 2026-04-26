import { requireAnyRole } from "@/lib/auth/guard";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  await requireAnyRole(["ceo", "cfo", "hr_admin"]);
  return <>{children}</>;
}
