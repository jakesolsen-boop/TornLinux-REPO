#!/usr/bin/env bash
set -euo pipefail

fail() {
  echo "[firstboot-installer-audit] ERROR: $1" >&2
  exit 1
}

pass() {
  echo "[firstboot-installer-audit] OK: $1"
}

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

FIRST_USE_FILE="$PROJECT_ROOT/src/renderer/components/FirstUseLanding.tsx"
FIRST_RUN_FILE="$PROJECT_ROOT/src/renderer/components/FirstRunSetup.tsx"
INSTALLER_SCREEN_FILE="$PROJECT_ROOT/src/renderer/components/InstallerScreen.tsx"
APP_FILE="$PROJECT_ROOT/src/renderer/App.tsx"
PRELOAD_FILE="$PROJECT_ROOT/electron/preload.cjs"
MAIN_FILE="$PROJECT_ROOT/electron/main.cjs"
INSTALLER_BACKEND_FILE="$PROJECT_ROOT/live-build/config/includes.chroot/usr/local/bin/tornlinux-installer"
SETUP_HOOK_FILE="$PROJECT_ROOT/live-build/config/hooks/live/0100-tornlinux-setup.chroot"
PKG_FILE="$PROJECT_ROOT/live-build/config/package-lists/tornlinux.list.chroot"

for path in \
  "$FIRST_USE_FILE" \
  "$FIRST_RUN_FILE" \
  "$INSTALLER_SCREEN_FILE" \
  "$APP_FILE" \
  "$PRELOAD_FILE" \
  "$MAIN_FILE" \
  "$INSTALLER_BACKEND_FILE" \
  "$SETUP_HOOK_FILE" \
  "$PKG_FILE"
do
  [[ -f "$path" ]] || fail "missing required file: $path"
done

grep -q 'onOpenNetworkSettings' "$FIRST_USE_FILE" || fail "first-use landing missing network settings action"
grep -q 'onSaveApiKeys' "$FIRST_USE_FILE" || fail "first-use landing missing API key save action"
grep -q 'onContinue' "$FIRST_USE_FILE" || fail "first-use landing missing continue action"
pass "first-use landing exposes network, save, and continue actions"

grep -q 'window.tornlinux?.getConfig' "$FIRST_RUN_FILE" || fail "first-run setup does not load config"
grep -q 'window.tornlinux?.setSettings' "$FIRST_RUN_FILE" || fail "first-run setup does not save settings"
grep -q 'window.tornlinux?.saveConfig' "$FIRST_RUN_FILE" || fail "first-run setup does not save API keys"
grep -q "localStorage.setItem(SETUP_KEY, 'true')" "$FIRST_RUN_FILE" || fail "first-run setup does not persist completion"
pass "first-run setup persists settings, config, and completion state"

grep -q 'getInstallerDisks' "$INSTALLER_SCREEN_FILE" || fail "installer screen missing disk discovery"
grep -q 'previewInstallerPlan' "$INSTALLER_SCREEN_FILE" || fail "installer screen missing plan preview"
grep -q 'applyInstallerPlan' "$INSTALLER_SCREEN_FILE" || fail "installer screen missing apply action"
grep -q 'Manual Layout (Coming Soon)' "$INSTALLER_SCREEN_FILE" || fail "installer UI still advertises manual layout as active"
pass "installer screen only exposes deployed install flows"

grep -q 'getBootIntent' "$PRELOAD_FILE" || fail "preload missing boot intent bridge"
grep -q 'getInstallerDisks' "$PRELOAD_FILE" || fail "preload missing installer disk bridge"
grep -q 'previewInstallerPlan' "$PRELOAD_FILE" || fail "preload missing installer preview bridge"
grep -q 'applyInstallerPlan' "$PRELOAD_FILE" || fail "preload missing installer apply bridge"
pass "preload bridge exposes firstboot and installer endpoints"

grep -q "installer: /\\\\btornlinux_installer=1\\\\b/.test(cmdline)" "$MAIN_FILE" || fail "main process does not parse installer boot intent"
grep -q "ipcMain.handle('tornlinux:getInstallerDisks'" "$MAIN_FILE" || fail "main process missing installer disk IPC"
grep -q "ipcMain.handle('tornlinux:previewInstallerPlan'" "$MAIN_FILE" || fail "main process missing installer preview IPC"
grep -q "ipcMain.handle('tornlinux:applyInstallerPlan'" "$MAIN_FILE" || fail "main process missing installer apply IPC"
grep -q "execFile('sudo', \\[INSTALLER_SCRIPT, 'apply-plan'" "$MAIN_FILE" || fail "main process does not elevate installer apply via sudo"
pass "electron runtime wires firstboot/installer UI to backend and boot intent"

grep -q "manual mode is not implemented yet" "$INSTALLER_BACKEND_FILE" || fail "installer backend behavior changed unexpectedly for manual mode"
grep -q 'lsblk -J -b' "$INSTALLER_BACKEND_FILE" || fail "installer backend missing disk discovery"
grep -Fq 'parted -s "$disk_path" mklabel gpt' "$INSTALLER_BACKEND_FILE" || fail "installer backend missing disk partitioning"
grep -Fq 'mkfs.vfat -F32 "$boot_partition"' "$INSTALLER_BACKEND_FILE" || fail "installer backend missing EFI format step"
grep -Fq 'mkfs.ext4 -F "$root_partition"' "$INSTALLER_BACKEND_FILE" || fail "installer backend missing root format step"
grep -q 'rsync -aAX --delete' "$INSTALLER_BACKEND_FILE" || fail "installer backend missing payload copy step"
grep -q 'grub-install --target=x86_64-efi' "$INSTALLER_BACKEND_FILE" || fail "installer backend missing GRUB install step"
pass "installer backend implements automatic install path"

grep -q 'NOPASSWD: /usr/local/bin/tornlinux-installer' "$SETUP_HOOK_FILE" || fail "setup hook does not provision sudoers rule for installer"
pass "live build hook provisions installer sudo access"

for pkg in parted dosfstools e2fsprogs grub-efi-amd64-bin efibootmgr rsync sudo network-manager network-manager-gnome; do
  grep -qx "$pkg" "$PKG_FILE" || fail "missing package dependency for firstboot/installer flow: $pkg"
done
pass "package list covers firstboot and installer runtime dependencies"

grep -q "setBootStage('installer')" "$APP_FILE" || fail "app does not enter installer stage"
grep -q "setBootStage(firstRunComplete ? 'system' : 'landing')" "$APP_FILE" || fail "app does not route live mode through first-use setup"
grep -q 'onOpenNetworkSettings={openNetworkSettings}' "$APP_FILE" || fail "first-use landing is not wired to network action"
grep -q 'onSaveApiKeys={saveApiKeys}' "$APP_FILE" || fail "first-use landing is not wired to config save"
pass "app routes firstboot and installer stages correctly"

pass "firstboot/installer audit completed"
