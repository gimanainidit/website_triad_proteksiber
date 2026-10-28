import { screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { renderWithProviders } from "@/test/render";
import { CtaBanner } from "./CtaBanner";

describe("CtaBanner", () => {
  test("asks the question in its single h2", () => {
    renderWithProviders(<CtaBanner />);
    const headings = screen.getAllByRole("heading", { level: 2 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent("Siap Meningkatkan Keamanan Siber Organisasi Anda?");
  });

  test("offers a free consultation with a link to /contact", () => {
    renderWithProviders(<CtaBanner />);
    expect(screen.getByRole("link", { name: "Konsultasi Gratis" })).toHaveAttribute("href", "/contact");
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });

  test("explains the offer under the heading", () => {
    renderWithProviders(<CtaBanner />);
    expect(screen.getByText(/Hubungi tim kami untuk konsultasi gratis/)).toBeInTheDocument();
  });

  test("contains no nested anchors", () => {
    const { container } = renderWithProviders(<CtaBanner />);
    expect(container.querySelector("a a")).toBeNull();
  });
});
