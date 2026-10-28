import { screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { renderWithProviders } from "@/test/render";
import Index from "./Index";

describe("Index landing page", () => {
  test("has exactly one h1", () => {
    renderWithProviders(<Index />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent("Lindungi Bisnis Anda dari Ancaman Siber.");
  });

  test("renders the sections in design order", () => {
    renderWithProviders(<Index />);
    const headings = Array.from(document.querySelectorAll("h1, h2")).map((h) => h.textContent ?? "");
    const expected = [
      "Lindungi Bisnis Anda dari Ancaman Siber.",
      "Dirancang untuk sistem yang tidak boleh berhenti.",
      "Solusi Keamanan Siber Komprehensif",
      "Temukan celahnya sebelum penyerang menemukannya.",
      "Kesiapan sertifikasi, dari gap assessment hingga audit.",
      "Menyediakan solusi keamanan siber terbaik",
      "Leadership Team",
      "Siap Meningkatkan Keamanan Siber Organisasi Anda?",
    ];
    expect(headings).toHaveLength(expected.length);
    expected.forEach((text, i) => expect(headings[i]).toHaveTextContent(text));
  });

  test("no old section content remains", () => {
    renderWithProviders(<Index />);
    expect(screen.queryByText(/Misi & Visi TRIAD PRO-TX SIBER/)).toBeNull();
  });

  test("does not add its own main landmark", () => {
    renderWithProviders(<Index />);
    expect(screen.queryByRole("main")).toBeNull();
  });
});
