const API = "https://pixabay.com/api";
const CACHE_DIR = ".cache/pixabay";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Pixabay API client. Pixabay requires responses to be cached for 24 hours.
 * @param {{ apiKey: string, fetch: typeof fetch, fs: import("./sync.mjs").Fs, now: () => number }} deps
 */
export function createPixabayClient({ apiKey, fetch, fs, now }) {
  /** @returns {Promise<any>} the Pixabay hit for one id */
  async function getHit(kind, pixabayId) {
    const cachePath = `${CACHE_DIR}/${kind}-${pixabayId}.json`;
    const cached = await readCache(cachePath);
    if (cached) return cached;

    const base = kind === "video" ? `${API}/videos/` : `${API}/`;
    const res = await fetch(`${base}?${new URLSearchParams({ key: apiKey, id: String(pixabayId) })}`);
    const hit = (await res.json()).hits[0];
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(cachePath, JSON.stringify({ fetchedAt: now(), hit }));
    return hit;
  }

  async function readCache(path) {
    try {
      const { fetchedAt, hit } = JSON.parse(String(await fs.readFile(path)));
      return now() - fetchedAt < CACHE_TTL_MS ? hit : null;
    } catch {
      return null;
    }
  }

  return { getHit };
}
