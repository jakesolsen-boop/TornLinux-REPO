#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION="$(tr -d '[:space:]' < "$PROJECT_ROOT/VERSION")"
IMAGE_NAME="TornLinux-${VERSION}"
ROOT_HELPER="/usr/local/bin/tornlinux-validation-lb-build"

cd "$PROJECT_ROOT/live-build"

if [[ -x "$ROOT_HELPER" ]]; then
  "$ROOT_HELPER"
else
  sudo lb build
fi

echo "[build] Expected ISO name stem: $IMAGE_NAME"
