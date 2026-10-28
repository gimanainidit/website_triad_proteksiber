#!/usr/bin/env bash
# Prepare a host whose nginx already serves other sites for the TRIAD stack.
# Run from a checkout of this repository: sudo bash deploy/shared-host/setup-host.sh
# Safe to re-run: stack files are refreshed, *.env files are created only once,
# and the nginx site is rolled back if `nginx -t` fails.
set -euo pipefail

here=$(cd "$(dirname "$0")" && pwd)
deploy_src=$(dirname "$here")
dir=${TRIAD_DEPLOY_DIR:-/opt/triad}
nginx_dir=${NGINX_DIR:-/etc/nginx}
user=triad

version=$(docker compose version --short)
if [[ "$(printf '%s\n2.24.4\n' "$version" | sort -V | head -1)" != "2.24.4" ]]; then
  echo "Docker Compose $version is too old; compose.override.yml needs >= 2.24.4" >&2
  exit 1
fi
if [[ -n "$(ss -ltnH 'sport = :8180')" && ! -f "$dir/compose.override.yml" ]]; then
  echo "Port 8180 is already in use by something else" >&2
  exit 1
fi

if ! id "$user" >/dev/null 2>&1; then
  useradd --system --user-group --home-dir "$dir" --create-home --shell /bin/bash "$user"
fi
usermod -aG docker "$user"  # docker group is root-equivalent: this user only

mkdir -p "$dir"
install -m 644 "$deploy_src/compose.yml" "$deploy_src/Caddyfile" "$here/compose.override.yml" "$dir/"
install -m 700 "$deploy_src/release.sh" "$dir/release.sh"
for name in production backend n8n; do
  target="$dir/$name.env"
  [[ -e "$target" ]] && continue
  install -m 600 "$deploy_src/$name.env.example" "$target"
done
sed -i -E 's|^SITE_ADDRESS=.*|SITE_ADDRESS=:80|' "$dir/production.env"
chown -R "$user:$user" "$dir"

site="$nginx_dir/sites-available/triad"
link="$nginx_dir/sites-enabled/triad"
backup=""
if [[ -f "$site" ]]; then
  backup=$(mktemp)
  cp "$site" "$backup"
fi
had_link=false
[[ -L "$link" ]] && had_link=true
install -m 644 "$here/nginx-triad.conf" "$site"
ln -sfn "$site" "$link"
if ! nginx -t; then
  echo "nginx -t failed; restoring previous nginx state" >&2
  if [[ -n "$backup" ]]; then cp "$backup" "$site"; else rm -f "$site"; fi
  $had_link || rm -f "$link"
  exit 1
fi
systemctl reload nginx
[[ -n "$backup" ]] && rm -f "$backup"

cat <<EOF
Done. Next, as user $user in $dir:
  1. Fill backend.env (DATABASE_URL, SUPABASE_*, JWT_SECRET_KEY) and image tags in production.env.
  2. docker login ghcr.io, then: docker compose --env-file production.env up -d --wait
  3. sudo certbot --nginx -d eranusasiber.my.id -d www.eranusasiber.my.id
EOF
