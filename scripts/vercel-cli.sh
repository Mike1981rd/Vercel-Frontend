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
  else
    # WSL-friendly fallback: look for Windows user token under /mnt/c/Users/*/.vercel-token
    if [ -d "/mnt/c/Users" ]; then
      # find first match to avoid globbing/exit on no match
      vercel_win_token=$(find /mnt/c/Users -maxdepth 2 -type f -name .vercel-token 2>/dev/null | head -n 1 || true)
      if [ -n "${vercel_win_token:-}" ] && [ -f "$vercel_win_token" ]; then
        # shellcheck disable=SC2046
        export $(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$vercel_win_token" | xargs)
      fi
    fi
    # Fallback: use cached Vercel auth token if present
    if [ -z "${VERCEL_TOKEN:-}" ] && [ -f "$HOME/.vercel/auth.json" ]; then
      vercel_cached_token=$(sed -n 's/.*"token"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$HOME/.vercel/auth.json" | head -n 1)
      if [ -n "${vercel_cached_token:-}" ]; then
        export VERCEL_TOKEN="$vercel_cached_token"
      fi
    fi
  fi
fi

if [ -z "${VERCEL_TOKEN:-}" ]; then
  echo "[vercel-cli] No VERCEL_TOKEN set. Relying on Git-based deploys or existing session." >&2
fi

if [ -n "${VERCEL_TOKEN:-}" ]; then
  exec npx vercel "$@" --token "$VERCEL_TOKEN"
else
  exec npx vercel "$@"
fi
