# PHASE 03 — RAPPORT D'IMPLÉMENTATION
## CA-TECH V2 — Homepage V2
**Date :** 28 septembre 2026  
**Statut :** Complété ✓

---

## Périmètre réalisé

Homepage V2 complète — 7 sections narratives + Header V2 + Footer V2 + Design System fondation.

---

## Fichiers créés

| Fichier | Rôle |
|---------|------|
| `src/styles/tokens.css` | Variables CSS — palette, typo, spacing, radius, motion |
| `src/styles/globals.css` | Reset + base typography + utilitaires globaux |
| `src/pages/Home.css` | Styles homepage (sections 1–7) |
| `src/pages/Home.jsx` | Homepage V2 — remplacé intégralement |
| `docs/redesign/PHASE-03-REPORT.md` | Ce fichier |

---

## Fichiers modifiés

| Fichier | Modification |
|---------|-------------|
| `index-src.html` | IBM Plex Serif + Sans (remplace Inter + Rajdhani), title/meta/OG/Twitter V2, theme-color `#05101E` |
| `src/main.jsx` | Import `./styles/globals.css` en premier |
| `src/components/layout/Header.tsx` | Nouvelle nav 5 items + dropdown Expertises → `/expertises/*` |
| `src/components/layout/Header.css` | Styles V2 — tokens, suppression glassmorphism excessif, nouvelles classes |
| `src/components/Footer.jsx` | Nouvelle structure — Brand, Expertises (4), Navigation, Zones |
| `src/components/Footer.css` | Styles V2 — tokens CSS, 4 colonnes, footer brand sans Rajdhani |
| `vite.config.js` | Ajout `/a-propos`, `/expertises/*` aux SPA_ROUTES |

---

## Architecture Homepage V2

```
01 HERO              → deep navy, IBM Plex Serif 300 72px clamp, italic accent
02 POSITIONNEMENT    → surface-1 (navy), éditorial 2 paragraphes
03 EXPERTISES        → deep navy, grille 2×2 hairline borders
04 RÉALISATIONS      → surface-1, 1 featured (21/9) + 2 mini (16/9)
05 MÉTHODE           → deep navy, 5 étapes horizontales hairline
06 À PROPOS          → surface-1, éditorial + ghost CTA /a-propos
07 CTA FINAL         → deep navy + radial gradient accent, centré
```

---

## Design System — Tokens V2

### Palette appliquée
- `--deep-navy: #05101E` — fond principal
- `--navy: #102740` — surface-1 (sections alternées)
- `--technical-blue: #1A4066` — surface-2, bordures cards
- `--tech-blue: #359BD9` — accent unique (eyebrows, liens actifs, italiques, CTA)
- `--cool-white: #F2F4F6` — texte primaire
- `--light-silver: #E0E0E3` — texte secondaire
- `--silver: #B0B4BA` — texte tertiaire

### Typographie
- Headlines: `IBM Plex Serif, weight 300` — importée via Google Fonts
- Body/UI: `IBM Plex Sans, weight 300/400/500`
- Rajdhani → supprimé partout
- Inter → supprimé partout

### Règles respectées
- ✓ Zéro `style={{}}` inline dans Home.jsx
- ✓ Zéro statistiques non sourcées
- ✓ Zéro bento SaaS générique
- ✓ Italic accent uniquement sur `<em>votre entreprise.</em>` dans le Hero — éditorial, pas systématique
- ✓ `prefers-reduced-motion` absolu dans globals.css (animation et transition à .01ms)

---

## Scoping fond sombre

Le fond `#05101E` est scopé à `.home-page` uniquement :

```css
.home-page { background: var(--deep-navy); }
html:has(.home-page) { background: var(--deep-navy); }
```

Les autres pages (Tarifs, Services, etc.) conservent leur propre fond via leurs CSS — vérification Playwright confirmée : `/tarifs` non affecté.

---

## Navigation V2

**Desktop :** ACCUEIL · EXPERTISES ▾ · RÉALISATIONS · À PROPOS · CONTACT · [Démarrer]  
**Mobile :** Logo + hamburger → menu drawer avec Expertises accordion

Dropdown Expertises :
- Intelligence Artificielle → `/expertises/ia`
- Automatisation → `/expertises/automatisation`
- Web & SaaS → `/expertises/web-saas`
- Infrastructure IT → `/expertises/infrastructure`

CTA nav : "Démarrer" → `/contact`  
Logo sub-label : "Cabinet Technologique" (remplace "Agence Web & Design")

---

## Footer V2

Structure 4 colonnes : Brand + desc + contacts · Expertises · Navigation · Zones  
"Solutions" colonne supprimée, liens `/catalogue` et `/collaborateurs-ia` retirés.

---

## QA Playwright — Résultats

| Section | Statut | Notes |
|---------|--------|-------|
| Hero | ✓ | Headline serif 300, italic accent, CTAs full-width mobile |
| Positionnement | ✓ | Body text 300 weight, section transition navy |
| Expertises | ✓ | 2×2 grid hairline borders, hover state fonctionnel |
| Réalisations | ✓ | Featured full-width + 2 mini, tags, "Voir toutes" ghost CTA |
| Méthode | ✓ | 5 colonnes horizontales desktop, responsive |
| À propos | ✓ | Contenu éditorial, ghost CTA /a-propos |
| CTA Final | ✓ | Centré, gradient radial accent, bouton primary large |
| Header V2 | ✓ | Nouveau nav, logo sub-label correct, dropdown, mobile ham |
| Footer V2 | ✓ | 4 colonnes, accent colors, zones tags |
| /tarifs | ✓ | Page blanche inchangée — fond propre non affecté |
| Mobile 375px | ✓ | Headline wraps correctement, CTAs full-width, hamburger |

### Bug corrigé en cours de QA
- **Spacing mobile headline** : `<br>` hidden sur mobile provoquait `systèmesqui` → corrigé avec `{' '}` explicites
- **Schema error** : `organizationSchema` utilisé comme fonction → corrigé `useJsonLd('home-org', organizationSchema)`

---

## Build production

```
✓ built in 872ms — 0 erreurs, 0 warnings critiques
```

2 avertissements pre-existants sur scripts non-module (`axeptio-consent.js`, `loic-widget.js`) — non liés à cette phase.

---

## Connu / À surveiller

| Élément | Note |
|---------|------|
| Images réalisations | `/assets/realisations/*.webp` n'existent pas encore → placeholder color `var(--technical-blue)` — à alimenter Phase 04 |
| Routes `/expertises/*` et `/a-propos` | Renvoient 404 (pages non créées) — normal Phase 03 |
| Redirect 301 `/services → /expertises/web-saas` | À ajouter dans `vercel.json` Phase 04 |
| Build shell `build.sh` | Pas re-exécuté — à faire avant déploiement pour sync dist/ |
| `css/main.css` | N'est plus importé par Home.jsx — fichier conservé (importé par aucune autre page) |

---

## Prochaines étapes — Phase 04

```
Sprint 1 : Pages Expertises × 4 (/expertises/ia, /automatisation, /web-saas, /infrastructure)
Sprint 2 : Page À propos (/a-propos)
Sprint 3 : Page Contact refonte
Sprint 4 : Redirections vercel.json (301 /services, /collaborateurs-ia, /automatisations, /catalogue)
Sprint 5 : Images réalisations réelles
```
