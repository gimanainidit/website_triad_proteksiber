import { screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { renderWithProviders } from "@/test/render";
import { Hero } from "./Hero";

describe("Hero", () => {
  test("has exactly one h1 that reads the headline", () => {
    renderWithProviders(<Hero />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(/^Lindungi Bisnis Anda dari Ancaman Siber\.$/);
  });
});
