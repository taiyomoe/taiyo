#!/usr/bin/env bash
# Used by Coolify as the build/start command, since it no longer allows `$(...)` in those fields.
# Usage: bash scripts/infisical-run.sh <build|start>
set -euo pipefail

INFISICAL_TOKEN=$(infisical login --method=universal-auth --silent --plain)
export INFISICAL_TOKEN

exec infisical run --projectId="$INFISICAL_PROJECT_ID" --env="$INFISICAL_ENV" -- pnpm -F @taiyomoe/web run "$1"
