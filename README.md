# Stephen King Multiverse

[![Deploy Pages](https://github.com/Grand-Archives/stephen-king/actions/workflows/pages.yml/badge.svg)](https://github.com/Grand-Archives/stephen-king/actions/workflows/pages.yml)

An interactive, bilingual guide to the connections that tie Stephen King's books into a single multiverse, with the Dark Tower at its center.

| Language | Live site |
| --- | --- |
| Português (Brasil) | <https://grand-archives.github.io/stephen-king/> |
| English | <https://grand-archives.github.io/stephen-king/en/> |

Part of the [GrandArchives](https://github.com/Grand-Archives) organization. This is an unofficial fan project; see the [disclaimer](#disclaimer).

## About

King's novels, stories and novellas share places, characters and ideas: Castle Rock, Derry, the Crimson King, the Beams that hold the worlds together. This guide makes those links easy to follow. It is a navigable version of the many maps and flowcharts of King's universe that circulate among fans, with a synopsis of every book and a profile for each character, place and concept, plus the list of books each one appears in.

Synopses avoid spoilers. Profiles do not.

## Features

- **Connection map**: a 3x3 grid with the Dark Tower in the middle and one colored region per group of worlds, each surrounded by its characters and places. Selecting a region or a name explains its links in a drawer and a reading panel.
- **Books, profiles and concepts**: three tabs with a synopsis (or profile) for every entry, the connections explained and the books where it appears.
- **Search and sorting**: accent-insensitive search; books can be ordered by year or by how connected they are.
- **Reader dialog**: opens a book or profile in place without losing your position on the map.
- **Deep links**: every book and profile has a stable hash (`#livro-<id>`, `#fio-<id>`) that survives a language switch.
- **Sources**: each profile cites the pages used, and the footer lists every page consulted.
- **Two languages** (Portuguese and English) with a language selector that keeps the current hash and query string.

## Tech stack

Plain HTML, CSS and JavaScript. No framework, no build step and no dependencies. The only external request is the Google Fonts stylesheet (Gloock, Instrument Sans and IBM Plex Mono).

## Project structure

```text
.
├── CLAUDE.md                     # contributor/agent guide (architecture and rules)
├── README.md
├── .github/workflows/pages.yml   # deploys the site/ folder to GitHub Pages
└── site/                         # everything that gets published
    ├── index.html                # Portuguese page (site root)
    ├── en/index.html             # English page
    ├── sitemap.xml               # all language URLs with hreflang alternates
    ├── assets/icons/             # favicon.ico, favicon.svg, apple-touch-icon.png
    ├── css/style.css             # all styles (language-independent)
    ├── js/app.js                 # shared i18n core + page logic (no visible text)
    └── i18n/
        ├── languages.json        # languages offered by the selector
        ├── pt-BR/{ui.json,data.js}
        └── en/{ui.json,data.js}
```

Each language page is a thin HTML shell. `js/app.js` reads `<html lang>`, loads `i18n/<lang>/ui.json` (interface strings) and `i18n/<lang>/data.js` (books, profiles, regions and sources), builds the page and renders the language selector. All user-visible text lives in those two files.

## Running locally

The site loads JSON and ES modules with `fetch`/`import()`, so it must be served over HTTP; opening `index.html` through `file://` does not work.

```bash
cd site
python -m http.server 8000
# or: npx serve .
```

Then open <http://localhost:8000/> and <http://localhost:8000/en/>.

## Adding a language

`js/app.js` does not need to change.

1. Create `site/i18n/<code>/ui.json` (same keys as `pt-BR/ui.json`, including `lang.label`, the credits and the rights notice) and `site/i18n/<code>/data.js` (same structure and ids as `pt-BR/data.js`; only the text changes).
2. Add `{ "code": "<code>", "name": "<Native name>", "path": "<code>/" }` to `site/i18n/languages.json`.
3. Create `site/<code>/index.html` from the head template in [`CLAUDE.md`](CLAUDE.md): correct `lang`, title, description, Open Graph tags, canonical URL and `../` relative paths.
4. Add the new `hreflang` alternate to the `<head>` of every existing language page, and the new URL (with alternates) to `site/sitemap.xml`.
5. Serve the site and check: no console errors, favicons load, the selector lists the new language and switching keeps the hash and query.

Credits and the unofficial-fan-project notice are mandatory in every language.

## Deployment

Every push to `master` runs `.github/workflows/pages.yml`, which uploads `site/` as the GitHub Pages artifact and deploys it. In the repository settings, **Pages → Build and deployment → Source** must be set to **GitHub Actions**.

## Contributing

Corrections to facts, links and translations are welcome through issues and pull requests.

- Branch: `master`.
- Commits are written in English and follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `refactor:`...).
- Keep the project dependency-free and free of build steps.
- Do not edit the i18n core block at the top of `js/app.js` here; it is shared verbatim across all GrandArchives sites.

## Sources and credits

The base material is Stephen King's books. Dates, names and details were checked against the author's official website, Wikipedia and the Stephen King Wiki; each profile lists the pages it used. Some connections were cross-checked against the *Stephen King Universe* flowchart by Gillian James.

Wikipedia and the Stephen King Wiki are published under the CC BY-SA license and were used only to verify facts. The texts of this guide are original.

## Disclaimer

This is an unofficial, free, non-profit fan project. It is not affiliated with or endorsed by Stephen King, his agents or his publishers. All books, titles, characters, places and other elements mentioned belong to Stephen King and their respective rights holders, including Peter Straub and Richard Chizmar for the works written with them. No excerpts of the works are reproduced; the texts are summaries and commentary for reference purposes.

## Copyright

Copyright © 2026 GrandArchives. Texts, map, organization and design of this guide.
