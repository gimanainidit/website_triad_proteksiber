import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { serviceCategories } from "@/content/services";
import { renderWithProviders } from "@/test/render";
import { Services } from "./Services";

// Radix triggers activate on mousedown, not click.
const selectTab = (name: string) => fireEvent.mouseDown(screen.getByRole("tab", { name }), { button: 0 });

describe("Services", () => {
  test("renders the section header and the two tab triggers", () => {
    renderWithProviders(<Services />);
    expect(screen.getByRole("heading", { level: 2, name: "Solusi Keamanan Siber Komprehensif" })).toBeInTheDocument();
    expect(screen.getAllByRole("tab").map((t) => t.textContent)).toEqual(["Assurance", "Consulting"]);
    expect(screen.getByRole("tab", { name: "Assurance" })).toHaveAttribute("aria-selected", "true");
  });

  test("the active tab shows four numbered cards linking to /services#slug", () => {
    renderWithProviders(<Services />);
    const panel = screen.getByRole("tabpanel");
    const cards = within(panel).getAllByRole("article");
    expect(cards).toHaveLength(4);
    expect(cards.map((c) => within(c).getByText(/^0\d$/).textContent)).toEqual(["01", "02", "03", "04"]);
    const first = within(cards[0]).getByRole("link", { name: "Pelajari ISMS ISO 27001 Audit" });
    expect(first).toHaveAttribute("href", "/services#iso-27001-audit");
  });

  test("switching to Consulting shows its four services", () => {
    renderWithProviders(<Services />);
    selectTab("Consulting");
    const panel = screen.getByRole("tabpanel");
    expect(within(panel).getAllByRole("article")).toHaveLength(4);
    const hrefs = within(panel)
      .getAllByRole("link")
      .map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(serviceCategories[1].services.map((s) => `/services#${s.slug}`));
  });

  test("card images are decorative and lazy", () => {
    const { container } = renderWithProviders(<Services />);
    const images = container.querySelectorAll("img");
    expect(images).toHaveLength(4);
    for (const img of images) {
      expect(img).toHaveAttribute("alt", "");
      expect(img).toHaveAttribute("loading", "lazy");
    }
  });

  test("no link is nested inside another link", () => {
    const { container } = renderWithProviders(<Services />);
    expect(container.querySelectorAll("a a")).toHaveLength(0);
  });
});
