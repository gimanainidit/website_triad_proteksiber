import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { MaskReveal } from "./MaskReveal";

describe("MaskReveal", () => {
  test("keeps its text in the accessibility tree", () => {
    render(
      <a href="/services" className="group">
        <MaskReveal>Pelajari</MaskReveal>
      </a>,
    );
    expect(screen.getByRole("link", { name: "Pelajari" })).toBeInTheDocument();
    expect(screen.getByText("Pelajari")).toBeVisible();
  });
});
