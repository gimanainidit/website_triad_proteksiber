import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";

import { VideoPlayerProvider } from "@/components/video-player";
import { features } from "@/content/features";
import { formatTimecode, media, resolveVideo } from "@/media";
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

const cards = () => screen.getAllByRole("article");

describe("Pelajari links", () => {
  test("each card links to its service section", () => {
    renderWithProviders(<FeatureVideos />);

    const targets = cards().map((card) => within(card).getByRole("link", { name: "Pelajari" }).getAttribute("href"));
    expect(targets).toEqual(["/services#penetration-testing", "/services#iso-27001-audit"]);
  });
});

describe("playing the video", () => {
  test("the full-card video button opens the player dialog", () => {
    renderWithProviders(<FeatureVideos />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Putar video PENETRATION TESTING & RED TEAMING" }));

    expect(screen.getByRole("dialog", { name: "Penetration Testing" })).toBeInTheDocument();
  });
});

describe("visible play button", () => {
  test("the second card's Putar video button opens feature-iso", () => {
    const resolve = vi.fn(resolveVideo);
    render(
      <MemoryRouter>
        <VideoPlayerProvider resolve={resolve}>
          <FeatureVideos />
        </VideoPlayerProvider>
      </MemoryRouter>,
    );
    const second = screen.getByRole("article", { name: /Kesiapan sertifikasi/ });

    fireEvent.click(within(second).getByRole("button", { name: "Putar video" }));

    expect(resolve).toHaveBeenCalledWith("feature-iso");
    expect(resolve).not.toHaveBeenCalledWith("feature-pentest");
    expect(screen.getByRole("dialog", { name: "Audit ISMS ISO 27001" })).toBeInTheDocument();
  });
});

describe("timecode", () => {
  test("each card shows the full duration of its video", () => {
    renderWithProviders(<FeatureVideos />);

    for (const id of ["feature-pentest", "feature-iso"] as const) {
      const card = cards()[features.findIndex((f) => f.mediaId === id)];
      expect(within(card).getByText(formatTimecode(media(id).duration ?? 0))).toBeInTheDocument();
    }
  });
});

describe("difference blend", () => {
  test("only decoration sits in the blend layer, never headings, body or actions", () => {
    renderWithProviders(<FeatureVideos />);

    for (const blended of document.querySelectorAll('[data-blend="difference"]')) {
      expect(within(blended as HTMLElement).queryByRole("heading", { hidden: true })).toBeNull();
      expect(within(blended as HTMLElement).queryByRole("link", { hidden: true })).toBeNull();
      expect(within(blended as HTMLElement).queryByRole("button", { hidden: true })).toBeNull();
    }
    for (const heading of screen.getAllByRole("heading", { level: 2 })) {
      expect(heading.closest('[data-blend="difference"]')).toBeNull();
    }
    expect(document.querySelectorAll('[data-blend="difference"]')).toHaveLength(2);
  });
});

describe("content", () => {
  test("every feature points at a video in the manifest", () => {
    for (const feature of features) {
      expect(media(feature.mediaId).kind).toBe("video");
      expect(resolveVideo(feature.mediaId)).toBeDefined();
    }
  });
});
