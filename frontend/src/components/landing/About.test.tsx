import { screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { renderWithProviders } from "@/test/render";
import { About } from "./About";

const MISSION =
  "Menyediakan solusi keamanan siber terbaik yang melindungi organisasi dari ancaman digital, memastikan kelangsungan bisnis, dan membangun kepercayaan stakeholder.";

describe("About", () => {
  test("states the mission as its single h2", () => {
    renderWithProviders(<About />);
    const headings = screen.getAllByRole("heading", { level: 2 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(MISSION);
  });

  test("labels the section with the TENTANG KAMI eyebrow", () => {
    renderWithProviders(<About />);
    expect(screen.getByText("TENTANG KAMI")).toBeInTheDocument();
  });

  test("lists Misi, Visi and Pendekatan as three titled columns with copy", () => {
    renderWithProviders(<About />);
    const titles = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(titles).toEqual(["Misi Kami", "Visi Kami", "Pendekatan Kami"]);
    const visi = screen.getByRole("heading", { level: 3, name: "Visi Kami" }).parentElement as HTMLElement;
    expect(within(visi).getByText(/mitra keamanan siber terpercaya di Indonesia/)).toBeInTheDocument();
  });

  test("contains no nested anchors", () => {
    const { container } = renderWithProviders(<About />);
    expect(container.querySelector("a a")).toBeNull();
  });
});
