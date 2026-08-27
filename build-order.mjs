// Generates order/index.html and order/ru.html — the /order landing page holding the
// Tally form. Both are DERIVED from index.html / ru.html rather than hand-written, so
// the head, header, footer, stylesheet and shared JS can never drift from the main
// pages. Re-run after any change to the site chrome; run build-seo.mjs afterwards to
// stamp the per-page metadata.
import { derivePage, NB } from './derive-page.mjs';

const TALLY_FORM = 'wb496g';
const TALLY_SRC = `https://tally.so/embed/${TALLY_FORM}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`;


const PAGES = [
  {
    out: 'order/index.html',
    src: 'index.html',
    lang: 'uk',
    copy: {
      eyebrow: 'Замовлення документа',
      h1: `Замовити документ з${NB}апостилем`,
      lead: `Заповніть коротку форму — відповімо в${NB}день звернення, назвемо точну ціну та${NB}строк. ` +
            `Приймаємо заявки щодня <span class="nowrap">з 9:00 до 20:00</span>.`,
      formTitle: 'Форма заявки',
      formNote: `Кілька запитань про вашу ситуацію — щоб одразу підказати потрібний документ.`,
      fallbackTitle: 'Форма не завантажилась',
      fallbackText: `Перевірте зʼєднання або напишіть нам напряму — відповімо так${NB}само швидко.`,
      fallbackBtn: 'Відкрити форму в новій вкладці',
      nextTitle: 'Що буде далі',
      steps: [
        ['Відповідь', `Пишемо або телефонуємо в${NB}день звернення й${NB}уточнюємо деталі.`],
        ['Текст документа', `Складаємо українською, з${NB}урахуванням вимог установи в${NB}Україні.`],
        ['Підписання', `Відеозустріч з${NB}адвокатом і${NB}шведським нотаріусом — близько <span class="nowrap">5 хвилин</span>.`],
        ['Оригінал', `Апостиль у${NB}Стокгольмі та${NB}відправка Новою поштою в${NB}Україну.`],
      ],
      priceTitle: 'Скільки це коштує',
      priceRows: [
        ['Документ під ключ', '2 350 SEK', '≈ 215 €'],
        ['Доставка в Україну', '400 SEK', '≈ 37 €'],
      ],
      priceNote: `Ціну та${NB}строк підтверджуємо до${NB}початку роботи. Оплата — після погодження тексту.`,
      priceLink: 'Усі ціни',
      contactTitle: 'Не хочете заповнювати форму?',
      contactText: `Напишіть у${NB}месенджер або зателефонуйте — відповімо так${NB}само.`,
      trust: [
        `Працюємо з${NB}клієнтами з${NB}усіх країн ЄС`,
        `Документ приймають в${NB}Україні без легалізації`,
        `Особистий супровід адвоката на${NB}кожному етапі`,
      ],
      backHome: 'На головну',
    },
  },
  {
    out: 'order/ru.html',
    src: 'ru.html',
    lang: 'ru',
    copy: {
      eyebrow: 'Заказ документа',
      h1: `Заказать документ с${NB}апостилем`,
      lead: `Заполните короткую форму — ответим в${NB}день обращения, назовём точную цену и${NB}срок. ` +
            `Принимаем заявки ежедневно <span class="nowrap">с 9:00 до 20:00</span>.`,
      formTitle: 'Форма заявки',
      formNote: `Несколько вопросов о вашей ситуации — чтобы сразу подсказать нужный документ.`,
      fallbackTitle: 'Форма не загрузилась',
      fallbackText: `Проверьте соединение или напишите нам напрямую — ответим так${NB}же быстро.`,
      fallbackBtn: 'Открыть форму в новой вкладке',
      nextTitle: 'Что будет дальше',
      steps: [
        ['Ответ', `Пишем или звоним в${NB}день обращения и${NB}уточняем детали.`],
        ['Текст документа', `Составляем на${NB}украинском, с${NB}учётом требований учреждения в${NB}Украине.`],
        ['Подписание', `Видеовстреча с${NB}адвокатом и${NB}шведским нотариусом — около <span class="nowrap">5 минут</span>.`],
        ['Оригинал', `Апостиль в${NB}Стокгольме и${NB}отправка Новой почтой в${NB}Украину.`],
      ],
      priceTitle: 'Сколько это стоит',
      priceRows: [
        ['Документ под ключ', '2 350 SEK', '≈ 215 €'],
        ['Доставка в Украину', '400 SEK', '≈ 37 €'],
      ],
      priceNote: `Цену и${NB}срок подтверждаем до${NB}начала работы. Оплата — после согласования текста.`,
      priceLink: 'Все цены',
      contactTitle: 'Не хотите заполнять форму?',
      contactText: `Напишите в${NB}мессенджер или позвоните — ответим так${NB}же.`,
      trust: [
        `Работаем с${NB}клиентами из${NB}всех стран ЕС`,
        `Документ принимают в${NB}Украине без легализации`,
        `Личное сопровождение адвоката на${NB}каждом этапе`,
      ],
      backHome: 'На главную',
    },
  },
];

const ARROW = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3.5 8h9M8.5 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CHECK = '<svg width="17" height="17" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8.4l3.2 3.1L13 4.8" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// order-page styles, appended to the sheet inherited from the source page
const CSS = `
/* ============================================================
   ORDER PAGE
   ============================================================ */
.order{ padding-top:150px; padding-bottom:var(--section); }
@media (max-width:991px){ .order{ padding-top:130px; } }
@media (max-width:767px){ .order{ padding-top:118px; } }
.order__intro{ display:flex; flex-direction:column; gap:18px; max-width:760px; margin-bottom:56px; }
.order__intro h1{ font-size:clamp(30px,4.4vw,52px); }
.order__intro .lead{ max-width:640px; }
@media (max-width:767px){ .order__intro{ margin-bottom:36px; } }

.order__grid{ display:grid; grid-template-columns:1.35fr 1fr; gap:28px; align-items:start; }
@media (max-width:991px){ .order__grid{ grid-template-columns:1fr; } }
/* the Tally form is short — the supporting panels that do not need to sit beside it
   go into a band underneath, so the two columns end at roughly the same height */
.order__below{ display:grid; grid-template-columns:1fr 1fr; gap:28px; margin-top:28px; }
@media (max-width:767px){ .order__below{ grid-template-columns:1fr; } }

/* form card — the Tally iframe renders transparent, so this card is what the user sees */
.order__form{ background:#fff; border:1px solid var(--line-soft); border-radius:var(--r-lg);
  box-shadow:var(--shadow-float); padding:34px; display:flex; flex-direction:column; gap:22px; min-width:0; }
@media (max-width:560px){ .order__form{ padding:24px 20px; } }
.order__form-head{ display:flex; flex-direction:column; gap:8px; }
.order__form-head h2{ font-family:"Plus Jakarta Sans", sans-serif; font-size:20px; font-weight:600;
  letter-spacing:-.02em; line-height:1.3; }
.order__form-head p{ font-size:14.5px; color:#79818d; margin:0; }
.order__frame{ position:relative; min-height:520px; }
.order__frame iframe{ width:100%; border:0; display:block; }

/* shown only if the embed never arrives */
.order__fallback{ display:none; flex-direction:column; gap:14px; align-items:flex-start;
  background:var(--bg-soft); border:1px solid var(--line); border-radius:var(--r-md); padding:26px; }
.order__fallback.is-visible{ display:flex; }
.order__fallback h3{ font-size:17px; }
.order__fallback p{ font-size:14.5px; margin:0; }

.order__side{ display:flex; flex-direction:column; gap:28px; position:sticky; top:104px; min-width:0; }
@media (max-width:991px){ .order__side{ position:static; top:auto; } }
.order__panel{ background:var(--bg-soft); border:1px solid var(--line-soft); border-radius:var(--r-lg); padding:28px; }
@media (max-width:560px){ .order__panel{ padding:22px 20px; } }
.order__panel h2,.order__panel h3{ font-family:"Plus Jakarta Sans", sans-serif; font-size:17px;
  font-weight:600; letter-spacing:-.02em; line-height:1.3; margin-bottom:18px; }
.order__panel--accent{ background:var(--secondary); border-color:var(--secondary-deep); }

.order__steps{ list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:18px; }
.order__steps li{ display:grid; grid-template-columns:auto 1fr; gap:14px; align-items:start; }
.order__steps .n{ font-family:var(--display); font-weight:500; font-size:15px; line-height:1.5;
  color:var(--primary); letter-spacing:.04em; }
.order__steps b{ display:block; font-size:15px; font-weight:600; color:var(--title); letter-spacing:-.01em; }
.order__steps small{ display:block; font-size:14px; line-height:1.6; margin-top:3px; }

.order__price{ display:flex; flex-direction:column; gap:12px; }
.order__price-row{ display:flex; align-items:baseline; justify-content:space-between; gap:14px;
  padding-bottom:12px; border-bottom:1px solid var(--secondary-deep); }
.order__price-row:last-child{ border-bottom:0; padding-bottom:0; }
.order__price-row span{ font-size:14.5px; color:var(--body-strong); min-width:0; }
.order__price-row b{ font-family:var(--display); font-weight:500; font-size:19px; color:var(--title);
  letter-spacing:.01em; white-space:nowrap; }
.order__price-row i{ display:block; font-style:normal; font-size:12.5px; color:var(--body); text-align:right; }
.order__note{ font-size:13.5px; line-height:1.6; margin:16px 0 0; }

.order__lead{ font-size:14.5px; margin:0; }
.order__contacts{ display:flex; flex-wrap:wrap; gap:10px; margin-top:16px; }
.order__trust{ list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:12px; }
.order__trust li{ display:grid; grid-template-columns:auto 1fr; gap:11px; align-items:start;
  font-size:14.5px; line-height:1.55; }
.order__trust svg{ color:var(--primary); margin-top:2px; }

.order__back{ display:inline-flex; align-items:center; gap:9px; margin-top:38px;
  font-size:15px; font-weight:500; color:var(--primary);
  transition:transform .4s var(--ease), opacity .3s var(--ease); }
.order__back svg{ transform:rotate(180deg); }
.order__back:hover{ transform:translateX(-3px); }
.order__back:focus-visible{ outline:2px solid var(--primary); outline-offset:3px; }
`;

const main = (c) => `<main id="top">

<section class="section--soft">
  <div class="container order">
    <div class="order__intro">
      <span class="eyebrow reveal">${c.eyebrow}</span>
      <h1 class="reveal d1">${c.h1}</h1>
      <p class="lead reveal d2">${c.lead}</p>
    </div>

    <div class="order__grid">
      <div class="order__form reveal d1" id="form">
        <div class="order__form-head">
          <h2>${c.formTitle}</h2>
          <p>${c.formNote}</p>
        </div>

        <div class="order__frame">
          <iframe data-tally-src="${TALLY_SRC}" loading="lazy" width="100%" height="520"
                  frameborder="0" marginheight="0" marginwidth="0" title="${c.formTitle}"></iframe>
        </div>

        <div class="order__fallback" id="order-fallback">
          <h3>${c.fallbackTitle}</h3>
          <p>${c.fallbackText}</p>
          <a class="btn btn--dark" href="https://tally.so/r/${TALLY_FORM}" target="_blank" rel="noopener">${c.fallbackBtn}
            ${ARROW}
          </a>
        </div>
      </div>

      <aside class="order__side">
        <div class="order__panel reveal d2">
          <h2>${c.nextTitle}</h2>
          <ol class="order__steps">
${c.steps.map(([t, d], i) => `            <li><span class="n">0${i + 1}</span><div><b>${t}</b><small>${d}</small></div></li>`).join('\n')}
          </ol>
        </div>

        <div class="order__panel order__panel--accent reveal d3">
          <h3>${c.priceTitle}</h3>
          <div class="order__price">
${c.priceRows.map(([name, sek, eur]) => `            <div class="order__price-row"><span>${name}</span><div><b>${sek}</b><i>${eur}</i></div></div>`).join('\n')}
          </div>
          <p class="order__note">${c.priceNote}</p>
          <div class="order__contacts">
            <a class="chip" href="/#pricing">${c.priceLink}</a>
          </div>
        </div>

      </aside>
    </div>

    <div class="order__below">
      <div class="order__panel reveal">
        <h3>${c.contactTitle}</h3>
        <p class="order__lead">${c.contactText}</p>
        <div class="order__contacts">
          <a class="chip" href="https://t.me/BogdanGrebenyuk" target="_blank" rel="noopener">Telegram</a>
          <a class="chip" href="https://wa.me/380677357000" target="_blank" rel="noopener">WhatsApp</a>
          <a class="chip" href="tel:+46736784546">+46 73 678 45 46</a>
        </div>
      </div>

      <div class="order__panel reveal d1">
        <ul class="order__trust">
${c.trust.map(t => `          <li>${CHECK}<span>${t}</span></li>`).join('\n')}
        </ul>
      </div>
    </div>

    <a class="order__back" href="/">${ARROW}${c.backHome}</a>
  </div>
</section>

</main>`;

// JS that replaces the home page's testimonial + form handlers
const JS = `
// Tally: load the embed, and fall back to a direct link if it never arrives
(function () {
  const FALLBACK_AFTER = 6000;
  const fallback = document.getElementById('order-fallback');
  const frame = document.querySelector('iframe[data-tally-src]');
  let loaded = false;

  const load = () => {
    if (typeof Tally !== 'undefined') { Tally.loadEmbeds(); return; }
    document.querySelectorAll('iframe[data-tally-src]:not([src])')
      .forEach(el => { el.src = el.dataset.tallySrc; });
  };

  if (frame) frame.addEventListener('load', () => { loaded = true; });

  const s = document.createElement('script');
  s.src = 'https://tally.so/widgets/embed.js';
  s.onload = load;
  s.onerror = load;   // still try the plain iframe if the widget script is blocked
  document.body.appendChild(s);

  setTimeout(() => {
    if (loaded || !fallback || !frame) return;
    fallback.classList.add('is-visible');
    frame.closest('.order__frame').hidden = true;
  }, FALLBACK_AFTER);
})();
`;

for (const p of PAGES) {
  derivePage({
    src: p.src,
    out: p.out,
    css: CSS,
    main: main(p.copy),
    js: JS,
    langSwitch: { uk: '/order', ru: '/order/ru.html' },
    // the source pages scroll their order CTAs to the #order section; that section
    // does not exist here, so those links jump to the Tally form instead
    rewrite: [[/href="#order"/g, 'href="#form"']],
  });
}
