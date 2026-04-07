#!/bin/bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

APP_DIR="${1:-TornLinux-linux-x64}"
LIVE_BUILD_DIR="${2:-live-build}"
TARGET_DIR="$LIVE_BUILD_DIR/config/includes.chroot/opt/tornlinux-app"

if [ ! -d "$APP_DIR" ]; then
  echo "Missing packaged app directory: $APP_DIR" >&2
  exit 1
fi

mkdir -p "$TARGET_DIR"
rm -rf "$TARGET_DIR"/*
cp -a "$APP_DIR"/. "$TARGET_DIR"/
chmod -R 755 "$TARGET_DIR"

if [ ! -f "$TARGET_DIR/TornLinux" ]; then
  echo "ERROR: expected binary missing at $TARGET_DIR/TornLinux" >&2
  exit 1
fi

echo "Copied packaged app into $TARGET_DIR"
ls -la "$TARGET_DIR"


VERSION="$(tr -d '[:space:]' < "$PROJECT_ROOT/VERSION")"
bash ./scripts/stamp-assets.sh
mkdir -p "$PROJECT_ROOT/live-build/config/includes.chroot/opt/tornlinux-app"
echo "$VERSION" > "$PROJECT_ROOT/live-build/config/includes.chroot/opt/tornlinux-app/version"
