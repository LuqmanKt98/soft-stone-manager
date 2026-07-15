import * as React from "react";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

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
  primary: "bg-primary/10 text-primary",
  "chart-2": "bg-chart-2/10 text-chart-2",
  "chart-4": "bg-chart-4/15 text-chart-4",
  "chart-5": "bg-chart-5/10 text-chart-5",
  "chart-6": "bg-chart-6/10 text-chart-6",
  "chart-7": "bg-chart-7/10 text-chart-7",
  success: "bg-success/10 text-success",
  destructive: "bg-destructive/10 text-destructive",
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
    <Card className={cn("p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-muted-foreground">
            {label}
          </p>
          <p
            className={cn(
              "mt-2 text-2xl font-semibold tracking-tight tabular",
              tone === "positive" && "text-success",
              tone === "negative" && "text-destructive",
            )}
          >
            {value}
          </p>
          {(hint || delta) && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {delta && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-xs font-medium",
                    delta.value >= 0 ? "text-success" : "text-destructive",
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
        {Icon && (
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              accentChip[accent],
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
    </Card>
  );
}
