"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Mountain, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems, navSections } from "./nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { InstallButton } from "@/components/pwa/install-prompt";

function Brand({ name, subtitle = true }: { name: string; subtitle?: boolean }) {
  return (
    <Link href="/dashboard" className="group flex items-center gap-3">
      <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-chart-7 text-primary-foreground shadow-md ring-1 ring-black/5 transition-transform group-hover:scale-105">
        <Mountain className="h-5 w-5" />
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-[15px] font-semibold tracking-tight">{name}</span>
        {subtitle && (
          <span className="text-[11px] font-medium text-muted-foreground">
            Business Manager
          </span>
        )}
      </span>
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-1 flex-col gap-5 overflow-y-auto py-2">
      {navSections.map((section) => (
        <div key={section.label} className="flex flex-col gap-1">
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
            {section.label}
          </p>
          {section.items.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                )}
                <Icon
                  className={cn(
                    "h-[18px] w-[18px] transition-transform group-hover:scale-110",
                    active && "text-primary",
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function SidebarFooter() {
  return (
    <div className="rounded-xl border border-border bg-gradient-to-br from-secondary/60 to-card p-3.5">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Sparkles className="h-3.5 w-3.5" />
        </span>
        <p className="text-xs font-semibold">Soft Stone PWA</p>
      </div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
        Installable & offline-ready. Add it to your home screen for an app-like
        experience.
      </p>
    </div>
  );
}

export function AppShell({
  businessName,
  children,
}: {
  businessName: string;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col gap-2 border-r border-border bg-sidebar px-4 py-5 lg:flex">
        <div className="px-2 pb-4">
          <Brand name={businessName} />
        </div>
        <NavLinks />
        <SidebarFooter />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[280px] max-w-[82%] flex-col gap-2 border-r border-border bg-sidebar px-4 py-5 shadow-2xl animate-scale">
            <div className="flex items-center justify-between px-2 pb-4">
              <Brand name={businessName} />
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavLinks onNavigate={() => setMobileOpen(false)} />
            <SidebarFooter />
          </aside>
        </div>
      )}

      {/* Top bar */}
      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/70 px-4 backdrop-blur-xl lg:pl-[288px] lg:pr-6">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="lg:hidden">
          <Brand name={businessName} subtitle={false} />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <InstallButton />
          <ThemeToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="px-4 pb-28 pt-6 sm:px-6 lg:pb-12 lg:pl-[288px] lg:pr-6">
        <div className="mx-auto w-full max-w-[1400px]">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <MobileBottomNav />
    </div>
  );
}

function MobileBottomNav() {
  const pathname = usePathname();
  const items = navItems.filter((i) => i.primary);
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-border bg-card/90 px-1 backdrop-blur-xl lg:hidden">
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "flex h-8 w-full items-center justify-center rounded-lg transition-colors",
                active && "bg-primary/10",
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
