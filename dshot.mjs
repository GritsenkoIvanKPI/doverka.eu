import puppeteer from 'puppeteer';
const b = await puppeteer.launch({ headless:true, args:['--no-sandbox'] });
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 950, deviceScaleFactor: 2 });
await p.goto('http://localhost:3000', { waitUntil:'networkidle2' });
await p.evaluate(async () => {
  document.querySelectorAll('img[loading="lazy"]').forEach(i => { i.loading='eager'; });
  document.querySelectorAll('.reveal').forEach(e => e.classList.add('visible'));
  await Promise.all([...document.images].map(i => Promise.race([i.decode().catch(()=>{}), new Promise(r=>setTimeout(r,6000))])));
});
await new Promise(r => setTimeout(r, 800));
const box = await p.evaluate(() => {
  const el = document.querySelector('#documents'); const r = el.getBoundingClientRect();
  return { x: 0, y: Math.max(0, r.top + window.scrollY + 60), width: innerWidth, height: 1150 };
});
await p.screenshot({ path: '/private/tmp/claude-501/-Users-ivan-Downloads--------------------------/9e27b261-f13c-4631-aeef-d4354d950ffe/scratchpad/docs-orig.png', clip: box });
console.log(await p.evaluate(() => [...document.querySelectorAll('.doc__media img')].map(i => `${i.getAttribute('src')} ${i.naturalWidth}x${i.naturalHeight}`)));
await b.close();
