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

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, primary: true },
  { href: "/trucks", label: "Trucks", icon: Truck, primary: true },
  { href: "/payments", label: "Payments", icon: Wallet, primary: true },
  { href: "/tracking", label: "Tracking", icon: CalendarRange },
  { href: "/analytics", label: "Analytics", icon: TrendingUp, primary: true },
  { href: "/reports", label: "Reports", icon: FileText, primary: true },
  { href: "/settings", label: "Settings", icon: Settings },
];
