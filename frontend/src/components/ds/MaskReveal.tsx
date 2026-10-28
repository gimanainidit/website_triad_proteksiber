import * as React from "react";

import { cn } from "@/lib/utils";
import "./ds.css";

/** Wipes in left to right when an ancestor `.group` is hovered or holds keyboard focus. The text stays in the accessibility tree. */
export const MaskReveal = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => <span ref={ref} className={cn("ds-mask-reveal", className)} {...props} />,
);
MaskReveal.displayName = "MaskReveal";
