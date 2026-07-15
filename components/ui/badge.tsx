import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold ring-1 ring-inset transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/10 text-primary ring-primary/15",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground ring-border",
        success: "border-transparent bg-success/12 text-success ring-success/20",
        warning:
          "border-transparent bg-warning/15 text-warning-foreground ring-warning/25 dark:text-warning",
        destructive:
          "border-transparent bg-destructive/12 text-destructive ring-destructive/20",
        outline: "border-border text-foreground ring-transparent",
        muted: "border-transparent bg-muted text-muted-foreground ring-border/60",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
