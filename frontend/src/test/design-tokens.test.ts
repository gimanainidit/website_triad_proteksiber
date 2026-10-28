import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

type Theme = "light" | "dark";
type Token = { name: string; value: string | Record<Theme, string> };

const tokens = JSON.parse(readFileSync(resolve(__dirname, "../../../docs/design-system/tokens.json"), "utf8"));
const css = readFileSync(resolve(__dirname, "../index.css"), "utf8");

const HEX = /^#[0-9a-f]{6}$/i;
const colorTokens: Token[] = tokens.color.tokens;

const block = (selector: RegExp) => css.match(selector)?.[1] ?? "";
const rootBlock = block(/:root\s*\{([^}]*)\}/);
const darkBlock = block(/\.dark\s*\{([^}]*)\}/);

const declaration = (body: string, variable: string) =>
  body.match(new RegExp(String.raw`--${variable}\s*:\s*([^;]+);`))?.[1].trim();

// A DS hex either lives as plain hex, or as a shadcn "H S% L%" triplet.
function hslTripletToHex(triplet: string): string {
  const [h, s, l] = triplet.split(/\s+/).map((part) => parseFloat(part));
  const sat = s / 100;
  const light = l / 100;
  const chroma = sat * Math.min(light, 1 - light);
  const channel = (n: number) => {
    const k = (n + h / 30) % 12;
    const value = light - chroma * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(value * 255).toString(16).padStart(2, "0");
  };
  return `#${channel(0)}${channel(8)}${channel(4)}`;
}

function resolvedHex(raw: string | undefined): string | undefined {
  if (raw === undefined) return undefined;
  return HEX.test(raw) ? raw.toLowerCase() : hslTripletToHex(raw);
}

// The DS "muted" is disabled text, while shadcn's --muted is a surface.
const cssNameFor: Record<string, string> = { muted: "muted-ink" };

const valueIn = (theme: Theme, variable: string) =>
  resolvedHex(declaration(theme === "dark" ? darkBlock : "", variable) ?? declaration(rootBlock, variable));

describe("color tokens", () => {
  const plain = colorTokens.filter(
    (token): token is Token & { value: Record<Theme, string> } => typeof token.value === "object",
  );

  test.each(plain.map((token) => [token.name, token] as const))("--%s matches the design system in light and dark", (name, token) => {
    const variable = cssNameFor[name] ?? name;
    expect(HEX.test(token.value.light)).toBe(true);
    expect(valueIn("light", variable)).toBe(token.value.light.toLowerCase());
    expect(valueIn("dark", variable)).toBe(token.value.dark.toLowerCase());
  });

  test.each(colorTokens.filter((token) => typeof token.value === "string"))("alias --$name points at $value", (token) => {
    const target = (token.value as string).replace(/[{}]/g, "");
    expect(declaration(rootBlock, token.name)).toBe(`var(--${target})`);
  });
});

describe("shadcn variables read from design system tokens", () => {
  const byName = Object.fromEntries(colorTokens.map((token) => [token.name, token.value as Record<Theme, string>]));
  const shadcnFrom: Record<string, string> = {
    card: "canvas",
    "card-foreground": "ink",
    popover: "canvas",
    "popover-foreground": "ink",
    secondary: "surface-raised",
    "secondary-foreground": "ink",
    muted: "surface-raised",
    "muted-foreground": "steel",
    foreground: "ink",
    border: "hairline",
    input: "hairline",
    "primary-foreground": "on-primary",
    "destructive-foreground": "on-destructive",
    "dark-foreground": "on-dark",
    "dark-muted": "on-dark-muted",
  };

  test.each(Object.entries(shadcnFrom))("--%s follows %s", (variable, source) => {
    expect(valueIn("light", variable)).toBe(byName[source].light.toLowerCase());
    expect(valueIn("dark", variable)).toBe(byName[source].dark.toLowerCase());
  });

  test("--dark is the dark page background in both themes", () => {
    expect(valueIn("light", "dark")).toBe(byName.background.dark.toLowerCase());
    expect(valueIn("dark", "dark")).toBe(byName.background.dark.toLowerCase());
  });
});

describe("shadows", () => {
  test.each(tokens.shadow.tokens as { name: string; value: string }[])("--$name matches", ({ name, value }) => {
    expect(declaration(rootBlock, name)).toBe(value);
  });
});

describe("fonts", () => {
  const families = tokens.type.families as Record<"serif" | "sans" | "mono", string>;
  const fontsource: Record<keyof typeof families, string> = {
    serif: "@fontsource/dm-serif-display",
    sans: "@fontsource/inter",
    mono: "@fontsource/jetbrains-mono",
  };

  test.each(Object.entries(families))("--font-%s is the DS family stack and its package is imported", (kind, stack) => {
    expect(declaration(rootBlock, `font-${kind}`)).toBe(stack);
    expect(css).toContain(`'${fontsource[kind as keyof typeof families]}/`);
  });
});

describe("text contrast, light theme", () => {
  const light = (name: string) => {
    const hex = (colorTokens.find((token) => token.name === name)?.value as Record<Theme, string>).light;
    return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  };

  // WCAG 2.x relative luminance and contrast ratio.
  const luminance = (rgb: number[]) => {
    const [r, g, b] = rgb.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrast = (foreground: string, background: string) => {
    const [hi, lo] = [luminance(light(foreground)), luminance(light(background))].sort((a, b) => b - a);
    return (hi + 0.05) / (lo + 0.05);
  };

  test.each([
    ["ink", "accent-soft"],
    ["ink-strong", "accent-soft"],
    ["steel", "canvas"],
    ["link", "canvas"],
    ["on-dark-muted", "navy-950"],
    ["on-dark", "navy-950"],
    ["ink", "canvas"],
  ])("%s on %s is at least 4.5:1", (foreground, background) => {
    expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
  });
});
