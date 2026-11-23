/* Small effects shared by every scene: SFX lettering, impact frames,
   shake, ink particles and the optional synthesized sound. */
import { env } from '../core/env.js';

const gsap = () => window.gsap;

/* ======================= Kanji flash and seal stamps ======================= */
/* A brush kanji flashes over the cut, like a title card in a samurai film. */
export function kanjiFlash(host, ch, { x = '50%', y = '50%', size = 260, hold = 0.35 } = {}) {
  if (!host || env.calm) return null;
  const G = gsap();
  const el = document.createElement('span');
  el.className = 'kflash';
  el.setAttribute('aria-hidden', 'true');
  el.textContent = ch;
  el.style.left = typeof x === 'number' ? `${x}px` : x;
  el.style.top = typeof y === 'number' ? `${y}px` : y;
  el.style.fontSize = typeof size === 'number' ? `${env.phone ? size * 0.62 : size}px` : size;
  host.append(el);
  G.timeline({ onComplete: () => el.remove() })
    .fromTo(el, { opacity: 0, scale: 1.35, xPercent: -50, yPercent: -50, rotation: -4 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.16, ease: 'expo.out' })
    .to(el, { opacity: 0, scale: 0.96, duration: 0.5, ease: 'power2.in' }, 0.16 + hold);
  return el;
}

/* A red hanko seal stamps onto a corner. stay: it remains. */
export function stamp(host, text, { cls = '', delay = 0, rot = -6 } = {}) {
  if (!host) return null;
  const G = gsap();
  const el = document.createElement('span');
  el.className = `seal ${cls}`;
  el.setAttribute('aria-hidden', 'true');
  el.textContent = text;
  host.append(el);
  if (G && !env.calm) {
    G.fromTo(el, { opacity: 0, scale: 1.8, rotation: rot - 10 }, { opacity: 1, scale: 1, rotation: rot, duration: 0.22, ease: 'back.out(2.2)', delay });
  } else {
    el.style.transform = `rotate(${rot}deg)`;
  }
  return el;
}

/* kept for the language switch hook */
export function refreshSfx() {}

/* ======================= Impact frame ======================= */
const flashTimes = [];

/* A short white flash over one section (never the full page). */
export function impact(host, point, kind = 'white') {
  if (env.calm || !host) return;
  const now = performance.now();
  while (flashTimes.length && now - flashTimes[0] > 1000) flashTimes.shift();
  if (flashTimes.length >= 3) return;
  flashTimes.push(now);
  const G = gsap();
  let ov = host.querySelector(':scope > .impact');
  if (!ov) {
    ov = document.createElement('div');
    ov.className = 'impact';
    ov.setAttribute('aria-hidden', 'true');
    host.append(ov);
  }
  if (kind === 'impact') {
    G.set(ov, { opacity: 0.7 });
    G.to(ov, { opacity: 0, duration: 0.28, ease: 'power2.out', delay: 0.05 });
  } else {
    G.fromTo(ov, { opacity: 0 }, { opacity: 0.32, duration: 0.05, yoyo: true, repeat: 1, ease: 'none' });
  }
}

export function shake(el, amp = 4) {
  if (env.calm || env.phone || !el) return;
  const G = gsap();
  G.fromTo(el, { x: -amp }, { x: amp, duration: 0.025, repeat: 5, yoyo: true, ease: 'none', onComplete: () => G.set(el, { x: 0 }) });
}

/* ======================= Particles ======================= */
/* points: viewport coords along which particles spawn. */
export function burst(host, { points, count = 40, colors = ['#0B0A0C'], life = 0.9, gravity = 900, speed = [160, 520], size = [2, 7], dots = false } = {}) {
  if (env.calm || !host || !points?.length) return;
  if (env.phone) count = Math.ceil(count / 2);
  const r = host.getBoundingClientRect();
  const cv = document.createElement('canvas');
  const dpr = Math.min(window.devicePixelRatio || 1, env.phone ? 1.25 : 1.5);
  cv.width = Math.round(r.width * dpr);
  cv.height = Math.round(r.height * dpr);
  cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:46';
  cv.setAttribute('aria-hidden', 'true');
  host.append(cv);
  const ctx = cv.getContext('2d');
  const ps = [];
  for (let i = 0; i < count; i++) {
    const p = points[(Math.random() * points.length) | 0];
    const a = Math.random() * Math.PI * 2;
    const v = speed[0] + Math.random() * (speed[1] - speed[0]);
    ps.push({
      x: p[0] - r.left, y: p[1] - r.top,
      vx: Math.cos(a) * v, vy: Math.sin(a) * v - v * 0.4,
      s: size[0] + Math.random() * (size[1] - size[0]),
      c: colors[(Math.random() * colors.length) | 0],
      l: life * (0.6 + Math.random() * 0.4),
    });
  }
  let last = performance.now();
  const step = (t) => {
    const dt = Math.min(0.05, (t - last) / 1000);
    last = t;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    let alive = 0;
    for (const p of ps) {
      p.l -= dt;
      if (p.l <= 0) continue;
      alive++;
      p.vy += gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      ctx.globalAlpha = Math.min(1, p.l * 3);
      ctx.fillStyle = p.c;
      ctx.beginPath();
      if (dots) ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
      else ctx.ellipse(p.x, p.y, p.s * 1.3, p.s * 0.8, Math.atan2(p.vy, p.vx), 0, Math.PI * 2);
      ctx.fill();
    }
    if (alive) requestAnimationFrame(step);
    else cv.remove();
  };
  requestAnimationFrame(step);
}

/* ======================= Sound (off by default) ======================= */
let ac = null, master = null, noise = null, soundOn = false;
try { soundOn = sessionStorage.getItem('axk-sound') === '1'; } catch (e) {}

function ensureAudio() {
  if (ac) return ac;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ac = new AC();
  const comp = ac.createDynamicsCompressor();
  master = ac.createGain();
  master.gain.value = 0.3;
  master.connect(comp).connect(ac.destination);
  noise = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return ac;
}

export const sound = {
  get on() { return soundOn; },
  set(on) {
    soundOn = on;
    try { sessionStorage.setItem('axk-sound', on ? '1' : '0'); } catch (e) {}
    if (on) { ensureAudio(); ac?.resume(); }
  },
  play(name) {
    if (!soundOn || env.calm) return;
    if (!ensureAudio()) return;
    const t = ac.currentTime;
    const src = (dur, f, q) => {
      const s = ac.createBufferSource();
      s.buffer = noise;
      const bp = ac.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = f;
      bp.Q.value = q;
      const g = ac.createGain();
      s.connect(bp).connect(g).connect(master);
      s.start(t);
      s.stop(t + dur + 0.05);
      return { bp, g };
    };
    if (name === 'swish') {
      const { bp, g } = src(0.2, 4000, 1.2);
      bp.frequency.setValueAtTime(4000, t);
      bp.frequency.exponentialRampToValueAtTime(800, t + 0.18);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(1, t + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.19);
    } else if (name === 'clap') {
      const { g } = src(0.04, 2200, 8);
      g.gain.setValueAtTime(1.4, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
    } else if (name === 'chin') {
      for (const f of [2900, 4100]) {
        const o = ac.createOscillator();
        const g = ac.createGain();
        o.type = 'sine';
        o.frequency.value = f;
        g.gain.setValueAtTime(0.5, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12 + (f > 3000 ? 0.05 : 0));
        o.connect(g).connect(master);
        o.start(t);
        o.stop(t + 0.2);
      }
      const { g } = src(0.008, 6000, 2);
      g.gain.setValueAtTime(0.6, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.01);
    } else if (name === 'thud') {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.frequency.setValueAtTime(90, t);
      o.frequency.exponentialRampToValueAtTime(50, t + 0.16);
      g.gain.setValueAtTime(1, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      o.connect(g).connect(master);
      o.start(t);
      o.stop(t + 0.2);
    }
  },
};
