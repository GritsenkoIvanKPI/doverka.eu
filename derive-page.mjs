// Shared machinery for the standalone pages (/order, /thanks). Each one is DERIVED
// from index.html / ru.html rather than hand-written, so the head, header, footer,
// stylesheet and shared JS can never drift from the main pages. Callers supply only
// what is specific to their page: the stylesheet addition, the <main>, and the tail
// of the inline script.
import fs from 'fs';
import path from 'path';

export const NB = '\u00A0';   // non-breaking space
export const NH = '\u2011';   // non-breaking hyphen

// section anchors that live on the home page
const HOME_SECTIONS = /href="#(services|situations|process|pricing|documents|reviews|about|faq)"/g;

const cut = (html, open, close, replacement) => {
  const a = html.indexOf(open);
  const b = html.indexOf(close, a);
  if (a === -1 || b === -1) throw new Error(`markers not found: ${open}`);
  return html.slice(0, a) + replacement + html.slice(b + close.length);
};

/**
 * @param {object}   o
 * @param {string}   o.src         source page to derive from
 * @param {string}   o.out         path to write
 * @param {string}   o.css         appended just before </style>
 * @param {string}   o.main        replaces <main id="top">…</main>
 * @param {string}   o.js          replaces the script tail from "// reviews:" onward
 * @param {object}   o.langSwitch  { uk, ru } hrefs for the header language switch
 * @param {Array}    [o.rewrite]   extra [pattern, replacement] pairs, applied last
 */
export function derivePage({ src, out, css, main, js, langSwitch, rewrite = [] }) {
  let html = fs.readFileSync(src, 'utf8');

  // --- head: drop what only the home page needs ------------------------------
  html = html.replace(/<!-- Testimonial\.to:[^\n]*\n<script[^>]*testimonial\.to[^>]*><\/script>\n/, '');
  html = html.replace(/<!-- LCP candidate[^\n]*\n<link rel="preload"[^>]*>\n/, '');

  // --- the page lives one level down -----------------------------------------
  html = html.replace(/(src|href)="images\//g, '$1="/images/');

  // --- links that pointed at sections of the home page -----------------------
  html = html.replace(HOME_SECTIONS, 'href="/#$1"');
  html = html.replace(/href="#top"/g, 'href="/"');

  // --- page-specific rewrites (self-links, etc.) -----------------------------
  for (const [pattern, replacement] of rewrite) html = html.replace(pattern, replacement);

  // --- language switch --------------------------------------------------------
  html = html.replace(/href="index\.html"( hreflang="uk")/g, `href="${langSwitch.uk}"$1`);
  html = html.replace(/href="ru\.html"( hreflang="ru")/g, `href="${langSwitch.ru}"$1`);

  // --- stylesheet: inherited sheet plus the page's own rules -----------------
  html = html.replace('</style>', `${css}</style>`);

  // --- body -------------------------------------------------------------------
  html = cut(html, '<main id="top">', '</main>', main);

  // --- script: keep header/menu/reveal, swap the page-specific tail ----------
  html = cut(html, '\n// reviews:', '</script>', `${js}</script>`);

  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  console.log(`${out}  ${Math.round(Buffer.byteLength(html) / 1024)} KB`);
}
