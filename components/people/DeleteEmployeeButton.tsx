"use client";

import { Trash2 } from "lucide-react";
import { deleteEmployeeAction } from "@/app/(app)/workspace/actions";
import { Button } from "@/components/ui/button";

export function DeleteEmployeeButton({
  employeeId,
  employeeName,
  disabled = false,
}: {
  employeeId: string;
  employeeName: string;
  disabled?: boolean;
}) {
  const handleDelete = async (e: React.FormEvent) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa nhân sự "${employeeName}"?\nThao tác này sẽ xóa cả tài khoản đăng nhập và không thể hoàn tác.`)) {
      e.preventDefault();
    }
  };

  if (disabled) return null;

  return (
    <form action={deleteEmployeeAction} onSubmit={handleDelete}>
      <input type="hidden" name="employeeId" value={employeeId} />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
        title="Xóa nhân sự"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </form>
  );
}
