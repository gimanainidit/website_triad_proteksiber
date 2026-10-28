import { describe, expect, test } from "vitest";
import config from "../../tailwind.config";

type ColorFn = (args: { opacityValue?: string }) => string;
const navy = (config.theme?.extend?.colors as unknown as { navy: Record<number, ColorFn> }).navy;

describe("design system color classes", () => {
  test("a bare class keeps a plain var() so browsers without color-mix still paint it", () => {
    expect(navy[950]({ opacityValue: "var(--tw-bg-opacity)" })).toBe("var(--navy-950)");
    expect(navy[950]({ opacityValue: undefined })).toBe("var(--navy-950)");
  });

  test.each(["0.9", ".5", "1"])("a numeric alpha (%s) goes through color-mix", (opacityValue) => {
    expect(navy[950]({ opacityValue })).toBe(`color-mix(in srgb, var(--navy-950) calc(${opacityValue} * 100%), transparent)`);
  });
});
