#!/usr/bin/env bash
set -euo pipefail

fail() {
  echo "[audit] ERROR: $1" >&2
  exit 1
}

warn() {
  echo "[audit] WARNING: $1" >&2
}

pass() {
  echo "[audit] OK: $1"
}

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
resolve_designer_overlay_root() {
  local candidate
  for candidate in \
    "${DESIGNER_OVERLAY_ROOT:-}" \
    "$PROJECT_ROOT/../designer-overlay-handoff" \
    "$PROJECT_ROOT/../../designer-overlay-handoff"
  do
    [[ -n "$candidate" && -d "$candidate" ]] || continue
    printf '%s\n' "$(cd "$candidate" && pwd)"
    return 0
  done
  return 1
}

DESIGNER_OVERLAY_ROOT="$(resolve_designer_overlay_root || true)"

[[ -f "$PROJECT_ROOT/electron/main.cjs" ]] || fail "electron/main.cjs missing"
[[ -f "$PROJECT_ROOT/electron/preload.cjs" ]] || fail "electron/preload.cjs missing"
[[ -f "$PROJECT_ROOT/src/renderer/App.tsx" ]] || fail "src/renderer/App.tsx missing"
[[ -f "$PROJECT_ROOT/src/renderer/components/FirstUseLanding.tsx" ]] || fail "src/renderer/components/FirstUseLanding.tsx missing"
[[ -f "$PROJECT_ROOT/scripts/stamp-assets.sh" ]] || fail "scripts/stamp-assets.sh missing"
[[ -f "$PROJECT_ROOT/live-build/config/includes.binary/boot/grub/grub.cfg" ]] || fail "GRUB config missing"
[[ -f "$PROJECT_ROOT/live-build/config/includes.binary/isolinux/live.cfg" ]] || fail "ISOLINUX config missing"

[[ -n "$DESIGNER_OVERLAY_ROOT" ]] || fail "designer overlay repo not found"
[[ -f "$DESIGNER_OVERLAY_ROOT/assets/master/splash_1.5.2.png" ]] || fail "designer overlay master splash missing"
[[ -f "$DESIGNER_OVERLAY_ROOT/assets/master/wallpaper_1.5.2.png" ]] || fail "designer overlay master wallpaper missing"
pass "designer overlay master art exists"

grep -qs 'designer-overlay-handoff' "$PROJECT_ROOT/scripts/stamp-assets.sh" || fail "stamp-assets.sh is not sourcing the designer overlay master assets"
grep -qs 'assets/staged' "$PROJECT_ROOT/scripts/stamp-assets.sh" || fail "stamp-assets.sh is not writing staged designer outputs"
pass "asset stamping points at master and staged artwork paths"

grep -qs '^LB_INITRAMFS="dracut-live"$' "$PROJECT_ROOT/live-build/config/common" || fail "live-build common config is not set to dracut-live"
grep -qs '^dracut-live$' "$PROJECT_ROOT/live-build/config/package-lists/live.list.chroot" || fail "dracut-live package is missing from live.list.chroot"
if grep -qs '^live-boot$' "$PROJECT_ROOT/live-build/config/package-lists/live.list.chroot"; then
  fail "live-boot is still present in live.list.chroot"
fi
pass "live-build package set is normalized to dracut"

grep -qs 'set menu_hide_ok=1' "$PROJECT_ROOT/live-build/config/includes.binary/boot/grub/grub.cfg" || fail "GRUB config is not forcing hidden menu behavior"
grep -qs 'set timeout=0' "$PROJECT_ROOT/live-build/config/includes.binary/boot/grub/grub.cfg" || fail "GRUB timeout is not zero"
grep -qs '^prompt 0$' "$PROJECT_ROOT/live-build/config/includes.binary/isolinux/live.cfg" || fail "ISOLINUX prompt is not suppressed"
grep -qs '^timeout 0$' "$PROJECT_ROOT/live-build/config/includes.binary/isolinux/live.cfg" || fail "ISOLINUX timeout is not zero"
grep -qs 'root=live:CDLABEL=' "$PROJECT_ROOT/live-build/config/includes.binary/boot/grub/grub.cfg" || fail "GRUB config is missing dracut live-root arguments"
grep -qs 'rd.live.squashimg=filesystem.squashfs' "$PROJECT_ROOT/live-build/config/includes.binary/boot/grub/grub.cfg" || fail "GRUB config is missing dracut squashfs arguments"
grep -qs 'root=live:CDLABEL=' "$PROJECT_ROOT/live-build/config/includes.binary/isolinux/live.cfg" || fail "ISOLINUX config is missing dracut live-root arguments"
grep -qs 'rd.live.squashimg=filesystem.squashfs' "$PROJECT_ROOT/live-build/config/includes.binary/isolinux/live.cfg" || fail "ISOLINUX config is missing dracut squashfs arguments"
if grep -qs ' persistence ' "$PROJECT_ROOT/live-build/config/includes.binary/boot/grub/grub.cfg" || grep -qs ' persistence ' "$PROJECT_ROOT/live-build/config/includes.binary/isolinux/live.cfg"; then
  fail "bootloader configs still force Debian persistence in the dracut validation build"
fi
pass "bootloader configs suppress visible menus"

grep -qs 'launchNetworkSettings' "$PROJECT_ROOT/electron/preload.cjs" || fail "preload bridge missing launchNetworkSettings"
grep -qs 'nm-connection-editor' "$PROJECT_ROOT/electron/main.cjs" || fail "main process missing nm-connection-editor launcher"
grep -qs 'gnome-control-center' "$PROJECT_ROOT/electron/main.cjs" || fail "main process missing gnome-control-center fallback"
grep -qs 'Opening network settings (' "$PROJECT_ROOT/src/renderer/App.tsx" || fail "renderer banner is not surfacing launcher method"
grep -qs 'Opening network settings (' "$PROJECT_ROOT/src/renderer/components/FirstUseLanding.tsx" || fail "first-use landing is not surfacing launcher method"
pass "network settings launch path is wired through bridge, backend, and renderer feedback"

grep -Fqs '/\\.validation-worktree' "$PROJECT_ROOT/package.json" || fail "package:linux is not excluding nested validation worktrees"
grep -Fqs '/TornLinux-linux-x64' "$PROJECT_ROOT/package.json" || fail "package:linux is not excluding packaged app recursion"
pass "packaging excludes recursive worktree payloads"

if [[ -d "$PROJECT_ROOT/TornLinux-linux-x64/resources/app/.validation-worktree" ]]; then
  warn "Existing packaged app still contains a nested .validation-worktree. Re-run npm run package:linux to refresh the staged payload."
else
  pass "current packaged app does not contain a nested validation worktree"
fi

if [[ -d "$PROJECT_ROOT/live-build/config/includes.chroot/opt/tornlinux-app/.validation-worktree" ]]; then
  warn "Current staged live-build payload still contains a nested .validation-worktree. Re-run prepare-live-build.sh after repackaging."
fi

pass "startup deployment audit completed"
