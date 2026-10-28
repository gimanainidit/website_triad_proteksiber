/**
 * Pure choice of the file to download for one config entry, given the API hit.
 * @typedef {{ url: string, width: number, height: number, size: number, thumbnail: string }} VideoFile
 * @param {import("./model.mjs").ConfigEntry} entry
 * @param {any} hit
 * @returns {import("./model.mjs").Selection}
 */
export function selectRendition(entry, hit) {
  const file = hit.videos[entry.rendition];
  return {
    rendition: entry.rendition,
    url: file.url,
    posterUrl: file.thumbnail,
    width: file.width,
    height: file.height,
    size: file.size,
    duration: hit.duration,
    ext: "mp4",
  };
}
