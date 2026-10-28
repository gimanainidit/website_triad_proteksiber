import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { renderWithProviders } from "@/test/render";
import { Environment } from "./Environment";

const dialog = () => document.querySelector("dialog") as HTMLDialogElement;

describe("Environment", () => {
  test("has one h2 with the section heading and a link to /services", () => {
    renderWithProviders(<Environment />);
    const headings = screen.getAllByRole("heading", { level: 2 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent("Dirancang untuk sistem yang tidak boleh berhenti.");
    expect(screen.getByRole("link", { name: "Lihat layanan" })).toHaveAttribute("href", "/services");
  });

  test("the full-size video button opens the player", () => {
    renderWithProviders(<Environment />);
    expect(dialog().open).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Putar video lingkungan kritis" }));
    expect(dialog().open).toBe(true);
  });

  test("the visible 'Putar layar penuh' button opens the player", () => {
    renderWithProviders(<Environment />);
    fireEvent.click(screen.getByRole("button", { name: "Putar layar penuh" }));
    expect(dialog().open).toBe(true);
  });
});
