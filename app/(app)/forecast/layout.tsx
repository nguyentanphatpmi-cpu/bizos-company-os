import { requireRouteAccess } from "@/lib/auth/guard";

export default async function ForecastLayout({ children }: { children: React.ReactNode }) {
  await requireRouteAccess("/forecast");
  return <>{children}</>;
}
