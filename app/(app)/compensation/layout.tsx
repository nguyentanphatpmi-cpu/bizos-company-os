import { requireRouteAccess } from "@/lib/auth/guard";

export default async function CompensationLayout({ children }: { children: React.ReactNode }) {
  await requireRouteAccess("/compensation");
  return <>{children}</>;
}
