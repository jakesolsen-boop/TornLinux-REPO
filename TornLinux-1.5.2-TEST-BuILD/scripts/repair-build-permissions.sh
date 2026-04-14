#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_USER="${SUDO_USER:-${USER:-$(id -un)}}"
TARGET_GROUP="$(id -gn "$TARGET_USER" 2>/dev/null || id -gn)"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "[perm-repair] Re-running with sudo for ownership repair."
  exec sudo "$0" "$@"
fi

cd "$PROJECT_ROOT"

echo "[perm-repair] Project root: $PROJECT_ROOT"
echo "[perm-repair] Restoring owner: ${TARGET_USER}:${TARGET_GROUP}"

repair_path() {
  local path="$1"
  [[ -e "$path" ]] || return 0
  echo "[perm-repair] chown -R ${TARGET_USER}:${TARGET_GROUP} $path"
  chown -R "${TARGET_USER}:${TARGET_GROUP}" "$path"
}

repair_path "TornLinux-linux-x64"
repair_path "dist"
repair_path "live-build/config/includes.chroot/opt/tornlinux-app"
repair_path "live-build/chroot"
repair_path "live-build/.build"
repair_path "live-build/cache"
repair_path "live-build/binary"

echo "[perm-repair] done"
