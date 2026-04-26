import { requireAnyRole } from "@/lib/auth/guard";

export default async function AuditLayout({ children }: { children: React.ReactNode }) {
  await requireAnyRole(["ceo", "cfo", "auditor"]);
  return <>{children}</>;
}
