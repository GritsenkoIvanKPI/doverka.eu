// node seo-audit.mjs http://localhost:3000
// Checks what a crawler and a social-share unfurler actually see on both pages:
// title/description, canonical, hreflang reciprocity, Open Graph, Twitter, icons,
// JSON-LD validity, alt text, and that every referenced asset really resolves.
import puppeteer from 'puppeteer';

const base = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');
const PAGES = [
  { path: '/index.html' },
  { path: '/ru.html' },
  { path: '/order' },
  { path: '/order/ru.html' },
  // confirmation pages: must be noindex and must stay out of the sitemap
  { path: '/thanks', noindex: true },
  { path: '/thanks/ru.html', noindex: true },
];
const FILES = ['/robots.txt', '/sitemap.xml', '/site.webmanifest', '/favicon.ico', '/favicon.svg',
               '/apple-touch-icon.png', '/icon-192.png', '/icon-512.png', '/icon-maskable-512.png'];

let problems = 0;
const fail = (where, msg) => { problems++; console.log(`  ✗ ${where}: ${msg}`); };
const ok = msg => console.log(`  ✓ ${msg}`);

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();

// production URLs live on the real origin — map them back to the server under test
const local = url => url.replace(/^https:\/\/doverka\.eu/, base).replace(/^\//, `${base}/`);
const reachable = async (url) => {
  try {
    const r = await page.evaluate(u => fetch(u, { method: 'GET' }).then(r => r.status), local(url));
    return r === 200;
  } catch { return false; }
};

console.log(`\nSEO audit — ${base}`);

for (const { path, noindex } of PAGES) {
  console.log(`\n${path}`);
  await page.goto(base + path, { waitUntil: 'domcontentloaded' });

  const meta = await page.evaluate(() => {
    const one = sel => document.querySelector(sel);
    const attr = (sel, a = 'content') => one(sel)?.getAttribute(a) ?? null;
    return {
      lang: document.documentElement.lang,
      title: document.title,
      description: attr('meta[name="description"]'),
      canonical: attr('link[rel="canonical"]', 'href'),
      robots: attr('meta[name="robots"]'),
      themeColor: attr('meta[name="theme-color"]'),
      hreflang: [...document.querySelectorAll('link[rel="alternate"][hreflang]')]
        .map(l => [l.hreflang, l.href]),
      og: Object.fromEntries([...document.querySelectorAll('meta[property^="og:"]')]
        .map(m => [m.getAttribute('property'), m.content])),
      tw: Object.fromEntries([...document.querySelectorAll('meta[name^="twitter:"]')]
        .map(m => [m.getAttribute('name'), m.content])),
      icons: [...document.querySelectorAll('link[rel*="icon"], link[rel="manifest"]')]
        .map(l => [l.getAttribute('rel'), l.getAttribute('href')]),
      ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => s.textContent),
      h1: [...document.querySelectorAll('h1')].map(h => h.textContent.trim()),
      imgs: [...document.images].map(i => ({
        src: i.getAttribute('src'),
        alt: i.getAttribute('alt'),
        sized: i.hasAttribute('width') && i.hasAttribute('height'),
        decorative: !!i.closest('[aria-hidden="true"]'),
      })),
    };
  });

  if (!meta.lang) fail('html', 'no lang attribute'); else ok(`lang="${meta.lang}"`);

  if (!meta.title) fail('title', 'missing');
  else if (meta.title.length > 65) fail('title', `${meta.title.length} chars — Google truncates past ~60`);
  else ok(`title (${meta.title.length} chars)`);

  if (!meta.description) fail('description', 'missing');
  else if (meta.description.length < 70 || meta.description.length > 165)
    fail('description', `${meta.description.length} chars — aim for 70–160`);
  else ok(`description (${meta.description.length} chars)`);

  if (!meta.canonical) fail('canonical', 'missing');
  else if (!/^https?:\/\//.test(meta.canonical)) fail('canonical', 'must be absolute');
  else ok(`canonical ${meta.canonical}`);

  if (!meta.robots) fail('robots', 'missing');
  else if (noindex && !/\bnoindex\b/.test(meta.robots)) fail('robots', `must be noindex, got "${meta.robots}"`);
  else if (!noindex && /\bnoindex\b/.test(meta.robots)) fail('robots', 'unexpectedly noindex');
  else ok(`robots "${meta.robots}"`);
  if (!meta.themeColor) fail('theme-color', 'missing'); else ok(`theme-color ${meta.themeColor}`);

  // hreflang: every page must list every language, itself included, absolutely
  const langs = meta.hreflang.map(([l]) => l);
  for (const need of ['uk', 'ru', 'x-default']) {
    if (!langs.includes(need)) fail('hreflang', `no "${need}" entry`);
  }
  if (meta.hreflang.some(([, href]) => !/^https?:\/\//.test(href)))
    fail('hreflang', 'relative href — Google needs fully-qualified URLs');
  const self = meta.hreflang.find(([, href]) => href.replace(base, 'https://doverka.eu') === meta.canonical);
  if (!self) fail('hreflang', `no self-reference matching canonical ${meta.canonical} — cluster is wrong`);
  else ok(`hreflang: ${langs.join(', ')} (self: ${self[0]})`);

  for (const key of ['og:type', 'og:title', 'og:description', 'og:url', 'og:image',
                     'og:image:width', 'og:image:height', 'og:image:alt', 'og:site_name', 'og:locale']) {
    if (!meta.og[key]) fail('open graph', `${key} missing`);
  }
  if (meta.og['og:image']) {
    if (!/^https?:\/\//.test(meta.og['og:image'])) fail('open graph', 'og:image must be absolute');
    else if (!await reachable(meta.og['og:image'])) fail('open graph', `og:image 404 — ${meta.og['og:image']}`);
    else ok(`og:image ${meta.og['og:image'].split('/').pop()} ${meta.og['og:image:width']}x${meta.og['og:image:height']}`);
    // the client asked for the brand card, not the portrait
    if (/bogdan|photo|portrait|hero/i.test(meta.og['og:image']))
      fail('open graph', 'og:image looks like the portrait — shares must show the logo card');
  }
  if (meta.tw['twitter:card'] !== 'summary_large_image')
    fail('twitter', `card is "${meta.tw['twitter:card']}" — expected summary_large_image`);
  else ok('twitter:card summary_large_image');

  for (const rel of ['icon', 'apple-touch-icon', 'manifest']) {
    if (!meta.icons.some(([r]) => r.includes(rel))) fail('icons', `no rel="${rel}"`);
  }
  ok(`icons: ${meta.icons.map(([r]) => r).join(', ')}`);

  if (!meta.ld.length) fail('json-ld', 'no structured data');
  for (const raw of meta.ld) {
    try {
      const data = JSON.parse(raw);
      const types = (data['@graph'] || [data]).map(n => [].concat(n['@type']).join('/'));
      ok(`json-ld: ${types.join(', ')}`);
    } catch (e) { fail('json-ld', `invalid JSON — ${e.message}`); }
  }

  if (meta.h1.length !== 1) fail('headings', `${meta.h1.length} <h1> elements — expected exactly 1`);
  else ok(`single h1: "${meta.h1[0].slice(0, 46)}…"`);

  const noAlt = meta.imgs.filter(i => i.alt === null || (i.alt === '' && !i.decorative));
  if (noAlt.length) fail('images', `${noAlt.length} without alt: ${noAlt.map(i => i.src).join(', ')}`);
  else ok(`alt text on all ${meta.imgs.length} images`);

  const unsized = meta.imgs.filter(i => !i.sized);
  if (unsized.length) fail('images', `${unsized.length} without width/height (CLS risk)`);
  else ok('width/height on all images');
}

console.log('\nsite files');
for (const f of FILES) {
  if (await reachable(f)) ok(f); else fail('files', `${f} not reachable`);
}

// robots must point at a sitemap that actually lists both pages
await page.goto(`${base}/robots.txt`, { waitUntil: 'domcontentloaded' });
const robots = await page.evaluate(() => document.body.innerText);
if (!/^Sitemap:\s*https?:\/\//mi.test(robots)) fail('robots.txt', 'no absolute Sitemap: line');
else ok('robots.txt declares a sitemap');

await page.goto(`${base}/sitemap.xml`, { waitUntil: 'domcontentloaded' });
const sitemap = await page.evaluate(() => document.documentElement.textContent);
for (const loc of ['doverka.eu/', 'doverka.eu/ru.html', 'doverka.eu/order', 'doverka.eu/order/ru.html']) {
  if (!sitemap.includes(loc)) fail('sitemap.xml', `missing ${loc}`);
}
ok('sitemap lists every indexable page');

// a noindex page in the sitemap is a contradictory signal to crawlers
for (const loc of ['doverka.eu/thanks']) {
  if (sitemap.includes(loc)) fail('sitemap.xml', `${loc} is noindex and must not be listed`);
}
ok('sitemap omits the noindex pages');

await browser.close();
console.log(`\nTOTAL ${problems}\n`);
process.exit(problems ? 1 : 0);
