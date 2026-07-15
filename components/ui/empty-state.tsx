import * as React from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  compact,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "gap-3 py-12" : "gap-4 py-20",
        className,
      )}
    >
      <div className="relative">
        <div className="absolute inset-0 -z-10 rounded-full bg-primary/10 blur-2xl" />
        <span
          className={cn(
            "flex items-center justify-center rounded-2xl border border-border bg-gradient-to-br from-secondary to-card text-muted-foreground shadow-sm",
            compact ? "h-12 w-12" : "h-16 w-16",
          )}
        >
          <Icon className={compact ? "h-5 w-5" : "h-7 w-7"} />
        </span>
      </div>
      <div className="max-w-sm space-y-1.5">
        <h3 className={cn("font-semibold tracking-tight", compact ? "text-base" : "text-lg")}>
          {title}
        </h3>
        {description && (
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
