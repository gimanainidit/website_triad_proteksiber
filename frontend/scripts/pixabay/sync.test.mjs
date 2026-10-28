import { describe, expect, it } from "vitest";
import { syncAssets } from "./sync.mjs";
import { API_KEY, createFakeFs, createFakePixabay, video173102 } from "./testkit.mjs";

const heroLoop = {
  id: "hero-loop",
  pixabayId: 173102,
  kind: "video",
  rendition: "small",
  role: "hero-loop",
  maxBytes: 6_500_000,
};

function setup({ entries = [heroLoop], fs = createFakeFs(), pixabay, apiKey = API_KEY, now = () => 1_000_000 } = {}) {
  const fake = pixabay ?? createFakePixabay({ hits: { "video:173102": video173102() } });
  const logs = [];
  const run = () => syncAssets({ config: { entries }, apiKey, fetch: fake.fetch, fs, now, log: (l) => logs.push(l) });
  return { fake, fs, logs, run };
}

describe("syncAssets", () => {
  it("turns a video entry into a manifest entry with local files and attribution", async () => {
    const { fs, logs, run } = setup();
    const { manifest } = await run();

    expect(manifest).toEqual([
      {
        id: "hero-loop",
        kind: "video",
        src: "/media/pixabay-173102-small.mp4",
        poster: "/media/pixabay-173102-small-poster.jpg",
        width: 960,
        height: 540,
        duration: 28,
        pixabayId: 173102,
        pageURL: "https://pixabay.com/videos/id-173102/",
        user: "spacetrip",
        license: "Pixabay Content License",
      },
    ]);
    expect(fs.files.has("public/media/pixabay-173102-small.mp4")).toBe(true);
    expect(fs.files.has("public/media/pixabay-173102-small-poster.jpg")).toBe(true);

    const everything = [JSON.stringify(manifest), ...logs, ...fs.files.keys(), ...[...fs.files.values()].map(String)];
    expect(everything.filter((s) => s.includes(API_KEY))).toEqual([]);
  });
});

describe("rendition budget", () => {
  it("steps down to the largest rendition that fits maxBytes", async () => {
    const { run } = setup({ entries: [{ ...heroLoop, rendition: "large", maxBytes: 11_000_000 }] });
    const { manifest } = await run();
    expect(manifest[0].src).toBe("/media/pixabay-173102-medium.mp4");
    expect(manifest[0]).toMatchObject({ width: 1280, height: 720 });
  });

  it("throws naming the id when no rendition fits", async () => {
    const { run } = setup({ entries: [{ ...heroLoop, maxBytes: 1_000_000 }] });
    await expect(run()).rejects.toThrow(/hero-loop/);
  });
});
