# TRIAD PRO-TX SIBER

The current TRIAD website is the React/Vite application in `frontend/`.
The FastAPI CMS backend is in `backend/`.

- Public website: https://triad-proteksiber-web.vercel.app
- Frontend setup and environment variables: [frontend/README.md](frontend/README.md)
- Backend AI configuration: [backend/README.md](backend/README.md)

Run frontend commands from `frontend/`: `npm ci`, `npm run dev`, and
`npm run build`. Vercel uses `frontend` as the project root and `build` as
its output directory. Local `.env` files are ignored and must never be committed.

The current public deployment serves the frontend only. CMS, login, and AI
features require a configured public backend.

The original Astro starter files at the repository root are preserved from
`main` for reference; the current Vercel deployment uses `frontend/`.

## Production VPS

See [VPS deployment guide](deploy/README.md) for containers, managed Neon/Supabase, pre-domain setup, GitHub Actions, and rollback. The workflow keeps VPS deployment disabled until installation and SSH secrets are configured.
