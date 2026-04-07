#!/usr/bin/env bash
set -euo pipefail

export PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export VERSION="$(tr -d '[:space:]' < "$PROJECT_ROOT/VERSION")"
export STAMP_TEXT="v${VERSION}"
export BRAND_LOGO="$PROJECT_ROOT/assets/brand/tornlinux_logo_circle.png"
export MASTER_SPLASH="$(find "$PROJECT_ROOT/assets/splash" -maxdepth 1 -type f -name '*.png' | sort -V | tail -n 1)"
export MASTER_WALLPAPER="$(find "$PROJECT_ROOT/assets/wallpaper" -maxdepth 1 -type f -name '*.png' | sort -V | tail -n 1)"

echo "[stamp-assets] VERSION=$VERSION"
echo "[stamp-assets] STAMP_TEXT=$STAMP_TEXT"

python3 -c "import PIL" >/dev/null 2>&1 || {
  echo "[stamp-assets] ERROR: python3-pil (Pillow) is required" >&2
  exit 1
}

RUNTIME_DIR="$PROJECT_ROOT/live-build/config/includes.chroot/usr/share/tornlinux"
PLYMOUTH_DIR="$PROJECT_ROOT/live-build/config/includes.chroot/usr/share/plymouth/themes/tornlinux"

[[ -f "$BRAND_LOGO" ]] || { echo "[stamp-assets] ERROR: missing brand logo at $BRAND_LOGO" >&2; exit 1; }
[[ -f "$MASTER_SPLASH" ]] || { echo "[stamp-assets] ERROR: missing master splash asset" >&2; exit 1; }
[[ -f "$MASTER_WALLPAPER" ]] || { echo "[stamp-assets] ERROR: missing master wallpaper asset" >&2; exit 1; }

mkdir -p "$RUNTIME_DIR"
mkdir -p "$PLYMOUTH_DIR"

python3 - <<PY
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import os

project_root = Path(os.environ["PROJECT_ROOT"])
stamp_text = os.environ["STAMP_TEXT"]
brand_logo = Path(os.environ["BRAND_LOGO"])
master_splash = Path(os.environ["MASTER_SPLASH"])
master_wallpaper = Path(os.environ["MASTER_WALLPAPER"])

font_candidates = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf",
]
font_path = next((f for f in font_candidates if Path(f).exists()), None)

def load_font(size: int):
    return ImageFont.truetype(font_path, size) if font_path else ImageFont.load_default()

def paste_logo(img: Image.Image, target_width: int, center_y: float):
    logo = Image.open(brand_logo).convert("RGBA")
    scale = target_width / logo.width
    resized = logo.resize((int(logo.width * scale), int(logo.height * scale)), Image.LANCZOS)
    x = (img.width - resized.width) // 2
    y = int(center_y - (resized.height / 2))
    img.alpha_composite(resized, (x, y))
    return resized.width, resized.height, x, y

def load_master_image(path: Path):
    return Image.open(path).convert("RGBA")

def render_from_master(source: Path, target: Path, anchor: str):
    img = load_master_image(source)
    stamp(img, anchor)
    img.save(target)

def render_plymouth_background(target: Path):
    img = load_master_image(master_splash)
    stamp(img, "bottom-left")
    img.save(target)

def stamp(img: Image.Image, anchor: str):
    draw = ImageDraw.Draw(img)
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

font = load_font(46)
render_from_master(master_splash, project_root / "live-build/config/includes.chroot/usr/share/tornlinux/splash.png", "bottom-left")
render_from_master(master_wallpaper, project_root / "live-build/config/includes.chroot/usr/share/tornlinux/wallpaper.png", "bottom-right")
render_plymouth_background(project_root / "live-build/config/includes.chroot/usr/share/plymouth/themes/tornlinux/background.png")

print("[stamp-assets] Generated fresh staged assets successfully")
PY
