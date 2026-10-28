import { createPixabayClient } from "./api.mjs";
import { renderContactSheet } from "./contact-sheet.mjs";

export const CONTACT_SHEET_PATH = ".cache/pixabay/candidates.html";

/**
 * Searches Pixabay and writes a contact sheet of the results to pick from.
 * @param {{
 *   kind: import("./model.mjs").Kind,
 *   query: string,
 *   n?: number,
 *   videoType?: string,
 *   editorsChoice?: boolean,
 *   apiKey: string,
 *   fetch: typeof fetch,
 *   fs: import("./sync.mjs").Fs,
 *   now: () => number,
 *   sleep?: (ms: number) => Promise<void>,
 * }} args
 * @returns {Promise<{ path: string, count: number }>}
 */
export async function searchCandidates({ kind, query, n = 12, videoType = "all", editorsChoice = false, apiKey, fetch, fs, now, sleep }) {
  const api = createPixabayClient({ apiKey, fetch, fs, now, sleep });
  const params = {
    q: query,
    safesearch: "true",
    // Pixabay accepts 3 to 200 results per page.
    per_page: String(Math.min(200, Math.max(3, n))),
    ...(kind === "video" ? { video_type: videoType } : { image_type: "photo", orientation: "horizontal" }),
    ...(editorsChoice && { editors_choice: "true" }),
  };
  const hits = await api.search(kind, params);
  await fs.mkdir(".cache/pixabay", { recursive: true });
  await fs.writeFile(CONTACT_SHEET_PATH, renderContactSheet({ kind, query, hits }));
  return { path: CONTACT_SHEET_PATH, count: hits.length };
}
