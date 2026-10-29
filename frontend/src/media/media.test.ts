import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { MEDIA_IDS, allMedia, formatTimecode, media, resolveVideo, type MediaId } from "./index";

const publicDir = join(dirname(fileURLToPath(import.meta.url)), "../../public");

describe("media manifest integrity", () => {
  it("MEDIA_IDS lists exactly the ids of the Pixabay and Unsplash entries, each once", () => {
    const ids = allMedia().map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...MEDIA_IDS].sort()).toEqual(ids.sort());
  });

  it("every entry names its source, and Unsplash photos link to their unsplash.com page", () => {
    for (const asset of allMedia()) {
      expect(["pixabay", "unsplash"]).toContain(asset.source);
      expect(asset.sourceId).toBeTruthy();
      if (asset.source === "unsplash") {
        expect(asset.pageURL).toMatch(new RegExp(`^https://unsplash\\.com/photos/.*${asset.sourceId}$`));
        expect(asset.license).toBe("Unsplash License");
      }
    }
  });

  it("every src and poster exists under public/", () => {
    const missing = allMedia()
      .flatMap((m) => [m.src, m.poster])
      .filter((p): p is string => Boolean(p))
      .filter((p) => !existsSync(join(publicDir, p)));
    expect(missing).toEqual([]);
  });
});

describe("media()", () => {
  it("returns the manifest entry for an id", () => {
    expect(media("hero-loop")).toMatchObject({
      id: "hero-loop",
      kind: "video",
      src: "/media/pixabay-173102-small.mp4",
      poster: "/media/pixabay-173102-small-poster.jpg",
    });
  });

  it("throws a clear error for an id missing from the manifest", () => {
    expect(() => media("nope" as MediaId)).toThrow(/nope/);
  });
});

describe("resolveVideo()", () => {
  it("adapts a video to the player source with its poster and title", () => {
    expect(resolveVideo("hero-full")).toEqual({
      src: media("hero-full").src,
      poster: media("hero-full").poster,
      title: "TRIAD PRO-TX SIBER",
    });
  });

  it("leaves the title out for videos without one", () => {
    expect(resolveVideo("hero-loop")?.title).toBeUndefined();
  });

  it("returns undefined for images and unknown ids", () => {
    expect(resolveVideo("svc-penetration-testing")).toBeUndefined();
    expect(resolveVideo("nope")).toBeUndefined();
  });
});

describe("formatTimecode()", () => {
  it("formats seconds as HH:MM:SS", () => {
    expect(formatTimecode(3725)).toBe("01:02:05");
  });
});
