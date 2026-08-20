import puppeteer from 'puppeteer';

const url = process.argv[2] || 'http://localhost:3000';
const width = Number(process.argv[3] || 390);
const openMenu = process.argv[4] === 'menu';

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width, height: 800, deviceScaleFactor: 1, isMobile: width < 900, hasTouch: width < 900 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
await page.evaluate(async () => {
  document.querySelectorAll('img[loading="lazy"]').forEach(i => { i.loading = 'eager'; });
  await Promise.all([...document.images].map(i => Promise.race([i.decode().catch(() => {}), new Promise(r => setTimeout(r, 4000))])));
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
});
if (openMenu) await page.evaluate(() => document.getElementById('burger').click());
await new Promise(r => setTimeout(r, 900));

const report = await page.evaluate((vw) => {
  const issues = [];
  const label = el => {
    const cls = (typeof el.className === 'string' && el.className.trim())
      ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : '';
    const txt = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40);
    return `${el.tagName.toLowerCase()}${cls}${txt ? ` "${txt}"` : ''}`;
  };
  const visible = el => {
    if (el.checkVisibility && !el.checkVisibility({ visibilityProperty: true, opacityProperty: true })) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  // intentionally wider-than-viewport marquee tracks
  const inMarquee = el => !!el.closest('.tagcloud');
  // elements inside a horizontally scrollable row are meant to extend past the edge
  const inScroller = el => {
    for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
      const ox = getComputedStyle(n).overflowX;
      if (ox === 'auto' || ox === 'scroll') return true;
    }
    return false;
  };

  // 1. page-level horizontal scroll
  const docW = document.documentElement.scrollWidth;
  if (docW > vw + 1) issues.push({ type: 'page-h-scroll', detail: `scrollWidth ${docW} > viewport ${vw}` });

  const all = [...document.body.querySelectorAll('*')];

  for (const el of all) {
    if (!visible(el) || inMarquee(el) || inScroller(el)) continue;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();

    // 2. element sticking out of the viewport
    if (cs.position !== 'fixed' && (r.right > vw + 1 || r.left < -1) && el.tagName !== 'HTML') {
      const parent = el.parentElement;
      const pr = parent ? parent.getBoundingClientRect() : null;
      // report only the outermost offender
      if (!pr || (pr.right <= vw + 1 && pr.left >= -1))
        issues.push({ type: 'overflows-viewport', el: label(el), rect: `${Math.round(r.left)}..${Math.round(r.right)}` });
    }

    // 3. content clipped inside an overflow:hidden box
    if (/hidden|clip/.test(cs.overflowX) && el.scrollWidth > el.clientWidth + 2)
      issues.push({ type: 'clipped-x', el: label(el), detail: `${el.scrollWidth} > ${el.clientWidth}` });
    if (/hidden|clip/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 2 && el.clientHeight > 0)
      issues.push({ type: 'clipped-y', el: label(el), detail: `${el.scrollHeight} > ${el.clientHeight}` });

    // 4. child wider than a non-scrolling parent
    if (el.parentElement && cs.position === 'static') {
      const p = el.parentElement;
      const pcs = getComputedStyle(p);
      if (pcs.overflowX === 'visible' && p.tagName !== 'BODY') {
        const pr = p.getBoundingClientRect();
        const pad = parseFloat(pcs.paddingRight) || 0;
        if (r.right > pr.right - pad + 2 && pr.width > 0 && pcs.display !== 'flex' && pcs.display !== 'grid')
          issues.push({ type: 'overflows-parent', el: label(el), parent: label(p) });
      }
    }
  }

  // 5. broken images
  for (const img of document.images)
    if (img.naturalWidth === 0) issues.push({ type: 'broken-image', el: img.getAttribute('src') });

  // 6. tap targets that are too small
  for (const el of document.querySelectorAll('a.btn, button, .chip, .mcta-ic, .float a, .burger, .faq__q, input, select')) {
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.height < 40 || r.width < 40)
      issues.push({ type: 'small-tap-target', el: label(el), size: `${Math.round(r.width)}x${Math.round(r.height)}` });
  }

  // 7. fixed overlays covering page content at rest
  const cta = document.querySelector('.mobile-cta');
  if (cta && visible(cta)) {
    const cr = cta.getBoundingClientRect();
    // scrolled to the very bottom the footer must not sit under the bar
    window.scrollTo(0, document.body.scrollHeight);
    const covered = [...document.querySelectorAll('.footer__bar, .footer__nav a, .form-card .btn')]
      .filter(el => { const r = el.getBoundingClientRect(); return r.bottom > cr.top && r.top < cr.bottom; })
      .map(label);
    if (covered.length) issues.push({ type: 'covered-by-sticky-cta', el: covered.join(' | ') });
    window.scrollTo(0, 0);
  }

  // 8. header overlapping hero content at rest
  const header = document.querySelector('.header');
  if (header) {
    const hr = header.getBoundingClientRect();
    const h1 = document.querySelector('.hero h1');
    if (h1) {
      const r = h1.getBoundingClientRect();
      if (r.top < hr.bottom) issues.push({ type: 'header-overlaps-hero', detail: `h1 top ${Math.round(r.top)} < header bottom ${Math.round(hr.bottom)}` });
    }
  }
  return issues;
}, width);

await browser.close();
const seen = new Set();
const uniq = report.filter(i => { const k = JSON.stringify(i); if (seen.has(k)) return false; seen.add(k); return true; });
uniq.forEach(i => console.log(JSON.stringify(i)));
console.log('TOTAL', uniq.length);
