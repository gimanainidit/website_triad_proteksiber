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
