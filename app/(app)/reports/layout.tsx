import { requireRouteAccess } from "@/lib/auth/guard";

export default async function ReportsLayout({ children }: { children: React.ReactNode }) {
  await requireRouteAccess("/reports");
  return <>{children}</>;
}
