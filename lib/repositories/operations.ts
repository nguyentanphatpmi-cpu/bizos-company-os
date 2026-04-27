import * as demo from "@/lib/queries/demo";
import { writeAuditLog } from "@/lib/repositories/audit";
import { getAuthenticatedUser, getDbClientOrThrow, getUserContext, withDemoFallback } from "@/lib/repositories/shared";
import { deptScopeFilter, isScopedEmployee, isScopedTeamLead } from "@/lib/auth/permissions";

export async function listTasks() {
  const user = await getAuthenticatedUser();
  const context = await getUserContext(user);
  const deptScope = deptScopeFilter(context);

  return withDemoFallback(demo.demoTasks, async (db) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q = db.from("tasks").select("*") as any;
    if (deptScope !== null) {
      q = q.in("department_id", [...deptScope]);
    } else if (isScopedTeamLead(context) && context.scopedDepartmentIds.length > 0) {
      q = q.in("department_id", [...context.scopedDepartmentIds]);
    } else if (isScopedEmployee(context) && context.employeeId) {
      q = q.eq("assignee_id", context.employeeId);
    }
    const { data, error } = await q.order("due_date");
    if (error) throw error;
    return data ?? [];
  });
}

export async function createTask(input: {
  title: string;
  assigneeId?: string;
  departmentId?: string;
  linkedKpiId?: string;
  dueDate?: string;
  priority?: "low" | "normal" | "high" | "urgent";
  taskType?: "growth" | "maintenance" | "admin" | "urgent";
}) {
  const user = await getAuthenticatedUser();
  const context = await getUserContext(user);
  if (!context.companyId) return;

  const db = await getDbClientOrThrow();
  const tasksTable = db.from("tasks") as unknown as {
    insert: (values: Record<string, unknown>) => {
      select: (columns: string) => { single: () => Promise<{ data: { id: string } | null }> };
    };
  };

  const payload = {
    company_id: context.companyId,
    title: input.title,
    assignee_id: input.assigneeId || null,
    department_id: input.departmentId || null,
    linked_kpi_id: input.linkedKpiId || null,
    due_date: input.dueDate || null,
    priority: input.priority || "normal",
    task_type: input.taskType || "growth",
    status: "todo",
  };

  const { data } = await tasksTable.insert(payload).select("id").single();
  await writeAuditLog({
    action: "task.create",
    entity: "tasks",
    entityId: data?.id ?? null,
    after: payload,
  });
}

export async function recordTaskOutput(input: {
  taskId: string;
  outputType: string;
  value: number;
}) {
  const user = await getAuthenticatedUser();
  const context = await getUserContext(user);
  if (!context.companyId) return;

  const db = await getDbClientOrThrow();

  // Verify task belongs to company and check assignee/manager access
  const taskResult = await db.from("tasks").select("assignee_id").eq("id", input.taskId).eq("company_id", context.companyId).single();
  const task = taskResult.data as { assignee_id: string | null } | null;
  const { hasAnyRole } = await import("@/lib/auth/permissions");
  if (!task) throw new Error("Unauthorized: Task không tìm thấy hoặc không thuộc công ty của bạn");
  if (task.assignee_id !== context.employeeId && !hasAnyRole(context, ["ceo", "dept_head", "team_lead"])) {
    throw new Error("Unauthorized: You can only record output for your own tasks.");
  }

  const outputsTable = db.from("task_outputs") as unknown as {
    insert: (values: Record<string, unknown>) => Promise<unknown>;
  };
  const tasksTable = db.from("tasks") as unknown as {
    update: (values: Record<string, unknown>) => {
      eq: (column: string, value: string) => {
        eq: (column: string, value: string) => Promise<unknown>;
      };
    };
  };

  await outputsTable.insert({
    task_id: input.taskId,
    output_type: input.outputType,
    value: input.value,
  });
  await tasksTable.update({ status: "done" }).eq("id", input.taskId).eq("company_id", context.companyId);

  await writeAuditLog({
    action: "task.output.record",
    entity: "task_outputs",
    entityId: input.taskId,
    after: input,
  });
}
