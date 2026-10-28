export const LICENSE = "Pixabay Content License";

/**
 * @typedef {"video" | "image"} Kind
 * @typedef {{
 *   id: string,
 *   pixabayId: number,
 *   kind: Kind,
 *   rendition: "tiny" | "small" | "medium" | "large" | "webformat",
 *   role: string,
 *   maxBytes: number,
 * }} ConfigEntry
 * @typedef {{
 *   id: string,
 *   kind: Kind,
 *   src: string,
 *   poster?: string,
 *   width: number,
 *   height: number,
 *   duration?: number,
 *   pixabayId: number,
 *   pageURL: string,
 *   user: string,
 *   license: typeof LICENSE,
 * }} ManifestEntry
 * @typedef {{
 *   rendition: string,
 *   url: string,
 *   posterUrl?: string,
 *   width: number,
 *   height: number,
 *   size?: number,
 *   duration?: number,
 *   ext: string,
 * }} Selection
 */

export const RENDITIONS = {
  video: ["tiny", "small", "medium", "large"],
  image: ["webformat", "large"],
};

/**
 * Checks a hand-edited config at the boundary so later code can trust it.
 * @param {{ entries: ConfigEntry[] }} config
 */
export function validateConfig(config) {
  const seen = new Set();
  for (const [index, e] of (config?.entries ?? []).entries()) {
    const label = e?.id ? `entry "${e.id}"` : `entry #${index}`;
    const fail = (field, rule) => {
      throw new Error(`${label}: ${field} ${rule}`);
    };
    if (typeof e.id !== "string" || !e.id) fail("id", "must be a non-empty string");
    if (seen.has(e.id)) fail("id", "is duplicate; every MediaId must be unique");
    seen.add(e.id);
    if (!Number.isInteger(e.pixabayId) || e.pixabayId <= 0) fail("pixabayId", "must be a positive integer");
    if (!(e.kind in RENDITIONS)) fail("kind", 'must be "video" or "image"');
    if (!RENDITIONS[e.kind].includes(e.rendition)) {
      fail("rendition", `must be one of ${RENDITIONS[e.kind].join(", ")} for ${e.kind}`);
    }
    if (typeof e.role !== "string" || !e.role) fail("role", "must be a non-empty string");
    if (!Number.isFinite(e.maxBytes) || e.maxBytes <= 0) fail("maxBytes", "must be a positive number");
  }
}
