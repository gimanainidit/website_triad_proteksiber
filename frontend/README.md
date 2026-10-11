# TRIAD PRO-TX SIBER frontend

React, TypeScript, Vite, Tailwind CSS, and shadcn/ui power the TRIAD website.

From this directory, run `npm ci`, then `npm run dev`. Production output is
created in `build/` by `npm run build`. Use `npm test` for the existing Vitest
suite. Node.js 22 or newer is recommended.

Local configuration belongs in ignored `.env` files:

- `VITE_SUPABASE_URL`: Supabase project URL.
- `VITE_SUPABASE_ANON_KEY`: Supabase publishable key only.
- `VITE_BACKEND_URL`: Public backend URL for CMS, authentication, and AI features.

Never expose backend secret keys, database passwords, or console tokens through
`VITE_` variables.

The production frontend is https://triad-proteksiber-web.vercel.app. Vercel uses
root directory `frontend`, build command `npm run build`, and output directory
`build`. The public site is currently deployed from a local build; automatic Git
deployments are not configured.

Brand assets in `public/` provide the TRIAD favicon and social sharing image.
Update the canonical and social URLs in `index.html` when a custom domain is set.
