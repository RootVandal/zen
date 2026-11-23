/* Sakura petals on a canvas 2D layer, drawn as cartoon cels: flat pink with an ink outline.
   Each petal is pre-rendered once into a sprite; per frame we only drawImage with a transform.
   API: const p = createPetals(canvas, opts); p.burst(x, y, n); p.setWind(v); p.destroy(); */

const TAU = Math.PI * 2;

function petalSprite(size, fill, shade, blur) {
  const c = document.createElement('canvas');
  const s = Math.ceil(size * 2.6);
  c.width = c.height = s;
  const g = c.getContext('2d');
  g.translate(s / 2, s / 2);
  if (blur) g.filter = `blur(${blur}px)`;
  const w = size * 0.62, h = size;
  const path = () => {
    g.beginPath();
    g.moveTo(0, h * 0.55);
    g.bezierCurveTo(-w * 1.05, h * 0.25, -w * 0.95, -h * 0.55, -w * 0.18, -h * 0.62);
    g.lineTo(0, -h * 0.42);
    g.lineTo(w * 0.18, -h * 0.62);
    g.bezierCurveTo(w * 0.95, -h * 0.55, w * 1.05, h * 0.25, 0, h * 0.55);
    g.closePath();
  };
  const grad = g.createLinearGradient(0, -h * 0.6, 0, h * 0.55);
  grad.addColorStop(0, fill);
  grad.addColorStop(1, shade);
  path();
  g.fillStyle = grad;
  g.fill();
  return c;
}

export function createPetals(canvas, opts = {}) {
  const ctx = canvas.getContext('2d');
  const reduce = opts.reduce || false;
  const palette = opts.palette || [
    ['#FFD3DF', '#FF8FB1'],
    ['#FFC2D3', '#E86A8E'],
    ['#FFFFFF', '#FFC2D3'],
    ['#FF8FB1', '#C9435F'],
  ];
  const sprites = [];
  for (const [f, sh] of palette) {
    sprites.push({ img: petalSprite(8, f, sh, 0.6), z: 8 });
    sprites.push({ img: petalSprite(12, f, sh, 0), z: 12 });
    sprites.push({ img: petalSprite(22, f, sh, 2.2), z: 22 });
  }

  let W = 0, H = 0, dpr = 1, raf = 0, running = false, last = 0;
  let wind = 0, windTarget = 0, scrollV = 0;
  const petals = [];

  function density() {
    const area = (W * H) / (1440 * 900);
    const base = opts.count ?? 46;
    return Math.round(Math.min(base, Math.max(14, base * area)) * (reduce ? 0.25 : 1));
  }

  function spawn(p, anywhere) {
    const sp = sprites[(Math.random() * sprites.length) | 0];
    p.img = sp.img;
    p.size = sp.z;
    p.x = Math.random() * (W + 200) - 100;
    p.y = anywhere ? Math.random() * H : -40 - Math.random() * 120;
    p.vy = 22 + Math.random() * 38 + sp.z * 1.6; // bigger petals fall faster (closer)
    p.vx = -10 + Math.random() * 20;
    p.rot = Math.random() * TAU;
    p.vr = (-1 + Math.random() * 2) * 1.6;
    p.flip = Math.random() * TAU;
    p.vf = 1.5 + Math.random() * 2.5;
    p.sway = Math.random() * TAU;
    p.life = 1;
    p.burst = false;
    return p;
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, opts.maxDpr || 1.75);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    const n = density();
    while (petals.length < n) petals.push(spawn({}, true));
    petals.length = Math.min(petals.length, n + 60);
  }

  function frame(t) {
    raf = running ? requestAnimationFrame(frame) : 0;
    const dt = Math.min(0.05, (t - (last || t)) / 1000);
    last = t;
    wind += (windTarget - wind) * Math.min(1, dt * 1.5);
    scrollV *= Math.pow(0.04, dt);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const n = density();
    for (let i = petals.length - 1; i >= 0; i--) {
      const p = petals[i];
      p.sway += dt * 1.3;
      p.x += (p.vx + wind * (0.5 + p.size / 22) + Math.sin(p.sway) * 18) * dt;
      p.y += (p.vy - scrollV * 0.35 * (p.size / 22)) * dt;
      p.rot += p.vr * dt;
      p.flip += p.vf * dt;
      if (p.burst) {
        p.vx *= Math.pow(0.25, dt);
        p.vy += 160 * dt;
        p.vy = Math.min(p.vy, 140);
        p.life -= dt * 0.25;
      }
      const out = p.y > H + 50 || p.x < -140 || p.x > W + 140 || p.life <= 0 || p.y < -400;
      if (out) {
        if (p.burst || petals.length > n) { petals.splice(i, 1); continue; }
        spawn(p, false);
      }
      const sx = Math.cos(p.flip);
      ctx.setTransform(dpr * Math.cos(p.rot) * sx, dpr * Math.sin(p.rot) * sx, -dpr * Math.sin(p.rot), dpr * Math.cos(p.rot), p.x * dpr, p.y * dpr);
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
      const s = p.img.width;
      ctx.drawImage(p.img, -s / 2, -s / 2);
    }
    ctx.globalAlpha = 1;
  }

  function start() {
    if (running) return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();
  const io = new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden ? start() : stop()));
  io.observe(canvas);
  const vis = () => (document.hidden ? stop() : start());
  document.addEventListener('visibilitychange', vis);

  return {
    burst(x, y, count = 24, power = 1) {
      if (reduce) count = Math.ceil(count / 4);
      for (let k = 0; k < count; k++) {
        const p = spawn({}, false);
        const a = Math.random() * TAU;
        const v = (120 + Math.random() * 380) * power;
        p.x = x; p.y = y;
        p.vx = Math.cos(a) * v;
        p.vy = Math.sin(a) * v - 120 * power;
        p.vr *= 4;
        p.burst = true;
        petals.push(p);
      }
    },
    setWind(v) { windTarget = v; },
    scroll(v) { scrollV = Math.max(-2500, Math.min(2500, v)); },
    start, stop,
    destroy() { stop(); ro.disconnect(); io.disconnect(); document.removeEventListener('visibilitychange', vis); },
  };
}
