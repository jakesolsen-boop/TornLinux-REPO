#!/usr/bin/env bash
set -euo pipefail

export PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export VERSION="$(tr -d '[:space:]' < "$PROJECT_ROOT/VERSION")"
export STAMP_TEXT="v${VERSION}"
export BRAND_LOGO="$PROJECT_ROOT/assets/brand/tornlinux_logo_circle.png"
export BUILD_LABEL="TORNLINUX"

resolve_designer_overlay_root() {
  local candidate
  for candidate in \
    "${DESIGNER_OVERLAY_ROOT:-}" \
    "$PROJECT_ROOT/../designer-overlay-handoff" \
    "$PROJECT_ROOT/../../designer-overlay-handoff"
  do
    [[ -n "$candidate" && -d "$candidate" ]] || continue
    printf '%s\n' "$(cd "$candidate" && pwd)"
    return 0
  done
  return 1
}

export DESIGNER_OVERLAY_ROOT="$(resolve_designer_overlay_root || true)"
[[ -n "$DESIGNER_OVERLAY_ROOT" ]] || { echo "[stamp-assets] ERROR: designer-overlay-handoff repo not found" >&2; exit 1; }

export MASTER_SPLASH="$DESIGNER_OVERLAY_ROOT/assets/master/splash_1.5.2.png"
export MASTER_WALLPAPER="$DESIGNER_OVERLAY_ROOT/assets/master/wallpaper_1.5.2.png"

echo "[stamp-assets] VERSION=$VERSION"
echo "[stamp-assets] STAMP_TEXT=$STAMP_TEXT"
echo "[stamp-assets] DESIGNER_OVERLAY_ROOT=$DESIGNER_OVERLAY_ROOT"
echo "[stamp-assets] MASTER_SPLASH=$MASTER_SPLASH"
echo "[stamp-assets] MASTER_WALLPAPER=$MASTER_WALLPAPER"

python3 -c "import PIL" >/dev/null 2>&1 || {
  echo "[stamp-assets] ERROR: python3-pil (Pillow) is required" >&2
  exit 1
}

RUNTIME_DIR="$PROJECT_ROOT/live-build/config/includes.chroot/usr/share/tornlinux"
PLYMOUTH_DIR="$PROJECT_ROOT/live-build/config/includes.chroot/usr/share/plymouth/themes/tornlinux"
DESIGNER_STAGED_DIR="$DESIGNER_OVERLAY_ROOT/assets/staged"
export DESIGNER_STAGED_DIR

[[ -f "$BRAND_LOGO" ]] || { echo "[stamp-assets] ERROR: missing brand logo at $BRAND_LOGO" >&2; exit 1; }
[[ -f "$MASTER_SPLASH" ]] || { echo "[stamp-assets] ERROR: missing master splash asset" >&2; exit 1; }
[[ -f "$MASTER_WALLPAPER" ]] || { echo "[stamp-assets] ERROR: missing master wallpaper asset" >&2; exit 1; }

mkdir -p "$RUNTIME_DIR"
mkdir -p "$PLYMOUTH_DIR"
if [[ -d "$DESIGNER_OVERLAY_ROOT" ]]; then
  mkdir -p "$DESIGNER_STAGED_DIR"
fi

python3 - <<PY
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import os

project_root = Path(os.environ["PROJECT_ROOT"])
stamp_text = os.environ["STAMP_TEXT"]
build_label = os.environ["BUILD_LABEL"]
brand_logo = Path(os.environ["BRAND_LOGO"])
master_splash = Path(os.environ["MASTER_SPLASH"])
master_wallpaper = Path(os.environ["MASTER_WALLPAPER"])
designer_staged_dir = Path(os.environ["DESIGNER_STAGED_DIR"]) if Path(os.environ["DESIGNER_OVERLAY_ROOT"]).exists() else None

label_font_candidates = [
    "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
]
version_font_candidates = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
    "/usr/share/fonts/truetype/liberation2/LiberationMono-Regular.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
]
label_font_path = next((f for f in label_font_candidates if Path(f).exists()), None)
version_font_path = next((f for f in version_font_candidates if Path(f).exists()), None)

def load_font(path: str | None, size: int):
    return ImageFont.truetype(path, size) if path else ImageFont.load_default()

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

def render_from_master(source: Path, targets: list[Path], anchor: str):
    img = load_master_image(source)
    stamp(img)
    for target in targets:
        target.parent.mkdir(parents=True, exist_ok=True)
        img.save(target)

def render_plymouth_background(targets: list[Path]):
    img = load_master_image(master_splash)
    stamp(img)
    for target in targets:
        target.parent.mkdir(parents=True, exist_ok=True)
        img.save(target)

def stamp(img: Image.Image):
    draw = ImageDraw.Draw(img)
    plaque_margin = max(26, img.width // 52)
    plaque_pad_x = max(16, img.width // 120)
    plaque_pad_y = max(12, img.height // 120)
    corner_radius = max(12, img.width // 120)
    logo_size = max(24, img.width // 50)
    label_gap = max(10, img.width // 192)
    label_bbox = draw.textbbox((0, 0), build_label, font=label_font)
    version_bbox = draw.textbbox((0, 0), stamp_text, font=version_font)
    label_w = label_bbox[2] - label_bbox[0]
    label_h = label_bbox[3] - label_bbox[1]
    version_w = version_bbox[2] - version_bbox[0]
    version_h = version_bbox[3] - version_bbox[1]
    content_w = logo_size + label_gap + max(label_w, version_w)
    content_h = label_h + version_h + 8
    plaque_w = content_w + (plaque_pad_x * 2)
    plaque_h = max(logo_size, content_h) + (plaque_pad_y * 2)
    x0 = img.width - plaque_w - plaque_margin
    y0 = plaque_margin
    x1 = x0 + plaque_w
    y1 = y0 + plaque_h

    draw.rounded_rectangle(
        [x0, y0, x1, y1],
        radius=corner_radius,
        fill=(7, 12, 18, 148),
        outline=(188, 205, 222, 82),
        width=1,
    )
    draw.line(
        [(x0 + plaque_pad_x, y1 - 1), (x1 - plaque_pad_x, y1 - 1)],
        fill=(130, 165, 194, 72),
        width=1,
    )

    logo = Image.open(brand_logo).convert("RGBA").resize((logo_size, logo_size), Image.LANCZOS)
    logo_x = int(x0 + plaque_pad_x)
    logo_y = int(y0 + ((plaque_h - logo_size) / 2))
    img.alpha_composite(logo, (logo_x, logo_y))

    text_x = logo_x + logo_size + label_gap
    label_y = int(y0 + plaque_pad_y - 1)
    version_y = int(label_y + label_h + 6)
    draw.text((text_x, label_y), build_label, font=label_font, fill=(183, 203, 220, 218))
    draw.text((text_x, version_y), stamp_text, font=version_font, fill=(248, 251, 255, 246))

label_font = load_font(label_font_path, 18)
version_font = load_font(version_font_path, 28)
splash_targets = [project_root / "live-build/config/includes.chroot/usr/share/tornlinux/splash.png"]
wallpaper_targets = [project_root / "live-build/config/includes.chroot/usr/share/tornlinux/wallpaper.png"]
background_targets = [project_root / "live-build/config/includes.chroot/usr/share/plymouth/themes/tornlinux/background.png"]

if designer_staged_dir is not None:
    splash_targets.append(designer_staged_dir / "splash.png")
    wallpaper_targets.append(designer_staged_dir / "wallpaper.png")
    background_targets.append(designer_staged_dir / "background.png")

render_from_master(master_splash, splash_targets, "top-right")
render_from_master(master_wallpaper, wallpaper_targets, "top-right")
render_plymouth_background(background_targets)

print("[stamp-assets] Generated fresh staged assets successfully")
PY
