# PHASE 03.1 — RAPPORT D'IMPLÉMENTATION
## CA-TECH V2 — Art Direction Correction + Hero Refinement
**Date :** 28 septembre 2026  
**Statut :** Complété ✓

---

## Périmètre réalisé

Correction de direction artistique sur la homepage uniquement.  
Fichiers touchés : `src/pages/Home.jsx` + `src/pages/Home.css` uniquement.

---

## Changements par section

### 01 — Hero (reconstruit)

| Élément | Avant (Phase 03) | Après (Phase 03.1) |
|---------|------------------|--------------------|
| Headline | "Nous concevons les systèmes qui font fonctionner *votre entreprise.*" | **"LA TECHNOLOGIE AU TRAVAIL."** (majuscules, uppercase CSS) |
| Eyebrow | "Cabinet technologique français" | **"CA-TECH / TECHNOLOGIE · IA · AUTOMATISATION"** avec numéro de section "01" |
| Body | "CA-TECH accompagne les PME françaises..." | **"CA-TECH conçoit, automatise et déploie des systèmes numériques adaptés aux besoins réels des entreprises."** |
| CTA primaire | "Démarrer un diagnostic" | **"Parler de votre projet"** |
| CTA ghost | "Voir nos réalisations" | **"Voir les réalisations"** |
| Composition | Heading centré, max-width 860px | **Architectural** — ligne fine sous nav (`::before`), meta row num+eyebrow, diviseur fin, headline max-width libre |
| `<br>` | `.home-hero-br` (hidden mobile) | `.hero-break` (hidden sous 640px) |

Éléments architecturaux ajoutés :
- **Ligne fine sous la nav** : `::before { top: var(--nav-h); height: 1px }` — sépare visuellement la nav du contenu
- **Diviseur interne** : `.home-hero-divider` entre le meta row et la headline — crée une hiérarchie typographique
- **Section number** : "01" en monospace dim — référence éditoriale

---

### 03 — Expertises (refondu)

**Avant :** `.expertises-grid` — grille 2×2 avec 4 cartes identiques.

**Après :** `.expertises-list` — liste éditoriale numérotée avec lignes séparatrices hairline.

Structure par item :
```
[01]  [Titre expertise (serif 2xl–4xl)]  [→]
      [Description (sans sm, tertiary)]
```

- Bordure `border-top` sur la liste, `border-bottom` sur chaque `<li>`
- `grid-template-columns: clamp(40px, 5vw, 64px) 1fr auto`
- Hover : numéro passe en accent, titre passe en accent, flèche apparaît avec translateX
- Arrow opacity 0 → 1 au hover (subtle, pas systématique)

---

### 05 — Méthode (refondu)

**Avant :** `.method-steps` — grille 5 colonnes égales avec 5 cellules identiques.

**Après :** `.method-parcours` — parcours éditorial avec lignes hairline, 3 colonnes sur desktop.

Structure par étape :
```
Desktop 1024+ : [01]  [Comprendre    ]  [Description complète...]
Tablet 1024-  : [01]  [Comprendre                              ]
                      [Description complète...                 ]
Mobile 640-   : [01]  [Comprendre                              ]
                      [Description...                          ]
```

- `grid-template-columns: clamp(40px, 5vw, 64px) 200px 1fr` sur desktop
- Collapse à `2 colonnes` sous 1024px avec `grid-column: 2` sur la description
- `font-variant-numeric: tabular-nums` sur les numéros

---

### 06 — À propos (complété)

Ajout du bloc fondateur :
```
Jean Kevin PEMOU
Consultant en technologie, IA et infrastructure.
```

Rendu : `.home-about-founder` avec `border-top` + `border-bottom` — encadré éditorial sobre, entre les corps de texte et le CTA ghost.

---

### 07 — CTA Final (refondu)

| Élément | Avant | Après |
|---------|-------|-------|
| Headline | "Prêt à faire fonctionner votre entreprise autrement ?" | **"Parlons de votre prochain système numérique."** |
| Eyebrow | — (absent) | **"Un projet à construire ?"** (texte xs uppercase accent) |
| CTA | "Démarrer un diagnostic gratuit" | **"Parler de votre projet"** |
| Corps | "30 minutes · Gratuit · Compte-rendu écrit" | Supprimé — pas dans le brief |

---

## Direction artistique appliquée

| Principe | Application |
|----------|-------------|
| PREMIUM | Typo seul comme design, lignes hairline, whitespace généreux |
| TECHNOLOGICAL | Section number 01, `font-variant-numeric`, `letter-spacing: .2em` |
| EDITORIAL | Liste numérotée Expertises, parcours Méthode (vs cartes) |
| FRENCH | Corps de texte sobre, pas de superlatives |
| HUMAN | Jean Kevin PEMOU nommé, CTA "Parler de votre projet" |
| PRÉCIS | "La technologie au travail" — direct, sans effets de style |

Anti-patterns éliminés :
- ✗ Grille 2×2 de cartes identiques → liste éditoriale
- ✗ 5 cellules égales → parcours 3-colonnes
- ✗ "Démarrer un diagnostic" (tone startup) → "Parler de votre projet"
- ✗ Blob / glow → diviseur fin + ligne sous nav
- ✗ Headline italic accent → uppercase typographique

---

## Build production

```
✓ built in 583ms — 0 erreurs, 0 warnings critiques
```

2 avertissements pré-existants non-module (`axeptio-consent.js`, `loic-widget.js`) — inchangés.

---

## Connu / Non touché

| Élément | Statut |
|---------|--------|
| `/expertises/*` | 404 — Phase 04 |
| `/a-propos` | 404 — Phase 04 |
| `vercel.json` redirects | Phase 04 |
| Images `/assets/realisations/*.webp` | Placeholder color — Phase 04 |
| Section Positionnement | Inchangée (contenu correct) |
| Section Réalisations | Inchangée (structure correcte) |

---

## Prochaines étapes — Phase 04

```
Sprint 1 : Pages Expertises × 4 (/expertises/ia, /automatisation, /web-saas, /infrastructure)
Sprint 2 : Page À propos (/a-propos)
Sprint 3 : Page Contact refonte
Sprint 4 : Redirections vercel.json (301 /services, /collaborateurs-ia, /automatisations, /catalogue)
Sprint 5 : Images réalisations réelles (/assets/realisations/*.webp)
```
