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
import type { AppRole } from "./auth/permissions";
import { ROUTE_ROLES } from "./auth/routes";

export type { AppRole };

export type NavItem = {
  href: string;
  labelKey: keyof typeof DICT;
  icon: LucideIcon;
  roles?: AppRole[];
};

export type NavGroup = {
  id: string;
  labelKey: keyof typeof DICT;
  defaultOpen?: boolean;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "overview",
    labelKey: "sidebar.group.overview",
    defaultOpen: true,
    items: [
      { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
      { href: "/alerts", labelKey: "nav.alerts", icon: Bell },
    ],
  },
  {
    id: "people",
    labelKey: "sidebar.group.people",
    items: [
      { href: "/org", labelKey: "nav.org", icon: Network },
      { href: "/departments", labelKey: "nav.departments", icon: Building2 },
      { href: "/people", labelKey: "nav.people", icon: Users },
      { href: "/recruiting", labelKey: "nav.recruiting", icon: UserPlus, roles: ROUTE_ROLES["/recruiting"] },
    ],
  },
  {
    id: "performance",
    labelKey: "sidebar.group.performance",
    defaultOpen: true,
    items: [
      { href: "/kpi", labelKey: "nav.kpi", icon: Target },
      { href: "/okr", labelKey: "nav.okr", icon: Flag },
      { href: "/operations", labelKey: "nav.operations", icon: ListChecks },
      { href: "/projects", labelKey: "nav.projects", icon: FolderKanban },
      { href: "/forecast", labelKey: "nav.forecast", icon: TrendingUp, roles: ROUTE_ROLES["/forecast"] },
    ],
  },
  {
    id: "finance",
    labelKey: "sidebar.group.finance",
    items: [
      { href: "/compensation", labelKey: "nav.compensation", icon: Wallet, roles: ROUTE_ROLES["/compensation"] },
      { href: "/finance", labelKey: "nav.finance", icon: Landmark, roles: ROUTE_ROLES["/finance"] },
      { href: "/reports", labelKey: "nav.reports", icon: FileBarChart, roles: ROUTE_ROLES["/reports"] },
    ],
  },
  {
    id: "governance",
    labelKey: "sidebar.group.governance",
    items: [
      { href: "/approvals", labelKey: "nav.approvals", icon: CheckSquare, roles: ROUTE_ROLES["/approvals"] },
      { href: "/audit", labelKey: "nav.audit", icon: History, roles: ROUTE_ROLES["/audit"] },
      { href: "/settings", labelKey: "nav.settings", icon: Settings, roles: ROUTE_ROLES["/settings"] },
    ],
  },
  {
    id: "personal",
    labelKey: "sidebar.group.personal",
    items: [
      { href: "/knowledge", labelKey: "nav.knowledge", icon: BookOpen },
      { href: "/profile", labelKey: "nav.profile", icon: UserCircle },
      { href: "/guide", labelKey: "nav.guide", icon: HelpCircle },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
