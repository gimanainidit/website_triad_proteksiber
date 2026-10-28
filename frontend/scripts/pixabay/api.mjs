const API = "https://pixabay.com/api";
const CACHE_DIR = ".cache/pixabay";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Pixabay API client. Pixabay requires responses to be cached for 24 hours.
 * @param {{ apiKey: string, fetch: typeof fetch, fs: import("./sync.mjs").Fs, now: () => number }} deps
 */
export function createPixabayClient({ apiKey, fetch, fs, now }) {
  /** @returns {Promise<any | null>} the Pixabay hit for one id, null when Pixabay has none */
  async function getHit(kind, pixabayId) {
    const cachePath = `${CACHE_DIR}/${kind}-${pixabayId}.json`;
    const cached = await readCache(cachePath);
    if (cached) return cached;

    const base = kind === "video" ? `${API}/videos/` : `${API}/`;
    const body = await request(base, { id: String(pixabayId) });
    const hit = body.hits[0] ?? null;
    if (!hit) return null;
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(cachePath, JSON.stringify({ fetchedAt: now(), hit }));
    return hit;
  }

  /** The request URL holds the key, so nothing derived from it may reach an error message. */
  async function request(base, params) {
    const redact = (text) => String(text).replaceAll(apiKey, "***");
    let res;
    try {
      res = await fetch(`${base}?${new URLSearchParams({ key: apiKey, ...params })}`);
    } catch (error) {
      throw new Error(redact(error?.message ?? error));
    }
    if (res.status === 429) {
      const reset = res.headers.get("X-RateLimit-Reset") ?? "unknown";
      throw new Error(`Pixabay rate limit exceeded (HTTP 429). Wait and retry; X-RateLimit-Reset: ${reset} seconds.`);
    }
    if (!res.ok) throw new Error(redact(`Pixabay API answered HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`));
    return res.json();
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
