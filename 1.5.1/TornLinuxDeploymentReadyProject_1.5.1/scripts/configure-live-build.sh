#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION="$(tr -d '[:space:]' < "$PROJECT_ROOT/VERSION")"
IMAGE_NAME="TornLinux-${VERSION}"

cd "$PROJECT_ROOT/live-build"

lb config \
  --distribution bookworm \
  --debian-installer false \
  --archive-areas "main contrib non-free non-free-firmware" \
  --binary-images iso-hybrid \
  --bootappend-live "boot=live components quiet splash username=tornuser" \
  --image-name "$IMAGE_NAME" \
  --iso-volume "$IMAGE_NAME" \
  --hdd-label "$IMAGE_NAME"

echo "[configure] VERSION=$VERSION"
echo "[configure] IMAGE_NAME=$IMAGE_NAME"
