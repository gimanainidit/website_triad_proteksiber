import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/btn relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-transparent font-sans font-medium transition-[background-color,border-color,color] duration-state motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:border-transparent disabled:bg-hairline disabled:text-muted-ink aria-disabled:cursor-not-allowed aria-disabled:border-transparent aria-disabled:bg-hairline aria-disabled:text-muted-ink",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground active:bg-primary-deep",
        dark: "bg-navy-950 text-on-dark dark:border-hairline-strong dark:bg-canvas",
        soft: "border-soft-border bg-soft text-ink-strong",
        secondary: "border-hairline-strong bg-transparent text-ink-strong",
        "on-soft": "border-soft-border bg-canvas text-ink-strong",
        link: "min-h-0 border-0 bg-transparent p-0 text-link active:underline disabled:bg-transparent aria-disabled:bg-transparent lg:min-h-0",
      },
      size: {
        md: "min-h-11 px-5 py-2.5 text-sm leading-[1.3] lg:min-h-10",
        sm: "h-6 px-2 [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:px-[14px] font-mono text-[11px] font-medium uppercase leading-none tracking-[1px]",
      },
      expand: {
        true: "transition-[background-color,border-color,color,padding-right] duration-expand",
        false: "",
      },
    },
    compoundVariants: [
      { size: "md", expand: true, class: "hover:pr-10 focus-visible:pr-10" },
      { size: "sm", expand: true, class: "hover:pr-[30px] focus-visible:pr-[30px]" },
    ],
    defaultVariants: { variant: "primary", size: "md", expand: false },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    Omit<VariantProps<typeof buttonVariants>, "expand"> {
  asChild?: boolean;
  /** Grow the right padding on hover/focus and fade in an arrow. Defaults to true, always off for `link`. */
  expand?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, expand = true, disabled, onClick, children, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const expanding = expand && variant !== "link" && !disabled;
    // An anchor has no native disabled state, so expose it through aria-disabled and swallow the click.
    const disabledProps =
      asChild && disabled
        ? { "aria-disabled": true, tabIndex: -1, onClick: (e: React.MouseEvent) => e.preventDefault() }
        : { disabled, onClick };
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, expand: expanding }), className)}
        {...props}
        {...disabledProps}
      >
        <Slottable>{children}</Slottable>
        {expanding && (
          <ArrowRight
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute size-4 opacity-0 transition-opacity duration-100 motion-reduce:transition-none",
              "group-hover/btn:opacity-100 group-hover/btn:delay-200 group-hover/btn:duration-300",
              "group-focus-visible/btn:opacity-100 group-focus-visible/btn:delay-200 group-focus-visible/btn:duration-300",
              size === "sm" ? "right-2" : "right-3",
            )}
          />
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";
