import { requireRouteAccess } from "@/lib/auth/guard";

export default async function AuditLayout({ children }: { children: React.ReactNode }) {
  await requireRouteAccess("/audit");
  return <>{children}</>;
}
