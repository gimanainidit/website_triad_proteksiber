import * as React from "react";

import { cn } from "@/lib/utils";
import "./ds.css";

export interface MaskRevealProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Classes for the accent copy that wipes in over the label. Defaults to the link colour. */
  overlayClassName?: string;
}

/**
 * The label is readable at rest in the inherited colour. When an ancestor `.group` is hovered or holds keyboard focus,
 * an accent copy wipes in left to right on top of it. The copy is aria-hidden so the name is not announced twice.
 */
export const MaskReveal = React.forwardRef<HTMLSpanElement, MaskRevealProps>(
  ({ className, overlayClassName, children, ...props }, ref) => (
    <span ref={ref} className={cn("ds-mask-reveal", className)} {...props}>
      {children}
      <span aria-hidden="true" className={cn("ds-mask-reveal__overlay text-link", overlayClassName)}>
        {children}
      </span>
    </span>
  ),
);
MaskReveal.displayName = "MaskReveal";
