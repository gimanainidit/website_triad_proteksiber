import { screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { allMedia } from "@/media";
import { renderWithProviders } from "@/test/render";
import Credits from "./Credits";

const uniquePixabayIds = [...new Set(allMedia().map((asset) => asset.pixabayId))];

describe("Credits", () => {
  test("has one h1 and states the Pixabay license with a link to its summary", () => {
    renderWithProviders(<Credits />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: "Kredit media" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /pixabay content license/i })).toHaveAttribute(
      "href",
      "https://pixabay.com/service/license-summary/",
    );
  });

  test("lists one entry per unique Pixabay source, so the hero pair appears once", () => {
    renderWithProviders(<Credits />);
    const items = screen.getAllByRole("listitem");
    expect(items.length).toBeLessThan(allMedia().length);
    expect(items).toHaveLength(uniquePixabayIds.length);
  });

  test("each entry credits its creator and links to the Pixabay page", () => {
    renderWithProviders(<Credits />);
    const items = screen.getAllByRole("listitem");
    for (const id of uniquePixabayIds) {
      const asset = allMedia().find((candidate) => candidate.pixabayId === id)!;
      const item = items.find((candidate) =>
        within(candidate).queryByRole("link", { name: "Lihat di Pixabay" })?.getAttribute("href") === asset.pageURL,
      );
      expect(item, `entry for pixabay ${id}`).toBeDefined();
      expect(item).toHaveTextContent(`oleh ${asset.user}`);
      expect(item).toHaveTextContent(asset.license);
    }
  });
});
