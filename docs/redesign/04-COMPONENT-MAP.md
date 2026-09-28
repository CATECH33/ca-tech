# 04 — COMPONENT MAP
## CA-TECH V2 — Inventaire des composants & décisions
**Date :** 28 septembre 2026 — **Mis à jour :** 28 septembre 2026

---

## Pages SPA actuelles — décisions

| Page | Fichier actuel | Décision | Notes |
|------|---------------|---------|-------|
| Home | `src/pages/Home.jsx` | REFONTE COMPLÈTE | Structure éditoriale, suppression stats |
| Services | `src/pages/Services.jsx` | REMPLACER | Devient 4 pages `/expertises/*` |
| CollaborateursIA | `src/pages/CollaborateursIA.jsx` | ARCHIVER | Contenu migré vers `/expertises/ia` |
| Automatisations | `src/pages/Automatisations.jsx` | ARCHIVER | Contenu migré vers `/expertises/automatisation` |
| Catalogue | `src/pages/Catalogue.jsx` | SUPPRIMER | Plus de section "Catalogue" dans l'archi |
| Realisations | `src/pages/Realisations.jsx` | REFONTE | Intégrer les réalisations statiques |
| Contact | `src/pages/Contact.jsx` | REFONTE | Formulaire React natif (migration depuis `devis.html`) |
| Tarifs | `src/pages/Tarifs.jsx` | REFONTE légère | Design update, contenu à valider |
| Loic | `src/pages/Loic.jsx` | REFINE | Pas de refonte structurelle, restyling |
| SeoPage | `src/pages/SeoPage.jsx` | KEEP | SEO pages locales — ne pas toucher |
| PolitiqueCookies | `src/pages/PolitiqueCookies.jsx` | KEEP | Légal |
| CookiePolicy | `src/pages/CookiePolicy.jsx` | KEEP | Légal |

### Pages à créer (Phase 02)

| Route | Fichier cible | Priorité |
|-------|--------------|---------|
| `/expertises/ia` | `src/pages/expertises/IA.jsx` | P1 |
| `/expertises/automatisation` | `src/pages/expertises/Automatisation.jsx` | P1 |
| `/expertises/web-saas` | `src/pages/expertises/WebSaas.jsx` | P1 |
| `/expertises/infrastructure` | `src/pages/expertises/Infrastructure.jsx` | P2 |
| `/a-propos` | `src/pages/APropos.jsx` | P1 |

---

## Composants layout — décisions

| Composant | Fichier | Décision | Action |
|-----------|---------|---------|--------|
| Header / Nav | `src/components/layout/Header.tsx` | REFONTE | Nouvelle structure 5 items + dropdown Expertises |
| Footer | `src/components/Footer.jsx` | REFONTE | Nouveau design, liens mis à jour |
| Layout wrapper | `src/App.jsx` | REFACTOR | Ajouter nouvelles routes + supprimer /catalogue |
| PWA Install Banner | `src/components/PwaInstallBanner.tsx` | KEEP | Fonctionnel, pas de modification |

---

## Composants UI actuels — décisions

| Composant | Localisation | Décision | Justification |
|-----------|-------------|---------|---------------|
| `ExpertiseCard` (avec images) | `Home.jsx` inline | REMPLACER | Cards génériques avec images stock → éditorial |
| `SeoSection` | `src/components/SeoContent.jsx` | KEEP/RESTYLER | Structure solide pour SEO |
| `SeoMethod` | `src/components/SeoContent.jsx` | KEEP/RESTYLER | |
| `SeoComparison` (tableau) | `src/components/SeoContent.jsx` | SUPPRIMER | Anti-pattern générique |
| `SeoProse` | `src/components/SeoContent.jsx` | KEEP/RESTYLER | |
| `SeoFaq` | `src/components/SeoContent.jsx` | KEEP/RESTYLER | |
| Proof stats (200+, 98%...) | `Home.jsx` inline | SUPPRIMER | Statistiques non sourcées |
| `DetailDrawer` | `src/components/DetailDrawer.jsx` | ÉVALUER | Utile pour Réalisations si besoin |
| `HeroVideo` | `src/components/hero/HeroVideo.tsx` | REFINE | Concept pertinent, intégrer dans hero V2 |

---

## Composants à créer (Phase 02)

### Atoms

| Composant | Props clés | Rôle |
|-----------|-----------|------|
| `Button` | `variant` (primary/ghost/outline), `size`, `href` | CTA |
| `Badge` | `label`, `variant` | Tag technique |
| `Eyebrow` | `label`, `onDark?` | Label de section |
| `Icon` | `name`, `size` | SVG linéaire technique |

### Molecules

| Composant | Props clés | Rôle |
|-----------|-----------|------|
| `SectionHeader` | `eyebrow`, `title`, `intro`, `align` | En-tête de section |
| `WorkCard` | `project` (titre, client, kpis, image), `featured?` | Réalisation |
| `ExpertiseItem` | `title`, `desc`, `href` | Ligne d'expertise dans la grille |
| `MethodStep` | `number`, `title`, `desc` | Étape de méthode |
| `Breadcrumb` | `items` | Fil d'Ariane pages internes |

### Organisms

| Composant | Rôle |
|-----------|------|
| `HeroSection` | Hero éditorial : headline + corps + CTAs |
| `EditorialBlock` | Section 2 colonnes texte sur surface-1 |
| `WorkGrid` | 1 featured + 2–3 miniatures |
| `ExpertiseGrid` | 4 domaines en 2×2 |
| `MethodTimeline` | 5 étapes horizontales |
| `CTASection` | Section finale headline + bouton |

---

## Organisation CSS cible

```
src/styles/
├── tokens.css          ← Variables CSS — couleurs, typo, spacing, radius
├── reset.css           ← Reset minimal
├── typography.css      ← Styles globaux Plex Serif / Plex Sans
├── layout.css          ← Container, grid, sections
├── components/
│   ├── button.css
│   ├── badge.css
│   ├── card.css
│   ├── nav.css
│   └── footer.css
└── pages/
    ├── home.css
    ├── expertises.css
    ├── realisations.css
    └── ...
```

**Règle absolue :** Zéro `style={{ }}` inline dans les composants JSX/TSX.  
Toute variation via CSS custom properties ou classes CSS sémantiques.

---

## Convention de nommage

| Élément | Convention | Exemple |
|---------|-----------|---------|
| Composants | PascalCase | `WorkCard`, `HeroSection` |
| Fichiers composants | `NomComposant.tsx` + `NomComposant.css` | |
| Classes CSS | kebab-case | `.work-card`, `.hero-section` |
| Modificateurs CSS | `--` BEM léger | `.btn--primary`, `.card--featured` |
| Tokens CSS | `--catégorie-nom` | `--color-tech-blue`, `--space-section` |

---

## Priorité d'implémentation (Phase 02)

```
Sprint 1 : tokens.css + reset + layout + typo + Button + Badge + Eyebrow
Sprint 2 : Header V2 + Footer V2
Sprint 3 : Homepage V2 complète
Sprint 4 : Pages Expertises IA + Automatisation
Sprint 5 : Pages Expertises Web/SaaS + Infrastructure
Sprint 6 : Page Réalisations + WorkCard + WorkGrid
Sprint 7 : Page À propos + Contact refonte
Sprint 8 : Tarifs refonte + Loïc restyling
Sprint 9 : Tests, perf, accessibilité
Sprint 10 : Déploiement production
```
