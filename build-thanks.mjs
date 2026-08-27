// Generates thanks/index.html and thanks/ru.html — the post-submit confirmation page
// Tally redirects to. Derived from the main pages via derive-page.mjs; run
// build-seo.mjs afterwards to stamp the metadata (this page is noindex).
import { derivePage, NB } from './derive-page.mjs';

const PAGES = [
  {
    out: 'thanks/index.html',
    src: 'index.html',
    langSwitch: { uk: '/thanks', ru: '/thanks/ru.html' },
    copy: {
      eyebrow: 'Заявку прийнято',
      h1: `Дякую! Ваш запит відправлено`,
      lead: `Я ознайомлюся з${NB}деталями вашої справи і${NB}звʼяжуся з${NB}вами якомога скоріше.`,
      paras: [
        `Якщо у${NB}вас термінове питання —${NB}зателефонуйте, і${NB}ми все обговоримо.`,
        `Також ви${NB}можете ознайомитися з${NB}іншими моїми послугами.`,
      ],
      signoff: `Бажаю гарного дня!`,
      artCaption: `Заявка${NB}у${NB}роботі`,
      ctaPrimary: 'На головну',
      ctaSecondary: 'Наші послуги',
      contactsTitle: `Термінове питання?`,
      hours: `Відповідаємо щодня <span class="nowrap">з 9:00 до 20:00</span>.`,
    },
  },
  {
    out: 'thanks/ru.html',
    src: 'ru.html',
    langSwitch: { uk: '/thanks', ru: '/thanks/ru.html' },
    copy: {
      eyebrow: 'Заявка принята',
      h1: `Спасибо! Ваш запрос отправлен`,
      lead: `Я ознакомлюсь с${NB}деталями вашего дела и${NB}свяжусь с${NB}вами как можно скорее.`,
      paras: [
        `Если у${NB}вас срочный вопрос —${NB}позвоните, и${NB}мы всё обсудим.`,
        `Также вы${NB}можете ознакомиться с${NB}другими моими услугами.`,
      ],
      signoff: `Хорошего вам дня!`,
      artCaption: `Заявка${NB}в${NB}работе`,
      ctaPrimary: 'На главную',
      ctaSecondary: 'Наши услуги',
      contactsTitle: `Срочный вопрос?`,
      hours: `Отвечаем ежедневно <span class="nowrap">с 9:00 до 20:00</span>.`,
    },
  },
];

const ARROW = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3.5 8h9M8.5 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const CSS = `
/* ============================================================
   THANK-YOU PAGE
   ============================================================ */
.thanks{ padding-top:170px; padding-bottom:var(--section); }
@media (max-width:991px){ .thanks{ padding-top:140px; } }
@media (max-width:767px){ .thanks{ padding-top:124px; } }

.thanks__head{ display:flex; flex-direction:column; align-items:center; gap:20px;
  text-align:center; margin-bottom:48px; }
.thanks__head h1{ font-size:clamp(28px,4.6vw,54px); max-width:26ch; }
.thanks__rule{ width:64px; height:3px; border-radius:2px; background:var(--yellow); }
@media (max-width:767px){ .thanks__head{ margin-bottom:44px; } }

.thanks__grid{ display:grid; grid-template-columns:1.1fr .9fr; gap:48px; align-items:center; }
@media (max-width:900px){ .thanks__grid{ grid-template-columns:1fr; gap:36px; } }

.thanks__body{ display:flex; flex-direction:column; gap:22px; min-width:0; }
.thanks__body .lead{ overflow-wrap:break-word; font-size:clamp(18px,2vw,22px); line-height:1.55; color:var(--title);
  font-weight:500; letter-spacing:-.02em; text-wrap:balance; }
.thanks__body p{ margin:0; }
.thanks__signoff{ font-weight:600; color:var(--title); }
.thanks__cta{ display:flex; gap:14px; flex-wrap:wrap; margin-top:8px; }

/* confirmation seal — the logo mark at scale, no photography needed */
.thanks__art{ background:var(--secondary); border:1px solid var(--secondary-deep);
  border-radius:var(--r-lg); aspect-ratio:4/3; display:grid; place-items:center;
  gap:22px; align-content:center; padding:40px; text-align:center; min-width:0; }
@media (max-width:900px){ .thanks__art{ aspect-ratio:16/10; } }
.thanks__seal{ width:min(190px,52%); height:auto; color:var(--primary); }
.thanks__art figcaption{ font-family:var(--display); font-size:15px; font-weight:500;
  letter-spacing:.14em; text-transform:uppercase; color:var(--primary); }

.thanks__foot{ margin-top:56px; padding-top:32px; border-top:1px solid var(--line);
  display:flex; align-items:center; justify-content:space-between; gap:20px; flex-wrap:wrap; }
.thanks__foot h2{ font-family:"Plus Jakarta Sans", sans-serif; font-size:17px; font-weight:600;
  letter-spacing:-.02em; line-height:1.3; }
.thanks__foot p{ margin:4px 0 0; font-size:14.5px; }
.thanks__chips{ display:flex; gap:10px; flex-wrap:wrap; }
@media (max-width:600px){ .thanks__foot{ flex-direction:column; align-items:stretch; } }

/* the visitor has just submitted — drop the sticky "order a document" bar rather than
   ask again, and with it the footer padding that existed only to clear it */
@media (max-width:991px){
  .mobile-cta{ display:none; }
  .footer__bar{ padding-bottom:0; }
}
`;

const SEAL = `<svg class="thanks__seal" viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <circle cx="32" cy="32" r="29" stroke="currentColor" stroke-width="1.6"/>
          <circle cx="32" cy="32" r="22" stroke="currentColor" stroke-width="1.6" stroke-dasharray="3.6 4.4" stroke-linecap="round" opacity=".55"/>
          <path d="M21.5 32.8l7.4 7.6 14-15.4" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;

const main = (c) => `<main id="top">

<section class="section--soft">
  <div class="container thanks">
    <div class="thanks__head">
      <span class="eyebrow reveal">${c.eyebrow}</span>
      <h1 class="reveal d1">${c.h1}</h1>
      <span class="thanks__rule reveal d2"></span>
    </div>

    <div class="thanks__grid">
      <div class="thanks__body reveal d1">
        <p class="lead">${c.lead}</p>
${c.paras.map(t => `        <p>${t}</p>`).join('\n')}
        <p class="thanks__signoff">${c.signoff}</p>

        <div class="thanks__cta">
          <a class="btn btn--dark" href="/">${c.ctaPrimary}
            ${ARROW}
          </a>
          <a class="btn btn--ghost" href="/#services">${c.ctaSecondary}</a>
        </div>
      </div>

      <figure class="thanks__art reveal d2">
        ${SEAL}
        <figcaption>${c.artCaption}</figcaption>
      </figure>
    </div>

    <div class="thanks__foot reveal d3">
      <div>
        <h2>${c.contactsTitle}</h2>
        <p>${c.hours}</p>
      </div>
      <div class="thanks__chips">
        <a class="chip" href="tel:+46736784546">+46 73 678 45 46</a>
        <a class="chip" href="https://t.me/BogdanGrebenyuk" target="_blank" rel="noopener">Telegram</a>
        <a class="chip" href="https://wa.me/380677357000" target="_blank" rel="noopener">WhatsApp</a>
      </div>
    </div>
  </div>
</section>

</main>`;

// nothing page-specific to run here — the shared header/menu/reveal logic is enough
const JS = '\n';

for (const p of PAGES) {
  derivePage({
    src: p.src,
    out: p.out,
    css: CSS,
    main: main(p.copy),
    js: JS,
    langSwitch: p.langSwitch,
    // #order lives on the home page, not here
    rewrite: [[/href="#order"/g, 'href="/#order"']],
  });
}
