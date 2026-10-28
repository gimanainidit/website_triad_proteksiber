const API = "https://pixabay.com/api";
const CACHE_DIR = ".cache/pixabay";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const RATE_LIMIT = 100;
const RATE_WINDOW_MS = 60_000;
// Margin for clock skew between us and Pixabay, so a full window never counts as two.
const RATE_MARGIN_MS = 1_000;

export const MISSING_KEY_MESSAGE =
  "PIXABAY_API_KEY is not set. Put PIXABAY_API_KEY=<your key> in frontend/.env.local (no VITE_ prefix, or the key would ship in the browser bundle).";

const realSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Pixabay API client. Pixabay requires responses to be cached for 24 hours.
 * @param {{ apiKey: string, fetch: typeof fetch, fs: import("./sync.mjs").Fs, now: () => number, sleep?: (ms: number) => Promise<void> }} deps
 */
export function createPixabayClient({ apiKey, fetch, fs, now, sleep = realSleep }) {
  if (!apiKey?.trim()) throw new Error(MISSING_KEY_MESSAGE);

  /** Timestamps of API requests still inside the rate window. */
  const sent = [];

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

  /** @returns {Promise<any[]>} search hits, for the contact sheet; not cached, as Pixabay allows for fresh queries */
  async function search(kind, params) {
    const body = await request(kind === "video" ? `${API}/videos/` : `${API}/`, params);
    return body.hits;
  }

  /** The request URL holds the key, so nothing derived from it may reach an error message. */
  async function request(base, params) {
    await waitForRateWindow();
    sent.push(now());
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

  async function waitForRateWindow() {
    while (sent.length && now() - sent[0] >= RATE_WINDOW_MS + RATE_MARGIN_MS) sent.shift();
    if (sent.length >= RATE_LIMIT) {
      await sleep(sent[0] + RATE_WINDOW_MS + RATE_MARGIN_MS - now());
      await waitForRateWindow();
    }
  }

  async function readCache(path) {
    try {
      const { fetchedAt, hit } = JSON.parse(String(await fs.readFile(path)));
      return now() - fetchedAt < CACHE_TTL_MS ? hit : null;
    } catch {
      return null;
    }
  }

  return { getHit, search };
}
