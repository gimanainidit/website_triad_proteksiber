import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import manifest from "./manifest.json";
import { MEDIA_IDS, allMedia, formatTimecode, media, resolveVideo, type MediaId } from "./index";

const publicDir = join(dirname(fileURLToPath(import.meta.url)), "../../public");

describe("media manifest integrity", () => {
  it("MEDIA_IDS lists exactly the ids in the manifest", () => {
    expect([...MEDIA_IDS].sort()).toEqual(manifest.map((m) => m.id).sort());
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
    expect(resolveVideo("svc-red-teaming")).toBeUndefined();
    expect(resolveVideo("nope")).toBeUndefined();
  });
});

describe("formatTimecode()", () => {
  it("formats seconds as HH:MM:SS", () => {
    expect(formatTimecode(3725)).toBe("01:02:05");
  });
});
