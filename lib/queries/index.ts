import * as demo from "./demo";
import { listDepartments, listEmployees, getCompany } from "@/lib/repositories/org";
import { listKpis, listKpiActuals, listKpiTargets } from "@/lib/repositories/kpi";
import { listTasks } from "@/lib/repositories/operations";
import { listPayrollEntries } from "@/lib/repositories/compensation";
import { listProjects } from "@/lib/repositories/projects";
import { listAccountingEntries } from "@/lib/repositories/finance";
import {
  listAlerts,
  listApprovals,
  listAuditLogs,
  listReports,
  listReportSchedules,
} from "@/lib/repositories/governance";
import { listSops } from "@/lib/repositories/knowledge";
import { listRequisitions } from "@/lib/repositories/recruiting";
import { getProfileScreenData } from "@/lib/repositories/profile";
import { withDemoFallback } from "@/lib/repositories/shared";

export async function fetchEmployees() {
  return listEmployees();
}

export async function fetchDepartments() {
  return listDepartments();
}

export async function fetchCompany() {
  return getCompany();
}

export async function fetchKpis() {
  return listKpis();
}

export async function fetchKpiActuals(period = "2026-04") {
  return listKpiActuals(period);
}

export async function fetchKpiTargets(period = "2026-04") {
  return listKpiTargets(period);
}

export async function fetchTasks() {
  return listTasks();
}

export async function fetchPayroll() {
  return listPayrollEntries();
}

export async function fetchProjects() {
  return listProjects();
}

export async function fetchAccounting() {
  return listAccountingEntries();
}

export async function fetchAlerts() {
  return listAlerts();
}

export async function fetchApprovals() {
  return listApprovals();
}

export async function fetchReports() {
  return listReports();
}

export async function fetchReportSchedules() {
  return listReportSchedules();
}

export async function fetchObjectives() {
  return withDemoFallback(demo.demoObjectives, async (db) => {
    const { data, error } = await db.from("objectives").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });
}

export async function fetchKeyResults() {
  return withDemoFallback(demo.demoKeyResults, async (db) => {
    const { data, error } = await db.from("key_results").select("*");
    if (error) throw error;
    return data ?? [];
  });
}

export async function fetchRequisitions() {
  return listRequisitions();
}

export async function fetchSops() {
  return listSops();
}

export async function fetchAuditLogs() {
  return listAuditLogs();
}

export async function fetchProfileData() {
  return getProfileScreenData();
}

export { demo };
