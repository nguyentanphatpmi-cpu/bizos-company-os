"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";
import { t as rawT, type Locale } from "@/lib/i18n/dict";
import { cn } from "@/lib/utils";

export function Sidebar({
  locale = "vi",
  roles = [],
}: {
  locale?: Locale;
  roles?: string[];
}) {
  const pathname = usePathname();
  const t = (key: Parameters<typeof rawT>[1]) => rawT(locale, key);
  const visibleItems = NAV_ITEMS.filter((item) => !item.roles || item.roles.some((role) => roles.includes(role)));

  return (
    <aside className="hidden md:flex md:w-[220px] md:flex-col md:fixed md:inset-y-0 md:left-0 md:z-30 md:bg-white md:ring-1 md:ring-[var(--line-soft)]">
      <div className="flex h-[78px] items-center gap-3 px-5 border-b border-[var(--line-soft)]">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6D5EF7] to-[#415BFF] text-white font-bold text-base shadow-[0_10px_25px_rgba(88,72,246,0.22)]">
          B
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[15px] font-bold text-[var(--text-strong)]">BIZOS</span>
          <span className="text-[10px] text-[var(--text-soft)] mt-0.5">{t("brand.tagline")}</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {visibleItems.map((item) => {
          const active =
            pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3.5 py-3 text-[13px] transition-colors",
                active
                  ? "bg-[var(--brand-50)] text-[var(--brand-700)] font-semibold shadow-[inset_0_0_0_1px_var(--brand-100)]"
                  : "text-[var(--text-soft)] hover:bg-[var(--surface-alt)] hover:text-[var(--text-strong)]",
              )}
            >
              <span className={cn("flex h-8 w-8 items-center justify-center rounded-xl", active ? "bg-white" : "bg-[var(--surface-alt)]")}>
                <Icon className="h-4 w-4 shrink-0" />
              </span>
              <span className="truncate">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="m-3 rounded-[24px] bg-[linear-gradient(180deg,#1E2458,#12183F)] p-4 text-white shadow-[0_18px_34px_rgba(12,16,47,0.22)]">
        <div className="text-[11px] opacity-75 mb-1">{t("sidebar.perf")}</div>
        <div className="text-[28px] font-bold leading-tight">87%</div>
        <div className="text-[11px] opacity-80 mt-1.5 leading-tight">{t("sidebar.perfHint")}</div>
      </div>
    </aside>
  );
}
