import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const ROOT = '/Users/ivan/Downloads/Клод сайти/Богдан адвокат';

// mark artwork on a 64 grid — `detail` adds the dashed inner ring (illegible under ~48px)
const mark = ({ rx = 14, detail = true, scale = 1, bleed = false } = {}) => `
  <rect width="64" height="64" rx="${rx}" fill="#1f477b"/>
  <g transform="translate(32 32) scale(${scale}) translate(-32 -32)">
    <circle cx="32" cy="32" r="21${detail ? '.5' : ''}" fill="none" stroke="#ffffff" stroke-width="${detail ? 2.6 : 3.4}"/>
    ${detail ? '<circle cx="32" cy="32" r="15" fill="none" stroke="#f0d42a" stroke-width="2" stroke-dasharray="3.4 4" stroke-linecap="round" opacity=".9"/>' : ''}
    <path d="${detail ? 'M23.6 32.6l5.9 6.1 11.1-12.2' : 'M22.4 32.8l6.6 6.8 12.4-13.6'}" fill="none" stroke="${detail ? '#ffffff' : '#f0d42a'}" stroke-width="${detail ? 3.6 : 4.6}" stroke-linecap="round" stroke-linejoin="round"/>
  </g>`;

const svg = (inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">${inner}</svg>`;

const TARGETS = [
  { file: 'favicon-16.png',        size: 16,  art: mark({ rx: 10, detail: false }) },
  { file: 'favicon-32.png',        size: 32,  art: mark({ rx: 12, detail: false }) },
  { file: 'favicon-48.png',        size: 48,  art: mark({ rx: 12, detail: false }) },
  { file: 'apple-touch-icon.png',  size: 180, art: mark({ rx: 0 }) },            // iOS masks the corners itself
  { file: 'icon-192.png',          size: 192, art: mark({ rx: 14 }) },
  { file: 'icon-512.png',          size: 512, art: mark({ rx: 14 }) },
  { file: 'icon-maskable-512.png', size: 512, art: mark({ rx: 0, scale: 0.72 }) }, // 80% safe zone
];

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();

for (const t of TARGETS) {
  await page.setViewport({ width: t.size, height: t.size, deviceScaleFactor: 1 });
  await page.setContent(
    `<style>html,body{margin:0;padding:0;background:transparent}svg{width:${t.size}px;height:${t.size}px;display:block}</style>${svg(t.art)}`,
    { waitUntil: 'load' }
  );
  const out = path.join(ROOT, t.file);
  await page.screenshot({ path: out, omitBackground: true });
  console.log(`${t.file}  ${t.size}x${t.size}  ${fs.statSync(out).size} B`);
}

await browser.close();
