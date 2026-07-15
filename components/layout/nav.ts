import {
  LayoutDashboard,
  Truck,
  Wallet,
  CalendarRange,
  TrendingUp,
  FileText,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  primary?: boolean; // shown in mobile bottom bar
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, primary: true },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/trucks", label: "Trucks", icon: Truck, primary: true },
      { href: "/payments", label: "Payments", icon: Wallet, primary: true },
    ],
  },
  {
    label: "Insights",
    items: [
      { href: "/tracking", label: "Tracking", icon: CalendarRange },
      { href: "/analytics", label: "Analytics", icon: TrendingUp, primary: true },
      { href: "/reports", label: "Reports", icon: FileText, primary: true },
    ],
  },
  {
    label: "System",
    items: [{ href: "/settings", label: "Settings", icon: Settings }],
  },
];

export const navItems: NavItem[] = navSections.flatMap((s) => s.items);
