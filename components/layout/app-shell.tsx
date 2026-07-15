"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Mountain } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems } from "./nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { InstallButton } from "@/components/pwa/install-prompt";

function Brand({ name }: { name: string }) {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <Mountain className="h-5 w-5" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-sm font-semibold tracking-tight">{name}</span>
        <span className="text-[11px] text-muted-foreground">Business Manager</span>
      </span>
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-1 flex-col gap-1">
      {navItems.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
            {item.label}
          </Link>
        );
      })}
    </nav>
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
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-card px-4 py-5 lg:flex">
        <div className="px-2 pb-6">
          <Brand name={businessName} />
        </div>
        <NavLinks />
        <div className="mt-auto rounded-lg bg-muted/60 p-3 text-[11px] leading-relaxed text-muted-foreground">
          <p className="font-medium text-foreground">Soft Stone PWA</p>
          Installable · Offline-ready
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[80%] flex-col border-r border-border bg-card px-4 py-5 animate-in">
            <div className="flex items-center justify-between px-2 pb-6">
              <Brand name={businessName} />
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavLinks onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Top bar */}
      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur lg:pl-[17rem] lg:pr-6">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-2 text-muted-foreground hover:bg-secondary lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="lg:hidden">
          <Brand name={businessName} />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <InstallButton />
          <ThemeToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="px-4 pb-24 pt-5 sm:px-6 lg:pb-10 lg:pl-[17rem] lg:pr-6">
        <div className="mx-auto w-full max-w-7xl">{children}</div>
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
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-border bg-card/95 backdrop-blur lg:hidden">
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
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
