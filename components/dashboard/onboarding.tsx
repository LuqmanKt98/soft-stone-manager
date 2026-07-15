import Link from "next/link";
import {
  Truck,
  Wallet,
  Settings2,
  ArrowRight,
  Sparkles,
  TrendingUp,
  FileText,
} from "lucide-react";
import { Card } from "@/components/ui/card";

const steps = [
  {
    icon: Settings2,
    title: "Set your default rates",
    desc: "Confirm purchase, selling and rental rates so every trip auto-calculates.",
    href: "/settings",
    cta: "Open Settings",
    accent: "text-chart-7 bg-chart-7/10 ring-chart-7/15",
  },
  {
    icon: Truck,
    title: "Add your first truck trip",
    desc: "Enter tons and rates — profit and transport savings are computed instantly.",
    href: "/trucks",
    cta: "Add a Trip",
    accent: "text-primary bg-primary/10 ring-primary/15",
  },
  {
    icon: Wallet,
    title: "Record a payment",
    desc: "Log what the company pays and watch outstanding balances update live.",
    href: "/payments",
    cta: "Record Payment",
    accent: "text-chart-2 bg-chart-2/10 ring-chart-2/15",
  },
];

const features = [
  { icon: TrendingUp, label: "Live analytics & trends" },
  { icon: FileText, label: "PDF & Excel reports" },
  { icon: Sparkles, label: "Installable offline app" },
];

export function DashboardOnboarding({ businessName }: { businessName: string }) {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="relative overflow-hidden border-border">
        <div className="grid-dots absolute inset-0 opacity-40" />
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative p-7 sm:p-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-primary shadow-sm">
            <Sparkles className="h-3.5 w-3.5" /> Welcome
          </span>
          <h2 className="mt-4 max-w-xl text-2xl font-semibold tracking-tight sm:text-3xl">
            Let&apos;s set up {businessName}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Your dashboard is ready and waiting for data. Follow the steps below to
            start tracking trips, profit, transportation savings and payments — all
            calculated automatically.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {features.map((f) => (
              <span
                key={f.label}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/70 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur"
              >
                <f.icon className="h-3.5 w-3.5 text-primary" />
                {f.label}
              </span>
            ))}
          </div>
        </div>
      </Card>

      {/* Steps */}
      <div className="grid gap-4 md:grid-cols-3 stagger">
        {steps.map((s, i) => (
          <Card key={s.href} className="flex flex-col p-5 card-elevated card-hover">
            <div className="flex items-center justify-between">
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${s.accent}`}
              >
                <s.icon className="h-5 w-5" />
              </span>
              <span className="text-2xl font-bold text-muted-foreground/25">
                0{i + 1}
              </span>
            </div>
            <h3 className="mt-4 font-semibold tracking-tight">{s.title}</h3>
            <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">
              {s.desc}
            </p>
            <Link
              href={s.href}
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:gap-1.5"
            >
              {s.cta} <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
