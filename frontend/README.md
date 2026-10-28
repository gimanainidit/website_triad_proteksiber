# TRIAD PRO-TX SIBER frontend

React, TypeScript, Vite, Tailwind CSS, and shadcn/ui power the TRIAD website.

From this directory, run `npm ci`, then `npm run dev`. Production output is
created in `build/` by `npm run build`. Use `npm test` for the existing Vitest
suite. Node.js 22 or newer is recommended.

Local configuration belongs in ignored `.env` files:

- `VITE_BACKEND_URL`: Public backend URL for CMS, authentication, and AI features.

Never expose backend secret keys, database passwords, or console tokens through
`VITE_` variables.

The production site is https://eranusasiber.my.id, served from the frontend
container on the VPS (see `deploy/shared-host/README.md`).

Brand assets in `public/` provide the TRIAD favicon and social sharing image.
`src/test/site-metadata.test.ts` pins the canonical and social URLs in `index.html`
to the production domain.

## Pixabay media pipeline

Videos and photos on the site come from Pixabay. A build-time script downloads
the curated files, so visitors never call Pixabay and the committed assets are
all CI needs.

Put the API key in `frontend/.env.local` (ignored by git) as
`PIXABAY_API_KEY=<key>`. Never use a `VITE_` prefix: those variables are bundled
into the browser. Node.js 22.9 or newer reads the file through
`--env-file-if-exists`.

- `npm run assets:search -- "<query>" --kind video|image [--n 12] [--editors-choice] [--video-type all|film|animation]`
  searches with `safesearch=true` (images: `image_type=photo`, `orientation=horizontal`)
  and writes a contact sheet to `.cache/pixabay/candidates.html`. Open it to
  pick candidates by id, tags, duration and size per rendition.
- `npm run assets:pixabay` reads `scripts/pixabay/assets.config.json`, downloads
  files into `public/media/` and writes `src/media/manifest.json`. Files are named
  `pixabay-<pixabayId>-<rendition>.<ext>`, video posters
  `pixabay-<pixabayId>-<rendition>-poster.jpg`. Re-runs skip files already on disk
  with the size the API reports.

Config entries are chosen by hand after a search:

```json
{
  "entries": [
    { "id": "hero-loop", "pixabayId": 173102, "kind": "video", "rendition": "small", "role": "hero-loop", "maxBytes": 6500000 }
  ]
}
```

- `id` is the `MediaId` the site uses; it must be unique. `role` is a free label.
- `rendition` is `tiny|small|medium|large` for video and `webformat|large` for
  image. A video rendition over `maxBytes` steps down to the largest one that
  fits, or the run fails naming the `id`. Image sizes are only known after
  download, so an image over `maxBytes` fails the run.
- Manifest entries hold `id, kind, src, poster, width, height, duration, pixabayId,
  pageURL, user, license`. `poster` and `duration` exist for video only. Duration
  and dimensions come from the API (there is no ffprobe); a poster is the
  rendition's `thumbnail`.

Budgets: hero loop up to 6.5 MB (`small`), modal video up to 15 MB (`medium`),
all of `public/media` up to 40 MB (check with `du -sh public/media`).

Pixabay rules the script follows: API responses are cached for 24 hours in
`.cache/pixabay/`, at most 100 API requests go out per 60 seconds (HTTP 429 stops
the run and prints `X-RateLimit-Reset`), and images are always downloaded, never
hotlinked. The site shows the attribution at `/kredit`. Nginx serves `/media/`
with a 30 day cache.
