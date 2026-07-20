# UX-UI Quick Reference — CA-TECH
> Fiche de référence à joindre lors de toute demande d'implémentation de page.
> Document complet : `UX_UI_SPECIFICATION.md`
> Stratégie : `STRATEGY.md`

---

## Identité

- **Slogan** : « L'Intelligence Artificielle au service de votre croissance. »
- **Cabinet de conseil** IA-first — pas une agence web.
- **Piliers** : IA (1) · Automatisation (2) · SEO (3) · Dev Web (4 — moyen) · Design (support)
- **Inspirations design** : Apple · Stripe · Vercel · Linear

---

## Design System — Tokens essentiels

```
Couleurs
  --color-primary       #0066FF   CTA, accents
  --color-primary-dark  #0A2540   Hero fond, titres forts
  --color-primary-light #E8F0FF   Fonds cartes, badges
  --color-gray-50       #F9FAFB   Sections alternées
  --color-gray-200      #E5E7EB   Bordures
  --color-gray-600      #4B5563   Texte secondaire
  --color-gray-900      #111827   Titres
  --color-white         #FFFFFF   Fond principal
  --gradient-primary    linear-gradient(135deg, #0066FF 0%, #0A2540 100%)

Typographie (Inter uniquement)
  H1       60px / weight 800      (mobile : 48px)
  H2       36px / weight 700      (mobile : 30px)
  H3       24px / weight 600
  Corps    16px / line-height 1.6
  Sous-titre section  14px · uppercase · letter-spacing 0.08em · #0066FF · pill

Espacement
  Section desktop  96px haut/bas   Section mobile  64px
  Gap cartes       24px desktop     Gap cartes      16px mobile
  Container        max-width 1280px · padding 40px desktop / 20px mobile

Radius  sm:6px  md:10px  lg:16px  xl:24px  full:9999px
Ombres  sm: 0 1px 2px rgba(0,0,0,.05)   md: 0 4px 16px rgba(0,0,0,.08)
Icônes  Lucide Icons · 20px corps · 24px nav · 32px features
Anim.   transform/opacity uniquement · 150ms fast · 250ms normal · 400ms slow
        ease-out: cubic-bezier(0.16,1,0.3,1)
```

---

## Règles immuables

| Règle | Détail |
|-------|--------|
| Mobile first | Conçu sur 375px, étendu ensuite |
| 1 H1 par page | Contient le mot-clé SEO principal |
| 1 CTA primaire par page | Jamais deux Button primary côte à côte |
| Hiérarchie titres | H1 → H2 → H3, aucun saut de niveau |
| Focus toujours visible | `outline: 2px solid #0066FF; offset: 3px` |
| Zones cliquables | Min 44×44px (WCAG) |
| Images | WebP · `width`+`height` toujours définis · lazy sauf hero |
| Animations | `prefers-reduced-motion` toujours respecté |
| Contraste | ≥ 4.5:1 texte courant · jamais `--color-gray-400` sur fond blanc |
| Lighthouse | ≥ 90 perf · ≥ 95 a11y · 100 SEO — critère de livraison |

---

## Structure de page type (ordre des sections)

```
1. Header sticky (blur backdrop)
2. [Breadcrumb — hors homepage]
3. Hero  →  Pill badge · H1 · Sous-titre · CTA primaire · Stats
4. Chiffres clés / Proof bar
5. Features / Ce que nous faisons (cartes 2×3)
6. Bénéfices Avant/Après (50/50 desktop)
7. Process (Stepper 4 étapes)
8. Cas client / Réalisations (1-3 cartes)
9. Témoignages (carousel)
10. Tarifs / Formats de mission (optionnel)
11. FAQ Accordion (Schema.org FAQPage)
12. CTA final (fond gradient-primary · Button white xl · micro-copy)
13. Footer
14. Widget Loïc (fixe bas droite sur toutes les pages)
```

---

## CTA catalogue

| Bouton | Destination | Taille | Style |
|--------|-------------|--------|-------|
| Lancer mon Diagnostic IA → | `/diagnostic-ia` | xl | primary |
| Démarrer avec Loïc → | Widget Loïc / `/loic` | xl | white (sur fond sombre) |
| Demander un devis gratuit → | `/devis` | lg | primary |
| Réserver mon RDV → | Calendly 30 min | lg | primary |
| Voir nos réalisations → | `/nos-realisations` | lg | ghost |
| Parler à l'équipe → | `/contact` | md | secondary |

**Micro-copy sous CTA** (toujours présente) :
- Diagnostic : « Gratuit · Sans engagement · Résultat en 10 min »
- Devis : « Réponse sous 24h · Devis détaillé · Sans engagement »

---

## Pages du site — Référence rapide

| Page | H1 cible | CTA primaire | Schema.org |
|------|----------|-------------|-----------|
| `/` Homepage | « L'Intelligence Artificielle au service de votre croissance » | Diagnostic IA | WebSite + Organization |
| `/intelligence-artificielle` | « Déployez l'IA au cœur de votre activité » | Diagnostic IA | Service |
| `/automatisation` | « Automatisez ce qui vous ralentit » | Diagnostic IA | Service |
| `/seo` | « Soyez trouvé avant vos concurrents » | Devis gratuit | Service |
| `/developpement-web` | « Des sites qui performent. Pas juste qui existent. » | Devis gratuit | Service |
| `/loic` | « Bonjour, je suis Loïc. Votre consultant IA. » | Démarrer le diagnostic | Service |
| `/diagnostic-ia` | « Votre diagnostic IA en 10 minutes » | Recevoir mon rapport | — |
| `/nos-realisations` | « Des projets qui parlent d'eux-mêmes » | Diagnostic IA | CreativeWork |
| `/blog` | « IA, Automatisation, SEO — pour les dirigeants » | — | Blog |
| `/blog/[slug]` | Titre article | Diagnostic IA (inline) | Article |
| `/a-propos` | « Nous croyons que l'IA doit servir les humains » | Travailler avec nous | Organization + Person |
| `/contact` | « Parlons de votre projet » | Envoyer | — |
| `/devis` | « Votre devis en 3 minutes » | Recevoir mon devis | — |
| `/[service]-[ville]` | « [Service] à [Ville] » | Diagnostic IA | LocalBusiness |

---

## Header & Footer — Rappel

```
Header (desktop) :
[Logo CA-TECH]  Services ▾  Loïc  Réalisations  Blog  [Diagnostic IA →]
Sticky · backdrop-blur(12px) · bg rgba(255,255,255,0.85) · hauteur 72px

Header (mobile) :
[Logo]  [☰]  → Drawer 80vw · focus trap · CTA primary en bas

Footer :
[Logo + Slogan]
Expertise : IA | Automatisation | SEO | Dev Web | Design
Villes    : Paris | Lyon | Dijon | Troyes
Légal + Contact + © 2026 CA-TECH
```

---

## Accessibilité — Checklist rapide

- `<main id="main-content">` + skip link en haut
- 1 seul `<h1>` · hiérarchie H1→H2→H3 sans saut
- `alt` descriptif sur toutes les images informatives · `alt=""` sur décoratif
- `aria-label` sur icônes seules · `aria-describedby` sur erreurs formulaire
- `aria-expanded` sur accordéons, dropdowns, drawers
- Focus trap dans modales et widget Loïc
- Escape ferme toute modale / drawer / dropdown
- Stat countUp : valeur finale dans le DOM dès le chargement

---

## SEO — Checklist rapide

- `<title>` unique · 50-60 chars · mot-clé principal
- `<meta description>` unique · 145-155 chars
- Open Graph complet (og:title, og:description, og:image 1200×630, og:url)
- `<link rel="canonical">` sur chaque page
- Breadcrumb `BreadcrumbList` sauf homepage
- `FAQPage` sur chaque section FAQ
- `LocalBusiness` sur pages ville
- `<link rel="preload">` police + image hero
- `loading="lazy"` sur toutes les images hors hero
- URLs : minuscules · tirets · mot-clé intégré · pas de paramètres
