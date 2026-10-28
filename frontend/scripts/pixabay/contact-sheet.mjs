const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const megabytes = (bytes) => `${(bytes / 1_000_000).toFixed(2)} MB`;

function details(kind, hit) {
  if (kind === "image") {
    return [`${hit.imageWidth}x${hit.imageHeight} original`, `${hit.webformatWidth}x${hit.webformatHeight} webformat`];
  }
  const renditions = ["tiny", "small", "medium", "large"].map((name) => {
    const f = hit.videos[name];
    return `${name} ${f.width}x${f.height} ${megabytes(f.size)}`;
  });
  return [`${hit.duration}s`, ...renditions];
}

/**
 * A static page for choosing candidates by eye. Pixabay text is escaped; previews
 * are hot-linked here only because this page never ships to visitors.
 * @param {{ kind: import("./model.mjs").Kind, query: string, hits: any[] }} search
 */
export function renderContactSheet({ kind, query, hits }) {
  const cards = hits
    .map((hit) => {
      const preview = kind === "video" ? hit.videos.tiny.thumbnail : hit.webformatURL;
      return `<article>
  <img src="${escapeHtml(preview)}" alt="" loading="lazy">
  <h2>${hit.id}</h2>
  <p class="tags">${escapeHtml(hit.tags)}</p>
  <p>by ${escapeHtml(hit.user)}</p>
  <ul>${details(kind, hit).map((d) => `<li>${escapeHtml(d)}</li>`).join("")}</ul>
  <p><a href="${escapeHtml(hit.pageURL)}">${escapeHtml(hit.pageURL)}</a></p>
</article>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Pixabay candidates: ${escapeHtml(query)}</title>
<style>
body{font:14px/1.4 system-ui,sans-serif;margin:24px;background:#f7f8fa;color:#0a1630}
main{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}
article{background:#fff;border-radius:12px;padding:12px;overflow:hidden}
img{width:100%;border-radius:8px;display:block}
h2{margin:8px 0 0;font:600 16px ui-monospace,monospace}
ul{margin:4px 0;padding-left:18px;font:12px ui-monospace,monospace}
.tags{color:#5a6577}
a{word-break:break-all}
</style></head>
<body><h1>${escapeHtml(kind)} candidates for "${escapeHtml(query)}" (${hits.length})</h1>
<main>
${cards}
</main></body></html>
`;
}
