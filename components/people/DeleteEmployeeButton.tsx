"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Trash2, Loader2 } from "lucide-react";
import { deleteEmployeeAction } from "@/app/(app)/workspace/actions";
import { Button } from "@/components/ui/button";

function SubmitButton({ employeeName }: { employeeName: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="ghost"
      size="icon"
      disabled={pending}
      className="h-8 w-8 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
      title="Xóa nhân sự"
      onClick={(e) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa nhân sự "${employeeName}"?\nThao tác này sẽ xóa cả tài khoản đăng nhập và không thể hoàn tác.`)) {
          e.preventDefault();
        }
      }}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}

export function DeleteEmployeeButton({
  employeeId,
  employeeName,
  disabled = false,
}: {
  employeeId: string;
  employeeName: string;
  disabled?: boolean;
}) {
  const [state, formAction] = useActionState(deleteEmployeeAction, null);

  useEffect(() => {
    if (state?.error) {
      alert(`Lỗi xóa nhân sự: ${state.error}`);
    }
  }, [state]);

  if (disabled) return null;

  return (
    <form action={formAction}>
      <input type="hidden" name="employeeId" value={employeeId} />
      <SubmitButton employeeName={employeeName} />
    </form>
  );
}
