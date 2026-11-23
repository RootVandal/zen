/* RU <-> EN. Russian is the HTML itself; English comes from data/en.js.
   On the first switch the Russian strings are cached from the DOM. */
import { EN } from '../data/en.js?v=77de92fa';
import { env, $$, store } from './env.js?v=77de92fa';

const h = document.documentElement;
const RU = new Map();
const RU_ATTR = new Map();
const listeners = [];
let cached = false;
const ruMeta = { title: document.title, desc: document.querySelector('meta[name="description"]')?.content };

function cacheRu() {
  if (cached) return;
  for (const el of $$('[data-i18n]')) RU.set(el, el.innerHTML);
  for (const el of $$('[data-i18n-attr]')) {
    const m = {};
    for (const pair of el.dataset.i18nAttr.split(';')) {
      const [attr] = pair.split(':');
      m[attr] = el.getAttribute(attr);
    }
    RU_ATTR.set(el, m);
  }
  cached = true;
}

export function t(key) {
  if (env.lang === 'en' && EN[key] != null) return EN[key];
  const el = document.querySelector(`[data-i18n="${key}"]`);
  return el ? (RU.get(el) ?? el.textContent) : key;
}

export function textOf(key) {
  const d = document.createElement('div');
  d.innerHTML = t(key);
  return d.textContent;
}

function apply(lang) {
  cacheRu();
  for (const el of $$('[data-i18n]')) {
    if (el.closest('.slice-clone')) continue;
    const k = el.dataset.i18n;
    const v = lang === 'en' ? EN[k] : RU.get(el);
    if (v != null && el.innerHTML !== v) el.innerHTML = v;
  }
  for (const el of $$('[data-i18n-attr]')) {
    for (const pair of el.dataset.i18nAttr.split(';')) {
      const [attr, k] = pair.split(':');
      const v = lang === 'en' ? EN[k] : RU_ATTR.get(el)?.[attr];
      if (v != null) el.setAttribute(attr, v);
    }
  }
  for (const a of $$('[data-href-en]')) a.href = lang === 'en' ? a.dataset.hrefEn : a.dataset.hrefRu;
  document.title = lang === 'en' ? EN['meta.title'] : ruMeta.title;
  const md = document.querySelector('meta[name="description"]');
  if (md) md.content = lang === 'en' ? EN['meta.desc'] : ruMeta.desc;
  for (const b of $$('.lang button')) b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
}

export function setLang(lang, { save = true } = {}) {
  lang = lang === 'en' ? 'en' : 'ru';
  const changed = h.lang !== lang || !cached;
  h.lang = lang;
  apply(lang);
  if (save) {
    store('local', 'axk-lang', lang);
    try {
      const u = new URL(location.href);
      if (lang === 'en') u.searchParams.set('lang', 'en'); else u.searchParams.delete('lang');
      history.replaceState(history.state, '', u);
    } catch (e) {}
  }
  if (changed) for (const fn of listeners) fn(lang);
}

export function onLang(fn) { listeners.push(fn); }

export function initI18n() {
  cacheRu();
  if (env.lang === 'en') apply('en');
  for (const b of $$('.lang button')) b.addEventListener('click', () => setLang(b.dataset.lang));
}
