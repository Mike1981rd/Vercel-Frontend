#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Load token from env file if not present
if [ -z "${VERCEL_TOKEN:-}" ]; then
  if [ -f "$ROOT_DIR/.secure/vercel.env" ]; then
    # shellcheck disable=SC2046
    export $(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$ROOT_DIR/.secure/vercel.env" | xargs)
  elif [ -f "$HOME/.vercel-token" ]; then
    # shellcheck disable=SC2046
    export $(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$HOME/.vercel-token" | xargs)
  fi
fi

if [ -z "${VERCEL_TOKEN:-}" ]; then
  echo "[vercel-cli] No VERCEL_TOKEN set. Relying on Git-based deploys or existing session." >&2
fi

exec npx vercel "$@"

