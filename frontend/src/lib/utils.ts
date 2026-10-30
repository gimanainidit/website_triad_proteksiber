import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// DS type classes set the font, not the color. Unregistered, twMerge drops them next to a text color.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "hero-display",
            "display-lg",
            "stat-display",
            "heading-1",
            "heading-2",
            "heading-3",
            "heading-4",
            "heading-5",
            "subtitle",
            "body-md",
            "body-sm",
            "caption",
            "eyebrow",
            "tagline",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
