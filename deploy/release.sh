#!/usr/bin/env bash
set -euo pipefail
cd "${TRIAD_DEPLOY_DIR:-/opt/triad}"
repo=${1:?repository required}
sha=${2:?commit required}
[[ "$repo" =~ ^[a-z0-9_-]+/[a-z0-9_.-]+$ ]] || exit 2
[[ "$sha" =~ ^[a-f0-9]{40}$ ]] || exit 2
exec 9>.deploy.lock
flock 9
if grep -qx "FRONTEND_IMAGE=ghcr.io/$repo-frontend:$sha" production.env \
  && grep -qx "BACKEND_IMAGE=ghcr.io/$repo-backend:$sha" production.env; then
  printf '%s\n' "Release $sha is already running; nothing to do."
  exit 0
fi
cp production.env production.env.previous
rollback() {
  cp production.env.previous production.env
  docker compose --env-file production.env up -d frontend backend gateway
}
trap 'rollback' ERR
sed -i -E "s|^FRONTEND_IMAGE=.*|FRONTEND_IMAGE=ghcr.io/$repo-frontend:$sha|;s|^BACKEND_IMAGE=.*|BACKEND_IMAGE=ghcr.io/$repo-backend:$sha|" production.env
docker compose --env-file production.env pull frontend backend
docker compose --env-file production.env up -d --wait --wait-timeout 180
# Exercise the real database, not only the process health endpoint.
docker compose --env-file production.env exec -T backend python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8001/api/resources', timeout=15)"
trap - ERR
printf '%s\n' "Release $sha deployed; prior image references retained in production.env.previous."
