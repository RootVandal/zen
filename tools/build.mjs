// Fills the generated blocks of index.html from js/data.js and art/*.svg.
// Run after editing content or art:   node tools/build.mjs
// The site itself needs no build: the output is committed.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { LINKS, PRICES, HONESTY, WORKS, STEPS, FAQ, CODE } = await import(pathToFileURL(join(root, 'js/data.js')));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fill = (s, lang) => s.replaceAll('{request}', LINKS.request[lang]).replaceAll('{telegram}', LINKS.telegram);
const nb = (s) => s.replace(/(\d) (\d)/g, '$1&nbsp;$2').replace(/(^|[\s(«])(в|во|о|об|на|с|со|к|и|а|из|от|до|по|за|для|не)\s/giu, '$1$2&nbsp;');
const tierRu = {
  landing: 'Лендинг · 12&nbsp;000&nbsp;₸',
  '3d': '3D-сайт · от 30&nbsp;000&nbsp;₸',
  business: 'Бизнес-сайт · от 40&nbsp;000&nbsp;₸',
  complex: 'Сложный проект · цена обсуждается',
};
const byKey = Object.fromEntries(WORKS.map((w) => [w.key, w]));
const KANJI_N = ['一', '二', '三', '四', '五', '六', '七', '八'];

function works() {
  return WORKS.map((w, i) => {
    const nn = String(i + 1).padStart(2, '0');
    const side = i % 2 ? 'work--flip' : '';
    const hon = w.honesty
      ? `\n          <li><span class="chip chip--${w.honesty}" data-i18n="hon.${w.honesty}">${esc(HONESTY[w.honesty].ru)}</span></li>`
      : '';
    const cutAttrs = w.cut.type === 'ink'
      ? `data-cut="ink" data-angle="${w.cut.angle}"`
      : `data-cut="noren"`;
    return `
  <article class="work ${side}" id="work-${w.key}" data-key="${w.key}" ${cutAttrs} aria-labelledby="w-${w.key}-h">
    <div class="work__stage">
      <div class="work__art">
        <a class="bframe" href="${w.url}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true" data-cursor-label>
          <span class="bframe__bar"><i></i><i></i><i></i><span class="bframe__url">${esc(w.host)}</span></span>
          <span class="bframe__view"><img class="bframe__shot" src="assets/shots/${w.key}.webp" width="1280" height="800" alt="Первый экран сайта ${esc(w.title)}" data-i18n-attr="alt:w.${w.key}.alt" loading="lazy" decoding="async"></span>
        </a>
        <span class="pframe" aria-hidden="true"><img src="assets/shots/${w.key}-m.webp" width="450" height="973" alt="" loading="lazy" decoding="async"></span>
      </div>
      <div class="work__text">
        <p class="work__num"><span data-i18n="work.label">Работа</span> ${nn}&thinsp;/&thinsp;${String(WORKS.length).padStart(2, '0')}</p>
        <h3 class="work__title" id="w-${w.key}-h">${esc(w.title)}</h3>
        <p class="work__kind" data-i18n="w.${w.key}.kind">${esc(w.kind.ru)}</p>
        <p class="work__desc" data-i18n="w.${w.key}.desc">${nb(esc(w.desc.ru))}</p>
        <ul class="chips">
          <li><a class="chip chip--tier" href="#price-${w.tier}" data-i18n="tier.${w.tier}">${tierRu[w.tier]}</a></li>${hon}
        </ul>
        <div class="work__btns">
          <a class="btn btn--red" href="${w.url}" target="_blank" rel="noopener" aria-label="Открыть сайт ${esc(w.title)} в новой вкладке" data-i18n-attr="aria-label:w.${w.key}.open"><span class="face"><span data-i18n="work.open">Открыть сайт</span> <span aria-hidden="true">↗</span></span></a>
          ${w.tour === false ? '' : `<button class="btn btn--ghost work__full" type="button" data-full="${w.key}"><span class="face" data-i18n="work.full">Вся страница</span></button>`}
        </div>
      </div>
    </div>
  </article>`;
  }).join('\n');
}

function prices() {
  return PRICES.map((p) => {
    const ex = p.examples.map((k) => `<a href="#work-${k}">${esc(byKey[k].title)}</a>`).join(', ');
    const exLabel = p.examples.length > 1 ? 'p.examples' : 'p.example';
    const exRu = p.examples.length > 1 ? 'Примеры:' : 'Пример:';
    const items = (p.items?.ru || []).map((t, i) =>
      `<li><span data-i18n="p.${p.id}.i${i}">${nb(esc(t))}</span></li>`).join('');
    const sum = p.complex
      ? `<p class="price__sum price__sum--text" data-i18n="p.${p.id}.sum">${esc(p.priceText.ru)}</p>
          <p class="price__approx" data-i18n="p.${p.id}.lead">${nb(esc(p.lead.ru))}</p>`
      : `<p class="price__sum" data-i18n="p.${p.id}.sum">${p.from ? '<span class="price__from">от</span> ' : ''}<span class="price__num">${nb(p.price.ru)}</span>&nbsp;<span class="cur">₸</span></p>
          <p class="price__approx" data-i18n="p.${p.id}.approx">${nb(p.approx.ru)}</p>`;
    const cta = p.complex
      ? `<a class="btn btn--red price__cta" href="${LINKS.telegram}" target="_blank" rel="noopener"><span class="face" data-i18n="p.discuss">Обсудить в Telegram</span></a>
        <a class="price__alt" href="${LINKS.request.ru}" data-href-ru="${LINKS.request.ru}" data-href-en="${LINKS.request.en}" target="_blank" rel="noopener" data-i18n="cta.request">Оставить заявку</a>`
      : `<a class="btn btn--red price__cta" href="${LINKS.request.ru}" target="_blank" rel="noopener" data-href-ru="${LINKS.request.ru}" data-href-en="${LINKS.request.en}"><span class="face" data-i18n="p.order">Заказать</span></a>`;
    return `
    <article class="price${p.complex ? ' price--ink' : ''}" id="price-${p.id}" aria-labelledby="p-${p.id}-h">
      <div class="price__face">
        <div class="price__blade" aria-hidden="true" style="--len:${p.blade}"><svg viewBox="0 0 1200 120"><use href="#katana"/></svg></div>
        <h3 class="price__name" id="p-${p.id}-h" data-i18n="p.${p.id}.name">${esc(p.name.ru)}</h3>
        ${sum}
        ${items ? `<ul class="price__list">${items}</ul>` : ''}
        <p class="price__ex"><span data-i18n="${exLabel}">${exRu}</span> ${ex}</p>
        ${cta}
      </div>
    </article>`;
  }).join('\n');
}

function steps() {
  return STEPS.map((st, i) => `
      <li class="step" id="step-${i + 1}">
        <span class="step__num" aria-hidden="true">0${i + 1}</span>
        <div class="step__text">
          <p class="step__label"><span data-i18n="step.label">Шаг</span> ${i + 1}</p>
          <p class="step__line" data-i18n="s.${i + 1}">${nb(fill(st.ru, 'ru'))}</p>
        </div>
      </li>`).join('');
}

function code() {
  return CODE.map((c, i) => `
      <article class="code__item">
        <span class="code__k" aria-hidden="true">0${i + 1}</span>
        <p class="code__label" data-i18n="c.${i + 1}.k">${esc(c.k.ru)}</p>
        <h3 class="code__h" data-i18n="c.${i + 1}.h">${esc(c.h.ru)}</h3>
        <p class="code__t" data-i18n="c.${i + 1}.t">${nb(esc(c.t.ru))}</p>
      </article>`).join('');
}

function faq() {
  return FAQ.map((f, i) => `
      <details class="qa">
        <summary><span class="qa__n" aria-hidden="true">0${i + 1}</span><span class="qa__q" data-i18n="f.${i + 1}.q">${esc(f.q.ru)}</span><span class="qa__plus" aria-hidden="true"></span></summary>
        <div class="qa__a"><p data-i18n="f.${i + 1}.a">${nb(fill(f.a.ru, 'ru'))}</p></div>
      </details>`).join('');
}

function sprite() {
  const dir = join(root, 'art');
  if (!existsSync(dir)) return '';
  const parts = [];
  for (const f of readdirSync(dir).filter((n) => n.endsWith('.svg')).sort()) {
    let s = readFileSync(join(dir, f), 'utf8');
    s = s.replace(/<\?xml[^>]*>/g, '').replace(/<!--[\s\S]*?-->/g, '');
    const inner = s.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
    // the ink ridges ship as assets/ridges*.webp: cheaper to clone and cut than the vector
    const cleaned = inner.replace(/<symbol id="ridges"[\s\S]*?<\/symbol>/, '');
    parts.push(`<!-- ${f} -->\n${cleaned.trim()}`);
  }
  return `<svg class="sprite" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">\n${parts.join('\n')}\n</svg>`;
}

const html = join(root, 'index.html');
let page = readFileSync(html, 'utf8');
const blocks = { works, prices, steps, faq, code, sprite };
for (const [name, fn] of Object.entries(blocks)) {
  const re = new RegExp(`(<!-- GEN:${name} -->)[\\s\\S]*?(<!-- /GEN:${name} -->)`);
  if (!re.test(page)) { console.warn('marker missing:', name); continue; }
  page = page.replace(re, (_, a, b) => `${a}${fn()}\n${b}`);
}
writeFileSync(html, page);
console.log('index.html updated');

// cache busting: one version for all css/js, so browsers never mix old and new files
{
  const { createHash } = await import('node:crypto');
  const files = ['css/tokens.css', 'css/base.css', 'css/sections.css', 'js/main.js', 'js/data.js', 'js/data/en.js',
    'js/core/env.js', 'js/core/i18n.js', 'js/fx/fx.js', 'js/fx/slice.js', 'js/fx/petals.js', 'js/ui/ui.js',
    'js/scenes/cover.js', 'js/scenes/works.js', 'js/scenes/rest.js'];
  const strip = (s) => s.replace(/\?v=[0-9a-f]+/g, '');
  const hash = createHash('sha1');
  for (const f of files) hash.update(strip(readFileSync(join(root, f), 'utf8')));
  const v = hash.digest('hex').slice(0, 8);
  for (const f of files.filter((f) => f.endsWith('.js'))) {
    const p = join(root, f);
    const s = readFileSync(p, 'utf8');
    const out = strip(s).replace(/(from\s+'\.{1,2}\/[^']+\.js)'/g, `$1?v=${v}'`).replace(/(import\('\.{1,2}\/[^']+\.js)'/g, `$1?v=${v}'`);
    if (out !== s) writeFileSync(p, out);
  }
  let pg = readFileSync(html, 'utf8');
  pg = strip(pg).replace(/(href="css\/[\w-]+\.css)"/g, `$1?v=${v}"`).replace(/(src="js\/main\.js)"/, `$1?v=${v}"`);
  writeFileSync(html, pg);
  console.log('version', v);
}
