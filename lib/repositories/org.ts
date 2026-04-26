import * as demo from "@/lib/queries/demo";
import { writeAuditLog } from "@/lib/repositories/audit";
import { getAuthenticatedUser, getDbClientOrThrow, getUserContext, withDemoFallback } from "@/lib/repositories/shared";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/env";

export async function listDepartments() {
  return withDemoFallback(demo.demoDepartments, async (db) => {
    const { data, error } = await db.from("departments").select("*").order("name");
    if (error) throw error;
    return data ?? [];
  });
}

export async function listEmployees() {
  return withDemoFallback(demo.demoEmployees, async (db) => {
    const { data, error } = await db.from("employees").select("*").order("full_name");
    if (error) throw error;
    return data ?? [];
  });
}

export async function getCompany() {
  return withDemoFallback(demo.demoCompany, async (db) => {
    const { data, error } = await db.from("companies").select("*").limit(1).maybeSingle();
    if (error) throw error;
    if (!data) return demo.demoCompany;
    return data;
  });
}

export async function createDepartment(input: {
  name: string;
  code: string;
  scope?: string;
  budgetMonthly: number;
  headEmployeeId?: string;
}) {
  const user = await getAuthenticatedUser();
  const context = await getUserContext(user);
  if (!context.companyId) return;

  const db = await getDbClientOrThrow();
  const departmentsTable = db.from("departments") as unknown as {
    insert: (values: Record<string, unknown>) => {
      select: (columns: string) => { single: () => Promise<{ data: { id: string } | null }> };
    };
  };

  const payload = {
    company_id: context.companyId,
    name: input.name,
    code: input.code || null,
    scope: input.scope || null,
    budget_monthly: input.budgetMonthly,
    head_employee_id: input.headEmployeeId || null,
  };

  const { data } = await departmentsTable.insert(payload).select("id").single();
  await writeAuditLog({
    action: "department.create",
    entity: "departments",
    entityId: data?.id ?? null,
    after: payload,
  });
}

export async function createEmployee(input: {
  fullName: string;
  email: string;
  departmentId?: string;
  managerId?: string;
  baseSalary: number;
  employmentType?: string;
}) {
  const user = await getAuthenticatedUser();
  const context = await getUserContext(user);
  if (!context.companyId) return;

  const db = await getDbClientOrThrow();
  const employeesTable = db.from("employees") as unknown as {
    insert: (values: Record<string, unknown>) => {
      select: (columns: string) => { single: () => Promise<{ data: { id: string } | null; error: any }> };
    };
  };

  let authUserId = null;

  if (input.email && !isDemoMode()) {
    const supabaseAdmin = await createServiceRoleClient();
    const defaultPassword = "Abcd@1234";

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: input.email,
      password: defaultPassword,
      email_confirm: true,
    });

    if (authError) {
      console.error("Lỗi tạo user Supabase:", authError);
      throw new Error(`Không thể tạo tài khoản đăng nhập: ${authError.message}`);
    }

    if (authData.user) {
      authUserId = authData.user.id;

      // Automatically assign the default 'employee' role using admin client to bypass RLS
      const userRolesTable = supabaseAdmin.from("user_roles");
      const { error: roleError } = await userRolesTable.insert({
        auth_user_id: authUserId,
        company_id: context.companyId,
        role: "employee",
      });

      if (roleError) {
        console.error("Lỗi gán quyền user_roles:", roleError);
        throw new Error(`Không thể gán quyền cho tài khoản: ${roleError.message}`);
      }
    }
  }

  const payload = {
    company_id: context.companyId,
    auth_user_id: authUserId,
    full_name: input.fullName,
    email: input.email || null,
    department_id: input.departmentId || null,
    manager_id: input.managerId || null,
    base_salary: input.baseSalary,
    employment_type: input.employmentType || "fulltime",
    status: "active",
  };

  const { data, error } = await employeesTable.insert(payload).select("id").single();
  if (error) {
    console.error("Lỗi tạo nhân sự:", error);
    throw new Error(`Không thể tạo hồ sơ nhân sự: ${error.message}`);
  }

  await writeAuditLog({
    action: "employee.create",
    entity: "employees",
    entityId: data?.id ?? null,
    after: payload,
  });
}

export async function updateEmployeeStatus(
  employeeId: string,
  status: "active" | "onboarding" | "on_leave" | "terminated",
) {
  const user = await getAuthenticatedUser();
  const context = await getUserContext(user);
  if (!context.companyId) return;

  const db = await getDbClientOrThrow();
  const employeesTable = db.from("employees") as unknown as {
    update: (values: Record<string, unknown>) => {
      eq: (col: string, val: string) => { eq: (col: string, val: string) => Promise<unknown> };
    };
  };

  await employeesTable.update({ status }).eq("id", employeeId).eq("company_id", context.companyId);

  await writeAuditLog({
    action: "employee.status_update",
    entity: "employees",
    entityId: employeeId,
    after: { status },
  });
}

export async function updateCompanySettings(input: {
  name: string;
  code: string;
  currency: string;
  timezone: string;
}) {
  const user = await getAuthenticatedUser();
  const context = await getUserContext(user);
  if (!context.companyId) return;

  const db = await getDbClientOrThrow();
  const companyTable = db.from("companies") as unknown as {
    update: (values: Record<string, unknown>) => { eq: (column: string, value: string) => Promise<unknown> };
  };

  await companyTable.update({
    name: input.name,
    code: input.code || null,
    currency: input.currency,
    timezone: input.timezone,
  }).eq("id", context.companyId);

  await writeAuditLog({
    action: "company.update",
    entity: "companies",
    entityId: context.companyId,
    after: input,
  });
}
