import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, test } from "vitest";

import { renderWithProviders } from "@/test/render";
import { SiteLayout } from "./SiteLayout";

function renderLayout() {
  return renderWithProviders(
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<h1>Halaman uji</h1>} />
      </Route>
    </Routes>,
  );
}

describe("SiteLayout", () => {
  test("the skip link targets the main landmark that exists in the page", () => {
    renderLayout();
    const skip = screen.getByRole("link", { name: "Lompat ke konten" });
    const target = document.querySelector(skip.getAttribute("href")!);
    expect(target).toBe(screen.getByRole("main"));
    expect(target).toHaveAttribute("tabindex", "-1");
  });

  test("renders the routed page inside the one main landmark", () => {
    renderLayout();
    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(screen.getByRole("main")).toContainElement(screen.getByRole("heading", { name: "Halaman uji" }));
  });

  test("renders the top navigation and the footer once each", () => {
    renderLayout();
    expect(screen.getAllByRole("banner")).toHaveLength(1);
    expect(screen.getAllByRole("contentinfo")).toHaveLength(1);
  });

  test("the shield stripe sits directly before the footer", () => {
    renderLayout();
    const stripe = screen.getByRole("contentinfo").previousElementSibling;
    expect(stripe).toHaveAttribute("role", "presentation");
    expect(stripe).not.toBe(screen.getByRole("main"));
  });
});
