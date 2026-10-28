import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva("rounded-xl border", {
  variants: {
    variant: {
      default: "border-hairline bg-canvas p-6 text-ink",
      feature: "border-hairline bg-canvas p-8 text-ink",
      soft: "border-soft-border bg-soft p-8 text-ink",
      photo: "overflow-hidden border-navy-900 bg-navy-950 p-0 text-on-dark",
    },
  },
  defaultVariants: { variant: "default" },
});

export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, variant, ...props }, ref) => (
  <div ref={ref} className={cn(cardVariants({ variant }), className)} {...props} />
));
Card.displayName = "Card";
