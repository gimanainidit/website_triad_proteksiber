import imageSearch from "./__fixtures__/image-search.json";
import video173102Fixture from "./__fixtures__/video-173102.json";
import videoSearch from "./__fixtures__/video-search.json";

export const API_KEY = "test-key-DO-NOT-LEAK";

const text = (data) => (typeof data === "string" ? data : Buffer.from(data).toString("utf8"));

export function createFakeFs(initial = {}) {
  const files = new Map(Object.entries(initial));
  const enoent = (path) => Object.assign(new Error(`ENOENT: ${path}`), { code: "ENOENT" });
  return {
    files,
    writes: [],
    async readFile(path) {
      if (!files.has(path)) throw enoent(path);
      return text(files.get(path));
    },
    async writeFile(path, data) {
      this.writes.push(path);
      files.set(path, data);
    },
    async mkdir() {},
    async stat(path) {
      if (!files.has(path)) throw enoent(path);
      return { size: Buffer.byteLength(files.get(path)) };
    },
  };
}

/**
 * Fake of the Pixabay API plus its CDN. `hits` maps "<kind>:<id>" to the hit the
 * API returns; every other URL is treated as a file download.
 */
export function createFakePixabay({ hits = {}, searches = {}, status = 200, headers = {} } = {}) {
  const calls = [];
  const fetch = async (url) => {
    calls.push(String(url));
    const u = new URL(url);
    if (u.hostname === "pixabay.com" && u.pathname.startsWith("/api/")) {
      const kind = u.pathname === "/api/videos/" ? "video" : "image";
      const rateHeaders = { "X-RateLimit-Limit": "100", "X-RateLimit-Remaining": "99", "X-RateLimit-Reset": "60", ...headers };
      if (u.searchParams.has("q") && status === 200) {
        return new Response(JSON.stringify(searches[kind] ?? { total: 0, totalHits: 0, hits: [] }), { status: 200, headers: rateHeaders });
      }
      const hit = hits[`${kind}:${u.searchParams.get("id")}`];
      if (status !== 200) return new Response("rate limited", { status, headers: rateHeaders });
      const body = { total: hit ? 1 : 0, totalHits: hit ? 1 : 0, hits: hit ? [hit] : [] };
      return new Response(JSON.stringify(body), { status: 200, headers: rateHeaders });
    }
    return new Response(Buffer.from(`bytes of ${url}`), { status: 200 });
  };
  return {
    fetch,
    calls,
    get apiCalls() {
      return calls.filter((c) => c.startsWith("https://pixabay.com/api/"));
    },
    get downloadCalls() {
      return calls.filter((c) => !c.startsWith("https://pixabay.com/api/"));
    },
  };
}

export const video173102 = () => structuredClone(video173102Fixture.hits[0]);
export const imageHit = () => structuredClone(imageSearch.hits[0]);
export const videoSearchResult = () => structuredClone(videoSearch);
export const imageSearchResult = () => structuredClone(imageSearch);
