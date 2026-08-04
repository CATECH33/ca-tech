/**
 * Maillage interne CA-TECH
 * Ajoute/enrichit les sections de liens internes sur toutes les pages.
 */
import { readFileSync, writeFileSync } from 'fs';

const ARR = '→';

function card(href, cat, title) {
  return `      <a href="${href}" class="lp-link-card"><span class="lp-link-cat">${cat}</span><span class="lp-link-title">${title}</span><span class="lp-link-arr">${ARR}</span></a>`;
}

function section(cards) {
  return `\n<!-- MAILLAGE INTERNE -->\n<section class="lp-section">\n  <div class="container">\n    <p class="lp-label">Explorez également</p>\n    <h2 class="lp-title" style="margin-bottom:2rem">Services et ressources liés</h2>\n    <div class="lp-links-grid">\n${cards.join('\n')}\n    </div>\n  </div>\n</section>\n`;
}

// ── Liens par page ────────────────────────────────────────────────────────────
const LINKS = {
  vitrine:      card('creation-site-vitrine.html',   'Service Web',         'Création de site vitrine'),
  ecommerce:    card('creation-site-ecommerce.html', 'Service Web',         'Création de boutique e-commerce'),
  landing:      card('creation-landing-page.html',   'Service Web',         'Création de landing page'),
  logo:         card('creation-logo.html',           'Design',              'Création de logo professionnel'),
  identite:     card('identite-visuelle.html',       'Design',              'Identité visuelle complète'),
  flyer:        card('creation-flyer.html',          'Design',              'Création de flyers'),
  refonte:      card('refonte-site-internet.html',   'Service Web',         'Refonte de site internet'),
  maintenance:  card('maintenance-site-web.html',    'Service Web',         'Maintenance de site web'),
  auto:         card('/automatisations',             'IA & Automatisation', 'Automatisations business'),
  ia:           card('/collaborateurs-ia',           'IA & Automatisation', 'Collaborateurs IA'),
  solutions:    card('/solutions',                   'CRM & Outils',        'Solutions CRM & Outils métier'),
  tarifs:       card('/tarifs',                      'Tarifs',              'Nos tarifs transparents'),
  cas:          card('cas-clients.html',             'Réalisations',        'Nos cas clients & résultats'),
  faq:          card('faq.html',                     'Ressource',           'FAQ — Toutes vos questions'),
  contact:      card('/contact',                     'Devis',               'Demander un devis gratuit'),
};
const L = LINKS;

// ── 1. Pages sans maillage → ajouter section complète ────────────────────────
const NEW_PAGES = [
  {
    file: 'automatisations.html',
    insertBefore: '<!-- FOOTER -->',
    cards: [L.ia, L.solutions, L.vitrine, L.ecommerce, L.maintenance, L.cas, L.tarifs, L.faq],
  },
  {
    file: 'collaborateurs-ia.html',
    insertBefore: '<!-- FOOTER',   // gère les espaces variables
    cards: [L.auto, L.solutions, L.vitrine, L.ecommerce, L.maintenance, L.cas, L.tarifs, L.faq],
  },
  {
    file: 'tarifs.html',
    insertBefore: '<!-- FOOTER -->',
    cards: [L.vitrine, L.ecommerce, L.landing, L.refonte, L.auto, L.ia, L.cas, L.faq],
  },
  {
    file: 'cas-clients.html',
    insertBefore: '<footer></footer>',
    cards: [L.vitrine, L.ecommerce, L.auto, L.ia, L.maintenance, L.solutions, L.tarifs, L.contact],
  },
  {
    file: 'solutions.html',
    insertBefore: '<!-- FOOTER -->',
    cards: [L.auto, L.ia, L.vitrine, L.ecommerce, L.maintenance, L.cas, L.tarifs, L.faq],
  },
];

// ── 2. Pages avec maillage existant → enrichir avec liens manquants ───────────
// Pour chaque page : {file, add: [cards à insérer], notYet: hrefs déjà présents}
// On insère juste avant la fermeture du lp-links-grid (    </div>)
const ENRICH_PAGES = [
  {
    file: 'creation-site-vitrine.html',
    add: [L.auto, L.ia, L.cas],
  },
  {
    file: 'creation-site-ecommerce.html',
    add: [L.auto, L.ia, L.cas, L.tarifs, L.faq],
  },
  {
    file: 'maintenance-site-web.html',
    add: [L.auto, L.ia, L.cas],
  },
  {
    file: 'creation-landing-page.html',
    add: [L.auto, L.ia, L.cas],
  },
  {
    file: 'creation-logo.html',
    add: [L.auto, L.ia, L.cas],
  },
  {
    file: 'identite-visuelle.html',
    add: [L.auto, L.ia, L.cas],
  },
  {
    file: 'refonte-site-internet.html',
    add: [L.auto, L.ia, L.cas],
  },
  {
    file: 'creation-flyer.html',
    add: [L.auto, L.ia, L.cas],
  },
  {
    file: 'faq.html',
    add: [L.auto, L.ia, L.cas, L.tarifs],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function process(file, fn) {
  const src = readFileSync(file, 'utf8');
  const result = fn(src);
  if (result === src) {
    console.log(`⚠️  ${file} — aucun changement (pattern non trouvé ?)`);
    return;
  }
  writeFileSync(file, result, 'utf8');
  console.log(`✅ ${file}`);
}

// ── Ajouter section complète ──────────────────────────────────────────────────
for (const { file, insertBefore, cards } of NEW_PAGES) {
  process(file, src => {
    const idx = src.indexOf(insertBefore);
    if (idx === -1) return src;
    return src.slice(0, idx) + section(cards) + src.slice(idx);
  });
}

// ── Enrichir maillage existant ────────────────────────────────────────────────
for (const { file, add } of ENRICH_PAGES) {
  process(file, src => {
    // Trouver la section MAILLAGE INTERNE
    const sectionStart = src.indexOf('MAILLAGE INTERNE');
    if (sectionStart === -1) {
      console.log(`⚠️  ${file} — section MAILLAGE INTERNE non trouvée`);
      return src;
    }
    // Dans cette section, trouver la fermeture du lp-links-grid
    const gridEnd = src.indexOf('    </div>', sectionStart);
    if (gridEnd === -1) return src;

    // Filtrer les liens déjà présents (évite doublons)
    const snippet = src.slice(sectionStart, gridEnd);
    const toAdd = add.filter(cardHtml => {
      const href = cardHtml.match(/href="([^"]+)"/)?.[1] ?? '';
      return !snippet.includes(href);
    });
    if (toAdd.length === 0) {
      console.log(`⏭️  ${file} — tous les liens déjà présents`);
      return src;
    }

    return src.slice(0, gridEnd) + toAdd.join('\n') + '\n' + src.slice(gridEnd);
  });
}

console.log('\nMaillage interne terminé.');
