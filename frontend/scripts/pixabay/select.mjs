const VIDEO_LADDER = ["tiny", "small", "medium", "large"];

/**
 * Pure choice of the file to download for one config entry, given the API hit.
 * Starts at the configured rendition and steps down until the file fits maxBytes.
 * @param {import("./model.mjs").ConfigEntry} entry
 * @param {any} hit
 * @returns {import("./model.mjs").Selection}
 */
export function selectRendition(entry, hit) {
  const start = VIDEO_LADDER.indexOf(entry.rendition);
  for (let i = start; i >= 0; i--) {
    const name = VIDEO_LADDER[i];
    const file = hit.videos[name];
    if (!file?.url || file.size > entry.maxBytes) continue;
    return {
      rendition: name,
      url: file.url,
      posterUrl: file.thumbnail,
      width: file.width,
      height: file.height,
      size: file.size,
      duration: hit.duration,
      ext: "mp4",
    };
  }
  throw new Error(
    `${entry.id}: no rendition of video ${entry.pixabayId} at or below "${entry.rendition}" fits maxBytes ${entry.maxBytes}`,
  );
}
