import * as demo from "@/lib/queries/demo";
import { writeAuditLog } from "@/lib/repositories/audit";
import { getAuthenticatedUser, getDbClientOrThrow, getUserContext, withDemoFallback } from "@/lib/repositories/shared";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/env";

export async function listDepartments() {
  const user = await getAuthenticatedUser();
  const context = await getUserContext(user);
  return withDemoFallback(demo.demoDepartments, async (db) => {
    if (!context.companyId) return [];
    const { data, error } = await db.from("departments").select("*").eq("company_id", context.companyId).order("name");
    if (error) throw error;
    return data ?? [];
  });
}

export async function listEmployees() {
  const user = await getAuthenticatedUser();
  const context = await getUserContext(user);
  return withDemoFallback(demo.demoEmployees, async (db) => {
    if (!context.companyId) return [];
    const { data, error } = await db.from("employees").select("*").eq("company_id", context.companyId).order("full_name");
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
  jobTitle?: string;
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
    const defaultPassword = process.env.DEFAULT_EMPLOYEE_PASSWORD || crypto.randomUUID().slice(0, 8);

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
    job_title: input.jobTitle || null,
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

export async function updateEmployeeJobTitle(employeeId: string, jobTitle: string) {
  const user = await getAuthenticatedUser();
  const context = await getUserContext(user);
  if (!context.companyId) return;

  const db = await getDbClientOrThrow();
  const employeesTable = db.from("employees") as unknown as {
    update: (values: Record<string, unknown>) => {
      eq: (col: string, val: string) => { eq: (col: string, val: string) => Promise<unknown> };
    };
  };

  await employeesTable
    .update({ job_title: jobTitle || null })
    .eq("id", employeeId)
    .eq("company_id", context.companyId);

  await writeAuditLog({
    action: "employee.job_title_update",
    entity: "employees",
    entityId: employeeId,
    after: { job_title: jobTitle || null },
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

export const PROTECTED_EMAILS = [
  "ceo@bizos.demo",
  "hr@bizos.demo",
  "cfo@bizos.demo",
  "sales.head@bizos.demo",
  "mkt.head@bizos.demo",
  "ops.head@bizos.demo",
  "cs.head@bizos.demo",
];

export async function deleteEmployee(employeeId: string) {
  const user = await getAuthenticatedUser();
  const context = await getUserContext(user);
  if (!context.companyId) return;

  const db = await getDbClientOrThrow();
  
  // 1. Get employee data to check email and auth_user_id
  const { data: employee, error: fetchError } = await db
    .from("employees")
    .select("email, auth_user_id, full_name")
    .eq("id", employeeId)
    .eq("company_id", context.companyId)
    .single();

  if (fetchError || !employee) {
    throw new Error("Không tìm thấy nhân sự hoặc bạn không có quyền.");
  }

  // 2. Prevent deleting protected demo accounts
  if (employee.email && PROTECTED_EMAILS.includes(employee.email)) {
    throw new Error("Không thể xóa nhân sự demo mặc định của hệ thống.");
  }

  // 3. Prevent self-deletion
  if (employee.auth_user_id === context.authUserId) {
    throw new Error("Bạn không thể tự xóa chính mình.");
  }

  // 4. Delete from employees table
  const { error: deleteError } = await db
    .from("employees")
    .delete()
    .eq("id", employeeId)
    .eq("company_id", context.companyId);

  if (deleteError) {
    throw new Error(`Lỗi khi xóa nhân sự: ${deleteError.message}`);
  }

  // 5. If has auth_user_id, delete from Supabase Auth
  if (employee.auth_user_id && !isDemoMode()) {
    const supabaseAdmin = await createServiceRoleClient();
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(employee.auth_user_id);
    if (authError) {
      console.error("Lỗi xóa user Supabase Auth:", authError);
    }
  }

  // 6. Audit Log
  await writeAuditLog({
    action: "employee.delete",
    entity: "employees",
    entityId: employeeId,
    before: employee,
  });
}
