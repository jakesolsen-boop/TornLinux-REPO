#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  scripts/write-usb.sh --iso <path-to-iso> --device <disk-device> [--persistence-size <GiB>] [--no-persistence]

Examples:
  scripts/write-usb.sh --iso live-build/TornLinux-1.5.2-amd64.hybrid.iso --device /dev/sdb
  scripts/write-usb.sh --iso live-build/TornLinux-1.5.2-amd64.hybrid.iso --device /dev/nvme1n1 --persistence-size 32

Notes:
  - This destroys the target device.
  - Persistence stores live-session changes such as TornLinux settings and API keys across reboots.
  - The script writes the ISO first, then optionally creates a persistence partition in the remaining space.
EOF
}

ISO_PATH=""
DEVICE=""
PERSISTENCE_SIZE_GIB="8"
ENABLE_PERSISTENCE="1"

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
    --persistence-size)
      PERSISTENCE_SIZE_GIB="${2:-}"
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

if [[ "$ENABLE_PERSISTENCE" != "1" ]]; then
  echo "[write-usb] ISO written without persistence partition"
  exit 0
fi

echo "[write-usb] Probing post-write partition table"
sudo partprobe "$DEVICE"
sleep 2

ISO_END_MIB="$(sudo parted -s "$DEVICE" unit MiB print free | awk '/Free Space/ { free_start=$1 } END { sub("MiB","",free_start); print free_start }')"
DISK_END_MIB="$(sudo parted -s "$DEVICE" unit MiB print free | awk '/Disk .*MiB/ { gsub("MiB","",$3); print $3 }')"

[[ -n "$ISO_END_MIB" && -n "$DISK_END_MIB" ]] || { echo "[write-usb] Could not determine free space for persistence" >&2; exit 1; }

START_MIB="$(printf '%.0f' "$ISO_END_MIB")"
END_MIB="$(printf '%.0f' "$DISK_END_MIB")"
REQUEST_MIB="$(( PERSISTENCE_SIZE_GIB * 1024 ))"
AVAILABLE_MIB="$(( END_MIB - START_MIB ))"

if (( AVAILABLE_MIB < 1024 )); then
  echo "[write-usb] Not enough free space left on device for persistence" >&2
  exit 1
fi

if (( REQUEST_MIB > AVAILABLE_MIB )); then
  REQUEST_MIB="$AVAILABLE_MIB"
fi

PERSIST_START="${START_MIB}MiB"
PERSIST_END="$(( START_MIB + REQUEST_MIB ))MiB"

echo "[write-usb] Creating persistence partition from $PERSIST_START to $PERSIST_END"
sudo parted -s "$DEVICE" mkpart primary ext4 "$PERSIST_START" "$PERSIST_END"
sudo partprobe "$DEVICE"
sleep 2

PERSIST_PART="$(lsblk -lnpo NAME,TYPE "$DEVICE" | awk '$2 == "part" { print $1 }' | tail -n 1)"
[[ -n "$PERSIST_PART" ]] || { echo "[write-usb] Could not find persistence partition after creation" >&2; exit 1; }

echo "[write-usb] Formatting persistence partition: $PERSIST_PART"
sudo mkfs.ext4 -F -L persistence "$PERSIST_PART"

TMP_MNT="$(mktemp -d)"
cleanup() {
  sudo umount "$TMP_MNT" >/dev/null 2>&1 || true
  rmdir "$TMP_MNT" >/dev/null 2>&1 || true
}
trap cleanup EXIT

sudo mount "$PERSIST_PART" "$TMP_MNT"
echo "/ union" | sudo tee "$TMP_MNT/persistence.conf" >/dev/null
sudo umount "$TMP_MNT"
rmdir "$TMP_MNT"
trap - EXIT

echo "[write-usb] Persistence enabled on $PERSIST_PART"
echo "[write-usb] Boot will use persistence automatically when this USB starts TornLinux."
