# 08 — REBUILD-01 RAPPORT FINAL
## CA-TECH V2 — Homepage Complete Rebuild
**Date :** 28 septembre 2026  
**Statut :** Complété ✓

---

## Périmètre

Rebuild complet de la homepage. Fichiers touchés :
- `src/pages/Home.jsx` — reconstruit intégralement
- `src/pages/Home.css` — reconstruit intégralement
- `src/components/layout/Header.css` — floating pill nav
- `src/components/layout/Header.tsx` — updated class names
- `src/components/Footer.css` — tokens mis à jour
- `src/styles/tokens.css` — nouveau système + backward compat aliases
- `src/styles/globals.css` — reset + reveal system
- `index-src.html` — IBM Plex Sans Condensed ajouté
- `docs/redesign/07-DESIGN-MD-IMPLEMENTATION.md` — créé

---

## Architecture homepage — 10 sections

| # | Section | Background | Narrative visuelle |
|---|---------|------------|-------------------|
| 01 | HERO | `--canvas` dark | Orb atmosphérique + badge + headline stacked |
| 02 | POSITIONNEMENT | `--white` light | 4 cartes expertise en grille |
| 03 | IA | `--canvas` dark | Split — copy + chat mockup Loïc (CSS) |
| 04 | AUTOMATISATION | `--white` light | Workflow INPUT→IA→ANALYSE→CRM→EMAIL→ACTION |
| 05 | WEB & SAAS | `--canvas` dark | Split — copy + 2 product cards tilted (screenshots réels) |
| 06 | INFRASTRUCTURE | `--white` light | Architecture diagram CSS (CDN→LB→Services→DB) |
| 07 | RÉALISATIONS | `--canvas-1` dark | 3 screenshots réels (CA-TECH Manager, CV Magic, Branding) |
| 08 | MÉTHODE | `--white` light | Parcours éditorial 5 étapes (01–05) |
| 09 | À PROPOS | `--canvas` dark | Split — bio + stats (2023 / 100+ / 48h / PME) |
| 10 | CTA FINAL | `--canvas-1` dark | Headline display + bouton unique |

---

## Design system appliqué

### Typographie
| Usage | Font | Size | Line-height |
|-------|------|------|-------------|
| Hero headline | IBM Plex Sans Condensed 700 | clamp(48px, 7vw, 88px) | 0.90 |
| Section h2 | IBM Plex Sans Condensed 700 | clamp(40px, 5vw, 64px) | 0.92 |
| CTA headline | IBM Plex Sans Condensed 700 | clamp(40px, 5vw, 72px) | 0.90 |
| Body | IBM Plex Sans 400 | 16px | 1.7 |
| Labels/nav | IBM Plex Sans 500 | 13px | — |
| Buttons | IBM Plex Sans 600 | 13–16px | — |

### Navigation (floating pill)
- `position: fixed; top: 20px; border-radius: 28px`
- `background: rgba(5,16,30,.88); backdrop-filter: blur(16px)`
- Logo | Links (centered absolute) | CTA (right)
- Mobile: hamburger → drawer below pill
- Scroll state: opacity 0.88 → 0.96, border renforcée

### Animations
- IntersectionObserver + `.reveal` / `.visible` (CSS-only)
- Delays 1–4 : 80ms, 160ms, 240ms, 320ms
- `prefers-reduced-motion` : toutes les animations désactivées

### Narratives visuelles
- **IA** : Composant `.ia-chat` CSS — header (avatar + status), messages user/bot, input fictif
- **Automatisation** : `.home-auto__workflow` — 6 chips reliés par flèches, chip IA accentué
- **Web & SaaS** : `.web-card--back` + `.web-card--front` — rotate ±2–4deg, shadow mockup
- **Infrastructure** : `.home-infra__diagram` — tiers CDN→LB→Services→DB avec `.infra-conn` verticaux

### Assets réels utilisés
| Section | Source |
|---------|--------|
| Web & SaaS (back card) | `/portfolio/cv-magic/home.webp` |
| Web & SaaS (front card) | `/portfolio/ca-tech-manager/dashboard.webp` |
| Réalisations #1 | `/portfolio/ca-tech-manager/home.webp` |
| Réalisations #2 | `/portfolio/cv-magic/home.webp` |
| Réalisations #3 | `/portfolio/branding/logo1.webp` |
| Automatisation tools | `/automatisations/{gmail,slack,google-calendar,telegram,whatsapp}.webp` |

---

## Build production

```
✓ built in 488ms — 0 erreurs, 0 warnings critiques
```

2 avertissements pré-existants non-module (`axeptio-consent.js`, `loic-widget.js`) — inchangés.

---

## Règles DESIGN.MD respectées

| Règle | Statut |
|-------|--------|
| Une seule couleur accent (#359BD9) | ✓ |
| Sections dark/light alternent | ✓ (8/10 strict, 9+10 dark car closing block) |
| Line-height ≤ 0.92 sur display | ✓ (0.90 hero, 0.92 sections) |
| IBM Plex Sans Condensed display uniquement | ✓ |
| IBM Plex Sans tout le reste | ✓ |
| 8px spacing base | ✓ |
| Pas de gradient entre sections | ✓ (coupes nettes) |
| Pas de shadows sur éléments plats | ✓ |
| prefers-reduced-motion ABSOLU | ✓ |
| Pas de photographies stock | ✓ (screenshots réels uniquement) |

---

## Fichiers NON touchés

Conformément au brief REBUILD-01 :
- `/expertises/*` — Phase 04
- `/a-propos` — Phase 04
- `/realisations` — inchangé
- `/contact` — inchangé
- `/services`, `/tarifs`, autres pages — inchangés
- `vercel.json` redirects — Phase 04
- Backend, Supabase, Stripe, intégrations — inchangés
- `package.json`, configs — inchangés

---

## Prochaines étapes — Phase 04

```
Sprint 1 : Pages Expertises × 4 (/expertises/ia, /automatisation, /web-saas, /infrastructure)
Sprint 2 : Page À propos (/a-propos)
Sprint 3 : Page Contact refonte
Sprint 4 : Redirections vercel.json (301 /services, /collaborateurs-ia, /automatisations, /catalogue)
Sprint 5 : Images réalisations additionnelles
```
