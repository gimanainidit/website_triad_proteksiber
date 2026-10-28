import * as React from "react";

import { cn } from "@/lib/utils";
import "./ds.css";

export const ShieldStripe = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} aria-hidden="true" role="presentation" className={cn("ds-shield-stripe", className)} {...props} />
  ),
);
ShieldStripe.displayName = "ShieldStripe";
