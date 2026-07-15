import * as React from "react";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Accent =
  | "primary"
  | "chart-2"
  | "chart-4"
  | "chart-5"
  | "chart-6"
  | "chart-7"
  | "success"
  | "destructive";

const accentChip: Record<Accent, string> = {
  primary: "bg-primary/10 text-primary ring-primary/15",
  "chart-2": "bg-chart-2/10 text-chart-2 ring-chart-2/15",
  "chart-4": "bg-chart-4/15 text-chart-4 ring-chart-4/20",
  "chart-5": "bg-chart-5/10 text-chart-5 ring-chart-5/15",
  "chart-6": "bg-chart-6/10 text-chart-6 ring-chart-6/15",
  "chart-7": "bg-chart-7/10 text-chart-7 ring-chart-7/15",
  success: "bg-success/10 text-success ring-success/15",
  destructive: "bg-destructive/10 text-destructive ring-destructive/15",
};

export interface StatCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  accent?: Accent;
  hint?: string;
  tone?: "default" | "positive" | "negative";
  delta?: { value: number; label?: string };
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "primary",
  hint,
  tone = "default",
  delta,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card p-5 card-elevated card-hover",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="truncate text-[13px] font-medium text-muted-foreground">
          {label}
        </p>
        {Icon && (
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 transition-transform group-hover:scale-110",
              accentChip[accent],
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
          </span>
        )}
      </div>

      <p
        className={cn(
          "mt-3 text-[26px] font-semibold leading-none tracking-tight tabular",
          tone === "positive" && "text-success",
          tone === "negative" && "text-destructive",
        )}
      >
        {value}
      </p>

      {(hint || delta) && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {delta && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold",
                delta.value >= 0
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive",
              )}
            >
              {delta.value >= 0 ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              {Math.abs(delta.value).toFixed(1)}%
            </span>
          )}
          {hint && (
            <span className="text-xs text-muted-foreground">{hint}</span>
          )}
        </div>
      )}
    </div>
  );
}
