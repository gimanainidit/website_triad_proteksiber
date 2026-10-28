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

  test("Hubungi Kami links to /contact", () => {
    renderWithProviders(<Hero />);
    expect(screen.getByRole("link", { name: "Hubungi Kami" })).toHaveAttribute("href", "/contact");
  });

  test("Company Deck links to the PDF in a new tab", () => {
    renderWithProviders(<Hero />);
    const link = screen.getByRole("link", { name: "Company Deck" });
    expect(link).toHaveAttribute("href", "/Triad_Proteksi-Company_Deck.pdf");
    expect(link).toHaveAttribute("target", "_blank");
  });
});
