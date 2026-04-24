import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between", className)}>
      <div>
        <h1 className="text-[31px] font-bold tracking-tight text-[var(--text-strong)]">{title}</h1>
        {description && <p className="mt-1 text-[13px] text-[var(--text-soft)]">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
