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

  test("shows the counter and working prev/next links in the middle", () => {
    renderCase("/services/penetration-testing");
    expect(screen.getByText("03 / 08")).toBeInTheDocument();
    const prev = screen.getByRole("link", { name: /^Layanan sebelumnya: / });
    const next = screen.getByRole("link", { name: /^Layanan berikutnya: / });
    expect(prev).toHaveAttribute("href", "/services/data-center-audit");
    expect(prev).toHaveAccessibleName("Layanan sebelumnya: Data Center Performance Audit");
    expect(next).toHaveAttribute("href", "/services/digital-forensics-incident-response");
    expect(next).toHaveAccessibleName("Layanan berikutnya: Digital Forensics & Incident Response");
  });

  test("the first service has a disabled prev and the last a disabled next", () => {
    const first = renderCase("/services/iso-27001-audit");
    expect(screen.queryByRole("link", { name: /^Layanan sebelumnya/ })).not.toBeInTheDocument();
    expect(screen.getByLabelText(/^Layanan sebelumnya/)).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("link", { name: /^Layanan berikutnya/ })).toBeInTheDocument();
    first.unmount();

    renderCase("/services/zero-trust-consulting");
    expect(screen.queryByRole("link", { name: /^Layanan berikutnya/ })).not.toBeInTheDocument();
    expect(screen.getByLabelText(/^Layanan berikutnya/)).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("link", { name: /^Layanan sebelumnya/ })).toBeInTheDocument();
  });

  test("lists standards as badges only when the service has any", () => {
    const pentest = renderCase("/services/penetration-testing");
    expect(screen.getByText("STANDAR")).toBeInTheDocument();
    expect(screen.getByText("OWASP Top 10")).toBeInTheDocument();
    expect(screen.getByText("CVSS")).toBeInTheDocument();
    pentest.unmount();

    renderCase("/services/digital-forensics-incident-response");
    expect(screen.queryByText("STANDAR")).not.toBeInTheDocument();
  });

  test("shows the kicker, content blocks and the contact CTA", () => {
    renderCase("/services/penetration-testing");
    for (const label of ["RINGKASAN", "CAKUPAN", "DELIVERABLES"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.getByText("BERKAS LAYANAN 03 · ASSURANCE")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Konsultasi layanan ini" })).toHaveAttribute("href", "/contact");
  });

  test("renders the gallery", () => {
    renderCase("/services/penetration-testing");
    expect(screen.getByRole("button", { name: "Buka galeri layar penuh" })).toBeInTheDocument();
  });

  test("moving from a longer gallery to a shorter one resets to its first image", () => {
    renderCase("/services/penetration-testing");
    const thumbs = screen.getAllByRole("button", { name: /^Tampilkan gambar:/ });
    expect(thumbs).toHaveLength(6);
    act(() => fireEvent.click(thumbs[5]));
    act(() => fireEvent.click(screen.getByRole("link", { name: "ke dfir" })));
    expect(screen.getAllByRole("button", { name: /^Tampilkan gambar:/ })).toHaveLength(2);
    expect(screen.getByText("Menelusuri bukti digital")).toBeInTheDocument();
  });

  test.each([
    ["red-teaming", "Penetration Testing dan Red Teaming Exercise"],
    ["security-training", "Peningkatan Awareness Program, Training, dan Edukasi"],
  ])("the retired slug %s redirects to the service that absorbed it", (slug, title) => {
    renderCase(`/services/${slug}`);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(title);
  });

  test("every reveal block sits inside the reveal host, since the CSS animates descendants only", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    renderCase("/services/penetration-testing");
    const blocks = [...document.querySelectorAll(".reveal-fade")];
    expect(blocks.length).toBeGreaterThan(0);
    for (const block of blocks) {
      expect(block.hasAttribute("data-visible")).toBe(false);
      expect(block.parentElement?.closest("[data-visible]")).not.toBeNull();
    }
    vi.unstubAllGlobals();
  });
});
