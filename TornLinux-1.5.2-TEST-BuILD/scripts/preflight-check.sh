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
CURRENT_VERSION="$(tr -d '[:space:]' < "$PROJECT_ROOT/VERSION")"

echo "[preflight] Project root: $PROJECT_ROOT"
PREFLIGHT_SUMMARY="$PROJECT_ROOT/PREFLIGHT_SUMMARY_${CURRENT_VERSION}.txt"
: > "$PREFLIGHT_SUMMARY"
summary(){ echo "$1" | tee -a "$PREFLIGHT_SUMMARY"; }
summary "TornLinux Preflight Summary ${CURRENT_VERSION}"
summary "Project root: $PROJECT_ROOT"

[[ -d "$PROJECT_ROOT/live-build/config" ]] || fail "live-build/config not found. Run this from the official project root."
[[ -f "$PROJECT_ROOT/package.json" ]] || fail "package.json missing from project root."
[[ -f "$PROJECT_ROOT/electron/main.cjs" ]] || fail "electron/main.cjs missing"
[[ -f "$PROJECT_ROOT/electron/preload.cjs" ]] || fail "electron/preload.cjs missing"

command -v node >/dev/null 2>&1 || fail "node not found"
command -v lb >/dev/null 2>&1 || fail "live-build 'lb' command not found"
command -v xorriso >/dev/null 2>&1 || fail "xorriso not found"
command -v python3 >/dev/null 2>&1 || fail "python3 not found"
python3 -c "import PIL" >/dev/null 2>&1 || fail "python3-pil (Pillow) missing"
command -v mksquashfs >/dev/null 2>&1 || fail "squashfs-tools not found"

node -c "$PROJECT_ROOT/electron/main.cjs" >/dev/null 2>&1 || fail "electron/main.cjs syntax check failed"
node -c "$PROJECT_ROOT/electron/preload.cjs" >/dev/null 2>&1 || fail "electron/preload.cjs syntax check failed"

[[ -f "$PROJECT_ROOT/dist/renderer/index.html" ]] || fail "Renderer build missing: dist/renderer/index.html"
[[ -d "$PROJECT_ROOT/live-build/config/includes.chroot/opt/tornlinux-app" ]] || fail "Staged app directory missing: live-build/config/includes.chroot/opt/tornlinux-app"
[[ -f "$PROJECT_ROOT/live-build/config/includes.chroot/opt/tornlinux-app/TornLinux" ]] || fail "Packaged Electron binary missing: live-build/config/includes.chroot/opt/tornlinux-app/TornLinux"

required_files=(
  "live-build/config/package-lists/tornlinux.list.chroot"
  "live-build/config/package-lists/tornlinux-electron-runtime.list.chroot"
  "live-build/config/includes.binary/boot/grub/grub.cfg"
  "live-build/config/includes.binary/isolinux/live.cfg"
  "live-build/config/includes.chroot/etc/live/config.conf.d/tornlinux.conf"
  "live-build/config/includes.chroot/etc/lightdm/lightdm.conf.d/20-tornlinux.conf"
  "live-build/config/hooks/live/0100-tornlinux-setup.chroot"
  "live-build/config/includes.chroot/usr/share/tornlinux/splash.png"
  "live-build/config/includes.chroot/usr/share/tornlinux/wallpaper.png"
  "live-build/config/includes.chroot/usr/share/plymouth/themes/tornlinux/background.png"
)
for rel in "${required_files[@]}"; do
  [[ -f "$PROJECT_ROOT/$rel" ]] || fail "Required build file missing: $rel"
done

[[ -x "$PROJECT_ROOT/scripts/prepare-live-build.sh" ]] || fail "scripts/prepare-live-build.sh is not executable"
[[ -x "$PROJECT_ROOT/scripts/preflight-check.sh" ]] || fail "scripts/preflight-check.sh is not executable"
[[ -x "$PROJECT_ROOT/scripts/configure-live-build.sh" ]] || fail "scripts/configure-live-build.sh is not executable"
[[ -x "$PROJECT_ROOT/scripts/build-iso.sh" ]] || fail "scripts/build-iso.sh is not executable"
[[ -x "$PROJECT_ROOT/scripts/write-usb.sh" ]] || fail "scripts/write-usb.sh is not executable"

BRAND_SOURCE="$PROJECT_ROOT/assets/brand/tornlinux_logo_circle.png"
[[ -f "$BRAND_SOURCE" ]] || fail "Brand logo missing for generated build assets: assets/brand/tornlinux_logo_circle.png"
summary "Using generated build assets from brand source: $BRAND_SOURCE"

grep -qs 'cp -a "\$APP_DIR"/\. "\$TARGET_DIR"/' "$PROJECT_ROOT/scripts/prepare-live-build.sh" || fail "prepare-live-build.sh is not using deterministic staged app copy"
grep -qs 'chmod -R 755 "\$TARGET_DIR"' "$PROJECT_ROOT/scripts/prepare-live-build.sh" || fail "prepare-live-build.sh is not applying staged app execute permissions"
grep -qs 'bash ./scripts/stamp-assets.sh' "$PROJECT_ROOT/scripts/prepare-live-build.sh" || fail "prepare-live-build.sh is not invoking stamp-assets via bash"
[[ -x "$PROJECT_ROOT/live-build/config/hooks/live/0100-tornlinux-setup.chroot" ]] || fail "Hook is not executable: live-build/config/hooks/live/0100-tornlinux-setup.chroot"

grep -qs "launchNetworkSettings" "$PROJECT_ROOT/electron/preload.cjs" || fail "preload missing launchNetworkSettings"
grep -qs "getNetworkStatus" "$PROJECT_ROOT/electron/preload.cjs" || fail "preload missing getNetworkStatus"
grep -qs "launchBluetoothSettings" "$PROJECT_ROOT/electron/preload.cjs" || fail "preload missing launchBluetoothSettings"
grep -qs "getInstallerDisks" "$PROJECT_ROOT/electron/preload.cjs" || fail "preload missing getInstallerDisks"
grep -qs "previewInstallerPlan" "$PROJECT_ROOT/electron/preload.cjs" || fail "preload missing previewInstallerPlan"
grep -qs "getSystemVolume" "$PROJECT_ROOT/electron/preload.cjs" || fail "preload missing getSystemVolume"
grep -qs "setSystemVolume" "$PROJECT_ROOT/electron/preload.cjs" || fail "preload missing setSystemVolume"

if grep -Rqs '^libnsswinbind$' "$PROJECT_ROOT/live-build/config/package-lists"; then
  fail "Invalid package detected in package lists: libnsswinbind"
fi

grep -qs '^lightdm$' "$PROJECT_ROOT/live-build/config/package-lists/tornlinux.list.chroot" || fail "lightdm missing from tornlinux.list.chroot"
grep -qs '^openbox$' "$PROJECT_ROOT/live-build/config/package-lists/tornlinux.list.chroot" || fail "openbox missing from tornlinux.list.chroot"
grep -qs '^accountsservice$' "$PROJECT_ROOT/live-build/config/package-lists/tornlinux.list.chroot" || fail "accountsservice missing from tornlinux.list.chroot"
grep -qs '^blueman$' "$PROJECT_ROOT/live-build/config/package-lists/tornlinux.list.chroot" || fail "blueman missing from tornlinux.list.chroot"
grep -qs '^alsa-utils$' "$PROJECT_ROOT/live-build/config/package-lists/tornlinux.list.chroot" || fail "alsa-utils missing from tornlinux.list.chroot"
grep -qs '^bluez$' "$PROJECT_ROOT/live-build/config/package-lists/tornlinux.list.chroot" || fail "bluez missing from tornlinux.list.chroot"
grep -qs '^pipewire$' "$PROJECT_ROOT/live-build/config/package-lists/tornlinux.list.chroot" || fail "pipewire missing from tornlinux.list.chroot"
grep -qs '^pipewire-pulse$' "$PROJECT_ROOT/live-build/config/package-lists/tornlinux.list.chroot" || fail "pipewire-pulse missing from tornlinux.list.chroot"
grep -qs '^wireplumber$' "$PROJECT_ROOT/live-build/config/package-lists/tornlinux.list.chroot" || fail "wireplumber missing from tornlinux.list.chroot"
grep -qs 'LIVE_USERNAME="tornuser"' "$PROJECT_ROOT/live-build/config/includes.chroot/etc/live/config.conf.d/tornlinux.conf" || fail "LIVE_USERNAME override missing or incorrect"
grep -qs 'autologin-user=tornuser' "$PROJECT_ROOT/live-build/config/includes.chroot/etc/lightdm/lightdm.conf.d/20-tornlinux.conf" || fail "LightDM autologin user missing or incorrect"
grep -qs 'autologin-session=openbox' "$PROJECT_ROOT/live-build/config/includes.chroot/etc/lightdm/lightdm.conf.d/20-tornlinux.conf" || fail "LightDM autologin session missing or incorrect"
grep -qs 'LOG="${HOME:-/home/tornuser}/.tornlinux-session.log"' "$PROJECT_ROOT/live-build/config/includes.chroot/usr/local/bin/tornlinux-session-start" || fail "session-start log path is not user-writable"
grep -qs 'LOG="${HOME:-/home/tornuser}/.tornlinux-electron.log"' "$PROJECT_ROOT/live-build/config/includes.chroot/usr/local/bin/tornlinux-electron-launch" || fail "electron-launch log path is not user-writable"
grep -qs 'mkdir -p /var/lib/lightdm/data' "$PROJECT_ROOT/live-build/config/hooks/live/0100-tornlinux-setup.chroot" || fail "hook does not create /var/lib/lightdm/data"
grep -qs 'touch /home/tornuser/.Xauthority' "$PROJECT_ROOT/live-build/config/hooks/live/0100-tornlinux-setup.chroot" || fail "hook does not create .Xauthority"
grep -qs "echo 'tornuser:tornlinux' | chpasswd" "$PROJECT_ROOT/live-build/config/hooks/live/0100-tornlinux-setup.chroot" || fail "Hook does not set tornuser password"

summary "Validating version propagation integrity"
grep -qs "^${CURRENT_VERSION}$" "$PROJECT_ROOT/VERSION" || fail "VERSION file unreadable"
[[ -f "$PROJECT_ROOT/live-build/config/includes.chroot/opt/tornlinux-app/version" ]] || warn "staged app version marker not present yet; run prepare-live-build.sh first"
if [[ -f "$PROJECT_ROOT/live-build/config/includes.chroot/opt/tornlinux-app/version" ]]; then
  grep -qs "^${CURRENT_VERSION}$" "$PROJECT_ROOT/live-build/config/includes.chroot/opt/tornlinux-app/version" || fail "staged app version marker does not match VERSION"
fi

STALE_MATCHES=$(grep -RIn "1\.3\.5\|1\.3\.6\|1\.3\.7\|1\.3\.8\|1\.3\.9\|1\.3\.10" "$PROJECT_ROOT/live-build/config/includes.chroot/usr/share/tornlinux" "$PROJECT_ROOT/live-build/config/includes.chroot/usr/share/plymouth/themes/tornlinux" "$PROJECT_ROOT/live-build/config/includes.chroot/opt/tornlinux-app" 2>/dev/null || true)
if [[ -n "${STALE_MATCHES}" ]]; then
  echo "$STALE_MATCHES" >&2
  fail "stale version markers detected in staged payload"
fi

PACKAGE_FILES=(
  "$PROJECT_ROOT/live-build/config/package-lists/tornlinux.list.chroot"
  "$PROJECT_ROOT/live-build/config/package-lists/tornlinux-electron-runtime.list.chroot"
)
summary "Validating package availability against apt"
for pkg_file in "${PACKAGE_FILES[@]}"; do
  while IFS= read -r pkg_name; do
    [[ -z "$pkg_name" ]] && continue
    [[ "$pkg_name" =~ ^# ]] && continue
    if ! apt-cache show "$pkg_name" >/dev/null 2>&1; then
      fail "Package not available via apt-cache: $pkg_name"
    fi
  done < "$pkg_file"
done

if [[ -d "$PROJECT_ROOT/chroot" || -d "$PROJECT_ROOT/binary" || -d "$PROJECT_ROOT/cache" ]]; then
  warn "Stale live-build artifacts detected in project root. These are ignored by scripts, but should be removed."
fi
if [[ -d "$PROJECT_ROOT/live-build/chroot" || -d "$PROJECT_ROOT/live-build/binary" || -d "$PROJECT_ROOT/live-build/cache" ]]; then
  warn "Stale live-build artifacts detected in live-build/. Run a hard clean before building."
fi

summary "Verified project root"
summary "Verified renderer build and staged app"
summary "Verified critical live-build files"
summary "Verified key user/session settings"
summary "Verified build tool availability"
summary "Verified package availability"
summary "Verified stable baseline corrections"
summary "Verified version propagation integrity"
summary "Verified Python/Pillow asset stamping prerequisites"
summary "Verified Electron entrypoint syntax and bridge methods"
summary "Verified master asset sources"
summary "Warnings: check terminal output for any stale-state warnings"
echo "Preflight checks passed"
summary "Result: Preflight checks passed"
summary "Next: run post-build validation after ISO generation"
