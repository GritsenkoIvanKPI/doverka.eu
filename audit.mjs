import puppeteer from 'puppeteer';
const url = process.argv[2] || 'http://localhost:3000';
const width = Number(process.argv[3] || 1440);
const browser = await puppeteer.launch({ headless:true, args:['--no-sandbox','--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil:'networkidle2', timeout:60000 });
await page.evaluate(() => document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible')));
await new Promise(r=>setTimeout(r,800));

const issues = await page.evaluate(() => {
  const out = [];
  const isBlock = el => {
    const d = getComputedStyle(el).display;
    return /^(block|flex|grid|list-item|table|table-cell|flow-root)/.test(d);
  };
  const blockOf = node => {
    let el = node.parentElement;
    while (el && !isBlock(el)) el = el.parentElement;
    return el;
  };

  // group every visible text node under its nearest block ancestor, so a line
  // split across <strong>/<span> is still measured as one line
  const groups = new Map();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const n = walker.currentNode;
    const p = n.parentElement;
    if (!p) continue;
    const tag = p.tagName.toLowerCase();
    if (tag === 'script' || tag === 'style') continue;
    if (!n.nodeValue.trim()) continue;
    if (p.checkVisibility && !p.checkVisibility({ visibilityProperty: true, opacityProperty: true })) continue;
    // .form-trap is the spam honeypot, parked off-screen — no person ever reads it
    if (p.closest('.mobile-menu') || p.closest('.form-trap')) continue;
    const b = blockOf(n);
    if (!b) continue;
    if (!groups.has(b)) groups.set(b, []);
    groups.get(b).push(n);
  }

  for (const [block, nodes] of groups) {
    const lines = [];
    let cur = null;
    const r = document.createRange();
    for (const n of nodes) {
      const text = n.nodeValue;
      for (let i = 0; i < text.length; i++) {
        r.setStart(n, i); r.setEnd(n, i + 1);
        const rect = r.getClientRects()[0];
        if (!rect) { if (cur) cur.s += text[i]; continue; }
        const top = Math.round(rect.top);
        if (!cur || Math.abs(cur.top - top) > 4) { cur = { top, s: text[i] }; lines.push(cur); }
        else cur.s += text[i];
      }
    }
    if (lines.length < 2) continue;
    const path = block.tagName.toLowerCase() +
      (typeof block.className === 'string' && block.className.trim()
        ? '.' + block.className.trim().split(/\s+/).join('.') : '');
    lines.forEach((ln, idx) => {
      const s = ln.s.replace(/\u00a0/g, ' ').trim();
      if (!s) return;
      const words = s.split(/\s+/).filter(Boolean);
      const last = words[words.length - 1];
      const isLast = idx === lines.length - 1;
      if (!isLast && /^[\u0400-\u04FFa-zA-Z]$/.test(last))
        out.push({ type: 'hanging-letter', path, line: s });
      if (!isLast && /[\u2014\u2013-]$/.test(last))
        out.push({ type: 'hanging-dash', path, line: s });
      if (words.length === 1 && lines.length > 1)
        out.push({ type: 'single-word-line', path, line: s, ctx: lines.map(l => l.s).join('').replace(/\s+/g, ' ').trim().slice(0, 70) });
    });
  }
  return out;
});
await browser.close();
console.log(JSON.stringify(issues, null, 1));
console.log('TOTAL', issues.length);
