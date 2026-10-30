import { screen, within } from "@testing-library/react";
import { Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, test } from "vitest";

import { renderWithProviders } from "@/test/render";
import Services from "./Services";

function Where() {
  const { pathname, hash } = useLocation();
  return <p data-testid="where">{pathname + hash}</p>;
}

describe("Services legacy anchors", () => {
  test("/services#slug redirects to /services/slug", () => {
    renderWithProviders(
      <Routes>
        <Route path="/services" element={<Services />} />
        <Route path="/services/:slug" element={<Where />} />
      </Routes>,
      { route: "/services#iso-27001-audit" },
    );
    expect(screen.getByTestId("where")).toHaveTextContent("/services/iso-27001-audit");
  });
});

describe("Services retired anchors", () => {
  test("/services#red-teaming lands on the service that absorbed it", () => {
    renderWithProviders(
      <Routes>
        <Route path="/services" element={<Services />} />
        <Route path="/services/:slug" element={<Where />} />
      </Routes>,
      { route: "/services#red-teaming" },
    );
    expect(screen.getByTestId("where")).toHaveTextContent("/services/penetration-testing");
  });
});

describe("Services list page", () => {
  const renderList = () =>
    renderWithProviders(
      <Routes>
        <Route path="/services" element={<Services />} />
      </Routes>,
      { route: "/services" },
    );

  test("one h1 and a h2 per category", () => {
    renderList();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Layanan Kami");
    expect(screen.getByRole("heading", { level: 2, name: "Assurance Services" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Consulting Services" })).toBeInTheDocument();
  });

  test("eight file links with correct hrefs", () => {
    renderList();
    const links = screen.getAllByRole("link", { name: /^Buka berkas: / });
    expect(links).toHaveLength(8);
    expect(screen.getByRole("link", { name: "Buka berkas: ISMS ISO 27001 Audit" })).toHaveAttribute(
      "href",
      "/services/iso-27001-audit",
    );
    expect(
      screen.getByRole("link", { name: "Buka berkas: Penetration Testing dan Red Teaming Exercise" }),
    ).toHaveAttribute("href", "/services/penetration-testing");
  });

  test("card meta shows number, image count and category", () => {
    renderList();
    const first = screen.getByRole("link", { name: "Buka berkas: ISMS ISO 27001 Audit" });
    expect(first).toHaveTextContent("01 · 3 GAMBAR · ASSURANCE");
    const pentest = screen.getByRole("link", { name: /Penetration Testing/ });
    expect(pentest).toHaveTextContent("03 · 6 GAMBAR · ASSURANCE");
    const last = screen.getByRole("link", { name: "Buka berkas: Zero Trust Consulting" });
    expect(last).toHaveTextContent(/^08 · \d+ GAMBAR · CONSULTING/);
  });

  test("second card in each list is offset for the zig-zag", () => {
    renderList();
    const lists = screen.getAllByRole("list");
    expect(lists).toHaveLength(2);
    for (const list of lists) {
      const items = within(list).getAllByRole("listitem");
      expect(items[0]).not.toHaveClass("md:mt-14");
      expect(items[1]).toHaveClass("md:mt-14");
    }
  });

  test("ends with the contact CTA", () => {
    renderList();
    expect(screen.getByRole("link", { name: /konsultasi/i })).toHaveAttribute("href", "/contact");
  });
});
