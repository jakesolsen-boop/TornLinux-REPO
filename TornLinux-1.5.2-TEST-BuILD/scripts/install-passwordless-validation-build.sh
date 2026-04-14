#!/usr/bin/env bash
set -euo pipefail

HELPER_PATH="/usr/local/bin/tornlinux-validation-lb-build"
SUDOERS_PATH="/etc/sudoers.d/tornlinux-validation-lb-build"
LIVE_BUILD_DIR="/home/jakesolsen/Documents/TornLinux-Project/TornLinux-REPO-Workspace/TornLinux-1.5.2-TEST-BuILD/.validation-worktree/live-build"
TEMP_HELPER="$(mktemp /var/tmp/tornlinux-validation-lb-build.XXXXXX)"

cleanup() {
  rm -f "${TEMP_HELPER}"
}

trap cleanup EXIT

cat > "${TEMP_HELPER}" <<EOF
#!/usr/bin/env bash
set -euo pipefail
cd ${LIVE_BUILD_DIR}
exec /usr/bin/lb build
EOF

install -o root -g root -m 0755 "${TEMP_HELPER}" "${HELPER_PATH}"

cat > "${SUDOERS_PATH}" <<EOF
jakesolsen ALL=(root) NOPASSWD: ${HELPER_PATH}
EOF

chmod 0440 "${SUDOERS_PATH}"

if command -v visudo >/dev/null 2>&1; then
  visudo -cf "${SUDOERS_PATH}"
else
  echo "[warn] visudo not found; sudoers file written but not syntax-checked."
fi

echo "[ok] Installed ${HELPER_PATH}"
echo "[ok] Installed ${SUDOERS_PATH}"
echo "[next] Validation build script will now use the helper automatically."
