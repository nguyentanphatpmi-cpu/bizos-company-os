import { requireRouteAccess } from "@/lib/auth/guard";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  await requireRouteAccess("/settings");
  return <>{children}</>;
}
