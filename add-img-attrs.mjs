// Stamps every <img> with its intrinsic width/height and decoding="async", and marks the
// hero as the LCP candidate. Every image is sized by CSS (width/height 100% inside an
// aspect-ratio box), so the attributes only give the browser the ratio up front — no
// layout change, but no reflow while the file is still in flight either.
import { execFileSync } from 'child_process';
import fs from 'fs';

const HERO = 'images/bogdan-hero.jpg';
const dims = new Map();

const dimsOf = (src) => {
  if (!dims.has(src)) {
    const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', src], { encoding: 'utf8' });
    dims.set(src, {
      w: out.match(/pixelWidth:\s*(\d+)/)[1],
      h: out.match(/pixelHeight:\s*(\d+)/)[1],
    });
  }
  return dims.get(src);
};

for (const file of ['index.html', 'ru.html']) {
  let html = fs.readFileSync(file, 'utf8');
  let touched = 0;

  html = html.replace(/<img\s([^>]*?)>/g, (tag, attrs) => {
    if (/\swidth=/.test(attrs)) return tag;
    const src = attrs.match(/src="([^"]+)"/)?.[1];
    if (!src || !fs.existsSync(src)) return tag;

    const { w, h } = dimsOf(src);
    let extra = ` width="${w}" height="${h}" decoding="async"`;
    // the hero is above the fold on every viewport — never lazy, always first in the queue
    if (src === HERO && !/loading=/.test(attrs)) extra += ' fetchpriority="high"';
    touched++;
    return `<img ${attrs.trim()}${extra}>`;
  });

  fs.writeFileSync(file, html);
  console.log(`${file}: ${touched} <img> updated`);
}
