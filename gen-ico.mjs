// Packs the 16/32/48 PNGs into a multi-size favicon.ico (PNG-in-ICO — read by every
// browser; the legacy /favicon.ico path is still requested by crawlers and RSS readers).
import fs from 'fs';

const sources = ['favicon-16.png', 'favicon-32.png', 'favicon-48.png'];
const images = sources.map(f => ({ size: Number(f.match(/\d+/)[0]), data: fs.readFileSync(f) }));

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);            // reserved
header.writeUInt16LE(1, 2);            // type: icon
header.writeUInt16LE(images.length, 4);

let offset = 6 + images.length * 16;
const entries = images.map(img => {
  const e = Buffer.alloc(16);
  e.writeUInt8(img.size === 256 ? 0 : img.size, 0);
  e.writeUInt8(img.size === 256 ? 0 : img.size, 1);
  e.writeUInt8(0, 2);                  // palette colours
  e.writeUInt8(0, 3);                  // reserved
  e.writeUInt16LE(1, 4);               // colour planes
  e.writeUInt16LE(32, 6);              // bits per pixel
  e.writeUInt32LE(img.data.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += img.data.length;
  return e;
});

fs.writeFileSync('favicon.ico', Buffer.concat([header, ...entries, ...images.map(i => i.data)]));
console.log(`favicon.ico  ${fs.statSync('favicon.ico').size} B  (${images.map(i => i.size).join(', ')})`);
