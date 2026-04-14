#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXPECTED_USER="${SUDO_USER:-${USER:-$(id -un)}}"
EXPECTED_GROUP="$(id -gn "$EXPECTED_USER" 2>/dev/null || id -gn)"

cd "$PROJECT_ROOT"

echo "[perm-audit] Project root: $PROJECT_ROOT"
echo "[perm-audit] Expected owner: ${EXPECTED_USER}:${EXPECTED_GROUP}"

check_path() {
  local path="$1"
  local count
  [[ -e "$path" ]] || return 0
  count="$(find "$path" -xdev \( ! -user "$EXPECTED_USER" -o ! -group "$EXPECTED_GROUP" \) \
    -printf '.' 2>/dev/null | wc -c || true)"
  if [[ "$count" -eq 0 ]]; then
    echo "[perm-audit] OK: $path"
    return 0
  fi
  echo "[perm-audit] BAD: $path has $count entries not owned by ${EXPECTED_USER}:${EXPECTED_GROUP}"
  find "$path" -xdev \( ! -user "$EXPECTED_USER" -o ! -group "$EXPECTED_GROUP" \) \
    -printf '%M %u:%g %p\n' 2>/dev/null | head -20 || true
}

check_path "TornLinux-linux-x64"
check_path "dist"
check_path "live-build/config/includes.chroot/opt/tornlinux-app"
check_path "live-build/chroot"
check_path "live-build/.build"
check_path "live-build/cache"
check_path "live-build/binary"

echo "[perm-audit] done"
