import * as React from "react";

import { cn } from "@/lib/utils";
import { LineMarker } from "./LineMarker";

// 4 columns below lg, 12 from lg. Padding and gap follow the benchmark's inner-card grid (18/22px, 14/16px).
const gridTracks = "grid grid-cols-4 gap-x-[14px] px-[18px] lg:grid-cols-12 lg:gap-x-4 lg:px-[22px]";

export const SectionGrid = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn(gridTracks, className)} {...props} />,
);
SectionGrid.displayName = "SectionGrid";

export type ColStart = 1 | 5 | 9 | 12;
export type ColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

// Static maps so Tailwind's scanner sees every class.
const startClass: Record<ColStart, string> = {
  1: "lg:col-start-1",
  5: "lg:col-start-5",
  9: "lg:col-start-9",
  12: "lg:col-start-12",
};

const spanClass: Record<ColSpan, string> = {
  1: "lg:col-span-1",
  2: "lg:col-span-2",
  3: "lg:col-span-3",
  4: "lg:col-span-4",
  5: "lg:col-span-5",
  6: "lg:col-span-6",
  7: "lg:col-span-7",
  8: "lg:col-span-8",
  9: "lg:col-span-9",
  10: "lg:col-span-10",
  11: "lg:col-span-11",
  12: "lg:col-span-12",
};

export interface ColProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Column the item starts on at lg and up. Omit to let the grid place it. */
  start?: ColStart;
  /** Columns spanned at lg and up. Below lg every Col takes the full row. */
  span?: ColSpan;
}

export const Col = React.forwardRef<HTMLDivElement, ColProps>(({ className, start, span = 12, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("col-span-4", start && startClass[start], spanClass[span], className)}
    {...props}
  />
));
Col.displayName = "Col";

export interface MarkerRowProps extends React.HTMLAttributes<HTMLDivElement> {
  inverted?: boolean;
  /** Which edge of the card the row sits on; sets the inner padding on that side. */
  position?: "top" | "bottom";
}

// Markers sit on columns 1, 5, 9, 12 at lg and up, and on columns 1 and 3 of the 4-column mobile grid.
const markerSlots = [
  "col-start-1 lg:col-start-1",
  "col-start-3 lg:col-start-5",
  "hidden lg:block lg:col-start-9",
  "hidden lg:block lg:col-start-12",
];

export const MarkerRow = React.forwardRef<HTMLDivElement, MarkerRowProps>(
  ({ className, inverted, position = "top", ...props }, ref) => (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        gridTracks,
        position === "top" ? "pt-[18px] lg:pt-[22px]" : "pb-[18px] lg:pb-[22px]",
        className,
      )}
      {...props}
    >
      {markerSlots.map((slot, i) => (
        <LineMarker key={slot} index={i} inverted={inverted} className={cn("mb-0", slot)} />
      ))}
    </div>
  ),
);
MarkerRow.displayName = "MarkerRow";
