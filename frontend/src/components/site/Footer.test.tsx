import { screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { renderWithProviders } from "@/test/render";
import { Footer } from "./Footer";

describe("Footer", () => {
  test("is the page's contentinfo landmark", () => {
    renderWithProviders(<Footer />);
    expect(screen.getAllByRole("contentinfo")).toHaveLength(1);
  });

  test("navigation column links to the public pages and the media credits", () => {
    renderWithProviders(<Footer />);
    const footer = screen.getByRole("contentinfo");
    expect(within(footer).getByRole("link", { name: "Layanan" })).toHaveAttribute("href", "/services");
    expect(within(footer).getByRole("link", { name: "Resources" })).toHaveAttribute("href", "/resources");
    expect(within(footer).getByRole("link", { name: "Kontak" })).toHaveAttribute("href", "/contact");
    expect(within(footer).getByRole("link", { name: "Kredit media" })).toHaveAttribute("href", "/kredit");
  });

  test("the legal row credits Pixabay and Unsplash with a link to /kredit", () => {
    renderWithProviders(<Footer />);
    expect(screen.getByRole("link", { name: "Video dan foto oleh Pixabay dan Unsplash" })).toHaveAttribute("href", "/kredit");
  });

  test("shows the contact email as a mailto link and the location", () => {
    renderWithProviders(<Footer />);
    expect(screen.getByRole("link", { name: "triad-proteksiber@pm.me" })).toHaveAttribute(
      "href",
      "mailto:triad-proteksiber@pm.me",
    );
    expect(screen.getByText("Jakarta, Indonesia")).toBeInTheDocument();
  });

  test("shows the brand description, tagline and the copyright of the current year", () => {
    renderWithProviders(<Footer />);
    expect(
      screen.getByText("Solusi keamanan siber enterprise-grade untuk organisasi Indonesia."),
    ).toBeInTheDocument();
    expect(screen.getByText("SATU AKSI SEJUTA PROTEKSI")).toBeInTheDocument();
    expect(
      screen.getByText(`© ${new Date().getFullYear()} TRIAD PRO-TX SIBER. All rights reserved.`),
    ).toBeInTheDocument();
  });
});
