import puppeteer from 'puppeteer';
const url = process.argv[2] || 'http://localhost:3000';
const width = Number(process.argv[3] || 390);
const outDir = process.argv[4];
const browser = await puppeteer.launch({ headless:true, args:['--no-sandbox','--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width, height: 900, deviceScaleFactor: 1.5 });
await page.goto(url, { waitUntil:'networkidle2', timeout:60000 });
await page.evaluate(async () => {
  document.querySelectorAll('img[loading="lazy"]').forEach(i => { i.loading='eager'; });
  await Promise.all([...document.images].map(i => Promise.race([i.decode().catch(()=>{}), new Promise(r=>setTimeout(r,5000))])));
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
});
await new Promise(r=>setTimeout(r,1500));
const h = await page.evaluate(() => document.documentElement.scrollHeight);
const CH = 1600;
let i = 0;
for (let y = 0; y < h; y += CH, i++) {
  await page.screenshot({ path: `${outDir}/m-${String(i).padStart(2,'0')}.png`, clip: { x:0, y, width, height: Math.min(CH, h-y) } });
}
await browser.close();
console.log('chunks', i, 'height', h);
