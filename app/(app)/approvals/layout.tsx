import { requireRouteAccess } from "@/lib/auth/guard";

export default async function ApprovalsLayout({ children }: { children: React.ReactNode }) {
  await requireRouteAccess("/approvals");
  return <>{children}</>;
}
