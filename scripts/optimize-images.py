#!/usr/bin/env python3
"""Turn the camera originals into web-ready art for the site.

The originals are 2–30 MB straight-out-of-camera JPEGs: fine as an archive,
far too heavy to ship. This script writes resized, EXIF-rotated WebP masters
to public/imgs/ and a typed manifest (lib/photo-manifest.generated.ts) holding
each file's dimensions plus a tiny inline blur placeholder, so <Image /> can
render every photo without layout shift and with a blur-up transition.

The archive no longer lives in the repo: 293 MB of originals that nothing
serves is a heavy thing to clone. Keep it wherever it is kept —a drive, the
cloud— and point the script at it. It expects the same folders as always
(Restaurant, Granja, Huerta, Proveeduría, "Paseos y Animales", Eventos).

Usage:  python3 scripts/optimize-images.py <carpeta-de-originales>
        PEBETA_ORIGINALES=<carpeta> python3 scripts/optimize-images.py

Needs Pillow. Only what it finds gets rebuilt, so a single folder is enough to
redo one area; commit public/imgs/ and the generated manifest afterwards.
"""

import base64
import io
import json
import os
import re
import sys
import unicodedata

from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = (
    sys.argv[1]
    if len(sys.argv) > 1
    else os.environ.get("PEBETA_ORIGINALES", os.path.join(ROOT, "assets", "imgs"))
)
OUT = os.path.join(ROOT, "public", "imgs")
MANIFEST = os.path.join(ROOT, "lib", "photo-manifest.generated.ts")

# Folder name on disk -> slug used in code/URLs.
FOLDERS = {
    "Restaurant": "restaurant",
    "Granja": "granja",
    "Huerta": "huerta",
    "Proveeduría": "proveeduria",
    "Paseos y Animales": "paseos",
    "Eventos": "eventos",
}

DEFAULT_MAX = 1800
QUALITY = 74
# Full-bleed shots (heroes, parallax bands) get more pixels to play with.
WIDE_MAX = 2600
WIDE = {"granja/7", "restaurant/8", "paseos/17", "eventos/7", "granja/6", "eventos/3"}


def slug(name: str) -> str:
    ascii_name = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", ascii_name.lower()).strip("-")


def sort_key(filename: str):
    base = os.path.splitext(filename)[0]
    return (0, int(base)) if base.isdigit() else (1, base)


def blur_data_url(im: Image.Image) -> str:
    thumb = im.copy()
    thumb.thumbnail((20, 20))
    buf = io.BytesIO()
    thumb.save(buf, "JPEG", quality=40)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()


def main() -> None:
    # Sin originales no hay nada que rehacer, y hay que cortar acá: seguir de
    # largo reescribiría el manifiesto vacío y dejaría al sitio sin fotos.
    if not os.path.isdir(SRC):
        sys.exit(
            f"No encuentro los originales en {SRC}.\n"
            "Pasá la carpeta como argumento o en PEBETA_ORIGINALES; el archivo\n"
            "ya no vive en el repo."
        )

    entries: dict[str, dict] = {}

    for folder, area in FOLDERS.items():
        src_dir = os.path.join(SRC, folder)
        if not os.path.isdir(src_dir):
            print(f"! missing folder {folder}")
            continue

        out_dir = os.path.join(OUT, area)
        os.makedirs(out_dir, exist_ok=True)

        files = sorted(
            (f for f in os.listdir(src_dir) if f.lower().endswith((".jpg", ".jpeg", ".png"))),
            key=sort_key,
        )

        for filename in files:
            key = f"{area}/{slug(os.path.splitext(filename)[0])}"
            out_name = f"{slug(os.path.splitext(filename)[0])}.webp"
            out_path = os.path.join(out_dir, out_name)

            with Image.open(os.path.join(src_dir, filename)) as raw:
                im = ImageOps.exif_transpose(raw).convert("RGB")

            limit = WIDE_MAX if key in WIDE else DEFAULT_MAX
            im.thumbnail((limit, limit), Image.LANCZOS)
            im.save(out_path, "WEBP", quality=QUALITY, method=5)

            entries[key] = {
                "src": f"/imgs/{area}/{out_name}",
                "width": im.width,
                "height": im.height,
                "blurDataURL": blur_data_url(im),
            }
            print(f"{key:26} {im.width}x{im.height}  {os.path.getsize(out_path) // 1024} KB")

    if not entries:
        sys.exit(f"No hay fotos en {SRC}: dejo el manifiesto como está.")

    os.makedirs(os.path.dirname(MANIFEST), exist_ok=True)
    body = ",\n".join(
        f"  {json.dumps(key)}: {json.dumps(value, ensure_ascii=False)}"
        for key, value in sorted(entries.items())
    )
    with open(MANIFEST, "w", encoding="utf-8") as fh:
        fh.write(
            "// GENERATED FILE — do not edit by hand.\n"
            "// Run `python3 scripts/optimize-images.py <carpeta-de-originales>`.\n\n"
            "export type PhotoAsset = {\n"
            "  src: string;\n"
            "  width: number;\n"
            "  height: number;\n"
            "  blurDataURL: string;\n"
            "};\n\n"
            "export const PHOTO_MANIFEST = {\n" + body + ",\n} as const satisfies Record<string, PhotoAsset>;\n\n"
            "export type PhotoKey = keyof typeof PHOTO_MANIFEST;\n"
        )
    print(f"\n{len(entries)} images -> public/imgs/, manifest at lib/photo-manifest.generated.ts")


if __name__ == "__main__":
    main()
