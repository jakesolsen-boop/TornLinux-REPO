#!/usr/bin/env bash
set -euo pipefail

fail() {
  echo "[header-audit] ERROR: $1" >&2
  exit 1
}

pass() {
  echo "[header-audit] OK: $1"
}

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PKG_FILE="$PROJECT_ROOT/live-build/config/package-lists/tornlinux.list.chroot"
RUNTIME_PKG_FILE="$PROJECT_ROOT/live-build/config/package-lists/tornlinux-electron-runtime.list.chroot"
HEADER_FILE="$PROJECT_ROOT/src/renderer/components/TornLinuxHeader.tsx"
SETTINGS_FILE="$PROJECT_ROOT/src/renderer/components/SettingsDrawer.tsx"
APP_FILE="$PROJECT_ROOT/src/renderer/App.tsx"
MAIN_FILE="$PROJECT_ROOT/electron/main.cjs"
PRELOAD_FILE="$PROJECT_ROOT/electron/preload.cjs"
AUTOSTART_FILE="$PROJECT_ROOT/live-build/config/includes.chroot/home/tornuser/.config/openbox/autostart"
HOOK_FILE="$PROJECT_ROOT/live-build/config/hooks/live/0100-tornlinux-setup.chroot"
SESSION_START="$PROJECT_ROOT/live-build/config/includes.chroot/usr/local/bin/tornlinux-session-start"
ELECTRON_LAUNCH="$PROJECT_ROOT/live-build/config/includes.chroot/usr/local/bin/tornlinux-electron-launch"
SCREENSHOT_HELPER="$PROJECT_ROOT/live-build/config/includes.chroot/usr/local/bin/tornlinux-save-screenshot"
DEBUG_HELPER="$PROJECT_ROOT/live-build/config/includes.chroot/usr/local/bin/tornlinux-debug-snapshot"
XBINDKEYS_FILE="$PROJECT_ROOT/live-build/config/includes.chroot/home/tornuser/.xbindkeysrc"

[[ -f "$PKG_FILE" ]] || fail "missing $PKG_FILE"
[[ -f "$RUNTIME_PKG_FILE" ]] || fail "missing $RUNTIME_PKG_FILE"
[[ -f "$HEADER_FILE" ]] || fail "missing header component"
[[ -f "$SETTINGS_FILE" ]] || fail "missing settings drawer"
[[ -f "$APP_FILE" ]] || fail "missing renderer app"
[[ -f "$MAIN_FILE" ]] || fail "missing electron main process"
[[ -f "$PRELOAD_FILE" ]] || fail "missing preload bridge"
[[ -f "$AUTOSTART_FILE" ]] || fail "missing openbox autostart"
[[ -f "$HOOK_FILE" ]] || fail "missing setup hook"
[[ -f "$SESSION_START" ]] || fail "missing session start wrapper"
[[ -f "$ELECTRON_LAUNCH" ]] || fail "missing electron launch wrapper"
[[ -f "$SCREENSHOT_HELPER" ]] || fail "missing screenshot helper"
[[ -f "$DEBUG_HELPER" ]] || fail "missing debug snapshot helper"
[[ -f "$XBINDKEYS_FILE" ]] || fail "missing xbindkeys hotkey config"

grep -q 'onOpenNetworkSettings' "$HEADER_FILE" || fail "header network action is not wired"
grep -q 'onOpenSettings' "$HEADER_FILE" || fail "header settings action is not wired"
grep -q 'onToggleTornStats' "$HEADER_FILE" || fail "header TornStats action is not wired"
pass "header buttons are wired in renderer"

grep -q 'launchNetworkSettings' "$PRELOAD_FILE" || fail "preload missing network launcher"
grep -q 'toggleTornStats' "$PRELOAD_FILE" || fail "preload missing TornStats toggle"
grep -q 'getDisplayState' "$PRELOAD_FILE" || fail "preload missing display state"
grep -q 'setDisplayMode' "$PRELOAD_FILE" || fail "preload missing display mode setter"
grep -q 'getSystemVolume' "$PRELOAD_FILE" || fail "preload missing volume getter"
grep -q 'setSystemVolume' "$PRELOAD_FILE" || fail "preload missing volume setter"
grep -q 'powerAction' "$PRELOAD_FILE" || fail "preload missing power actions"
grep -q 'launchBluetoothSettings' "$PRELOAD_FILE" || fail "preload missing bluetooth launcher"
pass "bridge exposes header and settings actions"

grep -q 'nm-connection-editor' "$MAIN_FILE" || fail "electron main missing network settings launcher"
grep -q 'pavucontrol' "$MAIN_FILE" || fail "electron main missing sound settings launcher"
grep -q 'blueman-manager' "$MAIN_FILE" || fail "electron main missing bluetooth settings launcher"
grep -q "execFile('xrandr'" "$MAIN_FILE" || fail "electron main missing display control"
grep -q "execFile('amixer'" "$MAIN_FILE" || fail "electron main missing volume control"
grep -q "systemctl', args: \\['reboot'\\]" "$MAIN_FILE" || fail "electron main missing reboot action"
grep -q "systemctl', args: \\['poweroff'\\]" "$MAIN_FILE" || fail "electron main missing poweroff action"
pass "electron main implements OS action handlers"

for pkg in \
  feh \
  openbox \
  lightdm \
  network-manager \
  network-manager-gnome \
  pavucontrol \
  blueman \
  policykit-1-gnome \
  alsa-utils \
  xbindkeys \
  scrot \
  libnotify-bin \
  x11-xserver-utils \
  xfce4-power-manager
do
  grep -qx "$pkg" "$PKG_FILE" || fail "missing package dependency: $pkg"
done
pass "package list covers header and shell actions"

grep -q 'polkit-gnome-authentication-agent-1' "$AUTOSTART_FILE" || fail "Openbox autostart missing polkit agent"
grep -q 'tornlinux-session-start' "$AUTOSTART_FILE" || fail "Openbox autostart missing TornLinux session wrapper"
grep -q 'polkit-gnome-authentication-agent-1' "$HOOK_FILE" || fail "setup hook does not provision polkit startup"
grep -q 'xfce4-power-manager' "$AUTOSTART_FILE" || fail "Openbox autostart missing power manager"
grep -q 'xbindkeys' "$AUTOSTART_FILE" || fail "Openbox autostart missing xbindkeys"
grep -q 'NOPASSWD: /usr/local/bin/tornlinux-debug-snapshot' "$HOOK_FILE" || fail "setup hook does not provision sudoers rule for debug snapshots"
pass "startup session provisions auth and power helpers"

grep -q 'feh --bg-fill /usr/share/tornlinux/wallpaper.png' "$SESSION_START" || fail "session start missing wallpaper apply"
grep -q '/usr/local/bin/tornlinux-electron-launch' "$SESSION_START" || fail "session start missing electron launch"
grep -q 'LOG_DIR="${BASE_DIR}/Logs"' "$SESSION_START" || fail "session start log directory is not persisted under ~/TornLinux/Logs"
grep -q 'tornlinux-debug-snapshot boot' "$SESSION_START" || fail "session start does not capture boot debug snapshots"
grep -q 'LOG="${BASE_DIR}/Logs/electron.log"' "$ELECTRON_LAUNCH" || fail "electron launch log is not persisted under ~/TornLinux/Logs"
grep -q 'scrot' "$SCREENSHOT_HELPER" || fail "screenshot helper is not using scrot"
grep -q 'journalctl -b --no-pager' "$DEBUG_HELPER" || fail "debug snapshot helper does not capture boot journal"
grep -q 'Print' "$XBINDKEYS_FILE" || fail "xbindkeys config is missing the Print hotkey"
pass "session wrapper persists logs and wires screenshot/debug helpers"

grep -q 'onOpenNetworkSettings={openNetworkSettings}' "$APP_FILE" || fail "App does not pass network handler to header/settings surfaces"
grep -q 'onOpenSettings={() => setSettingsOpen(true)}' "$APP_FILE" || fail "App does not open settings drawer from header"
grep -q 'onToggleTornStats={toggleTornStats}' "$APP_FILE" || fail "App does not pass TornStats toggle to header"
pass "App connects header to runtime handlers"

pass "header/runtime audit completed"
