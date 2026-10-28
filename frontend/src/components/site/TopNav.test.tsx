import { fireEvent, screen, within } from "@testing-library/react";
import { Link, Route, Routes } from "react-router-dom";
import { describe, expect, test } from "vitest";

import { renderWithProviders } from "@/test/render";
import { TopNav } from "./TopNav";

// The panel is whatever the menu button controls, so the test does not depend on its markup.
const menuPanel = () => {
  const id = screen.getAllByRole("button", { name: /menu/i })[0].getAttribute("aria-controls");
  return id ? document.getElementById(id) : null;
};

describe("TopNav", () => {
  test("links to services, resources and contact, plus one primary call to action", () => {
    renderWithProviders(<TopNav />);
    const nav = screen.getByRole("navigation");
    expect(within(nav).getByRole("link", { name: "Layanan" })).toHaveAttribute("href", "/services");
    expect(within(nav).getByRole("link", { name: "Resources" })).toHaveAttribute("href", "/resources");
    expect(within(nav).getByRole("link", { name: "Kontak" })).toHaveAttribute("href", "/contact");
    expect(screen.getByRole("link", { name: "Hubungi Kami" })).toHaveAttribute("href", "/contact");
  });

  test("the logo links home and carries the brand name as its accessible name", () => {
    renderWithProviders(<TopNav />);
    expect(screen.getByRole("link", { name: /triad pro-tx siber/i })).toHaveAttribute("href", "/");
  });

  test("marks only the link of the current route", () => {
    renderWithProviders(<TopNav />, { route: "/resources" });
    expect(screen.getByRole("link", { name: "Resources" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Layanan" })).not.toHaveAttribute("aria-current");
  });

  test("gains a shadow only once the page scrolled past 8px", () => {
    renderWithProviders(<TopNav />);
    const header = screen.getByRole("banner");
    expect(header).toHaveAttribute("data-scrolled", "false");
    Object.defineProperty(window, "scrollY", { configurable: true, value: 9 });
    fireEvent.scroll(window);
    expect(header).toHaveAttribute("data-scrolled", "true");
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
    fireEvent.scroll(window);
    expect(header).toHaveAttribute("data-scrolled", "false");
  });

  describe("menu below lg", () => {
    test("the button toggles aria-expanded, its label and the panel", () => {
      renderWithProviders(<TopNav />);
      const button = screen.getByRole("button", { name: "Buka menu" });
      expect(button).toHaveAttribute("aria-expanded", "false");
      expect(menuPanel()).not.toBeInTheDocument();

      fireEvent.click(button);
      const closeButton = screen.getByRole("button", { name: "Tutup menu" });
      expect(closeButton).toHaveAttribute("aria-expanded", "true");
      const panel = menuPanel()!;
      expect(panel).toBeInTheDocument();
      expect(within(panel).getByRole("link", { name: "Layanan" })).toHaveAttribute("href", "/services");
      expect(within(panel).getByRole("link", { name: "Hubungi Kami" })).toHaveAttribute("href", "/contact");

      fireEvent.click(closeButton);
      expect(menuPanel()).not.toBeInTheDocument();
    });

    test("Escape closes the panel and returns focus to the button", () => {
      renderWithProviders(<TopNav />);
      fireEvent.click(screen.getByRole("button", { name: "Buka menu" }));
      fireEvent.keyDown(document, { key: "Escape" });
      expect(menuPanel()).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Buka menu" })).toHaveFocus();
    });

    test("a route change closes the panel", () => {
      renderWithProviders(
        <Routes>
          <Route path="*" element={<><TopNav /><Link to="/elsewhere">elsewhere</Link></>} />
        </Routes>,
      );
      fireEvent.click(screen.getByRole("button", { name: "Buka menu" }));
      fireEvent.click(within(menuPanel()!).getByRole("link", { name: "Resources" }));
      expect(menuPanel()).not.toBeInTheDocument();
    });
  });
});
