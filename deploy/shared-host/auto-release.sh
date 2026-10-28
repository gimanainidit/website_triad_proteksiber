#!/usr/bin/env bash
# Release the newest main commit whose CI run succeeded. Run by triad-auto-release.timer.
# Each commit is handled once, whoever put it live, so a failed release or a manual
# rollback is not undone. Pause with: touch /opt/triad/auto-release.paused
set -euo pipefail
dir=${TRIAD_DEPLOY_DIR:-/opt/triad}
cd "$dir"
[[ -e auto-release.paused ]] && exit 0

image=$(sed -n -E 's|^FRONTEND_IMAGE=ghcr.io/(.+)-frontend:([a-f0-9]{40})$|\1 \2|p' production.env)
read -r repo running <<<"$image" || true
[[ -n "${running:-}" ]] || { echo "FRONTEND_IMAGE has no commit tag yet; waiting for the first manual release"; exit 0; }

latest=$(curl -fsS --max-time 30 -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/$repo/actions/workflows/vps.yml/runs?branch=main&event=push&status=success&per_page=1" \
  | python3 -c 'import json, sys; print(json.load(sys.stdin)["workflow_runs"][0]["head_sha"])' 2>/dev/null) || true
[[ "$latest" =~ ^[a-f0-9]{40}$ ]] || { echo "No usable commit from the GitHub API (outage, rate limit or no green run)" >&2; exit 1; }

[[ "$latest" == "$(cat auto-release.last 2>/dev/null)" ]] && exit 0
printf '%s\n' "$latest" > auto-release.last
[[ "$latest" == "$running" ]] && exit 0
exec "$dir/release.sh" "$repo" "$latest"
