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
      <Link to="/services/digital-forensics-incident-response">ke dfir</Link>
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
    renderCase("/services/digital-forensics-incident-response");
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent("Digital Forensics & Incident Response");
    expect(screen.getByText("04 / 08")).toBeInTheDocument();
  });

  test("links back to the service list", () => {
    renderCase("/services/digital-forensics-incident-response");
    expect(screen.getByRole("link", { name: "← Semua layanan" })).toHaveAttribute("href", "/services");
  });

  test("sets the document title", () => {
    renderCase("/services/digital-forensics-incident-response");
    expect(document.title).toBe("Digital Forensics & Incident Response | Layanan TRIAD PRO-TX SIBER");
  });

  test("an unknown slug renders the not-found page", () => {
    renderCase("/services/tidak-ada");
    expect(screen.getByRole("heading", { level: 1, name: "404" })).toBeInTheDocument();
  });

  test("moves focus to the h1 and scrolls to top when the slug changes", () => {
    renderCase("/services/penetration-testing");
    vi.mocked(window.scrollTo).mockClear();
    act(() => fireEvent.click(screen.getByRole("link", { name: "ke dfir" })));
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("Digital Forensics & Incident Response");
    expect(h1).toHaveFocus();
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  test.each([
    ["red-teaming", "Penetration Testing dan Red Teaming Exercise"],
    ["security-training", "Peningkatan Awareness Program, Training, dan Edukasi"],
  ])("the retired slug %s redirects to the service that absorbed it", (slug, title) => {
    renderCase(`/services/${slug}`);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(title);
  });
});
