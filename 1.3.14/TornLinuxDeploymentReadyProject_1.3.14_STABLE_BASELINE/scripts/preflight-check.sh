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
PREFLIGHT_SUMMARY="$PROJECT_ROOT/PREFLIGHT_SUMMARY_1.3.14.txt"
: > "$PREFLIGHT_SUMMARY"
summary(){ echo "$1" | tee -a "$PREFLIGHT_SUMMARY"; }
summary "TornLinux Preflight Summary v1.3.14"
summary "Project root: $PROJECT_ROOT"

[[ -d "$PROJECT_ROOT/live-build/config" ]] || fail "live-build/config not found. Run this from the official project root."
[[ -f "$PROJECT_ROOT/package.json" ]] || fail "package.json missing from project root."
[[ -f "$PROJECT_ROOT/electron/main.cjs" ]] || fail "electron/main.cjs missing"
node -c "$PROJECT_ROOT/electron/main.cjs" >/dev/null 2>&1 || fail "electron/main.cjs syntax check failed"

# Renderer/package staging checks
[[ -f "$PROJECT_ROOT/dist/renderer/index.html" ]] || fail "Renderer build missing: dist/renderer/index.html"
[[ -d "$PROJECT_ROOT/live-build/config/includes.chroot/opt/tornlinux-app" ]] || fail "Staged app directory missing: live-build/config/includes.chroot/opt/tornlinux-app"
[[ -f "$PROJECT_ROOT/live-build/config/includes.chroot/opt/tornlinux-app/TornLinux" ]] || fail "Packaged Electron binary missing: live-build/config/includes.chroot/opt/tornlinux-app/TornLinux"

# Critical live-build config checks
required_files=(
  "live-build/config/package-lists/tornlinux.list.chroot"
  "live-build/config/package-lists/tornlinux-electron-runtime.list.chroot"
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

# Hook/tool executability
[[ -x "$PROJECT_ROOT/scripts/prepare-live-build.sh" ]] || fail "scripts/prepare-live-build.sh is not executable"
[[ -x "$PROJECT_ROOT/scripts/preflight-check.sh" ]] || fail "scripts/preflight-check.sh is not executable"
[[ -x "$PROJECT_ROOT/scripts/configure-live-build.sh" ]] || fail "scripts/configure-live-build.sh is not executable"
[[ -x "$PROJECT_ROOT/scripts/build-iso.sh" ]] || fail "scripts/build-iso.sh is not executable"

# Stable baseline corrections
grep -qs 'cp -a "\$APP_DIR"/\. "\$TARGET_DIR"/' "$PROJECT_ROOT/scripts/prepare-live-build.sh" || fail "prepare-live-build.sh is not using deterministic staged app copy"
grep -qs 'chmod -R 755 "\$TARGET_DIR"' "$PROJECT_ROOT/scripts/prepare-live-build.sh" || fail "prepare-live-build.sh is not applying staged app execute permissions"
grep -qs 'bash ./scripts/stamp-assets.sh' "$PROJECT_ROOT/scripts/prepare-live-build.sh" || fail "prepare-live-build.sh is not invoking stamp-assets via bash"
[[ -x "$PROJECT_ROOT/live-build/config/hooks/live/0100-tornlinux-setup.chroot" ]] || fail "Hook is not executable: live-build/config/hooks/live/0100-tornlinux-setup.chroot"

# Package list sanity
if grep -Rqs '^libnsswinbind$' "$PROJECT_ROOT/live-build/config/package-lists"; then
  fail "Invalid package detected in package lists: libnsswinbind"
fi

if ! grep -qs '^lightdm$' "$PROJECT_ROOT/live-build/config/package-lists/tornlinux.list.chroot"; then
  fail "lightdm missing from tornlinux.list.chroot"
fi
if ! grep -qs '^openbox$' "$PROJECT_ROOT/live-build/config/package-lists/tornlinux.list.chroot"; then
  fail "openbox missing from tornlinux.list.chroot"
fi

# Content sanity
grep -qs 'LIVE_USERNAME="tornuser"' "$PROJECT_ROOT/live-build/config/includes.chroot/etc/live/config.conf.d/tornlinux.conf" || fail "LIVE_USERNAME override missing or incorrect"
grep -qs 'autologin-user=tornuser' "$PROJECT_ROOT/live-build/config/includes.chroot/etc/lightdm/lightdm.conf.d/20-tornlinux.conf" || fail "LightDM autologin user missing or incorrect"
grep -qs 'autologin-session=openbox' "$PROJECT_ROOT/live-build/config/includes.chroot/etc/lightdm/lightdm.conf.d/20-tornlinux.conf" || fail "LightDM autologin session missing or incorrect"

grep -qs '^accountsservice$' "$PROJECT_ROOT/live-build/config/package-lists/tornlinux.list.chroot" || fail "accountsservice missing from tornlinux.list.chroot"
grep -qs 'LOG="${HOME:-/home/tornuser}/.tornlinux-session.log"' "$PROJECT_ROOT/live-build/config/includes.chroot/usr/local/bin/tornlinux-session-start" || fail "session-start log path is not user-writable"

grep -qs "shell, Menu, session" "$PROJECT_ROOT/electron/main.cjs" || fail "electron/main.cjs import line missing corrected shell/session structure"
grep -qs "package.json" "$PROJECT_ROOT/electron/main.cjs" || fail "electron/main.cjs is not sourcing APP_VERSION from package.json"

grep -qs 'LOG="${HOME:-/home/tornuser}/.tornlinux-electron.log"' "$PROJECT_ROOT/live-build/config/includes.chroot/usr/local/bin/tornlinux-electron-launch" || fail "electron-launch log path is not user-writable"
grep -qs 'mkdir -p /var/lib/lightdm/data' "$PROJECT_ROOT/live-build/config/hooks/live/0100-tornlinux-setup.chroot" || fail "hook does not create /var/lib/lightdm/data"
grep -qs 'touch /home/tornuser/.Xauthority' "$PROJECT_ROOT/live-build/config/hooks/live/0100-tornlinux-setup.chroot" || fail "hook does not create .Xauthority"

grep -qs "echo 'tornuser:tornlinux' | chpasswd" "$PROJECT_ROOT/live-build/config/hooks/live/0100-tornlinux-setup.chroot" || fail "Hook does not set tornuser password"
grep -qs 'userdel -r user' "$PROJECT_ROOT/live-build/config/hooks/live/0100-tornlinux-setup.chroot" || warn "Hook does not remove default user as a fallback safety measure"

# Build tool availability
command -v lb >/dev/null 2>&1 || fail "live-build 'lb' command not found"
command -v xorriso >/dev/null 2>&1 || fail "xorriso not found"
command -v python3 >/dev/null 2>&1 || fail "python3 not found"
python3 -c "import PIL" >/dev/null 2>&1 || fail "python3-pil (Pillow) missing"
command -v mksquashfs >/dev/null 2>&1 || fail "squashfs-tools not found"

# Version propagation integrity
CURRENT_VERSION="$(tr -d '[:space:]' < "$PROJECT_ROOT/VERSION")"
summary "Validating version propagation integrity"
grep -qs "^${CURRENT_VERSION}$" "$PROJECT_ROOT/VERSION" || fail "VERSION file unreadable"
[[ -f "$PROJECT_ROOT/live-build/config/includes.chroot/opt/tornlinux-app/version" ]] || warn "staged app version marker not present yet; run prepare-live-build.sh first"
if [[ -f "$PROJECT_ROOT/live-build/config/includes.chroot/opt/tornlinux-app/version" ]]; then
  grep -qs "^${CURRENT_VERSION}$" "$PROJECT_ROOT/live-build/config/includes.chroot/opt/tornlinux-app/version" || fail "staged app version marker does not match VERSION"
fi

# Fail on known stale version markers in staged assets/app/docs paths that must match current release
STALE_MATCHES=$(grep -RIn "1\.3\.5\|1\.3\.6\|1\.3\.7\|1\.3\.8\|1\.3\.9\|1\.3\.10"   "$PROJECT_ROOT/live-build/config/includes.chroot/usr/share/tornlinux"   "$PROJECT_ROOT/live-build/config/includes.chroot/usr/share/plymouth/themes/tornlinux"   "$PROJECT_ROOT/live-build/config/includes.chroot/opt/tornlinux-app" 2>/dev/null || true)
if [[ -n "${STALE_MATCHES}" ]]; then
  echo "$STALE_MATCHES" >&2
  fail "stale version markers detected in staged payload"
fi



# Package availability validation
summary "Validating package availability against apt"
PACKAGE_FILES=(
  "$PROJECT_ROOT/live-build/config/package-lists/tornlinux.list.chroot"
  "$PROJECT_ROOT/live-build/config/package-lists/tornlinux-electron-runtime.list.chroot"
)

for pkg_file in "${PACKAGE_FILES[@]}"; do
  while IFS= read -r pkg_name; do
    [[ -z "$pkg_name" ]] && continue
    [[ "$pkg_name" =~ ^# ]] && continue
    if ! apt-cache show "$pkg_name" >/dev/null 2>&1; then
      fail "Package not available via apt-cache: $pkg_name"
    fi
  done < "$pkg_file"
done


# Wrong-directory / stale-state warnings
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
summary "Verified Electron entrypoint syntax and version sourcing"
summary "Warnings: check terminal output for any stale-state warnings"
echo "[preflight] Verified project root"
echo "[preflight] Verified renderer build and staged app"
echo "[preflight] Verified critical live-build files"
echo "[preflight] Verified key user/session settings"
echo "[preflight] Verified build tool availability"
echo "[preflight] Verified package availability"
echo "[preflight] Verified stable baseline corrections"
echo "[preflight] Verified version propagation integrity"
echo "[preflight] Verified Python/Pillow asset stamping prerequisites"
echo "[preflight] Verified Electron entrypoint syntax and version sourcing"
echo "Preflight checks passed"
summary "Result: Preflight checks passed"
summary "Next: run post-build validation after ISO generation"
