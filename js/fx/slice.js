/* Katana slash engine.
   One straight line (or an X of two lines) splits one or more layers. Each
   layer is cloned into pieces with a static clip-path polygon; only the
   wrappers move (transform/opacity), so the cut is cheap to composite.

   const h = createSlash({ layers:[{el, depth}], angle, through, ... });
   await h.cut();      // trail -> hit-stop -> slip along the blade -> fall
   h.fallTl            // paused timeline when fall === 'scrub'
   h.reset();  h.aftermath();
*/
const gsap = () => window.gsap;
const RAD = Math.PI / 180;

/* ---------------- geometry ---------------- */
export function clipHalf(poly, P, n, side, overlap = 0) {
  const out = [];
  const d = (p) => side * ((p[0] - P[0]) * n[0] + (p[1] - P[1]) * n[1]) + overlap;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const da = d(a);
    const db = d(b);
    if (da >= 0) out.push(a);
    if (da * db < 0) {
      const k = da / (da - db);
      out.push([a[0] + k * (b[0] - a[0]), a[1] + k * (b[1] - a[1])]);
    }
  }
  return out;
}

function centroid(poly) {
  let x = 0, y = 0;
  for (const p of poly) { x += p[0]; y += p[1]; }
  return [x / poly.length, y / poly.length];
}

/* segment where the line P + s*t crosses the rect (viewport coords) */
export function lineInRect(rect, P, t, extend = 0.08) {
  const ts = [];
  const { left, top, right, bottom } = rect;
  if (Math.abs(t[0]) > 1e-6) {
    for (const x of [left, right]) {
      const s = (x - P[0]) / t[0];
      const y = P[1] + s * t[1];
      if (y >= top - 1 && y <= bottom + 1) ts.push(s);
    }
  }
  if (Math.abs(t[1]) > 1e-6) {
    for (const y of [top, bottom]) {
      const s = (y - P[1]) / t[1];
      const x = P[0] + s * t[0];
      if (x >= left - 1 && x <= right + 1) ts.push(s);
    }
  }
  if (ts.length < 2) {
    const r = Math.hypot(rect.width, rect.height) / 2;
    ts.push(-r, r);
  }
  let a = Math.min(...ts), b = Math.max(...ts);
  const len = b - a;
  a -= len * extend; b += len * extend;
  return [[P[0] + a * t[0], P[1] + a * t[1]], [P[0] + b * t[0], P[1] + b * t[1]]];
}

/* ---------------- the trail layer ---------------- */
const NS = 'http://www.w3.org/2000/svg';
let layer = null;
const pool = [];
let poolI = 0;
const it_glow = new Map();

function trailPool() {
  if (layer) return;
  layer = document.getElementById('slash-layer');
  if (!layer) {
    layer = document.createElementNS(NS, 'svg');
    layer.id = 'slash-layer';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);
  }
  for (let i = 0; i < 4; i++) {
    const g = document.createElementNS(NS, 'g');
    const draw = document.createElementNS(NS, 'g');
    const glow = document.createElementNS(NS, 'path');
    const body = document.createElementNS(NS, 'path');
    const core = document.createElementNS(NS, 'path');
    glow.setAttribute('fill', '#E5122A');
    glow.setAttribute('opacity', '.55');
    body.setAttribute('fill', '#F4EFEA');
    core.setAttribute('fill', 'none');
    core.setAttribute('stroke', '#FFFFFF');
    core.setAttribute('stroke-width', '1.5');
    core.setAttribute('stroke-linecap', 'round');
    draw.append(glow, body, core);
    g.append(draw);
    g.style.opacity = '0';
    layer.append(g);
    it_glow.set(g, glow);
    pool.push({ g, draw, body, core });
  }
}

/* A white crescent with an ink outline sweeping from A to B. Returns a timeline. */
export function trail(A, B, { w = 14, dur = 0.14, color } = {}) {
  trailPool();
  const G = gsap();
  const it = pool[poolI++ % pool.length];
  const dx = B[0] - A[0], dy = B[1] - A[1];
  const L = Math.hypot(dx, dy);
  const ang = Math.atan2(dy, dx) / RAD;
  it.g.setAttribute('transform', `translate(${A[0].toFixed(1)} ${A[1].toFixed(1)}) rotate(${ang.toFixed(2)})`);
  it.body.setAttribute('d', `M0 0 Q ${L / 2} ${-w} ${L} 0 Q ${L / 2} ${w * 0.28} 0 0Z`);
  it.core.setAttribute('d', `M${L * 0.1} ${-w * 0.22} Q ${L / 2} ${-w * 0.55} ${L * 0.9} ${-w * 0.22}`);
  it_glow.get(it.g)?.setAttribute('d', `M${-L * 0.02} ${w * 0.25} Q ${L / 2} ${-w * 1.9} ${L * 1.02} ${w * 0.25} Q ${L / 2} ${w * 0.9} ${-L * 0.02} ${w * 0.25}Z`);
  if (color) it.body.setAttribute('fill', color);
  G.killTweensOf([it.g, it.draw]);
  const tl = G.timeline();
  tl.set(it.g, { opacity: 1 })
    .fromTo(it.draw, { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: dur, ease: 'power4.in' })
    .to(it.g, { opacity: 0, duration: 0.22, ease: 'power1.out' }, dur + 0.04);
  return tl;
}

/* ---------------- slash ---------------- */
function px(v, vh) {
  if (typeof v === 'number') return v;
  const m = String(v).match(/^(-?[\d.]+)(vh|vw|px)?$/);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  if (m[2] === 'vh') return (n * vh) / 100;
  if (m[2] === 'vw') return (n * window.innerWidth) / 100;
  return n;
}

function stripIds(node) {
  if (node.nodeType !== 1) return;
  node.removeAttribute('id');
  node.removeAttribute('for');
  node.removeAttribute('name');
  for (const c of node.children) stripIds(c);
}

export function createSlash(opts) {
  const G = gsap();
  const o = {
    angle: -26, slip: 24, hitStop: 70, fall: 'time', depthScale: 1,
    gap: { base: '4vh', k: '18vh', exit: '70vh' }, rot: { base: 1, k: 2 },
    timeFall: { dist: '22vh', rot: 6, dur: 0.22 },
    trail: { w: 14, dur: 0.14 }, remove: false, keepClones: false,
    ...opts,
  };
  const layers = o.layers.map((l) => (l.nodeType ? { el: l, depth: 1 } : l));
  let pieces = [];
  let tl = null;
  let state = 'idle'; // idle | prepared | cut
  const api = { fallTl: null, pieces, state: () => state };

  function throughPoint() {
    const th = o.through;
    if (typeof th === 'function') return th();
    if (th && th.nodeType) {
      const r = th.getBoundingClientRect();
      return [r.left + r.width * 0.55, r.top + r.height / 2];
    }
    const r = layers[0].el.getBoundingClientRect();
    const f = th || [0.5, 0.5];
    return [r.left + r.width * f[0], r.top + r.height * f[1]];
  }

  function prepare() {
    if (state !== 'idle') return;
    const vh = window.innerHeight;
    const P = throughPoint();
    const t = [Math.cos(o.angle * RAD), Math.sin(o.angle * RAD)];
    const n = [-t[1], t[0]];
    let t2, n2;
    if (o.second) {
      t2 = [Math.cos(o.second.angle * RAD), Math.sin(o.second.angle * RAD)];
      n2 = [-t2[1], t2[0]];
    }
    api.t = t; api.n = n; api.P = P;
    pieces = [];
    for (const { el, depth } of layers) {
      const parent = el.parentElement;
      if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
      const r = el.getBoundingClientRect();
      const pr = parent.getBoundingClientRect();
      const W = el.offsetWidth || r.width;
      const H = el.offsetHeight || r.height;
      const s = r.width / (W || 1) || 1;
      const left = (r.left - pr.left) / s - parent.clientLeft;
      const top = (r.top - pr.top) / s - parent.clientTop;
      const Pl = [(P[0] - r.left) / s, (P[1] - r.top) / s];
      const box = [[0, 0], [W, 0], [W, H], [0, H]];
      let polys = [
        { poly: clipHalf(box, Pl, n, 1, 0.5), side: 1 },
        { poly: clipHalf(box, Pl, n, -1, 0.5), side: -1 },
      ];
      if (o.second) {
        polys = polys.flatMap((p) => [
          { poly: clipHalf(p.poly, Pl, n2, 1, 0.5), side: p.side },
          { poly: clipHalf(p.poly, Pl, n2, -1, 0.5), side: p.side },
        ]);
      }
      polys = polys.filter((p) => p.poly.length >= 3);
      const z = getComputedStyle(el).zIndex;
      for (const p of polys) {
        const c = centroid(p.poly);
        let dir;
        if (o.second) {
          const dx = c[0] - Pl[0], dy = c[1] - Pl[1];
          const m = Math.hypot(dx, dy) || 1;
          dir = [dx / m, dy / m];
        } else {
          dir = [n[0] * p.side, n[1] * p.side];
        }
        const fall = document.createElement('div');
        fall.className = 'slice-fall';
        fall.setAttribute('aria-hidden', 'true');
        fall.style.cssText = `left:${left}px;top:${top}px;width:${W}px;height:${H}px;visibility:hidden;transform-origin:${c[0].toFixed(1)}px ${c[1].toFixed(1)}px;${z !== 'auto' ? `z-index:${z};` : ''}`;
        const slip = document.createElement('div');
        slip.className = 'slice-slip';
        const clone = el.cloneNode(true);
        stripIds(clone);
        clone.setAttribute('aria-hidden', 'true');
        clone.setAttribute('inert', '');
        clone.classList.add('slice-clone');
        clone.style.width = `${W}px`;
        clone.style.height = `${H}px`;
        clone.style.right = 'auto';
        clone.style.bottom = 'auto';
        clone.style.visibility = 'visible';
        clone.style.opacity = '1';
        const poly = p.poly.map(([x, y]) => `${((x / W) * 100).toFixed(3)}% ${((y / H) * 100).toFixed(3)}%`).join(',');
        clone.style.clipPath = `polygon(${poly})`;
        clone.style.webkitClipPath = clone.style.clipPath;
        for (const img of clone.querySelectorAll('img')) { img.loading = 'eager'; img.decoding = 'sync'; }
        slip.append(clone);
        fall.append(slip);
        el.insertAdjacentElement('afterend', fall);
        pieces.push({ fall, slip, clone, depth, side: p.side, dir, el });
      }
    }
    api.pieces = pieces;
    // trail segment across the union of the layer boxes
    const rects = layers.map((l) => l.el.getBoundingClientRect());
    const ur = {
      left: Math.min(...rects.map((q) => q.left)), top: Math.min(...rects.map((q) => q.top)),
      right: Math.max(...rects.map((q) => q.right)), bottom: Math.max(...rects.map((q) => q.bottom)),
    };
    ur.width = ur.right - ur.left; ur.height = ur.bottom - ur.top;
    const clip = o.trailRect ? o.trailRect() : ur;
    api.seg = lineInRect(clip, P, t);
    if (o.second) api.seg2 = lineInRect(clip, P, t2);
    // scrubbed fall timeline (cover): halves drift apart with depth, then exit
    if (o.fall === 'scrub') {
      const base = px(o.gap.base, vh), k = px(o.gap.k, vh), exit = px(o.gap.exit, vh);
      const ft = G.timeline({ paused: true });
      for (const q of pieces) {
        const d = q.depth * o.depthScale;
        const g1 = base + k * d;
        const r1 = (o.rot.base + o.rot.k * d) * q.side;
        ft.to(q.fall, { x: q.dir[0] * g1, y: q.dir[1] * g1, rotation: r1, ease: 'none', duration: 0.6 }, 0);
        ft.to(q.fall, { x: q.dir[0] * (g1 + exit), y: q.dir[1] * (g1 + exit), rotation: r1 * 2.2, ease: 'power1.in', duration: 0.4 }, 0.6);
      }
      api.fallTl = ft;
    }
    state = 'prepared';
  }

  function show() {
    for (const q of pieces) { q.fall.style.visibility = 'visible'; q.fall.style.willChange = 'transform'; }
    for (const { el } of layers) el.style.visibility = 'hidden';
  }

  function cleanup(final) {
    for (const q of pieces) q.fall.remove();
    pieces = [];
    api.pieces = pieces;
    for (const { el } of layers) el.style.visibility = final && o.remove ? 'hidden' : '';
    state = final ? 'cut' : 'idle';
  }

  api.prepare = prepare;

  api.cut = () => new Promise((resolve) => {
    if (state === 'cut') { resolve(); return; }
    prepare();
    const T = o.trail.dur;
    const hs = o.hitStop / 1000;
    const slipDur = o.slipDur ?? 0.16;
    tl = G.timeline({ onComplete: resolve });
    tl.add(trail(api.seg[0], api.seg[1], o.trail), 0);
    if (o.second) tl.add(trail(api.seg2[0], api.seg2[1], o.trail), (o.second.delay || 120) / 1000);
    const swapAt = o.second ? T + (o.second.delay || 120) / 1000 : T;
    tl.call(() => {
      show();
      o.onSwap?.(api);
    }, null, swapAt);
    const slipTargets = pieces.map((q) => q.slip);
    tl.to(slipTargets, {
      x: (i) => -pieces[i].side * api.t[0] * o.slip,
      y: (i) => -pieces[i].side * api.t[1] * o.slip,
      duration: slipDur, ease: 'power2.out',
    }, swapAt + hs);
    if (o.fall === 'time') {
      const vh = window.innerHeight;
      const dist = px(o.timeFall.dist, vh);
      const fd = o.timeFall.dur;
      tl.to(pieces.map((q) => q.fall), {
        x: (i) => pieces[i].dir[0] * dist * (o.timeFall.spreadX ?? 1),
        y: (i) => pieces[i].dir[1] * dist + (o.timeFall.gravity || 0),
        rotation: (i) => pieces[i].side * o.timeFall.rot * (o.second ? (i % 2 ? 1.6 : -1) : 1),
        opacity: o.timeFall.fade === false ? 1 : 0,
        duration: fd, ease: o.timeFall.ease || 'power2.in',
      }, swapAt + hs + slipDur * 0.6);
      if (!o.keepClones) tl.call(() => cleanup(true), null, swapAt + hs + slipDur * 0.6 + fd + 0.02);
      else tl.call(() => { state = 'cut'; }, null, swapAt + hs + slipDur * 0.6 + fd + 0.02);
    } else {
      tl.call(() => { state = 'cut'; }, null, swapAt + hs + slipDur);
    }
  });

  api.reset = () => {
    tl?.kill();
    tl = null;
    api.fallTl?.kill();
    api.fallTl = null;
    for (const q of pieces) q.fall.remove();
    pieces = [];
    api.pieces = pieces;
    for (const { el } of layers) el.style.visibility = '';
    state = 'idle';
  };

  api.aftermath = () => {
    api.reset();
    for (const { el } of layers) el.style.visibility = o.remove ? 'hidden' : '';
    state = 'cut';
  };

  return api;
}
