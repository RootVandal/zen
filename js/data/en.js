/* English dictionary. Russian lives in index.html; work, price, step and FAQ
   texts come from js/data.js so both languages stay in one place. */
import { LINKS, PRICES, HONESTY, WORKS, STEPS, FAQ, CODE } from '../data.js';

const fill = (s) => s.replaceAll('{request}', LINKS.request.en).replaceAll('{telegram}', LINKS.telegram);

export const EN = {
  'meta.title': 'ZEN — websites people remember · Portfolio',
  'meta.desc': 'ZEN is a website studio in Almaty. Landing page 12,000 KZT, 3D website from 30,000 KZT, business website from 40,000 KZT. We take projects from Kazakhstan, the CIS and around the world.',
  skip: 'Skip to content',
  'hdr.home': 'ZEN — back to the start',
  'hdr.toc': 'Contents',
  'hdr.sound': 'Sound',
  'hdr.tg': 'Message on Telegram',
  'hdr.sections': 'Sections',
  'toc.about': 'Who we are',
  'toc.works': 'Works',
  'toc.prices': 'Prices',
  'toc.process': 'How we work',
  'toc.faq': 'Questions',
  'toc.contacts': 'Contacts',
  'toc.p': 'p.',
  'toc.cover': 'Prologue',
  'toc.finale': 'Finale',
  calm: 'Calm mode',
  'calm.sys': 'Calm mode · set by your system',
  'cursor.open': 'Open ↗',
  'cover.spine': 'Vol. 1 · Almaty · Website studio',
  'cover.vol': 'Vol. 1',
  'cover.h1': 'We build <span class="cut-anchor">websites</span> people remember.',
  'cover.h1plain': 'We build websites people remember.',
  'cover.lead': 'We take projects from Kazakhstan, the CIS and around the world.',
  'cover.kicker': 'Website studio · Almaty',
  'cover.hint': 'Scroll',
  'cover.prices': 'Landing page — 12,000&nbsp;KZT · 3D website — from 30,000&nbsp;KZT · business website — from 40,000&nbsp;KZT',
  'tag.aria': 'Prices: from 12,000 KZT',
  'tag.from': 'from',
  'tag.num': '12,000',
  'tag.cur': 'KZT',
  'contents.k': 'Volume one',
  'code.k': 'The studio code',
  'code.lead': 'ZEN is a website studio in Almaty. We take projects from Kazakhstan, the CIS and around the world.',
  'prices.k': 'Three blades and a special order',
  'process.k': 'The way of the blade',
  'faq.k': 'Questions and answers',
  'cta.tg': 'Message on Telegram',
  'cta.works': 'See the works',
  'cta.request': 'Send a request',
  'sticker.aria': 'Prices: from 12,000 KZT',
  'sticker.from': 'from',
  'sticker.num': '12,000',
  'sticker.cur': 'KZT',
  'contents.h': 'Contents',
  'contents.foot': 'Volume 1 · 8 works · 4 plans',
  'about.p1': 'Axioma is a website studio in Almaty.',
  'about.p2': 'Kazakhstan · CIS · worldwide',
  'about.p3': 'We take projects from Kazakhstan, the CIS and around the world.',
  'about.p4': 'Landing pages, 3D websites, business websites and complex projects, from 12,000&nbsp;KZT.',
  'about.p4link': 'See prices →',
  'works.big': '6 live websites',
  'works.sub': 'Our own project, demos and concepts for different businesses. Open any of them and look around.',
  'work.label': 'Work',
  'work.open': 'Open site',
  'work.full': 'Full page',
  'prices.line': 'A website from 12,000&nbsp;KZT',
  'prices.note': 'Dollar and ruble prices are approximate, at the National Bank of Kazakhstan rate of 4 November 2026 (1 USD = 453.26 KZT, 1 RUB = 5.58 KZT). Payment and the exact amount are agreed when you order.',
  'prices.all': 'All prices ↗',
  'p.example': 'Example:',
  'p.examples': 'Examples:',
  'p.order': 'Order',
  'p.discuss': 'Discuss on Telegram',
  'step.label': 'Step',
  'faq.you': 'YOU',
  'faq.us': 'US',
  'duel.h': 'Finale',
  'duel.tpl': 'TEMPLATE',
  'duel.a': 'The website people forget.',
  'duel.b': '…',
  'back.line': 'The next chapter is your website.',
  'back.tbc': 'To be continued',
  'foot.h': 'Credits',
  'foot.vol': 'Volume one',
  'foot.volv': '“Websites people remember”',
  'foot.studio': 'Studio',
  'foot.studiov': 'ZEN, Almaty',
  'foot.works': 'Works',
  'foot.geo': 'Reach',
  'foot.geov': 'Kazakhstan · CIS · worldwide',
  'foot.prices': 'All prices',
  'foot.site': 'Studio website',
  'foot.copy': '© 2026 ZEN — website studio, Almaty.',
  'foot.top': 'Back to top ↑',
  'sheet.close': 'Close',
  'tier.landing': 'Landing page · 12,000 KZT',
  'tier.3d': '3D website · from 30,000 KZT',
  'tier.business': 'Business website · from 40,000 KZT',
  'tier.complex': 'Complex project · price agreed individually',
};

for (const [k, v] of Object.entries(HONESTY)) EN[`hon.${k}`] = v.en;
for (const w of WORKS) {
  EN[`w.${w.key}.kind`] = w.kind.en;
  EN[`w.${w.key}.desc`] = w.desc.en;
  EN[`w.${w.key}.alt`] = `First screen of the ${w.title} website`;
  EN[`w.${w.key}.open`] = `Open the ${w.title} website in a new tab`;
}
for (const p of PRICES) {
  EN[`p.${p.id}.name`] = p.name.en;
  if (p.complex) {
    EN[`p.${p.id}.sum`] = p.priceText.en;
    EN[`p.${p.id}.lead`] = p.lead.en;
  } else {
    EN[`p.${p.id}.sum`] = `${p.from ? '<span class="price__from">from</span> ' : ''}<span class="price__num">${p.price.en}</span>&nbsp;<span class="cur">KZT</span>`;
    EN[`p.${p.id}.approx`] = p.approx.en;
    p.items.en.forEach((t, i) => { EN[`p.${p.id}.i${i}`] = t; });
  }
}
STEPS.forEach((s, i) => { EN[`s.${i + 1}`] = fill(s.en); });
CODE.forEach((c, i) => { EN[`c.${i + 1}.k`] = c.k.en; EN[`c.${i + 1}.h`] = c.h.en; EN[`c.${i + 1}.t`] = c.t.en; });
FAQ.forEach((f, i) => { EN[`f.${i + 1}.q`] = f.q.en; EN[`f.${i + 1}.a`] = fill(f.a.en); });
