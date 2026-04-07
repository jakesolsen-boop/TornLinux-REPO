#!/usr/bin/env bash
set -euo pipefail

export PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export VERSION="$(tr -d '[:space:]' < "$PROJECT_ROOT/VERSION")"
export STAMP_TEXT="v${VERSION}"
export BRAND_LOGO="$PROJECT_ROOT/assets/brand/tornlinux_logo_circle.png"

echo "[stamp-assets] VERSION=$VERSION"
echo "[stamp-assets] STAMP_TEXT=$STAMP_TEXT"

python3 -c "import PIL" >/dev/null 2>&1 || {
  echo "[stamp-assets] ERROR: python3-pil (Pillow) is required" >&2
  exit 1
}

RUNTIME_DIR="$PROJECT_ROOT/live-build/config/includes.chroot/usr/share/tornlinux"
PLYMOUTH_DIR="$PROJECT_ROOT/live-build/config/includes.chroot/usr/share/plymouth/themes/tornlinux"

[[ -f "$BRAND_LOGO" ]] || { echo "[stamp-assets] ERROR: missing brand logo at $BRAND_LOGO" >&2; exit 1; }

mkdir -p "$RUNTIME_DIR"
mkdir -p "$PLYMOUTH_DIR"

python3 - <<PY
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import os

project_root = Path(os.environ["PROJECT_ROOT"])
stamp_text = os.environ["STAMP_TEXT"]
brand_logo = Path(os.environ["BRAND_LOGO"])

font_candidates = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf",
]
font_path = next((f for f in font_candidates if Path(f).exists()), None)

def load_font(size: int):
    return ImageFont.truetype(font_path, size) if font_path else ImageFont.load_default()

def make_background(width: int, height: int, accent_top: tuple[int, int, int], accent_bottom: tuple[int, int, int]):
    img = Image.new("RGBA", (width, height), (10, 14, 19, 255))
    draw = ImageDraw.Draw(img)
    for y in range(height):
        ratio = y / max(height - 1, 1)
        color = tuple(int(accent_top[i] * (1 - ratio) + accent_bottom[i] * ratio) for i in range(3))
        draw.line([(0, y), (width, y)], fill=(*color, 255))

    glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse(
        [width * 0.18, height * 0.1, width * 0.82, height * 0.88],
        fill=(36, 157, 255, 36),
    )
    return Image.alpha_composite(img, glow)

def paste_logo(img: Image.Image, target_width: int, center_y: float):
    logo = Image.open(brand_logo).convert("RGBA")
    scale = target_width / logo.width
    resized = logo.resize((int(logo.width * scale), int(logo.height * scale)), Image.LANCZOS)
    x = (img.width - resized.width) // 2
    y = int(center_y - (resized.height / 2))
    img.alpha_composite(resized, (x, y))
    return resized.width, resized.height, x, y

def render_splash(target: Path):
    img = make_background(1920, 1080, (8, 12, 16), (18, 24, 31))
    draw = ImageDraw.Draw(img)
    logo_w, logo_h, _, logo_y = paste_logo(img, 260, img.height * 0.36)
    title_font = load_font(72)
    subtitle_font = load_font(30)
    title = "TORNLINUX"
    subtitle = "Command Center"
    title_box = draw.textbbox((0, 0), title, font=title_font)
    subtitle_box = draw.textbbox((0, 0), subtitle, font=subtitle_font)
    title_x = (img.width - (title_box[2] - title_box[0])) // 2
    subtitle_x = (img.width - (subtitle_box[2] - subtitle_box[0])) // 2
    title_y = int(logo_y + logo_h + 42)
    subtitle_y = title_y + 82
    draw.text((title_x, title_y), title, font=title_font, fill=(235, 242, 248, 255))
    draw.text((subtitle_x, subtitle_y), subtitle, font=subtitle_font, fill=(120, 180, 235, 255))
    stamp(img, "bottom-left")
    img.save(target)

def render_wallpaper(target: Path):
    img = make_background(1920, 1080, (14, 20, 28), (7, 9, 12))
    draw = ImageDraw.Draw(img)
    paste_logo(img, 520, img.height * 0.44)
    headline_font = load_font(92)
    sub_font = load_font(34)
    headline = "TornLinux"
    subline = "Purpose-built for Torn"
    hbox = draw.textbbox((0, 0), headline, font=headline_font)
    sbox = draw.textbbox((0, 0), subline, font=sub_font)
    hx = (img.width - (hbox[2] - hbox[0])) // 2
    sx = (img.width - (sbox[2] - sbox[0])) // 2
    hy = int(img.height * 0.7)
    sy = hy + 96
    draw.text((hx, hy), headline, font=headline_font, fill=(240, 244, 248, 220))
    draw.text((sx, sy), subline, font=sub_font, fill=(123, 189, 255, 220))
    stamp(img, "bottom-right")
    img.save(target)

def render_plymouth_logo(target: Path):
    img = Image.new("RGBA", (320, 320), (0, 0, 0, 0))
    paste_logo(img, 240, img.height / 2)
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
render_splash(project_root / "live-build/config/includes.chroot/usr/share/tornlinux/splash.png")
render_wallpaper(project_root / "live-build/config/includes.chroot/usr/share/tornlinux/wallpaper.png")
render_plymouth_logo(project_root / "live-build/config/includes.chroot/usr/share/plymouth/themes/tornlinux/background.png")

print("[stamp-assets] Generated fresh staged assets successfully")
PY
