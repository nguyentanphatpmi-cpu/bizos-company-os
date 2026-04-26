"use server";

import { revalidatePath } from "next/cache";
import { resolveAlert, setApprovalStatus } from "@/lib/repositories/governance";
import { assertAnyRole } from "@/lib/auth/guard";

export async function resolveAlertAction(formData: FormData) {
  await assertAnyRole(["ceo", "cfo", "hr_admin", "auditor"]);
  const alertId = String(formData.get("alertId") ?? "");
  if (!alertId) return;
  await resolveAlert(alertId);
  revalidatePath("/alerts");
}

export async function approveRequestAction(formData: FormData) {
  await assertAnyRole(["ceo", "cfo", "hr_admin", "dept_head", "team_lead"]);
  const approvalId = String(formData.get("approvalId") ?? "");
  if (!approvalId) return;
  await setApprovalStatus(approvalId, "approved");
  revalidatePath("/approvals");
}

export async function rejectRequestAction(formData: FormData) {
  await assertAnyRole(["ceo", "cfo", "hr_admin", "dept_head", "team_lead"]);
  const approvalId = String(formData.get("approvalId") ?? "");
  if (!approvalId) return;
  await setApprovalStatus(approvalId, "rejected");
  revalidatePath("/approvals");
}
