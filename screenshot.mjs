import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotsDir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] ? `-${process.argv[3]}` : '';

// Find next N
const existing = fs.readdirSync(screenshotsDir)
  .map(f => { const m = f.match(/^screenshot-(\d+)/); return m ? parseInt(m[1]) : 0; });
const n = existing.length ? Math.max(...existing) + 1 : 1;
const filename = `screenshot-${n}${label}.png`;
const outPath = path.join(screenshotsDir, filename);

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

// Chrome tiles (and silently duplicates content in) full-page captures taller than
// 16384 device px. Drop the scale factor rather than ship a corrupted screenshot.
const LIMIT = 16384;
const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
let scale = 1.5;
while (pageHeight * scale > LIMIT && scale > 0.5) scale -= 0.25;
if (scale !== 1.5) {
  console.log(`page is ${pageHeight}px tall — deviceScaleFactor lowered to ${scale} to stay under ${LIMIT}px`);
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: scale });
}
await new Promise(r => setTimeout(r, 1200));
// Force lazy images to load for the capture. Scrolling past them is unreliable —
// Chrome needs time at each stop to start the fetch — so flip them to eager and
// await decode() instead. This only affects the screenshot, not the page.
await page.evaluate(async () => {
  document.querySelectorAll('img[loading="lazy"]').forEach(i => { i.loading = 'eager'; });
  await Promise.all([...document.images].map(i =>
    Promise.race([i.decode().catch(() => {}), new Promise(r => setTimeout(r, 5000))])));
});
await new Promise(r => setTimeout(r, 300));
// Trigger all reveal animations
await page.evaluate(() => {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
});
await new Promise(r => setTimeout(r, 1500));
await page.screenshot({ path: outPath, fullPage: true });
await browser.close();

console.log(`Saved: ${outPath}`);
