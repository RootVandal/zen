"""Procedural sumi-e art: misty ink ridges, an enso brush circle, a brush stroke.
Writes art/sumi.svg (symbols). Deterministic (seeded). Run:
    python -I tools/gen-sumi.py
"""
import math
import random
from pathlib import Path

R = random.Random(783)
OUT = Path(__file__).resolve().parent.parent / "art" / "sumi.svg"


def f(v):
    return f"{v:.1f}"


def ridge(width, base, amp, rough, seed, steps=9):
    """Midpoint-displacement ridgeline from x=0..width, returns list of (x, y)."""
    rnd = random.Random(seed)
    pts = [base + rnd.uniform(-amp, amp) * 0.4, base + rnd.uniform(-amp, amp) * 0.4]
    disp = amp
    for _ in range(steps):
        nxt = []
        for i in range(len(pts) - 1):
            nxt.append(pts[i])
            nxt.append((pts[i] + pts[i + 1]) / 2 + rnd.uniform(-disp, disp))
        nxt.append(pts[-1])
        pts = nxt
        disp *= rough
    n = len(pts) - 1
    return [(width * i / n, y) for i, y in enumerate(pts)]


def peaks(width, base, spec, seed, jag=6):
    """Ridgeline shaped by explicit peaks [(x, height, spread)], plus jagged detail."""
    rnd = random.Random(seed)
    out = []
    for i in range(0, 321):
        x = width * i / 320
        h = 0
        for px, ph, sp in spec:
            d = (x - px) / sp
            k = 0.85 if d < 0 else 1.25  # asymmetric slopes
            u = max(0.0, 1 - abs(d) * k / 2.4)
            h = max(h, ph * (u ** 0.8) * (1 - 0.12 * abs(math.sin(d * 5.3))))
        out.append((x, base - h))
    # jagged rock detail
    det = ridge(width, 0, jag, 0.62, seed + 1, steps=8)
    j = 0
    res = []
    for x, y in out:
        while j < len(det) - 1 and det[j + 1][0] < x:
            j += 1
        res.append((x, y + det[j][1]))
    return res


def area_path(pts, width, bottom):
    d = f"M0 {f(bottom)} L" + " L".join(f"{f(x)} {f(y)}" for x, y in pts) + f" L{f(width)} {f(bottom)}Z"
    return d


def line_path(pts):
    return "M" + " L".join(f"{f(x)} {f(y)}" for x, y in pts)


def ridges():
    W, H = 1600, 600
    layers = [
        # far to near: (peaks, base, fill top, fill bottom alpha, seed)
        ([(230, 230, 120), (640, 340, 150), (1010, 250, 110), (1420, 290, 140)], 470, "#43343A", 0.0, 11),
        ([(90, 170, 100), (470, 230, 120), (880, 290, 130), (1290, 210, 120), (1580, 150, 90)], 520, "#2A2025", 0.0, 23),
        ([(330, 150, 130), (760, 110, 110), (1200, 180, 140)], 560, "#161114", 0.0, 37),
        ([(160, 90, 160), (640, 70, 200), (1100, 110, 180), (1540, 80, 140)], 600, "#0B0A0C", 1.0, 41),
    ]
    out = [f'<symbol id="ridges" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMax slice">']
    out.append("<defs>")
    for i, (_, _, col, a, _) in enumerate(layers):
        out.append(
            f'<linearGradient id="ridges-g{i}" x1="0" y1="0" x2="0" y2="1">'
            f'<stop offset="0" stop-color="{col}"/><stop offset=".35" stop-color="{col}" stop-opacity="{0.9 if a < 1 else 1}"/>'
            f'<stop offset="1" stop-color="{col}" stop-opacity="{a}"/></linearGradient>'
        )
    out.append(
        '<linearGradient id="ridges-mist" x1="0" y1="0" x2="0" y2="1">'
        '<stop offset="0" stop-color="#F4EFEA" stop-opacity="0"/><stop offset=".5" stop-color="#F4EFEA" stop-opacity=".07"/>'
        '<stop offset="1" stop-color="#F4EFEA" stop-opacity="0"/></linearGradient>'
    )
    out.append("</defs>")
    for i, (pk, base, col, a, seed) in enumerate(layers):
        pts = peaks(W, base, pk, seed, jag=7 + i * 3)
        out.append(f'<path d="{area_path(pts, W, H + 2)}" fill="url(#ridges-g{i})"/>')
        # red rim light from the sun along the ridgeline
        rim_op = [0.10, 0.18, 0.4, 0.75][i]
        out.append(f'<path d="{line_path(pts)}" fill="none" stroke="#E5122A" stroke-width="{1 + i * 0.6:.1f}" stroke-opacity="{rim_op}"/>')
        if i < 3:
            # mist band at the foot of each layer
            out.append(f'<rect x="0" y="{base - 70}" width="{W}" height="140" fill="url(#ridges-mist)"/>')
    out.append("</symbol>")
    return "\n".join(out)


def brush_band(cx, cy, r0, a0, sweep, w0, w1, n, rnd, dry_from=0.65):
    """Centreline arc -> polygon with tapering width and ragged edges; bristle gaps as separate strips."""
    outer, inner = [], []
    for i in range(n + 1):
        t = i / n
        a = a0 + sweep * t
        r = r0 * (1 + 0.035 * math.sin(t * 7.3) + rnd.uniform(-0.004, 0.004))
        w = w0 + (w1 - w0) * (t ** 1.3)
        w *= 1 + 0.08 * math.sin(t * 23) + rnd.uniform(-0.05, 0.05)
        if t < 0.04:
            w *= 0.75 + t * 6  # blunt start
        ox = cx + math.cos(a) * (r + w / 2)
        oy = cy + math.sin(a) * (r + w / 2)
        ix = cx + math.cos(a) * (r - w / 2)
        iy = cy + math.sin(a) * (r - w / 2)
        outer.append((ox, oy))
        inner.append((ix, iy))
    pts = outer + inner[::-1]
    return "M" + " L".join(f"{f(x)} {f(y)}" for x, y in pts) + "Z"


def enso():
    rnd = random.Random(5)
    cx = cy = 250
    out = ['<symbol id="enso" viewBox="0 0 500 500">', "<defs>", '<mask id="enso-dry" maskUnits="userSpaceOnUse" x="0" y="0" width="500" height="500">',
           '<rect width="500" height="500" fill="#fff"/>']
    a0 = math.radians(-70)
    sweep = math.radians(332)
    # dry-brush streaks: thin black arcs over the last part of the stroke
    for k in range(18):
        start = 0.42 + rnd.uniform(0, 0.3)
        rr = 196 + rnd.uniform(-20, 20)
        seg = []
        for i in range(40):
            t = start + (1 - start) * i / 39
            a = a0 + sweep * t
            seg.append((cx + math.cos(a) * rr, cy + math.sin(a) * rr))
        out.append(f'<path d="{line_path(seg)}" fill="none" stroke="#000" stroke-width="{rnd.uniform(0.8, 2.6):.1f}" stroke-linecap="round"/>')
    out.append("</mask></defs>")
    body = brush_band(cx, cy, 196, a0, sweep, 46, 6, 260, rnd)
    out.append(f'<path d="{body}" fill="currentColor" mask="url(#enso-dry)"/>')
    # ink splashes at the start
    for _ in range(7):
        a = a0 + rnd.uniform(-0.25, 0.1)
        r = 196 + rnd.uniform(-34, 34)
        out.append(f'<circle cx="{f(cx + math.cos(a) * r)}" cy="{f(cy + math.sin(a) * r)}" r="{rnd.uniform(1.5, 4.5):.1f}" fill="currentColor"/>')
    out.append("</symbol>")
    return "\n".join(out)


def stroke_symbol():
    rnd = random.Random(9)
    W, H = 800, 100
    top, bot = [], []
    n = 160
    for i in range(n + 1):
        t = i / n
        x = 20 + (W - 60) * t
        y = 50 + 6 * math.sin(t * 3.2) - 4 * t
        w = 46 * (1 - t ** 1.6) + 3
        if t < 0.03:
            w *= 0.7 + t * 10
        w *= 1 + rnd.uniform(-0.05, 0.05)
        top.append((x, y - w / 2))
        bot.append((x, y + w / 2))
    d = "M" + " L".join(f"{f(x)} {f(y)}" for x, y in top + bot[::-1]) + "Z"
    out = ['<symbol id="brush" viewBox="0 0 800 100" preserveAspectRatio="none">', "<defs>",
           '<mask id="brush-dry" maskUnits="userSpaceOnUse" x="0" y="0" width="800" height="100"><rect width="800" height="100" fill="#fff"/>']
    for k in range(14):
        y = 50 + rnd.uniform(-20, 20)
        x0 = rnd.uniform(260, 560)
        out.append(f'<path d="M{f(x0)} {f(y)} L800 {f(y - 4)}" stroke="#000" stroke-width="{rnd.uniform(0.8, 2.2):.1f}"/>')
    out.append("</mask></defs>")
    out.append(f'<path d="{d}" fill="currentColor" mask="url(#brush-dry)"/>')
    out.append("</symbol>")
    return "\n".join(out)


def main():
    svg = '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute">\n'
    svg += ridges() + "\n" + enso() + "\n" + stroke_symbol() + "\n</svg>\n"
    OUT.write_text(svg, encoding="utf-8")
    print(OUT, len(svg) // 1024, "KB")


if __name__ == "__main__":
    main()
