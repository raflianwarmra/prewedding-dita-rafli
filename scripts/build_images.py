"""Convert source photos and illustrations into web-ready WebP files.

Run from the repo root:  python3 scripts/build_images.py
Sources live in OneDrive / the digital-invitation project; outputs are committed.
"""
import json
from pathlib import Path
from PIL import Image, ImageOps

HOME = Path.home()
PHOTOS = HOME / "Library/CloudStorage/OneDrive-Personal/Wedding Planner/00 Foto"
ART = HOME / "Code/digital-invitation/ILLUSTRATION ASSET/PNG"
OUT = Path(__file__).resolve().parent.parent / "assets"

FIKRI = PHOTOS / "03 Prewedding - Fikri Pratama/Edited"
AZHAR = PHOTOS / "04 Prewedding - Azhar/Dita & Rafli - Prewedding"
JATI = next((PHOTOS / "02 Prewedding - Jatidiriono").glob("HIRES EDITED*"))


def jati(look, n):
    folder = next(JATI.glob(f"LOOK {look} *"))
    return folder / f"_PW_{n:04d} copy.jpg"


def fikri(look, n):
    return FIKRI / look / f"Byfikriipra-{n}.jpg"


def azhar(n):
    return AZHAR / f"D&R_PW-{n}.jpg"


# output name -> source file
PHOTO_SOURCES = {
    "bugis-1": fikri("Look 1 - Bugis", 3),
    "bugis-2": fikri("Look 1 - Bugis", 37),
    "bugis-3": fikri("Look 1 - Bugis", 67),
    "bugis-4": fikri("Look 1 - Bugis", 134),
    "jawa-1": azhar(5802),
    "jawa-2": azhar(5908),
    "jawa-3": azhar(5860),
    "jawa-4": azhar(6158),
    "palembang-1": jati("1A", 118),
    "palembang-1-sepia": jati("1B", 118),
    "palembang-2": jati("1A", 441),
    "palembang-2-sepia": jati("1B", 441),
    "palembang-3": jati("1A", 290),
    "palembang-3-sepia": jati("1B", 290),
    "palembang-4": jati("1A", 178),
    "palembang-4-sepia": jati("1B", 178),
    "woven-1": jati("2A", 79),
    "woven-2": jati("2A", 74),
    "woven-3": jati("2A", 322),
    "woven-4": jati("2A", 226),
    "projection-1": jati("2A", 5),
    "projection-2": jati("2A", 214),
    "projection-3": jati("2A", 228),
    "projection-4": jati("2A", 284),
    "peranakan-1": azhar(6414),
    "peranakan-2": azhar(6700),
    "peranakan-3": azhar(6566),
    "peranakan-4": azhar(6917),
    "bappenas-1": fikri("Look 2 - After Office", 269),
    "bappenas-2": fikri("Look 2 - After Office", 199),
    "bappenas-3": fikri("Look 2 - After Office", 293),
    "bappenas-4": fikri("Look 2 - After Office", 248),
    "ooc-1": azhar(7029),
    "ooc-2": azhar(7280),
    "ooc-3": azhar(7545),
    "ooc-4": azhar(7650),
    "film": azhar(7010),
}


def save_webp(im, path, width, quality):
    im = im.copy()
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(path, "WEBP", quality=quality, method=6)
    return im.size


def build_photos():
    out = OUT / "photos"
    out.mkdir(parents=True, exist_ok=True)
    manifest = {}
    for name, src in PHOTO_SOURCES.items():
        im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
        save_webp(im, out / f"{name}-360.webp", 360, 72)
        save_webp(im, out / f"{name}-800.webp", 800, 78)
        w, h = save_webp(im, out / f"{name}-1600.webp", 1600, 80)
        manifest[name] = [w, h]
        print(f"{name:20s} {w}x{h}")
    (out / "manifest.json").write_text(json.dumps(manifest, indent=1))


def open_art(name):
    # Some illustrator PNGs carry an EXIF rotation (the arch is stored sideways).
    return ImageOps.exif_transpose(Image.open(ART / name))


def build_art():
    out = OUT / "art"
    out.mkdir(parents=True, exist_ok=True)
    bugis = open_art("WEDDING D&R_Background Bugis.png").convert("RGB")
    palembang = open_art("WEDDING D&R_Background Palembang.png").convert("RGB")
    # Foyer: the full Bugis scene (sky, lanterns, houses) as a portrait backdrop.
    save_webp(bugis, out / "foyer-900.webp", 900, 76)
    save_webp(bugis, out / "foyer-1600.webp", 1600, 76)
    # House strips for the two rooms that have an illustrated house.
    b = bugis.crop((0, int(bugis.height * 0.36), bugis.width, int(bugis.height * 0.72)))
    save_webp(b, out / "house-bugis.webp", 1400, 74)
    p = palembang.crop((0, int(palembang.height * 0.36), palembang.width, int(palembang.height * 0.72)))
    save_webp(p, out / "house-palembang.webp", 1400, 74)
    # Transparent pieces keep their alpha.
    for src, name, width in [
        ("WEDDING D&R_Frame adat.png", "arch", 1400),
        ("WEDDING D&R_Pattern.png", "pattern", 2400),
        ("WEDDING D&R_Lantern.png", "lanterns", 700),
    ]:
        im = open_art(src).convert("RGBA")
        im = im.crop(im.getbbox())
        print(name, save_webp(im, out / f"{name}.webp", width, 82))


if __name__ == "__main__":
    import sys
    build_art()
    if "--art-only" not in sys.argv:
        build_photos()
