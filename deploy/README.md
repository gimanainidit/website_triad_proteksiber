# TRIAD VPS deployment — Supabase Postgres + Storage

This directory prepares production. Frontend/API use one origin: Caddy routes `/api/*`
to FastAPI and everything else to the React static build. Supabase holds both the
PostgreSQL data and uploaded files; no local PostgreSQL container is created.

**The current VPS already runs nginx for other sites: use [shared-host mode](shared-host/README.md).**
The rest of this guide describes the dedicated-VPS mode, where Caddy owns ports 80/443.

## Prerequisites

Ubuntu LTS, Docker Engine and Compose plugin from [Docker's official Ubuntu instructions](https://docs.docker.com/engine/install/ubuntu/),
a non-root deploy user, and SSH key authentication. Membership of the Docker group
gives administrative control of the host; limit it to the deploy user.
Allow ports 80/443 and your SSH port. Backend ports are not published. n8n is only
bound to loopback. Minimum practical starting point: 2 vCPU / 4 GB RAM, depending
on n8n workload. CI builds images outside the VPS.

Create `/opt/triad`, owned by the deploy user. Copy `compose.yml`, `Caddyfile`, and
`release.sh` there, plus the three example files renamed to `production.env`,
`backend.env`, `n8n.env`. These examples contain placeholders only.

```sh
cd /opt/triad
chmod 700 release.sh
chmod 600 production.env backend.env n8n.env
```

Supply these values securely on the VPS:

- `DATABASE_URL`: the real Neon URL. Supabase stays configured separately for storage.
  URL-encode special password characters. The backend always verifies TLS certificates
  and hostnames, including when the provider URL says `sslmode=require`.
- `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`: project URL and server-only secret.
- `JWT_SECRET_KEY`: generate once and retain; `openssl rand -hex 48` can generate it.
- `OPENAI_API_KEY`: your own key; optional. Leave empty to disable AI endpoints.
- `N8N_ENCRYPTION_KEY`: independently generate once and preserve with n8n backups.
- `N8N_API_KEY`: create on this VPS n8n instance; a key from development is not portable.

The CMS can start with blank OPENAI_API_KEY/N8N_API_KEY. AI and n8n operations return
HTTP 503 with a configuration message until enabled. Restart backend after setting keys.
No credentials from the Codex development checkout are baked into images or automatically
copied to the production host. Existing development DATABASE_URL is Supabase;
replace it with the intended Neon connection rather than assuming Neon is provisioned.

## First deployment before buying a domain

1. Push the workflow to main. It runs existing checks and publishes two private GHCR
   images tagged with the complete commit SHA.
   `VITE_BACKEND_URL` is empty in VPS builds, so requests use the same origin.
2. On VPS, authenticate to GHCR using a credential with `read:packages`, through
   `docker login ghcr.io --username YOUR_GITHUB_USER --password-stdin`. For private
   repositories ensure the credential also has the account's required package access.
   Do not paste credentials into shell command arguments.
3. In `production.env`, set both image tags to the SHA of a successful image build,
   and set `SITE_ADDRESS=http://YOUR_VPS_IP`. HTTP via IP is only for initial checks;
   wait for HTTPS before sending real login credentials or using the public CMS.
4. Start n8n, then access its initial owner setup through an SSH tunnel:

```sh
cd /opt/triad
docker compose --env-file production.env up -d n8n
# Run this next command on your own computer:
ssh -L 5678:127.0.0.1:5678 DEPLOY_USER@VPS_IP
```

Open your computer's forwarded port 5678, create the n8n owner and API key, then
save that key in VPS `backend.env`. Keep the editor behind this tunnel.
`N8N_SECURE_COOKIE=false` supports this loopback HTTP tunnel, not a public editor.
The gateway does not expose public n8n webhook routes in this initial configuration.

5. Initialize schema explicitly on an empty, intended production Neon database:

```sh
cd /opt/triad
docker compose --env-file production.env pull frontend backend
docker compose --env-file production.env run --rm --no-deps backend python init_db.py
docker compose --env-file production.env up -d --wait --wait-timeout 180
```

`AUTO_CREATE_TABLES=false` prevents every deployment from creating schema automatically.
This initialization only creates missing tables; it is NOT a schema migration strategy.
Future column changes need reviewed Alembic migrations. Image rollback does not roll back data.

6. Check `http://VPS_IP/`, `/services`, `/api/health`, and `/api/resources`.
   Resources must return JSON from Neon. Check Supabase buckets, access policies,
   admin provisioning, login, uploads and AI separately before opening the CMS.
   Build/tests alone do not prove these live integrations work.

## Automatic releases

Set GitHub repository variable `VPS_DEPLOY_ENABLED=true` only after first installation.
Create GitHub environment `production`. Configure secrets there:
`VPS_HOST`, `VPS_USER`, `VPS_PORT` (default 22), `VPS_SSH_KEY`, `VPS_KNOWN_HOSTS`.
Use a dedicated deployment SSH key. Verify the server host-key fingerprint against
the provider console before entering its known_hosts line; do not blindly trust ssh-keyscan.

A push to main runs checks, builds/pushes image tags, then calls `/opt/triad/release.sh`.
The script serializes deployments, retains prior image references, waits for health
and requests `/api/resources`. On failure it restores previous image references.
First bootstrap is manual: automatic deployment does not install Docker, create
secrets, initialize n8n, or manage database migrations.

To roll back manually:

```sh
cd /opt/triad
cp production.env.previous production.env
docker compose --env-file production.env up -d --wait
```

When changing Compose/Caddy/release configuration, copy the reviewed updated files
to VPS before deploying a release that depends on them; CI currently updates images only.
This is a single-VPS deployment with possible brief downtime, not a zero-downtime cluster.

## Add the domain later

Point the apex A record at VPS IPv4 and www CNAME at the apex. Add AAAA only if IPv6
is correctly routed to this VPS. Change `SITE_ADDRESS` to the chosen hostname
(without http://), then recreate gateway:

```sh
docker compose --env-file production.env up -d --force-recreate gateway
```

Caddy obtains and renews HTTPS certificates when DNS and ports 80/443 are reachable.
Domain change does not require rebuilding this frontend because API URLs are relative.
Canonical and social-card URLs in `frontend/index.html` point to https://eranusasiber.my.id.
Add www to Caddy routing if you want it supported.

## Preview and retained state

There is no preview deployment. For interactive previews use a separate staging
backend and database; never let preview writes target production.
Avoid putting server secrets into any VITE_* variable.

Back up n8n volume together with its encryption key, securely and off the VPS.
A filesystem copy of live SQLite is insufficient; use a consistent SQLite backup
or stop n8n while taking a volume snapshot. Retain provider backups for Neon/Supabase
according to your actual plan; free-tier retention must be verified.
Never run `docker compose down -v` against production unless intentionally deleting state.
