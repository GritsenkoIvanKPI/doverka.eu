// Re-encodes the photography for the web: the document scans were 2–3 MB PNGs and the
// generated JPEGs were saved at near-lossless quality, together ~13 MB on a single page.
// Runs off macOS `sips`; safe to re-run (already-optimised files simply shrink no further).
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const DIR = 'images';
const KB = n => `${Math.round(n / 1024)} KB`;

// documents: portrait scans, downscaled — they render in a 3-up gallery, never full size
const DOCS = { maxDim: 1400, quality: 84 };
// photography: quality nudged up on the two frames that contain a face
const FACES = new Set(['bogdan-hero.jpg', 'bogdan-portrait.jpg']);

let before = 0, after = 0;

for (const file of fs.readdirSync(DIR).sort()) {
  const src = path.join(DIR, file);
  if (!fs.statSync(src).isFile()) continue;
  if (!/\.(png|jpe?g)$/i.test(file)) continue;
  if (file.startsWith('og-cover')) continue;          // freshly generated at the right size

  const isDoc = /^doc-\d+\.png$/i.test(file);
  const out = isDoc ? path.join(DIR, file.replace(/\.png$/i, '.jpg')) : src;
  const quality = isDoc ? DOCS.quality : FACES.has(file) ? 85 : 82;

  const size0 = fs.statSync(src).size;
  const args = ['-s', 'format', 'jpeg', '-s', 'formatOptions', String(quality)];
  if (isDoc) args.push('-Z', String(DOCS.maxDim));
  args.push(src, '--out', out);
  execFileSync('sips', args, { stdio: 'ignore' });
  if (isDoc) fs.unlinkSync(src);

  const size1 = fs.statSync(out).size;
  before += size0; after += size1;
  console.log(`${file.padEnd(26)} ${KB(size0).padStart(8)} -> ${KB(size1).padStart(8)}${isDoc ? `  (${path.basename(out)})` : ''}`);
}

console.log(`\ntotal  ${KB(before)} -> ${KB(after)}  (-${Math.round((1 - after / before) * 100)}%)`);
