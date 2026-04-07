#!/usr/bin/env bash
set -euo pipefail

export PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export VERSION="$(tr -d '[:space:]' < "$PROJECT_ROOT/VERSION")"
export STAMP_TEXT="v${VERSION}"

echo "[stamp-assets] VERSION=$VERSION"
echo "[stamp-assets] STAMP_TEXT=$STAMP_TEXT"

python3 -c "import PIL" >/dev/null 2>&1 || {
  echo "[stamp-assets] ERROR: python3-pil (Pillow) is required" >&2
  exit 1
}

resolve_asset_source() {
  local kind="$1"
  local candidates=()
  if [[ "$kind" == "splash" ]]; then
    candidates=(
      "$PROJECT_ROOT/assets/master/splash.png"
      "$PROJECT_ROOT/assets/splash/splash_${VERSION}.png"
      "$PROJECT_ROOT/assets/splash/splash_1.3.11.png"
      "$PROJECT_ROOT/assets/splash/splash_1.3.5.png"
    )
  else
    candidates=(
      "$PROJECT_ROOT/assets/master/wallpaper.png"
      "$PROJECT_ROOT/assets/wallpaper/wallpaper_${VERSION}.png"
      "$PROJECT_ROOT/assets/wallpaper/wallpaper_1.3.11.png"
      "$PROJECT_ROOT/assets/wallpaper/wallpaper_1.3.5.png"
    )
  fi

  local candidate
  for candidate in "${candidates[@]}"; do
    if [[ -f "$candidate" ]]; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done
  return 1
}

MASTER_SPLASH="$(resolve_asset_source splash)"
MASTER_WALLPAPER="$(resolve_asset_source wallpaper)"
RUNTIME_DIR="$PROJECT_ROOT/live-build/config/includes.chroot/usr/share/tornlinux"
PLYMOUTH_DIR="$PROJECT_ROOT/live-build/config/includes.chroot/usr/share/plymouth/themes/tornlinux"

[[ -f "$MASTER_SPLASH" ]] || { echo "[stamp-assets] ERROR: no splash asset source found" >&2; exit 1; }
[[ -f "$MASTER_WALLPAPER" ]] || { echo "[stamp-assets] ERROR: no wallpaper asset source found" >&2; exit 1; }

mkdir -p "$RUNTIME_DIR"
mkdir -p "$PLYMOUTH_DIR"

cp "$MASTER_SPLASH" "$RUNTIME_DIR/splash.png"
cp "$MASTER_WALLPAPER" "$RUNTIME_DIR/wallpaper.png"
cp "$MASTER_SPLASH" "$PLYMOUTH_DIR/background.png"

python3 - <<PY
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import os

project_root = Path(os.environ["PROJECT_ROOT"])
stamp_text = os.environ["STAMP_TEXT"]

font_candidates = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf",
]
font_path = next((f for f in font_candidates if Path(f).exists()), None)

def stamp(target: Path, anchor: str):
    img = Image.open(target).convert("RGBA")
    draw = ImageDraw.Draw(img)
    font = ImageFont.truetype(font_path, max(24, img.width // 42)) if font_path else ImageFont.load_default()
    bbox = draw.textbbox((0, 0), stamp_text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    pad = max(20, img.width // 72)
    if anchor == "bottom-left":
        x = pad + 6
        y = img.height - th - pad - 4
    else:
        x = img.width - tw - pad - 6
        y = img.height - th - pad - 4
    draw.rounded_rectangle([x-14, y-8, x+tw+14, y+th+8], radius=10, fill=(0, 0, 0, 155))
    draw.text((x+1, y+1), stamp_text, font=font, fill=(0, 0, 0, 210))
    draw.text((x, y), stamp_text, font=font, fill=(255, 255, 255, 245))
    img.save(target)

targets = {
    project_root / "live-build/config/includes.chroot/usr/share/tornlinux/splash.png": "bottom-left",
    project_root / "live-build/config/includes.chroot/usr/share/tornlinux/wallpaper.png": "bottom-right",
    project_root / "live-build/config/includes.chroot/usr/share/plymouth/themes/tornlinux/background.png": "bottom-left",
}
for target, anchor in targets.items():
    stamp(target, anchor)

print("[stamp-assets] Copied master assets and stamped staged assets successfully")
PY
