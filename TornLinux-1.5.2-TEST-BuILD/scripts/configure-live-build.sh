#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION="$(tr -d '[:space:]' < "$PROJECT_ROOT/VERSION")"
IMAGE_NAME="TornLinux-${VERSION}"

cd "$PROJECT_ROOT/live-build"

BOOT_APPEND="boot=live components quiet splash rd.live.image root=live:CDLABEL=${IMAGE_NAME} rd.live.dir=live rd.live.squashimg=filesystem.squashfs username=tornuser"

lb config \
  --distribution bookworm \
  --debian-installer none \
  --archive-areas "main contrib non-free non-free-firmware" \
  --mirror-bootstrap "http://deb.debian.org/debian/" \
  --mirror-chroot "http://deb.debian.org/debian/" \
  --mirror-chroot-security "http://security.debian.org/debian-security/" \
  --mirror-binary "http://deb.debian.org/debian/" \
  --mirror-binary-security "http://security.debian.org/debian-security/" \
  --binary-images iso-hybrid \
  --initramfs dracut-live \
  --bootloaders "grub-pc grub-efi" \
  --bootappend-live "$BOOT_APPEND" \
  --checksums md5 \
  --image-name "$IMAGE_NAME" \
  --iso-volume "$IMAGE_NAME" \
  --hdd-label "$IMAGE_NAME"

echo "[configure] VERSION=$VERSION"
echo "[configure] IMAGE_NAME=$IMAGE_NAME"
