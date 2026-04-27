import { requireRouteAccess } from "@/lib/auth/guard";

export default async function RecruitingLayout({ children }: { children: React.ReactNode }) {
  await requireRouteAccess("/recruiting");
  return <>{children}</>;
}
