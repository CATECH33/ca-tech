#!/usr/bin/env node
/**
 * Corrige les caractères U+FFFD (`�`) dans les fichiers HTML.
 * Ordre :
 *  1. Phrases figées (currency, ranges, tokens spéciaux "jusqu'à", "d'où"...)
 *  2. `à` — listes blanches de contextes ("� Paris", "� partir", "mises � jour"...)
 *  3. Em-dash — standalone `<word> � <word>` non couvert par la liste blanche
 *  4. Dictionnaire de mots (è, ê, ç, ô, û, î, â, œ)
 *  5. Fallback — tout `�` restant devient `é`
 *
 * Utilisation :  node scripts/_fix-encoding.mjs [--dry-run] [fichier1 fichier2 …]
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { basename } from 'node:path'

const R = '�'

/* ═════════════════════════════════════════════════════════════════════════════
   Étape 1 — Phrases figées, currency, dimensions, ranges numériques
   ═════════════════════════════════════════════════════════════════════════════ */

const PHRASE_RULES = [
  // Range between two numbers (avant currency pour "3 � 5" → "3 à 5", pas "3 € 5")
  { re: /(\d)(\s|&nbsp;)�(\s|&nbsp;)(\d)/gu, to: '$1$2à$3$4' },
  // Dimension pattern: 2000�2000 → 2000×2000
  { re: /(\d)�(\d)/gu, to: '$1×$2' },
  // Currency — with space: 990 � → 990 € (après range)
  { re: /(\d)(\s|&nbsp;)�(?=[^\p{L}\p{N}]|$)/gu, to: '$1$2€' },
  // Currency — no space: 139� → 139€
  { re: /(\d)�(?=[^\p{L}\p{N}]|$)/gu, to: '$1€' },

  // Fixed idioms
  { re: /jusqu'�/g,     to: "jusqu'à" },
  { re: /Jusqu'�/g,     to: "Jusqu'à" },
  { re: /au-del�/g,     to: 'au-delà' },
  { re: /Au-del�/g,     to: 'Au-delà' },
  { re: /d�j�/g,        to: 'déjà' },
  { re: /D�j�/g,        to: 'Déjà' },
  { re: /face-�-face/g, to: 'face-à-face' },
  { re: /d'o�/g,        to: "d'où" },
  { re: /'�'/g,         to: "'à'" },
]

/* ═════════════════════════════════════════════════════════════════════════════
   Étape 2 — Contexte "à" (mot standalone) : `� <keyword>` où <keyword> est
   sémantiquement lié à la préposition "à".
   ═════════════════════════════════════════════════════════════════════════════ */

const A_KEYWORDS = [
  // prépositions / articles / expressions figées
  'partir', 'proximit[ée]', 'nouveau', 'nouvelle', 'nouveaux', 'nouvelles',
  'jour', 'jours', 'la\\b', 'La\\b', "l'", 'l&#39;',
  'construire', 'dominer', 'l&#39;utilisation', "l'utilisation",
  'toute', 'tout', 'toutes', 'tous', 'Chaque', 'chaque',
  'notre', 'Notre', 'votre', 'Votre', 'nos', 'Nos', 'vos', 'Vos',
  "l'aveugle", 'travers', 'traversers?', 'travailler',
  'elle seule', 'elle-m[eê]me',
  // villes / lieux fréquents
  'Paris', 'Lyon', 'Dijon', 'Troyes', 'Marseille', 'Bordeaux',
  'Reims', 'Nantes', 'Toulouse', 'Lille', 'Rennes', 'Grenoble',
  'Cannes', 'Montpellier', 'Rouen', 'Metz', 'Nancy', 'Amiens', 'Nice',
  'Strasbourg', 'Station', 'Talant', 'Chen[êe]ve',
  'La\\s+D[éeè]fense', 'La\\s+Cit[eé]',
  // temps / quantités
  '2\\s+fois', 'quelques', 'plusieurs', '30\\s*min', '48\\s*h',
]

// standalone `� <keyword>` (lookbehind: not preceded by a letter/digit → not a broken word-ending)
const A_CONTEXT_RE = new RegExp(
  `(?<![\\p{L}\\p{N}])�(\\s|&nbsp;)(${A_KEYWORDS.join('|')})`,
  'gu',
)

/* ═════════════════════════════════════════════════════════════════════════════
   Étape 3 — Em-dash : standalone ` � ` entre deux mots (souvent parenthétique).
   Appliqué APRÈS la règle `à` — donc tout ` � ` qui reste devient ` — `.
   ═════════════════════════════════════════════════════════════════════════════ */

const EMDASH_RE = /(?<=\s|&nbsp;)�(?=\s|&nbsp;)/g

/* ═════════════════════════════════════════════════════════════════════════════
   Étape 4 — Dictionnaire de mots (non-é seulement)
   ═════════════════════════════════════════════════════════════════════════════ */

const WORDS = {
  /* è */
  'd�s': 'dès', 'D�s': 'Dès',
  'apr�s': 'après', 'Apr�s': 'Après',
  'tr�s': 'très',
  'pr�s': 'près',
  'aupr�s': 'auprès',
  'succ�s': 'succès',
  'acc�s': 'accès',
  "d'acc�s": "d'accès", "l'acc�s": "l'accès",

  'si�cle': 'siècle', 'si�cles': 'siècles',
  'si�ge': 'siège', 'si�ges': 'sièges',
  'mati�re': 'matière', 'mati�res': 'matières', 'MATI�RES': 'MATIÈRES',
  'mani�re': 'manière', 'mani�res': 'manières',
  'premi�re': 'première', 'Premi�re': 'Première', 'premi�res': 'premières',
  'derni�re': 'dernière', 'Derni�re': 'Dernière',
  'enti�re': 'entière', 'enti�rement': 'entièrement',
  'particuli�re': 'particulière', 'particuli�rement': 'particulièrement',
  'financi�re': 'financière', 'financi�res': 'financières',
  'r�guli�re': 'régulière', 'r�guli�res': 'régulières', 'r�guli�rement': 'régulièrement',
  'saisonni�re': 'saisonnière', 'saisonni�res': 'saisonnières',
  'douani�res': 'douanières',
  '�trang�res': 'étrangères', '�trangers': 'étrangers',
  'fronti�res': 'frontières',
  'crit�res': 'critères',
  'client�le': 'clientèle',
  // Adj. complète/complètes (feminine) — è; compléter/complément → fallback é
  'compl�te': 'complète', 'Compl�te': 'Complète',
  'compl�tes': 'complètes', 'Compl�tes': 'Complètes',
  'compl�tement': 'complètement',
  'mod�le': 'modèle', 'mod�les': 'modèles',
  'coll�gue': 'collègue', 'coll�gues': 'collègues',
  'fr�re': 'frère', 'fr�res': 'frères',
  'r�gle': 'règle', 'r�gles': 'règles',
  'r�glement': 'règlement',
  'r�glementation': 'règlementation', // rare form
  'p�re': 'père', 'm�re': 'mère', 'p�res': 'pères', 'm�res': 'mères',
  'r�le': 'rôle', 'R�le': 'Rôle',
  'r�ve': 'rêve', 'r�ves': 'rêves',
  'ma�s': 'maïs',
  'ci-apr�s': 'ci-après',
  'l�ve': 'lève', 'l�vent': 'lèvent',
  'rel�ve': 'relève', 'rel�vent': 'relèvent',
  'pr�l�ve': 'prélève', 'pr�l�vent': 'prélèvent',
  'obsol�te': 'obsolète', 'obsol�tes': 'obsolètes',
  'pi�ce': 'pièce', 'pi�ces': 'pièces',
  'poss�de': 'possède', 'poss�dent': 'possèdent',
  'proc�de': 'procède', 'proc�dent': 'procèdent',
  'acc�de': 'accède', 'acc�dent': 'accèdent',
  'progr�s': 'progrès',
  'proc�s': 'procès',
  'g�ne': 'gène', 'g�nes': 'gènes',
  'hygi�ne': 'hygiène',
  'th�se': 'thèse',
  'banni�re': 'bannière', 'banni�res': 'bannières', 'Banni�re': 'Bannière',
  'passag�re': 'passagère',
  'l�g�re': 'légère',
  'guerri�re': 'guerrière',
  'derri�re': 'derrière',
  'ri�re': 'rière',
  'r�unions': 'réunions', 'R�unions': 'Réunions',

  'deuxi�me': 'deuxième', 'troisi�me': 'troisième',
  '1�re': '1ère', '2�me': '2ème', '3�me': '3ème',
  '8�me': '8ème', '9�me': '9ème', '10�me': '10ème',
  '11�me': '11ème', '13�me': '13ème', '20�me': '20ème',

  'probl�me': 'problème', 'probl�mes': 'problèmes',
  'syst�me': 'système', 'syst�mes': 'systèmes', 'Syst�me': 'Système',
  'th�me': 'thème',
  'embl�me': 'emblème',

  '�me': 'âme', "l'�me": "l'âme",
  'F�te': 'Fête', 'f�tes': 'fêtes',
  'fen�tre': 'fenêtre',
  'requ�tes': 'requêtes', 'Requ�tes': 'Requêtes',
  'peut-�tre': 'peut-être',
  'bien-�tre': 'bien-être', 'Bien-�tre': 'Bien-être',
  '�tre': 'être',
  '�tes': 'êtes', '�tes-vous': 'êtes-vous',
  "d'�tre": "d'être",
  'vous-m�me': 'vous-même',
  'moi-m�me': 'moi-même',
  'elle-m�me': 'elle-même',
  'm�me': 'même', 'M�me': 'Même', 'm�mes': 'mêmes',
  'pr�t': 'prêt', 'Pr�t': 'Prêt', 'pr�ts': 'prêts', 'pr�te': 'prête',
  'en-t�te': 'en-tête', 't�te': 'tête',
  'go�t': 'goût', 'Go�t': 'Goût',
  'ambigu�t�': 'ambiguïté', 'ambigu�t�s': 'ambiguïtés',

  /* ç */
  'fran�ais': 'français', 'fran�aise': 'française', 'fran�aises': 'françaises',
  'fran�ais-anglais': 'français-anglais',
  'con�u': 'conçu', 'con�ue': 'conçue', 'con�us': 'conçus', 'con�ues': 'conçues',
  'con�oit': 'conçoit',
  'Con�u': 'Conçu',
  'commen�ons': 'commençons',
  're�oit': 'reçoit', 're�oivent': 'reçoivent',
  'Besan�on': 'Besançon',
  'pronon�able': 'prononçable',
  'commer�ant': 'commerçant', 'commer�ants': 'commerçants',
  'Commer�ants': 'Commerçants',
  'e-commer�ants': 'e-commerçants',
  'contrefa�on': 'contrefaçon',
  'aper�u': 'aperçu', 'Aper�u': 'Aperçu',
  'fa�on': 'façon',
  '�a': 'ça',

  /* ô */
  'C�te': 'Côte',
  "C�te-d'Or": "Côte-d'Or",
  'C�tes-du-Rh�ne': 'Côtes-du-Rhône',
  'Rh�ne': 'Rhône',
  'Rh�ne-Alpes': 'Rhône-Alpes',
  'Auvergne-Rh�ne-Alpes': 'Auvergne-Rhône-Alpes',
  "d'Auvergne-Rh�ne-Alpes": "d'Auvergne-Rhône-Alpes",
  'Chalon-sur-Sa�ne': 'Chalon-sur-Saône',
  'plut�t': 'plutôt',
  't�t': 'tôt',
  'H�tellerie': 'Hôtellerie', 'h�tellerie': 'hôtellerie',
  'Technop�le': 'Technopôle',
  'Lyonbiop�le': 'Lyonbiopôle',
  'p�le': 'pôle', 'p�les': 'pôles',
  'Contr�le': 'Contrôle', 'contr�le': 'contrôle', 'contr�lons': 'contrôlons',
  'M�con': 'Mâcon',
  'c�t�': 'côté', 'c�t�s': 'côtés',
  'ic�ne': 'icône',

  /* û */
  'co�t': 'coût', 'co�ts': 'coûts',
  'co�te': 'coûte', 'co�ter': 'coûter',
  'surco�t': 'surcoût', 'surco�ts': 'surcoûts',
  's�r': 'sûr',

  /* î */
  'bo�te': 'boîte',
  'ma�trise': 'maîtrise', 'ma�trisons': 'maîtrisons', 'ma�trisez': 'maîtrisez',
  'mara�chage': 'maraîchage',
  'appara�tre': 'apparaître', "d'appara�tre": "d'apparaître",
  'dispara�t': 'disparaît',
  'para�tre': 'paraître',
  'conna�t': 'connaît',
  'cro�t': 'croît',

  /* â */
  'ch�teau': 'château',
  'b�timent': 'bâtiment', 'b�timents': 'bâtiments',
  'b�che': 'bâche',
  'gr�ce': 'grâce', 'Gr�ce': 'Grâce',
  "l'�ge": "l'âge",
  "d'�ge": "d'âge",

  /* œ */
  'c�ur': 'cœur',
  '�uvre': 'œuvre', "l'�uvre": "l'œuvre",
  '�il': 'œil', "L'�il": "L'œil", "d'�il": "d'œil", "l'�il": "l'œil",

  /* Standalone "à" tokens */
  'l�': 'là',

  /* "où" */
  'o�': 'où',
  'O�': 'Où',
}

/* ═════════════════════════════════════════════════════════════════════════════
   Corrector
   ═════════════════════════════════════════════════════════════════════════════ */

function fix(src) {
  let out = src

  // Phase 1 : phrases + regex figées
  for (const { re, to } of PHRASE_RULES) out = out.replace(re, to)

  // Phase 2 : `à` par contexte (avant tout autre remplacement de `� `)
  out = out.replace(A_CONTEXT_RE, 'à$1$2')

  // Phase 3 : em-dash pour tout ` � ` restant entre deux tokens
  out = out.replace(EMDASH_RE, '—')

  // Phase 4 : dictionnaire mot par mot (bornes de mot custom pour couvrir `�`)
  const keys = Object.keys(WORDS).sort((a, b) => b.length - a.length)
  for (const k of keys) {
    if (!out.includes(k)) continue
    const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, 'gu')
    out = out.replace(re, WORDS[k])
  }

  // Phase 5 : fallback — `�` restant → `é`
  out = out.replace(/�/g, 'é')

  return out
}

/* ═════════════════════════════════════════════════════════════════════════════
   CLI
   ═════════════════════════════════════════════════════════════════════════════ */

const args = process.argv.slice(2)
const dry = args.includes('--dry-run')
const explicit = args.filter(a => !a.startsWith('--'))

const files = explicit.length
  ? explicit
  : readdirSync('.').filter(f => f.endsWith('.html'))

let changed = 0
for (const f of files) {
  let src
  try { src = readFileSync(f, 'utf8') } catch { continue }
  if (!src.includes(R)) continue

  const fixed = fix(src)
  const before = (src.match(/�/g) || []).length
  const after = (fixed.match(/�/g) || []).length

  if (dry) {
    console.log(`${f}: ${before} → ${after} � remaining`)
  } else {
    writeFileSync(f, fixed, 'utf8')
    console.log(`✓ ${basename(f)}  (${before} → ${after})`)
    changed++
  }
}
if (!dry) console.log(`\n${changed} fichiers modifiés.`)
