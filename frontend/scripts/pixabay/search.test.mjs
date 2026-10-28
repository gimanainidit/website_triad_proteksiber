import { describe, expect, it } from "vitest";
import { searchCandidates } from "./search.mjs";
import { API_KEY, createFakeFs, createFakePixabay, imageSearchResult, videoSearchResult } from "./testkit.mjs";

const SHEET = ".cache/pixabay/candidates.html";

function setup({ apiKey = API_KEY, searches } = {}) {
  const fake = createFakePixabay({ searches: searches ?? { video: videoSearchResult(), image: imageSearchResult() } });
  const fs = createFakeFs();
  const search = (args) => searchCandidates({ apiKey, fetch: fake.fetch, fs, now: () => 1_000_000, ...args });
  return { fake, fs, search, sheet: () => String(fs.files.get(SHEET)) };
}

describe("searchCandidates", () => {
  it("asks for safe video results and writes a contact sheet with the facts needed to choose", async () => {
    const { fake, search, sheet } = setup();
    const result = await search({ kind: "video", query: "data center", n: 12 });

    const url = new URL(fake.apiCalls[0]);
    expect(url.pathname).toBe("/api/videos/");
    expect(Object.fromEntries(url.searchParams)).toMatchObject({ q: "data center", safesearch: "true", per_page: "12", video_type: "all" });
    expect(result.path).toBe(SHEET);

    const first = videoSearchResult().hits[0];
    const html = sheet();
    expect(html).toContain(String(first.id));
    expect(html).toContain(first.pageURL);
    expect(html).toContain(first.user);
    expect(html).toContain(first.videos.tiny.thumbnail);
    expect(html).toContain(`${first.duration}s`);
    for (const rendition of ["tiny", "small", "medium", "large"]) {
      const f = first.videos[rendition];
      expect(html).toContain(`${rendition} ${f.width}x${f.height} ${(f.size / 1_000_000).toFixed(2)} MB`);
    }
  });

  it("asks for horizontal photos and lists image size per candidate", async () => {
    const { fake, search, sheet } = setup();
    await search({ kind: "image", query: "server room", n: 5, editorsChoice: true });

    const params = Object.fromEntries(new URL(fake.apiCalls[0]).searchParams);
    expect(new URL(fake.apiCalls[0]).pathname).toBe("/api/");
    expect(params).toMatchObject({ safesearch: "true", per_page: "5", image_type: "photo", orientation: "horizontal", editors_choice: "true" });

    const first = imageSearchResult().hits[0];
    expect(sheet()).toContain(first.webformatURL);
    expect(sheet()).toContain(`${first.imageWidth}x${first.imageHeight}`);
  });

  it("escapes Pixabay text and never writes the key", async () => {
    const hostile = videoSearchResult();
    hostile.hits[0].tags = '<img src=x onerror="alert(1)">';
    const { search, sheet } = setup({ searches: { video: hostile } });
    await search({ kind: "video", query: "x", n: 3 });
    expect(sheet()).not.toContain("<img src=x");
    expect(sheet()).toContain("&lt;img");
    expect(sheet()).not.toContain(API_KEY);
  });

  it("refuses an empty key with the PIXABAY_API_KEY hint", async () => {
    const { fake, search } = setup({ apiKey: "" });
    await expect(search({ kind: "video", query: "x", n: 3 })).rejects.toThrow(/PIXABAY_API_KEY.*frontend\/\.env\.local/s);
    expect(fake.calls).toEqual([]);
  });
});
