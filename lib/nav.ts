import {
  LayoutDashboard,
  Network,
  Building2,
  Users,
  Target,
  ListChecks,
  Wallet,
  FolderKanban,
  Landmark,
  Settings,
  FileBarChart,
  Bell,
  CheckSquare,
  History,
  Flag,
  TrendingUp,
  UserPlus,
  BookOpen,
  UserCircle,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";
import type { DICT } from "./i18n/dict";

export type NavItem = {
  href: string;
  labelKey: keyof typeof DICT;
  icon: LucideIcon;
  roles?: Array<"ceo" | "cfo" | "hr_admin" | "dept_head" | "team_lead" | "employee" | "auditor">;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/org", labelKey: "nav.org", icon: Network },
  { href: "/departments", labelKey: "nav.departments", icon: Building2 },
  { href: "/people", labelKey: "nav.people", icon: Users },
  { href: "/kpi", labelKey: "nav.kpi", icon: Target },
  { href: "/operations", labelKey: "nav.operations", icon: ListChecks },
  { href: "/compensation", labelKey: "nav.compensation", icon: Wallet, roles: ["ceo", "cfo", "hr_admin", "dept_head"] },
  { href: "/projects", labelKey: "nav.projects", icon: FolderKanban },
  { href: "/finance", labelKey: "nav.finance", icon: Landmark, roles: ["ceo", "cfo", "auditor"] },
  { href: "/reports", labelKey: "nav.reports", icon: FileBarChart, roles: ["ceo", "cfo", "hr_admin", "dept_head", "auditor"] },
  { href: "/alerts", labelKey: "nav.alerts", icon: Bell },
  { href: "/approvals", labelKey: "nav.approvals", icon: CheckSquare, roles: ["ceo", "cfo", "hr_admin", "dept_head", "team_lead"] },
  { href: "/audit", labelKey: "nav.audit", icon: History, roles: ["ceo", "auditor", "cfo"] },
  { href: "/okr", labelKey: "nav.okr", icon: Flag },
  { href: "/forecast", labelKey: "nav.forecast", icon: TrendingUp, roles: ["ceo", "cfo", "dept_head"] },
  { href: "/recruiting", labelKey: "nav.recruiting", icon: UserPlus, roles: ["ceo", "hr_admin", "dept_head"] },
  { href: "/knowledge", labelKey: "nav.knowledge", icon: BookOpen },
  { href: "/profile", labelKey: "nav.profile", icon: UserCircle },
  { href: "/settings", labelKey: "nav.settings", icon: Settings, roles: ["ceo", "cfo", "hr_admin"] },
  { href: "/guide", labelKey: "nav.guide", icon: HelpCircle },
];
