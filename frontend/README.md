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
