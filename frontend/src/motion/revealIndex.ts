import type { CSSProperties } from "react";

export function revealIndex(i: number): CSSProperties {
  return { "--i": i } as CSSProperties;
}
