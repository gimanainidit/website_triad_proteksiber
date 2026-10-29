import { screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { allMedia } from "@/media";
import { renderWithProviders } from "@/test/render";
import Credits from "./Credits";

const sourceKey = (asset: { source: string; sourceId: string }) => `${asset.source}:${asset.sourceId}`;
const uniqueSources = [...new Map(allMedia().map((asset) => [sourceKey(asset), asset])).values()];
const LINK_LABEL = { pixabay: "Lihat di Pixabay", unsplash: "Lihat di Unsplash" } as const;

describe("Credits", () => {
  test("has one h1 and links both licenses", () => {
    renderWithProviders(<Credits />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: "Kredit media" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /pixabay content license/i })).toHaveAttribute(
      "href",
      "https://pixabay.com/service/license-summary/",
    );
    expect(screen.getByRole("link", { name: /^unsplash license$/i })).toHaveAttribute("href", "https://unsplash.com/license");
  });

  test("lists one entry per unique source item, so the hero pair appears once", () => {
    renderWithProviders(<Credits />);
    const items = screen.getAllByRole("listitem");
    expect(items.length).toBeLessThan(allMedia().length);
    expect(items).toHaveLength(uniqueSources.length);
  });

  test("each entry credits its creator and links to its source page", () => {
    renderWithProviders(<Credits />);
    const items = screen.getAllByRole("listitem");
    for (const asset of uniqueSources) {
      const item = items.find((candidate) =>
        within(candidate).queryByRole("link", { name: LINK_LABEL[asset.source] })?.getAttribute("href") === asset.pageURL,
      );
      expect(item, `entry for ${sourceKey(asset)}`).toBeDefined();
      expect(item).toHaveTextContent(`oleh ${asset.user}`);
      expect(item).toHaveTextContent(asset.license);
    }
  });
});
