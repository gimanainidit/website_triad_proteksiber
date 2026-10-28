import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { formatTimecode, media } from "@/media";
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

  test("the transparent video button opens the player dialog", () => {
    renderWithProviders(<Hero />);
    const dialog = document.querySelector("dialog") as HTMLDialogElement;
    expect(dialog.open).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Putar video profil" }));
    expect(dialog.open).toBe(true);
  });

  test("the visible Putar video button opens the player dialog", () => {
    renderWithProviders(<Hero />);
    const dialog = document.querySelector("dialog") as HTMLDialogElement;
    fireEvent.click(screen.getByRole("button", { name: "Putar video" }));
    expect(dialog.open).toBe(true);
  });

  test("shows the full video duration as a timecode", () => {
    renderWithProviders(<Hero />);
    expect(screen.getByText(formatTimecode(media("hero-full").duration ?? 0))).toBeInTheDocument();
  });

  test("keeps the headline and CTAs outside the difference blend layer", () => {
    renderWithProviders(<Hero />);
    const blend = document.querySelector("[data-blend=\"difference\"]");
    expect(blend).not.toBeNull();
    expect(screen.getByText("ENTERPRISE CYBERSECURITY")).toBeInTheDocument();
    expect(blend).toContainElement(screen.getByText("ENTERPRISE CYBERSECURITY"));
    expect(screen.getByRole("heading", { level: 1 }).closest("[data-blend]")).toBeNull();
    expect(screen.getByRole("link", { name: "Hubungi Kami" }).closest("[data-blend]")).toBeNull();
  });

  test("the index.html head preloads the hero poster", () => {
    const html = readFileSync(resolve(__dirname, "../../../index.html"), "utf8");
    expect(html).toContain(
      "<link rel=\"preload\" as=\"image\" href=\"/media/pixabay-173102-small-poster.jpg\" fetchpriority=\"high\">",
    );
  });
});
