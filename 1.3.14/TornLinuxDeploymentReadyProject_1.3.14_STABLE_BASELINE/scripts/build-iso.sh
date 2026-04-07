#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION="$(tr -d '[:space:]' < "$PROJECT_ROOT/VERSION")"
IMAGE_NAME="TornLinux-${VERSION}"

cd "$PROJECT_ROOT/live-build"
sudo lb build

echo "[build] Expected ISO name stem: $IMAGE_NAME"
