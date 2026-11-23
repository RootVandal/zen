"""Make "blood print" proofs of work screenshots: a red-and-black duotone with
film grain, like a samurai film poster. The page lays the proof over the
colour screenshot and the katana cuts it away.

Run once and commit the output:
    python -I tools/make-ink.py assets/shots
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps

KEYS = ["axioma", "noir", "lumen"]
# gradient map: luminance -> colour
STOPS = [
    (0.00, (11, 10, 12)),
    (0.34, (26, 8, 12)),
    (0.55, (158, 11, 28)),
    (0.78, (229, 18, 42)),
    (0.93, (255, 92, 112)),
    (1.00, (244, 239, 234)),
]


def gradient_map(lum):
    out = np.zeros(lum.shape + (3,), np.float32)
    xs = np.array([s[0] for s in STOPS], np.float32)
    for c in range(3):
        ys = np.array([s[1][c] for s in STOPS], np.float32)
        out[..., c] = np.interp(lum, xs, ys)
    return out


def proof(src: Path) -> Image.Image:
    im = Image.open(src).convert("L").resize((1024, 640), Image.LANCZOS)
    g = ImageOps.autocontrast(im, cutoff=1)
    lum = np.asarray(g, np.float32) / 255.0
    lum = np.clip((lum - 0.5) * 1.25 + 0.5, 0, 1)  # punchier contrast
    rng = np.random.default_rng(783)
    lum = np.clip(lum + rng.normal(0, 0.03, lum.shape).astype(np.float32), 0, 1)
    rgb = gradient_map(lum)
    # vignette
    h, w = lum.shape
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    d = np.sqrt(((x - w / 2) / (w / 2)) ** 2 + ((y - h / 2) / (h / 2)) ** 2)
    rgb *= np.clip(1.15 - 0.45 * d, 0.45, 1)[..., None]
    return Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8))


def main(folder: str) -> None:
    root = Path(folder)
    for key in KEYS:
        dst = root / f"{key}-ink.webp"
        img = proof(root / f"{key}.webp")
        q = 70
        while True:
            img.save(dst, "WEBP", quality=q, method=6)
            if dst.stat().st_size <= 110_000 or q <= 40:
                break
            q -= 6
        print(f"{dst.name}: {dst.stat().st_size // 1024} KB (q{q})")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "assets/shots")
