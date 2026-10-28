# Shared-host mode (VPS with an existing nginx)

Use this mode when the VPS already runs nginx on 80/443 for other sites. The host
nginx terminates TLS for `eranusasiber.my.id` and `www.eranusasiber.my.id` and proxies
to the TRIAD gateway on `127.0.0.1:8180`. Nothing else is published, so Docker's ufw
bypass does not expose any container. n8n stays off unless `COMPOSE_PROFILES=automation`.

Database and files live in Supabase project `nnxyouxuxvxrvggklqvf` (Postgres via the
transaction pooler, Storage buckets `resources` and `templates`). Supabase signs its pooler
certificate with its own root CA, shipped in the backend image at
`/app/certs/supabase-prod-ca-2021.crt`; keep `PGSSLROOTCERT` in `backend.env`.

## Install

1. DNS (Cloudflare): `A eranusasiber.my.id -> <VPS IPv4>`, `CNAME www -> eranusasiber.my.id`.
   Keep both records DNS only: Cloudflare's proxy cuts requests at 100 s and AI generation
   can take longer. No AAAA unless IPv6 is routed to the VPS. If you later enable the proxy,
   set SSL/TLS mode to Full (strict).
2. From a checkout of this repository: `sudo bash deploy/shared-host/setup-host.sh`.
   It creates user `triad` (docker group: root-equivalent), fills `/opt/triad`, creates the
   `*.env` files once with mode 600, installs the nginx site, runs `nginx -t` and reloads
   (and rolls the site back if the check fails). Re-running it never overwrites `*.env`
   and keeps a site file certbot has edited.
2b. Or run the guided path for steps 1–5 as a normal user: `bash deploy/shared-host/wizard.sh`.
3. As `triad` in `/opt/triad`: fill `backend.env` and the image tags in `production.env`,
   `docker login ghcr.io` with a `read:packages` token, then
   `docker compose --env-file production.env run --rm --no-deps backend python init_db.py`
   (creates missing CMS tables only) and
   `docker compose --env-file production.env up -d --wait --wait-timeout 180`.
4. Check: `curl -s 127.0.0.1:8180/api/health`, `ss -ltn | grep 8180` shows only `127.0.0.1`,
   and the other sites on this host still answer.
5. `sudo certbot --nginx -d eranusasiber.my.id -d www.eranusasiber.my.id`, then
   `curl -I https://eranusasiber.my.id/api/health`.

To release a new commit: `bash deploy/shared-host/ship.sh` (push, wait for CI, run release.sh).
Releases and rollback use `/opt/triad/release.sh` unchanged; Compose picks up
`compose.override.yml` from the same directory. Never run `docker compose down -v`.

To remove: `docker compose down` in `/opt/triad`, delete `/etc/nginx/sites-enabled/triad`,
`nginx -t`, reload.
