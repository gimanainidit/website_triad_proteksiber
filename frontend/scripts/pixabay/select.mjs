const VIDEO_LADDER = ["tiny", "small", "medium", "large"];
const LARGE_IMAGE_EDGE = 1280;

/**
 * Pure choice of the file to download for one config entry, given the API hit.
 * Videos start at the configured rendition and step down until the file fits
 * maxBytes. Image sizes are unknown until downloaded, so sync enforces maxBytes there.
 * @param {import("./model.mjs").ConfigEntry} entry
 * @param {any} hit
 * @returns {import("./model.mjs").Selection}
 */
export function selectRendition(entry, hit) {
  return entry.kind === "video" ? selectVideo(entry, hit) : selectImage(entry, hit);
}

function selectVideo(entry, hit) {
  for (let i = VIDEO_LADDER.indexOf(entry.rendition); i >= 0; i--) {
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

function selectImage(entry, hit) {
  if (entry.rendition === "webformat") {
    return { rendition: "webformat", url: hit.webformatURL, width: hit.webformatWidth, height: hit.webformatHeight, ext: extOf(hit.webformatURL) };
  }
  // The API reports only the original's size; largeImageURL is that original scaled to a 1280px long edge.
  const scale = Math.min(1, LARGE_IMAGE_EDGE / Math.max(hit.imageWidth, hit.imageHeight));
  return {
    rendition: "large",
    url: hit.largeImageURL,
    width: Math.round(hit.imageWidth * scale),
    height: Math.round(hit.imageHeight * scale),
    ext: extOf(hit.largeImageURL),
  };
}

function extOf(url) {
  return new URL(url).pathname.split(".").pop().toLowerCase();
}
