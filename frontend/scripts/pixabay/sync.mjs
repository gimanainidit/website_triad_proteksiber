import { createPixabayClient } from "./api.mjs";
import { LICENSE, validateConfig } from "./model.mjs";
import { selectRendition } from "./select.mjs";

const MEDIA_DIR = "public/media";

export const MISSING_KEY_MESSAGE =
  "PIXABAY_API_KEY is not set. Put PIXABAY_API_KEY=<your key> in frontend/.env.local (no VITE_ prefix, or the key would ship in the browser bundle).";

/**
 * @typedef {{
 *   readFile(path: string): Promise<string | Uint8Array>,
 *   writeFile(path: string, data: Uint8Array | string): Promise<void>,
 *   mkdir(path: string, opts?: { recursive: boolean }): Promise<unknown>,
 *   stat(path: string): Promise<{ size: number }>,
 * }} Fs
 */

/**
 * Downloads the curated Pixabay files and returns the manifest describing them.
 * Paths are relative to the working directory (the `frontend/` folder).
 * @param {{
 *   config: { entries: import("./model.mjs").ConfigEntry[] },
 *   apiKey: string,
 *   fetch: typeof fetch,
 *   fs: Fs,
 *   now: () => number,
 *   sleep?: (ms: number) => Promise<void>,
 *   log?: (line: string) => void,
 * }} deps
 */
export async function syncAssets({ config, apiKey, fetch, fs, now, sleep, log = () => {} }) {
  if (!apiKey?.trim()) throw new Error(MISSING_KEY_MESSAGE);
  validateConfig(config);
  const api = createPixabayClient({ apiKey, fetch, fs, now, sleep });
  const manifest = [];
  const downloaded = [];
  const reused = [];
  await fs.mkdir(MEDIA_DIR, { recursive: true });

  for (const entry of config.entries) {
    const hit = await api.getHit(entry.kind, entry.pixabayId);
    if (!hit) throw new Error(`${entry.id}: Pixabay has no ${entry.kind} with id ${entry.pixabayId}`);
    const pick = selectRendition(entry, hit);

    const name = `pixabay-${entry.pixabayId}-${pick.rendition}`;
    const file = `${name}.${pick.ext}`;
    const poster = `${name}-poster.jpg`;
    await save(entry, `${MEDIA_DIR}/${file}`, pick.url, { expectedSize: pick.size, maxBytes: entry.maxBytes });
    if (pick.posterUrl) await save(entry, `${MEDIA_DIR}/${poster}`, pick.posterUrl, {});

    manifest.push({
      id: entry.id,
      kind: entry.kind,
      src: `/media/${file}`,
      ...(pick.posterUrl && { poster: `/media/${poster}` }),
      width: pick.width,
      height: pick.height,
      ...(pick.duration !== undefined && { duration: pick.duration }),
      pixabayId: entry.pixabayId,
      pageURL: hit.pageURL,
      user: hit.user,
      license: LICENSE,
    });
    log(`${entry.id}: ${file}`);
  }
  return { manifest, downloaded, reused };

  /** A file counts as present when it has the size the API reported, or any content when the API reports none. */
  async function save(entry, path, url, { expectedSize, maxBytes = Infinity }) {
    const onDisk = await fs.stat(path).then((s) => s.size, () => 0);
    if (onDisk > 0 && (expectedSize === undefined || onDisk === expectedSize)) {
      reused.push(path);
      return;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${entry.id}: download of ${path} failed with HTTP ${res.status}`);
    const bytes = Buffer.from(await res.arrayBuffer());
    if (bytes.length > maxBytes) throw new Error(`${entry.id}: ${path} is ${bytes.length} bytes, over maxBytes ${maxBytes}`);
    await fs.writeFile(path, bytes);
    downloaded.push(path);
  }
}
