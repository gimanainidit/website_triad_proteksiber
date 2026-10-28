#!/usr/bin/env bash
# Prepare a host whose nginx already serves other sites for the TRIAD stack.
# Run from a checkout of this repository: sudo bash deploy/shared-host/setup-host.sh
# Safe to re-run: stack files are refreshed, *.env files are created only once,
# a site certbot has edited is left alone, and nginx changes are rolled back
# if `nginx -t` fails.
set -euo pipefail

here=$(cd "$(dirname "$0")" && pwd)
deploy_src=$(dirname "$here")
dir=/opt/triad
nginx_dir=/etc/nginx
if [[ $EUID -ne 0 ]]; then  # directory overrides exist for the unprivileged tests only
  dir=${TRIAD_DEPLOY_DIR:-$dir}
  nginx_dir=${NGINX_DIR:-$nginx_dir}
fi
user=triad
site="$nginx_dir/sites-available/triad"
link="$nginx_dir/sites-enabled/triad"

fail() { echo "$1" >&2; exit 1; }

version=$(docker compose version --short)
if [[ "$(printf '%s\n2.24.4\n' "$version" | sort -V | head -1)" != "2.24.4" ]]; then
  fail "Docker Compose $version is too old; compose.override.yml needs >= 2.24.4"
fi
if [[ -n "$(ss -ltnH 'sport = :8180')" && ! -f "$dir/compose.override.yml" ]]; then
  fail "Port 8180 is already in use by something else"
fi
for name in production backend n8n; do
  [[ -L "$dir/$name.env" ]] && fail "$dir/$name.env is a symlink; refusing to edit it as root"
done
if [[ -e "$link" && ! -L "$link" ]]; then
  fail "$link is a regular file, not a link; move it away first"
fi

if id "$user" >/dev/null 2>&1; then
  home=$(getent passwd "$user" | cut -d: -f6)
  [[ $(id -u "$user") -lt 1000 && "$home" == "$dir" ]] \
    || fail "User $user already exists and is not the deploy account (home $home)"
else
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

created_site=false
if [[ ! -e "$site" ]]; then
  install -m 644 "$here/nginx-triad.conf" "$site"
  created_site=true
elif ! cmp -s "$here/nginx-triad.conf" "$site"; then
  echo "Keeping $site: it differs from the template (certbot or a manual edit)." >&2
fi
old_target=""
[[ -L "$link" ]] && old_target=$(readlink "$link")
if [[ "$old_target" != "$site" ]] || $created_site; then
  ln -sfn "$site" "$link"
  if ! nginx -t; then
    echo "nginx -t failed; restoring previous nginx state" >&2
    if [[ -n "$old_target" ]]; then ln -sfn "$old_target" "$link"; else rm -f "$link"; fi
    $created_site && rm -f "$site"
    exit 1
  fi
  systemctl reload nginx
fi

cat <<EOF
Done. Next, as user $user in $dir:
  1. Fill backend.env (DATABASE_URL, SUPABASE_*, JWT_SECRET_KEY) and image tags in production.env.
  2. docker login ghcr.io, then: docker compose --env-file production.env up -d --wait
  3. sudo certbot --nginx -d eranusasiber.my.id -d www.eranusasiber.my.id
EOF
