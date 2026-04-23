import { createClientOrNull } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Footer } from "@/components/layout/Footer";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClientOrNull();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Sidebar />
      <Topbar userEmail={user?.email ?? "demo@bizos.local"} />
      <main className="md:ml-60 p-6 flex-1">{children}</main>
      <div className="md:ml-60">
        <Footer />
      </div>
    </div>
  );
}
