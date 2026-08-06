/**
 * Injecte /js/cookie-consent.js dans toutes les pages HTML statiques.
 * Le script est ajouté en PREMIER script dans le <head> (avant tout tag Google).
 * Pages déjà patchées ou exclues (index.html, loic.html, offline.html,
 * commande-confirmation.html, contact.html, realisations.html, services.html)
 * sont ignorées ou traitées séparément.
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, extname } from 'path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');

// Pages SPA (ne pas toucher — gérées par le React CookieBanner)
const EXCLUDE = new Set([
  'index.html',
  'loic.html',      // page SPA redirection
  'offline.html',   // page offline PWA, pas de tracking
]);

// Tag à injecter (premier script dans <head>)
const SCRIPT_TAG = '<script src="/js/cookie-consent.js"></script>';
const MARKER     = 'cookie-consent.js';

const files = readdirSync(ROOT).filter(f => extname(f) === '.html' && !EXCLUDE.has(f));

let patched = 0;
let skipped = 0;

for (const file of files) {
  const path    = join(ROOT, file);
  const content = readFileSync(path, 'utf8');

  if (content.includes(MARKER)) {
    skipped++;
    continue;
  }

  // Insère juste après <head> ou juste avant le premier </head>
  let updated;
  if (content.includes('<head>')) {
    updated = content.replace('<head>', '<head>\n  ' + SCRIPT_TAG);
  } else if (content.includes('</head>')) {
    updated = content.replace('</head>', '  ' + SCRIPT_TAG + '\n</head>');
  } else {
    console.warn('⚠  Pas de <head> trouvé dans', file);
    skipped++;
    continue;
  }

  writeFileSync(path, updated, 'utf8');
  patched++;
  console.log('✓', file);
}

console.log(`\n✅  ${patched} pages patchées, ${skipped} déjà à jour ou ignorées.`);
