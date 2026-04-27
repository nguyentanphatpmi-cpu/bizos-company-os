import * as demo from "@/lib/queries/demo";
import { withDemoFallback } from "@/lib/repositories/shared";

export async function listPayrollEntries() {
  const user = await import("@/lib/repositories/shared").then(m => m.getAuthenticatedUser());
  const context = await import("@/lib/repositories/shared").then(m => m.getUserContext(user));
  
  return withDemoFallback(demo.demoPayroll, async (db) => {
    const { data, error } = await db.from("payroll_entries")
      .select("*")
      .eq("company_id", context.companyId ?? "")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });
}
