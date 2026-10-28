import * as React from "react";

import { cn } from "@/lib/utils";
import { revealIndex } from "@/motion";

export interface LineMarkerProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** For navy surfaces. */
  inverted?: boolean;
  compact?: boolean;
  /** Stagger position, read by `.reveal-line` as `--i`. */
  index?: number;
}

export const LineMarker = React.forwardRef<HTMLSpanElement, LineMarkerProps>(
  ({ className, inverted = false, compact = false, index, style, ...props }, ref) => (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn(
        "reveal-line block h-px w-[14px] bg-hairline-strong",
        compact ? "mb-2" : "mb-[14px]",
        inverted && "bg-on-dark-muted",
        className,
      )}
      style={index === undefined ? style : { ...revealIndex(index), ...style }}
      {...props}
    />
  ),
);
LineMarker.displayName = "LineMarker";
