"""Favicon: a red hanko seal with the brush kanji 禅 as an outline path.
    python -I tools/favicon.py
"""
from pathlib import Path

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
FONT = ROOT / "art" / "_fonts" / "YujiBoku-Regular.ttf"  # https://github.com/google/fonts/raw/main/ofl/yujiboku/YujiBoku-Regular.ttf (not committed)
CHAR = "禅"

font = TTFont(FONT)
gs = font.getGlyphSet()
name = font.getBestCmap()[ord(CHAR)]
bp = BoundsPen(gs)
gs[name].draw(bp)
x0, y0, x1, y1 = bp.bounds
box = 44  # glyph box inside the 64 viewBox
s = box / max(x1 - x0, y1 - y0)
ox = 32 - (x0 + x1) / 2 * s
oy = 32 + (y0 + y1) / 2 * s
pen = SVGPathPen(gs)
gs[name].draw(TransformPen(pen, (s, 0, 0, -s, ox, oy)))
svg = (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
    '<rect width="64" height="64" rx="8" fill="#E5122A"/>'
    '<rect x="4" y="4" width="56" height="56" rx="5" fill="none" stroke="#F4EFEA" stroke-width="1.6" opacity=".85"/>'
    f'<path d="{pen.getCommands()}" fill="#F4EFEA"/></svg>'
)
(ROOT / "assets" / "favicon.svg").write_text(svg, encoding="utf-8")
print("favicon.svg", len(svg), "bytes")
