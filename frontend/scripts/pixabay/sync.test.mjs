import { describe, expect, it } from "vitest";
import { syncAssets } from "./sync.mjs";
import { API_KEY, createFakeFs, createFakePixabay, imageHit, video173102 } from "./testkit.mjs";

const heroLoop = {
  id: "hero-loop",
  pixabayId: 173102,
  kind: "video",
  rendition: "small",
  role: "hero-loop",
  maxBytes: 6_500_000,
};

function setup({ entries = [heroLoop], fs = createFakeFs(), pixabay, apiKey = API_KEY, now = () => 1_000_000, sleep } = {}) {
  const fake = pixabay ?? createFakePixabay({ hits: { "video:173102": video173102() } });
  const logs = [];
  const run = () => syncAssets({ config: { entries }, apiKey, fetch: fake.fetch, fs, now, sleep, log: (l) => logs.push(l) });
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

describe("api key", () => {
  it.each([null, "", "   "])("refuses %j and says where to set PIXABAY_API_KEY", async (apiKey) => {
    const { fake, run } = setup({ apiKey });
    await expect(run()).rejects.toThrow(/PIXABAY_API_KEY.*frontend\/\.env\.local.*no VITE_ prefix/s);
    expect(fake.calls).toEqual([]);
  });
});

describe("api cache", () => {
  const HOUR = 3_600_000;

  it("reuses a cached response younger than 24h without calling the API", async () => {
    let t = 1_000_000;
    const first = setup({ now: () => t });
    await first.run();
    expect(first.fake.apiCalls).toHaveLength(1);

    t += 23 * HOUR;
    const second = setup({ fs: first.fs, now: () => t });
    const { manifest } = await second.run();
    expect(second.fake.apiCalls).toHaveLength(0);
    expect(manifest[0].user).toBe("spacetrip");
  });

  it("asks the API again once the cached response is 24h old", async () => {
    let t = 1_000_000;
    const first = setup({ now: () => t });
    await first.run();

    t += 24 * HOUR;
    const second = setup({ fs: first.fs, now: () => t });
    await second.run();
    expect(second.fake.apiCalls).toHaveLength(1);
  });

  it("keeps one cache entry per kind and pixabayId, never containing the key", async () => {
    const { fs, run } = setup();
    await run();
    const cached = [...fs.files.keys()].filter((p) => p.startsWith(".cache/pixabay/"));
    expect(cached).toEqual([".cache/pixabay/video-173102.json"]);
    expect(String(fs.files.get(cached[0]))).not.toContain(API_KEY);
  });
});

describe("api errors", () => {
  it("stops on HTTP 429 and reports X-RateLimit-Reset", async () => {
    const pixabay = createFakePixabay({ status: 429, headers: { "X-RateLimit-Reset": "37" } });
    const { fs, run } = setup({ pixabay });
    await expect(run()).rejects.toThrow(/429.*X-RateLimit-Reset: 37/s);
    expect(fs.writes).toEqual([]);
  });

  it("names the id when Pixabay has no such hit", async () => {
    const { run } = setup({ pixabay: createFakePixabay({ hits: {} }) });
    await expect(run()).rejects.toThrow(/hero-loop.*173102/s);
  });

  it("never leaks the key in an error from a failing request", async () => {
    const fetch = async (url) => {
      throw new Error(`connect ECONNREFUSED ${url}`);
    };
    const run = syncAssets({ config: { entries: [heroLoop] }, apiKey: API_KEY, fetch, fs: createFakeFs(), now: () => 0 });
    const error = await run.catch((e) => e);
    expect(error.message).toMatch(/ECONNREFUSED/);
    expect(error.message).not.toContain(API_KEY);
  });
});

describe("download reuse", () => {
  const videoPath = "public/media/pixabay-173102-small.mp4";
  const posterPath = "public/media/pixabay-173102-small-poster.jpg";

  it("skips files already on disk with the size the API reports", async () => {
    const fs = createFakeFs({ [videoPath]: Buffer.alloc(5_987_902), [posterPath]: Buffer.from("jpg") });
    const { fake, run } = setup({ fs });
    const { downloaded, reused } = await run();
    expect(fake.downloadCalls).toEqual([]);
    expect(downloaded).toEqual([]);
    expect(reused).toEqual([videoPath, posterPath]);
  });

  it("downloads again when the size on disk differs (truncated file)", async () => {
    const fs = createFakeFs({ [videoPath]: Buffer.alloc(1000), [posterPath]: Buffer.from("jpg") });
    const { fake, run } = setup({ fs });
    const { downloaded, reused } = await run();
    expect(fake.downloadCalls).toEqual([expect.stringContaining("173102-848555581_small.mp4")]);
    expect(downloaded).toEqual([videoPath]);
    expect(reused).toEqual([posterPath]);
  });
});

describe("image entries", () => {
  const photo = { id: "service-dc", pixabayId: 2160321, kind: "image", rendition: "large", role: "service", maxBytes: 2_000_000 };
  const imagePixabay = () => createFakePixabay({ hits: { "image:2160321": imageHit() } });

  it("downloads largeImageURL locally and describes it without video fields", async () => {
    const hit = imageHit();
    const { fake, fs, run } = setup({ entries: [photo], pixabay: imagePixabay() });
    const { manifest } = await run();

    expect(fake.downloadCalls).toEqual([hit.largeImageURL]);
    expect(fake.apiCalls[0]).toMatch(/^https:\/\/pixabay\.com\/api\/\?/);
    expect(manifest).toEqual([
      {
        id: "service-dc",
        kind: "image",
        src: "/media/pixabay-2160321-large.jpg",
        width: 1280,
        height: 448,
        pixabayId: 2160321,
        pageURL: hit.pageURL,
        user: "Schäferle",
        license: "Pixabay Content License",
      },
    ]);
    expect([...fs.files.keys()].filter((p) => p.startsWith("public/media/"))).toEqual(["public/media/pixabay-2160321-large.jpg"]);
  });

  it("downloads webformatURL for the webformat rendition", async () => {
    const hit = imageHit();
    const { fake, run } = setup({ entries: [{ ...photo, rendition: "webformat" }], pixabay: imagePixabay() });
    const { manifest } = await run();
    expect(fake.downloadCalls).toEqual([hit.webformatURL]);
    expect(manifest[0]).toMatchObject({ src: "/media/pixabay-2160321-webformat.jpg", width: 640, height: 224 });
  });

  it("rejects a downloaded image over maxBytes, naming the id, and writes nothing", async () => {
    const { fs, run } = setup({ entries: [{ ...photo, maxBytes: 10 }], pixabay: imagePixabay() });
    await expect(run()).rejects.toThrow(/service-dc/);
    expect([...fs.files.keys()].filter((p) => p.startsWith("public/media/"))).toEqual([]);
  });
});

describe("throttle", () => {
  it("never sends more than 100 API requests within 60 seconds", async () => {
    const ids = Array.from({ length: 101 }, (_, i) => 1000 + i);
    const entries = ids.map((pixabayId) => ({ ...heroLoop, id: `clip-${pixabayId}`, pixabayId }));
    const hits = Object.fromEntries(ids.map((id) => [`video:${id}`, { ...video173102(), id }]));
    const pixabay = createFakePixabay({ hits });

    let t = 5_000_000;
    const apiTimes = [];
    const timed = {
      ...pixabay,
      fetch: (url) => {
        if (String(url).startsWith("https://pixabay.com/api/")) apiTimes.push(t);
        return pixabay.fetch(url);
      },
    };
    const sleep = async (ms) => {
      t += ms;
    };

    await setup({ entries, pixabay: timed, now: () => t, sleep }).run();

    expect(apiTimes).toHaveLength(101);
    for (let i = 100; i < apiTimes.length; i++) {
      expect(apiTimes[i] - apiTimes[i - 100]).toBeGreaterThanOrEqual(60_000);
    }
    expect(apiTimes[99] - apiTimes[0]).toBeLessThan(60_000);
  });
});
