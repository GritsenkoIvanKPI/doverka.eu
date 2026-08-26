# Doverka.eu

Лендінг сервісу **Doverka.eu** — нотаріальні документи з апостилем для українців
у Швеції та країнах ЄС. Адвокат Богдан Гребенюк.

Дві мовні версії, статичний HTML без збірки та фреймворків.

## Структура

| Файл | Призначення |
|------|-------------|
| `index.html` | українська версія (`lang="uk"`) |
| `ru.html` | російська версія (`lang="ru"`) |
| `order/index.html` | сторінка замовлення `/order` (форма Tally), українська |
| `order/ru.html` | сторінка замовлення `/order/ru.html`, російська |
| `images/` | фото та зображення (Gemini + оброблене фото клієнта) |
| `images/og-cover*.jpg` | картки для соцмереж 1200×630 (логотип, **не** фото адвоката) |
| `favicon.*`, `icon-*.png`, `apple-touch-icon.png` | набір іконок сайту |
| `site.webmanifest` | веб-маніфест (іконки, тема, standalone) |
| `robots.txt`, `sitemap.xml` | індексація |
| `CLIENT_BRIEF.md` | бриф, палітра, правила типографіки, що замінити перед запуском |
| `doverka-eu-texts.txt` | вихідні тексти старого сайту |
| `GEMINI_IMAGE_GENERATION.md` | як генерувалися зображення |

## Локальний запуск

```bash
node serve.mjs          # http://localhost:3000
```

## Перевірки якості

```bash
node screenshot.mjs http://localhost:3000            # скріншот сторінки
node shot-mobile.mjs http://localhost:3000 390 <dir> # мобільні скріншоти
node audit.mjs http://localhost:3000 <ширина>        # типографіка: зависла літера / тире / рядок з одного слова
node layout-audit.mjs http://localhost:3000 <ширина> # верстка: overflow, обрізання, перекриття, тап-таргети
node seo-audit.mjs http://localhost:3000             # мета-теги, OG, hreflang, JSON-LD, іконки, alt, sitemap
```

## Генерація ассетів

```bash
node gen-icons.mjs        # favicon-16/32/48, apple-touch-icon, icon-192/512, maskable
node gen-ico.mjs          # пакує 16/32/48 у favicon.ico
node gen-og.mjs           # соцкартки 1200×630: og-cover, og-cover-ru, og-order, og-order-ru
node build-order.mjs      # order/index.html та order/ru.html з index.html / ru.html
node build-seo.mjs        # мета-блок + JSON-LD в обидві сторінки, robots.txt, sitemap.xml, site.webmanifest
node optimize-images.mjs  # перестиснення images/ (sips)
node add-img-attrs.mjs    # width/height/decoding на всі <img>
```

`build-order.mjs` **виводить** сторінки замовлення з `index.html` / `ru.html` — шапка,
підвал, стилі та спільний JS беруться звідти, тому розсинхрону бути не може. Правити
треба конфіг усередині `build-order.mjs`, а не `order/*.html`. Порядок запуску:
`build-order.mjs` → `build-seo.mjs`.

`build-seo.mjs` перечитує FAQ прямо з розмітки — після правки питань просто запусти його
ще раз, і структуровані дані оновляться. Мета-блок обмежений маркерами
`<!-- ===== SEO … ===== -->`; редагувати треба в `build-seo.mjs`, не в HTML.

Обидві сторінки проходять обидва аудити з нулем помилок на ширинах 320–1920.
Для скриптів потрібен `puppeteer` (`npm i puppeteer`).

## Перед запуском

Див. розділ «Потребує заміни перед запуском» у `CLIENT_BRIEF.md`:
Trustpilot ID, реальний відеовідгук, реальні скани документів, підключення форми.

> Будь-яка зміна тексту вноситься **в обидві** сторінки — спільного джерела немає.
