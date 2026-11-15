/* ==========================================================================
   build-it.js — generates it/index.html, the static Italian edition of the home.

   Why: the language switcher works in the browser, so search engines only ever
   saw the English text. This script bakes the Italian strings of i18n.js into a
   copy of index.html, so Google can index https://filippogerbino.com/it/.

   Run it after ANY change to index.html or to the Italian strings in i18n.js:

       node tools/build-it.js

   No dependencies. Never edit it/index.html by hand: it is overwritten.
   ========================================================================== */
'use strict';
const fs   = require('fs');
const path = require('path');
const vm   = require('vm');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://filippogerbino.com/';

/* ── Italian head texts (the ones that are not data-i18n elements) ────────── */
const META = {
  description:   'Filippo Gerbino è un compositore per videogiochi, orchestratore e produttore. Colonne sonore orchestrali complete e audio adattivo implementato in FMOD — per giochi, film e trailer.',
  ogDescription: 'Composizione, orchestrazione, produzione, mix e master. Tutto quello che serve al tuo gioco, da una sola mano.',
  ogImageAlt:    'Filippo Gerbino — compositore per videogiochi e orchestratore',
};

/* ── Labels for screen readers (attributes, so not covered by data-i18n) ──── */
const ATTR_TEXT = [
  [/aria-label="Play video: /g,            'aria-label="Riproduci il video: '],
  [/aria-label="Play the audio reel"/g,    'aria-label="Riproduci l\'audio reel"'],
  [/aria-label="Play \/ pause"/g,          'aria-label="Riproduci / pausa"'],
  [/aria-label="Play /g,                   'aria-label="Riproduci '],
  [/aria-label="Previous track"/g,         'aria-label="Brano precedente"'],
  [/aria-label="Next track"/g,             'aria-label="Brano successivo"'],
  [/aria-label="Previous video"/g,         'aria-label="Video precedente"'],
  [/aria-label="Next video"/g,             'aria-label="Video successivo"'],
  [/aria-label="Show video (\d) of (\d)"/g, 'aria-label="Mostra il video $1 di $2"'],
  [/aria-label="Close player"/g,           'aria-label="Chiudi il player"'],
  [/aria-label="Reel chapters"/g,          'aria-label="Capitoli del reel"'],
  [/aria-label="Language"/g,               'aria-label="Lingua"'],
  [/alt="Filippo Gerbino at the piano"/g,  'alt="Filippo Gerbino al pianoforte"'],
];

/* ── Read the Italian dictionary straight from i18n.js ────────────────────── */
function loadDictionary() {
  const sandbox = {
    window: {},
    document: { readyState: 'loading', addEventListener() {}, documentElement: { getAttribute() { return null; } } },
    localStorage: { getItem() { return null; }, setItem() {} },
    navigator: {},
  };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'i18n.js'), 'utf8'), sandbox);
  const dict = sandbox.window.i18n && sandbox.window.i18n.dict;
  if (!dict || !dict.it) throw new Error('i18n.js no longer exposes window.i18n.dict');
  return dict;
}

/* ── Replace the content of every data-i18n element (what i18n.js does live) ─ */
function translate(html, it) {
  const openRe = /<([a-zA-Z][\w-]*)\b[^<>]*?\sdata-i18n="([^"]+)"[^<>]*>/g;
  let out = '', pos = 0, m, done = 0;
  const untranslated = [];
  while ((m = openRe.exec(html))) {
    const name = m[1], key = m[2];
    const innerStart = m.index + m[0].length;
    if (it[key] == null) { untranslated.push(key); continue; }   // stays English, like on the live switch
    // walk forward to the closing tag that matches this element
    const tagRe = new RegExp('<(/?)' + name + '\\b[^<>]*>', 'gi');
    tagRe.lastIndex = innerStart;
    let depth = 1, t, innerEnd = -1;
    while ((t = tagRe.exec(html))) {
      if (t[1]) { if (--depth === 0) { innerEnd = t.index; break; } }
      else if (!t[0].endsWith('/>')) depth++;
    }
    if (innerEnd < 0) throw new Error('no closing tag for data-i18n="' + key + '"');
    out += html.slice(pos, innerStart) + it[key];
    pos = innerEnd;
    openRe.lastIndex = innerEnd;
    done++;
  }
  return { html: out + html.slice(pos), done, untranslated };
}

function translatePlaceholders(html, ph) {
  return html.replace(/<[^<>]*\sdata-i18n-ph="([^"]+)"[^<>]*>/g, (tag, key) =>
    ph[key] == null ? tag : tag.replace(/\splaceholder="[^"]*"/, ' placeholder="' + ph[key] + '"'));
}

/* ── The page moves one folder down: relative URLs need "../" ─────────────── */
const isRelative = (u) => !!u && !/^(#|\?|\/|\.\.?\/|[a-z][a-z0-9+.-]*:)/i.test(u);
function rebase(html) {
  html = html.replace(/\b(href|src|data-src|data-play-src|poster|action)="([^"]*)"/g,
    (m, attr, url) => isRelative(url) ? attr + '="../' + url + '"' : m);
  return html.replace(/\bsrcset="([^"]*)"/g, (m, list) => 'srcset="' + list.split(',').map(item => {
    const parts = item.trim().split(/\s+/);
    if (isRelative(parts[0])) parts[0] = '../' + parts[0];
    return parts.join(' ');
  }).join(', ') + '"');
}

function must(html, from, to, label) {
  if (typeof from === 'string' ? !html.includes(from) : !from.test(html)) throw new Error('index.html changed, cannot find: ' + label);
  return html.replace(from, to);
}

/* ── Build ────────────────────────────────────────────────────────────────── */
const dict = loadDictionary();
let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const EOL = html.includes('\r\n') ? '\r\n' : '\n';

// 1. things that belong to the English edition only (the "send Italians to it/" redirect)
html = must(html, /[ \t]*<!-- en-only:start[\s\S]*?<!-- en-only:end -->\r?\n/, '', 'en-only block');

// 2. language of the document + where the switcher goes
html = must(html, '<html lang="en" data-lang-fixed="en" data-alt-it="it/">',
                  '<html lang="it" data-lang-fixed="it" data-alt-en="../">', '<html> tag');
html = must(html, '<head>', '<head>' + EOL +
  '  <!-- GENERATED FILE — do not edit. Source: index.html + i18n.js, built by tools/build-it.js -->', '<head>');

// 3. head: Italian description, social tags, canonical
html = must(html, /(<meta name="description" content=")[^"]*"/,          '$1' + META.description + '"', 'meta description');
html = must(html, /(<meta property="og:description" content=")[^"]*"/,   '$1' + META.ogDescription + '"', 'og:description');
html = must(html, /(<meta property="og:title" content=")[^"]*"/,         '$1' + dict.it['meta.title'] + '"', 'og:title');
html = must(html, /(<meta property="og:image:alt" content=")[^"]*"/,     '$1' + META.ogImageAlt + '"', 'og:image:alt');
html = must(html, '<meta property="og:locale" content="en_US" />',           '<meta property="og:locale" content="it_IT" />', 'og:locale');
html = must(html, '<meta property="og:locale:alternate" content="it_IT" />', '<meta property="og:locale:alternate" content="en_US" />', 'og:locale:alternate');
html = must(html, '<meta property="og:url" content="' + SITE + '" />',       '<meta property="og:url" content="' + SITE + 'it/" />', 'og:url');
html = must(html, '<link rel="canonical" href="' + SITE + '" />',            '<link rel="canonical" href="' + SITE + 'it/" />', 'canonical');

// 4. body: Italian strings
const tr = translate(html, dict.it);
html = translatePlaceholders(tr.html, dict.itPlaceholders || {});
ATTR_TEXT.forEach(([from, to]) => { html = html.replace(from, to); });

// 5. paths (a link to the home is this page itself)
html = html.replace(/href="index\.html(#[^"]*)?"/g, (m, hash) => 'href="' + (hash || './') + '"');
html = rebase(html);

fs.mkdirSync(path.join(ROOT, 'it'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'it', 'index.html'), html);

console.log('it/index.html written — ' + tr.done + ' texts translated');
if (tr.untranslated.length) console.log('left in English (no Italian string in i18n.js): ' + [...new Set(tr.untranslated)].join(', '));
