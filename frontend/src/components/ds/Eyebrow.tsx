import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const eyebrowVariants = cva("text-eyebrow", {
  variants: {
    // shield-blue fails contrast as small text on light grounds, so `link` is the light-ground tone.
    tone: { link: "text-link", "on-dark": "text-shield", steel: "text-steel" },
  },
  defaultVariants: { tone: "link" },
});

export interface EyebrowProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof eyebrowVariants> {}

export const Eyebrow = React.forwardRef<HTMLParagraphElement, EyebrowProps>(({ className, tone, ...props }, ref) => (
  <p ref={ref} className={cn(eyebrowVariants({ tone }), className)} {...props} />
));
Eyebrow.displayName = "Eyebrow";
