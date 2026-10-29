import { act, fireEvent, screen } from "@testing-library/react";
import { Link, Route, Routes } from "react-router-dom";
import { beforeAll, describe, expect, test, vi } from "vitest";

import { renderWithProviders } from "@/test/render";
import NotFound from "./NotFound";
import ServiceCase from "./ServiceCase";

function renderCase(route: string) {
  return renderWithProviders(
    <>
      <Link to="/services/penetration-testing">ke pentest</Link>
      <Link to="/services/red-teaming">ke red team</Link>
      <Routes>
        <Route path="/services" element={<p>daftar</p>} />
        <Route path="/services/:slug" element={<ServiceCase />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>,
    { route },
  );
}

beforeAll(() => {
  window.scrollTo = vi.fn();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("ServiceCase", () => {
  test("shows one h1 with the service title and its position", () => {
    renderCase("/services/red-teaming");
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent("Adversary Simulation / Red Teaming");
    expect(screen.getByText("04 / 08")).toBeInTheDocument();
  });

  test("links back to the service list", () => {
    renderCase("/services/red-teaming");
    expect(screen.getByRole("link", { name: "← Semua layanan" })).toHaveAttribute("href", "/services");
  });

  test("sets the document title", () => {
    renderCase("/services/red-teaming");
    expect(document.title).toBe("Adversary Simulation / Red Teaming | Layanan TRIAD PRO-TX SIBER");
  });

  test("an unknown slug renders the not-found page", () => {
    renderCase("/services/tidak-ada");
    expect(screen.getByRole("heading", { level: 1, name: "404" })).toBeInTheDocument();
  });

  test("moves focus to the h1 and scrolls to top when the slug changes", () => {
    renderCase("/services/penetration-testing");
    vi.mocked(window.scrollTo).mockClear();
    act(() => fireEvent.click(screen.getByRole("link", { name: "ke red team" })));
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("Adversary Simulation / Red Teaming");
    expect(h1).toHaveFocus();
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });
});
