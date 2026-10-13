# CLAUDE.md

**Always respond to the user in Brazilian Portuguese (pt-BR)**, regardless of the language of the conversation, an issue/PR or any file being discussed.
Everything written into the repository (code, comments, commits, docs) stays in English, except the site's own translated content.

## What this repo is

Static site published on GitHub Pages at `https://grandarchives.github.io/stephen-king/`: an interactive guide to the connections of Stephen King's multiverse.
Plain HTML/CSS/JS only. **No build step, no framework, no dependencies.** The `GrandArchives` org shares this layout across its guide sites.

## Folder structure

```
CLAUDE.md
.github/workflows/pages.yml        # publishes the whole site/ folder (upload-pages-artifact path: site)
site/                              # everything that gets published
  index.html                       # pt-BR page, site root (keeps the original published URL)
  en/index.html                    # English page, published at /en/
  sitemap.xml                      # every language URL, with xhtml:link hreflang alternates
  assets/icons/                    # favicon.ico, favicon.svg, apple-touch-icon.png
  css/style.css                    # all styles (language-independent)
  js/app.js                        # i18n core (verbatim) + page logic; contains NO user-visible text
  i18n/languages.json              # [{ "code", "name", "path" }] used by the language selector
  i18n/pt-BR/ui.json               # UI strings (flat "section.key": "text"; may hold trusted inline HTML)
  i18n/pt-BR/data.js               # content: books, sources, profiles, regions (ES module, `export default {...}`)
  i18n/en/{ui.json,data.js}        # English UI strings and content (same keys, ids and structure as pt-BR)
  <code>/index.html                # one page per extra language, e.g. site/en/index.html
  i18n/<code>/{ui.json,data.js}    # data of each extra language
```

There are no images in this site (the Tower and the icons are inline SVG in `app.js`).

## How a page works

`<html lang="...">` is the language code and also the folder name under `site/i18n/`. The page itself is light: `<head>` + `<div id="app"></div>` + a `<noscript>` message.
`js/app.js` (classic `<script defer>`) starts with the shared i18n core (`I18N.t / tn / apply / languageSwitcher / load / asset / ROOT / LANG`). It then:
loads `ui.json`, `data.js` and `languages.json`, injects the body skeleton (markup with `data-i18n` / `data-i18n-attr`), calls `I18N.apply()`, renders the language selector and runs the page logic.

- The i18n core block at the top of `app.js` is **identical in every GrandArchives site**. Do not edit it here; fix it in the shared source and paste it verbatim everywhere.
- `data-i18n="key"` sets `innerHTML`; `data-i18n-attr="attr:key;attr2:key2"` sets attributes. `{name}` placeholders are filled by `t(key, vars)`. Plurals use `key.one` / `key.other` through `tn(key, n)`.
- Locale-sensitive code must use `I18N.LANG` (`localeCompare`, `Intl.*`, case folding). Never concatenate translated fragments in a way that fixes one language's word order: use `{placeholders}` templates.
- Non-text presentation config (colors, map geometry, layout constants) stays in `app.js` / CSS. Anything that is content (ids, years, relations between entries, source links) lives in `data.js`.
- Book/profile/region ids and the URL hash prefixes (`#livro-<id>`, `#fio-<id>`) are language-independent on purpose, so a link survives a language switch.
- `ui.json` must contain `lang.label` (aria-label of the language selector).
- `data.js` documents its own structure in the header comment; a translator must be able to produce a complete `data.js` for a new language alone.
- Languages present: `pt-BR` (root) and `en` (`/en/`). In `en`, book titles and characters, places and concepts use King's original English names, so `title` equals `originalTitle` (the page then shows the original title only once); Brazilian-edition notes in `remark` are dropped. Links to Brazilian publisher pages keep their URLs and say "(Brazilian edition)" in the label.
- The selector (`<select class="langsel">` inside `#langbar`) is always rendered, listing every entry of `languages.json` (Português and English today). There is no automatic redirect by browser language and no language memory in `localStorage`; do not add them.

## How to add a language (steps shown for `en`, which already exists and is the worked example)

`app.js` must not need any edit.

1. Create `site/i18n/en/ui.json` (same keys as `pt-BR/ui.json`, translated, including `lang.label`, the credits and the unofficial-fan-project/rights notice) and `site/i18n/en/data.js` (same structure and ids as `pt-BR/data.js`, translated values only).
2. Add `{ "code": "en", "name": "English", "path": "en/" }` to `site/i18n/languages.json`.
3. Create `site/en/index.html` from the head template below, with the right `lang`, `<title>`, description, Open Graph tags, canonical and relative `../` paths.
4. Add the `hreflang` alternate for the new language to the `<head>` of **every existing language page** (and keep `x-default` pointing to the Portuguese root).
5. Add the new URL to `site/sitemap.xml` as a `<url>` with `xhtml:link` alternates for every language incl. `x-default`, and add the new alternate to the existing `<url>` entries.
6. Test through a static server (never `file://`): no console errors, favicons 200, the selector appears on both pages and switches to the equivalent URL keeping hash and query.

Head template (pt-BR root page shown; for `site/en/index.html` use `lang="en"`, `og:locale` `en_US`, `canonical`/`og:url` `https://grandarchives.github.io/stephen-king/en/`, English texts, and prefix every local path with `../`):

```html
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Multiverso Stephen King: guia de conexões | GrandArchives</title>
<meta name="description" content="...">
<link rel="canonical" href="https://grandarchives.github.io/stephen-king/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="GrandArchives">
<meta property="og:locale" content="pt_BR">
<meta property="og:locale:alternate" content="en_US">   <!-- one per other language -->
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:url" content="https://grandarchives.github.io/stephen-king/">
<link rel="alternate" hreflang="pt-BR" href="https://grandarchives.github.io/stephen-king/">
<link rel="alternate" hreflang="en" href="https://grandarchives.github.io/stephen-king/en/">
<link rel="alternate" hreflang="x-default" href="https://grandarchives.github.io/stephen-king/">
<link rel="icon" href="assets/icons/favicon.ico" sizes="any">
<link rel="icon" href="assets/icons/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="assets/icons/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gloock&family=IBM+Plex+Mono:wght@400;500&family=Instrument+Sans:wght@400;500;600&display=swap">
<link rel="stylesheet" href="css/style.css">
<script src="js/app.js" defer></script>
</head>
<body>
<div id="app"></div>
<noscript>Message in the page language saying JavaScript is required.</noscript>
</body>
</html>
```

## Rules

- pt-BR is the primary language and stays at the root URL; other languages live under `site/<code>/`.
- The credits (sources, CC BY-SA attribution of Wikipedia and Stephen King Wiki) and the unofficial-fan-project/rights notice are mandatory in every language.
- Footer copyright reads `© 2026 GrandArchives.`
- No build step, no framework, no new dependencies.
- Always test through a static server (e.g. `npx serve site` or `python -m http.server` inside `site/`), never `file://`: the page loads `ui.json` and `data.js` with `fetch` / `import()`.
- Commits are in English, Conventional Commits style (`feat:`, `fix:`, `refactor:` ...), on branch `master`.
- Never add AI-attribution trailers (`Co-Authored-By`, `Claude-Session`, "Generated with ...") to commits or PR descriptions.
