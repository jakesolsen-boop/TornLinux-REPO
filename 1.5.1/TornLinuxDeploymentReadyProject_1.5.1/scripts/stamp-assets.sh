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

mkdir -p "$PROJECT_ROOT/live-build/config/includes.chroot/usr/share/tornlinux"
mkdir -p "$PROJECT_ROOT/live-build/config/includes.chroot/usr/share/plymouth/themes/tornlinux"

cp "$PROJECT_ROOT/assets/master/splash.png" "$PROJECT_ROOT/live-build/config/includes.chroot/usr/share/tornlinux/splash.png"
cp "$PROJECT_ROOT/assets/master/wallpaper.png" "$PROJECT_ROOT/live-build/config/includes.chroot/usr/share/tornlinux/wallpaper.png"
cp "$PROJECT_ROOT/assets/master/splash.png" "$PROJECT_ROOT/live-build/config/includes.chroot/usr/share/plymouth/themes/tornlinux/background.png"

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

targets = [
    project_root / "live-build/config/includes.chroot/usr/share/tornlinux/splash.png",
    project_root / "live-build/config/includes.chroot/usr/share/tornlinux/wallpaper.png",
    project_root / "live-build/config/includes.chroot/usr/share/plymouth/themes/tornlinux/background.png",
]
for target in targets:
    img = Image.open(target).convert("RGBA")
    draw = ImageDraw.Draw(img)
    font = ImageFont.truetype(font_path, max(24, img.width // 42)) if font_path else ImageFont.load_default()
    bbox = draw.textbbox((0, 0), stamp_text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    pad = max(20, img.width // 72)
    x = img.width - tw - pad - 6
    y = img.height - th - pad - 4
    draw.rounded_rectangle([x-14, y-8, x+tw+14, y+th+8], radius=10, fill=(0, 0, 0, 155))
    draw.text((x+1, y+1), stamp_text, font=font, fill=(0, 0, 0, 210))
    draw.text((x, y), stamp_text, font=font, fill=(255, 255, 255, 245))
    img.save(target)
print("[stamp-assets] Stamped staged assets successfully")
PY
