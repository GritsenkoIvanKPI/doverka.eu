// Assembles deploy/ — exactly the files that belong in public_html, and nothing else.
// The asset list is verified against what the built pages actually reference, so a new
// image or icon cannot be left behind. Everything else in the repo (dev tooling, the
// briefs, the unredacted originals in documents/) deliberately stays out: anything
// uploaded is publicly readable at doverka.eu/<name>.
import fs from 'fs';
import path from 'path';

const OUT = 'deploy';

const PAGES = ['index.html', 'ru.html', 'order/index.html', 'order/ru.html',
               'thanks/index.html', 'thanks/ru.html'];

// served as-is, referenced from the head or the manifest rather than the body
const ROOT_FILES = [
  'send-form.php',
  'favicon.ico', 'favicon.svg', 'apple-touch-icon.png',
  'icon-192.png', 'icon-512.png', 'icon-maskable-512.png',
  'site.webmanifest', 'robots.txt', 'sitemap.xml',
];

// never leaves the machine: unredacted scans, retired art, build inputs
const EXCLUDE_DIRS = ['images/_unused', 'documents'];

fs.rmSync(OUT, { recursive: true, force: true });

const copy = (src, dest) => {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
};

let count = 0, bytes = 0;
const add = (rel) => {
  if (!fs.existsSync(rel)) throw new Error(`missing: ${rel}`);
  copy(rel, path.join(OUT, rel));
  count++; bytes += fs.statSync(rel).size;
};

for (const p of [...PAGES, ...ROOT_FILES]) add(p);

// images/, minus the excluded folders
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (EXCLUDE_DIRS.some(x => rel === x || rel.startsWith(x + path.sep))) continue;
    if (entry.isDirectory()) walk(rel);
    else add(rel);
  }
};
walk('images');

// --- verify: every local asset the pages ask for is in the bundle ---------------
const shipped = new Set();
const collect = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.join(dir, e.name);
    e.isDirectory() ? collect(rel) : shipped.add(path.relative(OUT, rel));
  }
};
collect(OUT);

const missing = new Set();
for (const page of PAGES) {
  const html = fs.readFileSync(page, 'utf8');
  for (const m of html.matchAll(/(?:src|href)="(\/[^":]+?\.[a-z0-9]{2,5})"/gi)) {
    const asset = m[1].replace(/^\//, '');
    if (!shipped.has(asset) && !asset.endsWith('.html')) missing.add(`${page} -> /${asset}`);
  }
}

console.log(`${OUT}/  ${count} files, ${(bytes / 1024 / 1024).toFixed(1)} MB`);
if (missing.size) {
  console.log('\nreferenced but NOT bundled:');
  for (const m of missing) console.log('  ' + m);
  process.exit(1);
}
console.log('every referenced asset is present');
console.log('\nstill to create by hand on the server: public_html/config.php');
