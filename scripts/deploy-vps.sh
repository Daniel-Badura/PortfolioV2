#!/usr/bin/env bash
set -Eeuo pipefail
[[ ${GITHUB_REPOSITORY:-} == Daniel-Badura/PortfolioV2 && ${GITHUB_REF:-} == refs/heads/main ]] || exit 1
[[ ${GITHUB_EVENT_NAME:-} == push || ${GITHUB_EVENT_NAME:-} == workflow_dispatch ]] || exit 1
[[ ${GITHUB_SHA:-} =~ ^[a-f0-9]{40}$ ]] || exit 1
[[ ${PORTFOLIO_DEPLOY_HOST:-} == 178.104.2.136 && ${PORTFOLIO_DEPLOY_USER:-} == portfolio-deploy ]] || exit 1
test -n "${PORTFOLIO_DEPLOY_KEY:-}"
test -n "${PORTFOLIO_SSH_KNOWN_HOSTS:-}"
latest=$(gh api repos/Daniel-Badura/PortfolioV2/git/ref/heads/main --jq .object.sha)
if [[ "$latest" != "$GITHUB_SHA" ]]; then
  echo 'Skipping a superseded main commit'
  exit 0
fi
ssh_dir=$(mktemp -d "$RUNNER_TEMP/portfolio-ssh.XXXXXX")
archive="$RUNNER_TEMP/portfolio-$GITHUB_SHA.tar.gz"
trap 'rm -f "$ssh_dir/key" "$ssh_dir/known_hosts" "$archive"; rmdir "$ssh_dir"' EXIT
printf '%s\n' "$PORTFOLIO_DEPLOY_KEY" > "$ssh_dir/key"
printf '%s\n' "$PORTFOLIO_SSH_KNOWN_HOSTS" > "$ssh_dir/known_hosts"
chmod 600 "$ssh_dir/"*
unset PORTFOLIO_DEPLOY_KEY
ssh_args=(-i "$ssh_dir/key" -o BatchMode=yes -o StrictHostKeyChecking=yes -o UserKnownHostsFile="$ssh_dir/known_hosts" -o ConnectTimeout=15 -o ServerAliveInterval=15 -o ServerAliveCountMax=4)
target="$PORTFOLIO_DEPLOY_USER@$PORTFOLIO_DEPLOY_HOST"
ssh "${ssh_args[@]}" "$target" status
docker build --platform linux/amd64 --provenance=false \
  --build-arg SITE_URL=https://www.daniel-badura.com \
  --build-arg SOURCE_COMMIT="$GITHUB_SHA" -t "portfolio:$GITHUB_SHA" .
docker save "portfolio:$GITHUB_SHA" | gzip -1 > "$archive"
[[ $(stat -c %s "$archive") -le 268435456 ]] || { echo 'Image archive exceeds 256 MiB'; exit 1; }
ssh "${ssh_args[@]}" "$target" "deploy $GITHUB_SHA" < "$archive"
ssh "${ssh_args[@]}" "$target" status
if [[ ${PORTFOLIO_PUBLIC_CHECK_ENABLED:-false} == true ]]; then
  node scripts/probe-production.mjs
fi
