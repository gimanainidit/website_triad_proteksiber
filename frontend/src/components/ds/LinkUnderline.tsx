import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

export interface LinkUnderlineProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  asChild?: boolean;
}

// The underline is a ::before that grows from the centre: width 0 to 100% while left goes 50% to 0.
const underline = [
  "before:absolute before:left-1/2 before:top-[calc(100%+1px)] before:h-px before:w-0 before:bg-ink before:opacity-50 before:content-['']",
  "before:transition-[width,left,opacity] before:duration-[350ms] before:ease-in-out motion-reduce:before:transition-none",
  "hover:before:left-0 hover:before:w-full hover:before:opacity-100",
  "focus-visible:before:left-0 focus-visible:before:w-full focus-visible:before:opacity-100",
].join(" ");

export const LinkUnderline = React.forwardRef<HTMLAnchorElement, LinkUnderlineProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "a";
    return (
      <Comp
        ref={ref}
        className={cn(
          "relative text-steel transition-colors duration-[350ms] ease-in-out hover:text-ink focus-visible:text-ink motion-reduce:transition-none",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          underline,
          className,
        )}
        {...props}
      />
    );
  },
);
LinkUnderline.displayName = "LinkUnderline";
