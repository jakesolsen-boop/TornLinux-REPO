#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  scripts/write-usb.sh --iso <path-to-iso> --device <disk-device> [--no-persistence]

Examples:
  scripts/write-usb.sh --iso live-build/TornLinux-1.5.2-amd64.hybrid.iso --device /dev/sdb
  scripts/write-usb.sh --iso live-build/TornLinux-1.5.2-amd64.hybrid.iso --device /dev/nvme1n1 --no-persistence

Notes:
  - This destroys the target device.
  - The current dracut validation path writes a bootable USB only.
  - Persistent overlays are not wired up here yet; the old Debian-style persistence.conf flow is intentionally disabled.
EOF
}

ISO_PATH=""
DEVICE=""
ENABLE_PERSISTENCE="0"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --iso)
      ISO_PATH="${2:-}"
      shift 2
      ;;
    --device)
      DEVICE="${2:-}"
      shift 2
      ;;
    --no-persistence)
      ENABLE_PERSISTENCE="0"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "[write-usb] Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

[[ -n "$ISO_PATH" ]] || { echo "[write-usb] --iso is required" >&2; exit 1; }
[[ -n "$DEVICE" ]] || { echo "[write-usb] --device is required" >&2; exit 1; }
[[ -f "$ISO_PATH" ]] || { echo "[write-usb] ISO not found: $ISO_PATH" >&2; exit 1; }
[[ -b "$DEVICE" ]] || { echo "[write-usb] Target is not a block device: $DEVICE" >&2; exit 1; }
command -v sudo >/dev/null 2>&1 || { echo "[write-usb] sudo is required" >&2; exit 1; }
command -v dd >/dev/null 2>&1 || { echo "[write-usb] dd is required" >&2; exit 1; }
command -v parted >/dev/null 2>&1 || { echo "[write-usb] parted is required" >&2; exit 1; }
command -v mkfs.ext4 >/dev/null 2>&1 || { echo "[write-usb] mkfs.ext4 is required" >&2; exit 1; }
command -v partprobe >/dev/null 2>&1 || { echo "[write-usb] partprobe is required" >&2; exit 1; }
command -v lsblk >/dev/null 2>&1 || { echo "[write-usb] lsblk is required" >&2; exit 1; }

if [[ "$(lsblk -ndo TYPE "$DEVICE" 2>/dev/null)" != "disk" ]]; then
  echo "[write-usb] Target must be a whole-disk block device: $DEVICE" >&2
  exit 1
fi

if findmnt -rn -S "$DEVICE" >/dev/null 2>&1 || lsblk -lnpo NAME,MOUNTPOINT "$DEVICE" | awk 'NF > 1 { exit 0 } END { exit 1 }'; then
  echo "[write-usb] Refusing to write a mounted device or mounted child partition: $DEVICE" >&2
  exit 1
fi

echo "[write-usb] Target device: $DEVICE"
lsblk "$DEVICE"
echo "[write-usb] WARNING: this will erase all data on $DEVICE"
read -r -p "Type WIPE to continue: " CONFIRM
[[ "$CONFIRM" == "WIPE" ]] || { echo "[write-usb] Cancelled"; exit 1; }

echo "[write-usb] Writing ISO to $DEVICE"
sudo dd if="$ISO_PATH" of="$DEVICE" bs=16M status=progress oflag=sync conv=fsync
sudo sync

if [[ "$ENABLE_PERSISTENCE" = "1" ]]; then
  echo "[write-usb] Persistence creation is disabled in the current dracut validation path." >&2
  echo "[write-usb] Re-run with --no-persistence, or update the script for dracut overlay handling first." >&2
  exit 1
fi

echo "[write-usb] ISO written without persistence partition"
