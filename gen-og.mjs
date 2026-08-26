// Renders the 1200x630 social-share cards. Deliberately brand-only: the logo lockup,
// never the lawyer's portrait — that is what shows up when the link is pasted anywhere.
import puppeteer from 'puppeteer';
import fs from 'fs';

const CARDS = [
  {
    file: 'images/og-cover.jpg',
    lang: 'uk',
    line1: 'Нотаріальні документи для України',
    h1size: 70,
    accent: 'онлайн, з апостилем',
    sub: 'Швеція та країни ЄС · Підготовка · Онлайн‑підписання · Апостиль · Доставка',
    eyebrow: 'Український адвокат у Швеції',
  },
  {
    file: 'images/og-cover-ru.jpg',
    lang: 'ru',
    line1: 'Нотариальные документы для Украины',
    h1size: 62,
    accent: 'онлайн, с апостилем',
    sub: 'Швеция и страны ЕС · Подготовка · Онлайн‑подписание · Апостиль · Доставка',
    eyebrow: 'Украинский адвокат в Швеции',
  },
  {
    file: 'images/og-order.jpg',
    lang: 'uk',
    line1: 'Замовити документ',
    h1size: 70,
    accent: 'з апостилем',
    sub: 'Коротка форма · Відповідь у день звернення · Точна ціна та строк одразу',
    eyebrow: 'Замовлення онлайн',
  },
  {
    file: 'images/og-order-ru.jpg',
    lang: 'ru',
    line1: 'Заказать документ',
    h1size: 70,
    accent: 'с апостилем',
    sub: 'Короткая форма · Ответ в день обращения · Точная цена и срок сразу',
    eyebrow: 'Заказ онлайн',
  },
];

const MARK = (size, op = 1) => `
<svg viewBox="0 0 64 64" width="${size}" height="${size}" style="opacity:${op}">
  <circle cx="32" cy="32" r="21.5" fill="none" stroke="#ffffff" stroke-width="2.6"/>
  <circle cx="32" cy="32" r="15" fill="none" stroke="#f0d42a" stroke-width="2" stroke-dasharray="3.4 4" stroke-linecap="round"/>
  <path d="M23.6 32.6l5.9 6.1 11.1-12.2" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const html = (c) => `<!doctype html><html lang="${c.lang}"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  *,*::before,*::after{ box-sizing:border-box; }
  html,body{ margin:0; padding:0; }
  body{ width:1200px; height:630px; overflow:hidden;
    font-family:"Plus Jakarta Sans", -apple-system, sans-serif;
    -webkit-font-smoothing:antialiased; }
  .card{ position:relative; width:1200px; height:630px; padding:72px 88px 74px;
    display:flex; flex-direction:column;
    background:
      radial-gradient(900px 620px at 12% -10%, #2d5d99 0%, rgba(45,93,153,0) 62%),
      radial-gradient(760px 560px at 108% 118%, rgba(240,212,42,.16) 0%, rgba(240,212,42,0) 60%),
      linear-gradient(148deg, #1f477b 0%, #173863 52%, #122c4e 100%);
    color:#fff; overflow:hidden; }
  /* grain — keeps the flat gradient from banding in Telegram/Facebook recompression */
  .card::after{ content:""; position:absolute; inset:0; pointer-events:none; opacity:.055;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/></filter><rect width='160' height='160' filter='url(%23n)'/></svg>"); }
  .watermark{ position:absolute; right:-150px; bottom:-170px; opacity:.075; }
  .row{ position:relative; z-index:1; }
  .lockup{ display:flex; align-items:center; gap:22px; }
  .lockup__text{ font-size:58px; font-weight:600; letter-spacing:-.035em; line-height:1; }
  .lockup__text span{ font-weight:400; opacity:.45; }
  .eyebrow{ margin-left:auto; font-family:"Oswald","Plus Jakarta Sans",sans-serif;
    font-size:19px; font-weight:400; letter-spacing:.14em; text-transform:uppercase;
    color:rgba(255,255,255,.66); display:flex; align-items:center; gap:12px; }
  .eyebrow::before{ content:""; width:26px; height:1px; background:rgba(255,255,255,.34); }
  .eyebrow i{ width:7px; height:7px; border-radius:50%; background:#f0d42a; display:block; font-style:normal; }
  .body{ flex:1; display:flex; flex-direction:column; justify-content:center; }
  h1{ margin:0; font-family:"Oswald","Plus Jakarta Sans",sans-serif; font-weight:500;
    font-size:${c.h1size}px; line-height:1.08; letter-spacing:0; }
  h1 em{ font-style:normal; color:#f0d42a; }
  .rule{ width:76px; height:4px; border-radius:2px; background:#f0d42a; margin:0 0 34px; }
  .sub{ margin:34px 0 0; font-size:23px; line-height:1.5; color:rgba(255,255,255,.74);
    font-weight:400; max-width:900px; }
  .foot{ position:relative; z-index:1; display:flex; align-items:center; gap:16px;
    padding-top:34px; border-top:1px solid rgba(255,255,255,.13);
    font-size:21px; font-weight:500; color:rgba(255,255,255,.86); }
  .foot span:not(.dot){ white-space:nowrap; }
  .dot{ width:5px; height:5px; border-radius:50%; background:rgba(255,255,255,.32); }
</style></head><body>
<div class="card">
  <div class="watermark">${MARK(560)}</div>

  <div class="row lockup">
    ${MARK(64)}
    <span class="lockup__text">doverka<span>.eu</span></span>
    <span class="eyebrow"><i></i>${c.eyebrow}</span>
  </div>

  <div class="row body">
    <div class="rule"></div>
    <h1>${c.line1}<br><em>${c.accent}</em></h1>
    <p class="sub">${c.sub}</p>
  </div>

  <div class="foot">
    <span>Stockholm</span><span class="dot"></span>
    <span>doverka.eu</span><span class="dot"></span>
    <span>+46&nbsp;73&nbsp;678&nbsp;45&nbsp;46</span>
  </div>
</div>
</body></html>`;

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });

for (const c of CARDS) {
  await page.setContent(html(c), { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 900));
  await page.screenshot({ path: c.file, type: 'jpeg', quality: 90 });
  console.log(`${c.file}  ${Math.round(fs.statSync(c.file).size / 1024)} KB`);
}

await browser.close();
