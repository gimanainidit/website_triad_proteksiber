import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, test, vi } from "vitest";

import App from "@/App";

function renderAt(path: string) {
  window.history.pushState({}, "", path);
  return render(<App />);
}

describe("site shell routing", () => {
  // The landing sections still on framer-motion use whileInView; jsdom has no IntersectionObserver.
  beforeAll(() => {
    vi.stubGlobal("IntersectionObserver", class { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } });
    window.scrollTo = vi.fn();
    HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as never;
  });

  test.each(["/", "/kredit"])("%s renders one nav, one main, one footer and the skip link", (path) => {
    renderAt(path);
    expect(screen.getAllByRole("banner")).toHaveLength(1);
    expect(screen.getAllByRole("navigation")).toHaveLength(1);
    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(screen.getAllByRole("contentinfo")).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Lompat ke konten" })).toHaveAttribute("href", "#main-content");
  });

  test("the landing page keeps its sections inside the shared main", () => {
    renderAt("/");
    expect(screen.getByRole("main")).toContainElement(screen.getByRole("heading", { level: 1 }));
  });

  test("/kredit shows the credits page", () => {
    renderAt("/kredit");
    expect(screen.getByRole("heading", { level: 1, name: "Kredit media" })).toBeInTheDocument();
  });
});
