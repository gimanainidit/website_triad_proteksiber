import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Eyebrow } from "./Eyebrow";

describe("Eyebrow", () => {
  test("renders its text", () => {
    render(<Eyebrow>Enterprise Cybersecurity</Eyebrow>);
    expect(screen.getByText("Enterprise Cybersecurity")).toBeInTheDocument();
  });

  test.each(["link", "on-dark", "steel"] as const)("renders text for tone %s", (tone) => {
    render(<Eyebrow tone={tone}>Label</Eyebrow>);
    expect(screen.getByText("Label")).toBeInTheDocument();
  });
});
