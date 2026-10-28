import { screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { renderWithProviders } from "@/test/render";
import { FeatureVideos } from "./FeatureVideos";

describe("FeatureVideos", () => {
  test("renders two cards, each headed by its feature heading", () => {
    renderWithProviders(<FeatureVideos />);

    const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(headings).toEqual([
      "Temukan celahnya sebelum penyerang menemukannya.",
      "Kesiapan sertifikasi, dari gap assessment hingga audit.",
    ]);
    expect(screen.getAllByRole("article")).toHaveLength(2);
  });
});
