#!/usr/bin/env bash
set -euo pipefail

fail() {
  echo "[postbuild] ERROR: $1" >&2
  exit 1
}

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LIVE_BUILD_DIR="$PROJECT_ROOT/live-build"
REPORT="$PROJECT_ROOT/POST_BUILD_VALIDATION_1.3.14.txt"
: > "$REPORT"

log() {
  echo "$1" | tee -a "$REPORT"
}

cd "$LIVE_BUILD_DIR"

log "TornLinux Post-Build Validation v1.3.14"
log "Live-build root: $LIVE_BUILD_DIR"

ISO_COUNT=$(find . -maxdepth 1 -type f -name '*.iso' | wc -l | tr -d ' ')
[[ "$ISO_COUNT" -ge 1 ]] || fail "No ISO found in live-build/"
ISO_FILE=$(find . -maxdepth 1 -type f -name '*.iso' | head -n 1)

[[ -s "$ISO_FILE" ]] || fail "ISO exists but is empty: $ISO_FILE"

log "ISO found: $ISO_FILE"
ls -lh "$ISO_FILE" | tee -a "$REPORT"
stat "$ISO_FILE" | tee -a "$REPORT"

if command -v xorriso >/dev/null 2>&1; then
  log "Inspecting ISO contents with xorriso"
  xorriso -indev "$ISO_FILE" -find / -maxdepth 3 -type f 2>/dev/null | grep -E 'live|vmlinuz|initrd|filesystem.squashfs|boot' | tee -a "$REPORT" || true
else
  log "xorriso unavailable for ISO content inspection"
fi

SQUASHFS=$(find binary -type f -name 'filesystem.squashfs' 2>/dev/null | head -n 1 || true)
if [[ -n "${SQUASHFS:-}" && -f "$SQUASHFS" ]]; then
  log "filesystem.squashfs found: $SQUASHFS"
  if command -v unsquashfs >/dev/null 2>&1; then
    log "Checking for expected TornLinux payload markers in squashfs"
    unsquashfs -ll "$SQUASHFS" 2>/dev/null | grep -E 'opt/tornlinux-app|usr/share/tornlinux/splash.png|usr/share/tornlinux/wallpaper.png|etc/lightdm|etc/live/config.conf.d/tornlinux.conf' | tee -a "$REPORT" || true
  fi
else
  log "filesystem.squashfs not found in live-build output tree"
fi

if [[ -f "$PROJECT_ROOT/live-build/config/includes.chroot/opt/tornlinux-app/version" ]]; then
  log "Staged app version marker:"
  cat "$PROJECT_ROOT/live-build/config/includes.chroot/opt/tornlinux-app/version" | tee -a "$REPORT"
fi
log "Validation result: ISO exists and basic output inspection completed"
log "Manual next step: flash ISO and test first boot behavior"
