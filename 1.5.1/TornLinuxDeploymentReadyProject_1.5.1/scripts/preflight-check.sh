#!/usr/bin/env bash
set -euo pipefail

fail() {
  echo "[preflight] ERROR: $1" >&2
  exit 1
}

warn() {
  echo "[preflight] WARNING: $1" >&2
}

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "[preflight] Project root: $PROJECT_ROOT"
PREFLIGHT_SUMMARY="$PROJECT_ROOT/PREFLIGHT_SUMMARY_1.4.0.txt"
: > "$PREFLIGHT_SUMMARY"
summary(){ echo "$1" | tee -a "$PREFLIGHT_SUMMARY"; }
summary "TornLinux Preflight Summary v1.4.0"
summary "Project root: $PROJECT_ROOT"

[[ -d "$PROJECT_ROOT/live-build/config" ]] || fail "live-build/config not found"
[[ -f "$PROJECT_ROOT/package.json" ]] || fail "package.json missing"
[[ -f "$PROJECT_ROOT/electron/main.cjs" ]] || fail "electron/main.cjs missing"
[[ -f "$PROJECT_ROOT/electron/preload.cjs" ]] || fail "electron/preload.cjs missing"

command -v node >/dev/null 2>&1 || fail "node not found"
command -v lb >/dev/null 2>&1 || fail "live-build 'lb' command not found"
command -v xorriso >/dev/null 2>&1 || fail "xorriso not found"
command -v mksquashfs >/dev/null 2>&1 || fail "squashfs-tools not found"
command -v python3 >/dev/null 2>&1 || fail "python3 not found"
python3 -c "import PIL" >/dev/null 2>&1 || fail "python3-pil (Pillow) missing"

node -c "$PROJECT_ROOT/electron/main.cjs" >/dev/null 2>&1 || fail "electron/main.cjs syntax check failed"
node -c "$PROJECT_ROOT/electron/preload.cjs" >/dev/null 2>&1 || fail "electron/preload.cjs syntax check failed"

grep -qs "launchNetworkSettings" "$PROJECT_ROOT/electron/preload.cjs" || fail "preload missing launchNetworkSettings"
grep -qs "getNetworkStatus" "$PROJECT_ROOT/electron/preload.cjs" || fail "preload missing getNetworkStatus"
grep -qs "launchBluetoothSettings" "$PROJECT_ROOT/electron/preload.cjs" || fail "preload missing launchBluetoothSettings"
grep -qs 'chmod -R 755 "$TARGET_DIR"' "$PROJECT_ROOT/scripts/prepare-live-build.sh" || fail "prepare-live-build missing runtime chmod"
grep -qs "/dev/ttyS0" "$PROJECT_ROOT/live-build/config/includes.chroot/usr/local/bin/tornlinux-session-start" || fail "session-start missing serial debug logging"
grep -qs "/dev/ttyS0" "$PROJECT_ROOT/live-build/config/includes.chroot/usr/local/bin/tornlinux-electron-launch" || fail "electron-launch missing serial debug logging"

[[ -f "$PROJECT_ROOT/assets/master/splash.png" ]] || fail "master splash missing"
[[ -f "$PROJECT_ROOT/assets/master/wallpaper.png" ]] || fail "master wallpaper missing"

STALE_MATCHES=$(grep -RIn "1\.3\.5\|1\.3\.6\|1\.3\.7\|1\.3\.8\|1\.3\.9\|1\.3\.10\|1\.3\.11\|1\.3\.12\|1\.3\.13\|1\.3\.14\|1\.3\.15\|1\.3\.16\|1\.3\.17"   "$PROJECT_ROOT/live-build/config/includes.chroot/usr/share/tornlinux"   "$PROJECT_ROOT/live-build/config/includes.chroot/usr/share/plymouth/themes/tornlinux" 2>/dev/null || true)
if [[ -n "${STALE_MATCHES}" ]]; then
  echo "$STALE_MATCHES" >&2
  fail "stale version markers detected in staged branded assets"
fi

summary "Verified project structure"
summary "Verified Electron entrypoints"
summary "Verified preload bridge methods"
summary "Verified build tool availability"
summary "Verified Python/Pillow asset stamping prerequisites"
summary "Verified runtime chmod in prepare-live-build"
summary "Verified serial debug logging path"
summary "Verified master asset sources"
echo "Preflight checks passed"
summary "Result: Preflight checks passed"
