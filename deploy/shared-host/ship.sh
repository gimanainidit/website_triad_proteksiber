#!/usr/bin/env bash
# Push main, wait for its CI run to build the images, then release that commit here.
# Run as the operator (gh logged in, sudo-capable): bash deploy/shared-host/ship.sh
set -euo pipefail
repo=gimanainidit/website_triad_proteksiber
cd "$(dirname "$0")/../.."

git push origin main
sha=$(git rev-parse main)
run=""
for _ in $(seq 30); do  # GitHub can take a while to register the run after a push
  run=$(gh run list --repo "$repo" --commit "$sha" --event push --limit 1 --json databaseId --jq '.[0].databaseId // empty')
  [[ -n "$run" ]] && break
  sleep 5
done
[[ -n "$run" ]] || { echo "No CI run for $sha after 150 s; check the Actions tab" >&2; exit 1; }
gh run watch "$run" --repo "$repo" --exit-status --interval 20
sudo -u triad /opt/triad/release.sh "$repo" "$sha"
