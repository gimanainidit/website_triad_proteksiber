import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// The only DS component allowed to be a full pill.
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-sans text-[13px] font-semibold leading-[1.4]",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground",
        soft: "border border-soft-border bg-soft text-ink-strong",
        dark: "bg-navy-950 text-on-dark",
      },
    },
    defaultVariants: { variant: "primary" },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(({ className, variant, ...props }, ref) => (
  <span ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
));
Badge.displayName = "Badge";
