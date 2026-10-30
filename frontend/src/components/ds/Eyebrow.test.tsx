import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Eyebrow } from "./Eyebrow";

describe("Eyebrow", () => {
  test("renders its text", () => {
    render(<Eyebrow>Enterprise Cybersecurity</Eyebrow>);
    expect(screen.getByText("Enterprise Cybersecurity")).toBeInTheDocument();
  });

  test.each(["link", "on-dark", "steel"] as const)("keeps the eyebrow type style with tone %s", (tone) => {
    render(<Eyebrow tone={tone}>Label</Eyebrow>);
    expect(screen.getByText("Label")).toHaveClass("text-eyebrow");
  });

  test("a color override keeps the eyebrow type style", () => {
    render(<Eyebrow className="text-primary">Label</Eyebrow>);
    expect(screen.getByText("Label")).toHaveClass("text-eyebrow", "text-primary");
  });
});
