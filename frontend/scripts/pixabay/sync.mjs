import { createPixabayClient } from "./api.mjs";
import { LICENSE } from "./model.mjs";
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
 *   log?: (line: string) => void,
 * }} deps
 */
export async function syncAssets({ config, apiKey, fetch, fs, now, log = () => {} }) {
  if (!apiKey?.trim()) throw new Error(MISSING_KEY_MESSAGE);
  const api = createPixabayClient({ apiKey, fetch, fs, now });
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
    await save(entry, `${MEDIA_DIR}/${file}`, pick.url, pick.size);
    await save(entry, `${MEDIA_DIR}/${poster}`, pick.posterUrl);

    manifest.push({
      id: entry.id,
      kind: entry.kind,
      src: `/media/${file}`,
      poster: `/media/${poster}`,
      width: pick.width,
      height: pick.height,
      duration: pick.duration,
      pixabayId: entry.pixabayId,
      pageURL: hit.pageURL,
      user: hit.user,
      license: LICENSE,
    });
    log(`${entry.id}: ${file}`);
  }
  return { manifest, downloaded, reused };

  /** A file counts as present when it has the size the API reported, or any content when the API reports none. */
  async function save(entry, path, url, expectedSize) {
    const onDisk = await fs.stat(path).then((s) => s.size, () => 0);
    if (onDisk > 0 && (expectedSize === undefined || onDisk === expectedSize)) {
      reused.push(path);
      return;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${entry.id}: download of ${path} failed with HTTP ${res.status}`);
    await fs.writeFile(path, Buffer.from(await res.arrayBuffer()));
    downloaded.push(path);
  }
}
