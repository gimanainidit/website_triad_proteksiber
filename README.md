# TRIAD PRO-TX SIBER

The current TRIAD website is the React/Vite application in `frontend/`.
The FastAPI CMS backend is in `backend/`.

- Public website: https://eranusasiber.my.id
- Frontend setup and environment variables: [frontend/README.md](frontend/README.md)
- Backend AI configuration: [backend/README.md](backend/README.md)

Run frontend commands from `frontend/`: `npm ci`, `npm run dev`, and
`npm run build`. Local `.env` files are ignored and must never be committed.

Production runs the frontend and backend as containers on the VPS; see
[deploy/shared-host/README.md](deploy/shared-host/README.md).

## Production VPS

See [VPS deployment guide](deploy/README.md) for containers, managed Neon/Supabase, pre-domain setup, GitHub Actions, and rollback. Every green push to main is released by a timer on the VPS.
