# UX/UI Specification — CA-TECH

**Version** : 1.0 — Juillet 2026
**Statut** : Document de référence (aligné sur `STRATEGY.md`)
**Slogan officiel** : « L'Intelligence Artificielle au service de votre croissance. »

> Ce document constitue la spécification UX/UI complète de CA-TECH. Il définit l'expérience utilisateur, l'architecture de l'information, le design system, les wireframes textuels, les animations, les parcours de conversion, les contraintes d'accessibilité et les performances attendues. Aucune implémentation ne doit être réalisée sans s'y référer.

---

## Table des matières

1. [Architecture du site](#1-architecture-du-site)
2. [Parcours utilisateurs](#2-parcours-utilisateurs)
3. [Design System](#3-design-system)
4. [Composants réutilisables](#4-composants-réutilisables)
5. [Animations & micro-interactions](#5-animations--micro-interactions)
6. [Stratégie Mobile](#6-stratégie-mobile)
7. [Stratégie Desktop](#7-stratégie-desktop)
8. [Wireframes textuels](#8-wireframes-textuels)
9. [CTA & Parcours de conversion](#9-cta--parcours-de-conversion)
10. [SEO intégré au design](#10-seo-intégré-au-design)
11. [Accessibilité WCAG AA](#11-accessibilité-wcag-aa)
12. [Performances attendues](#12-performances-attendues)

---

## 1. Architecture du site

### 1.1 Principe directeur

Le site est organisé autour de **4 entrées d'expertise** (IA, Automatisation, SEO, Web) et d'un **point d'entrée conversationnel unique** : Loïc. Chaque page a un rôle précis dans le tunnel de conversion et porte un mot-clé SEO principal.

### 1.2 Arborescence complète

```
/ (Homepage)
│
├── /intelligence-artificielle
│   ├── /conseil-ia-paris
│   ├── /conseil-ia-lyon
│   ├── /conseil-ia-dijon
│   └── /conseil-ia-troyes
│
├── /automatisation
│   ├── /automatisation-paris
│   ├── /automatisation-lyon
│   ├── /automatisation-dijon
│   └── /automatisation-troyes
│
├── /seo
│   ├── /agence-seo-paris
│   ├── /agence-seo-lyon
│   ├── /agence-seo-dijon
│   └── /agence-seo-troyes
│
├── /developpement-web
│   ├── /creation-site-vitrine
│   ├── /creation-site-ecommerce
│   ├── /creation-landing-page
│   └── /developpement-sur-mesure
│
├── /design-identite
│   ├── /creation-logo
│   ├── /identite-visuelle
│   └── /creation-flyer
│
├── /loic                        ← Page dédiée à l'agent IA
├── /diagnostic-ia               ← Outil interactif de diagnostic
├── /nos-realisations            ← Portfolio / cas clients
├── /blog                        ← Cluster SEO éditorial
│   └── /blog/[slug]
├── /a-propos
├── /contact
├── /devis                       ← Formulaire multi-étapes
├── /commande-confirmation
│
├── /mentions-legales
├── /politique-confidentialite
└── /cgv
```

### 1.3 Hiérarchie des pages par priorité business

| Priorité | Page | Rôle principal |
|----------|------|----------------|
| P0 | Homepage `/` | Conversion initiale, présentation Loïc, preuve expertise |
| P0 | `/loic` | Démonstration produit, engagement conversationnel |
| P0 | `/devis` | Conversion finale |
| P1 | `/intelligence-artificielle` | SEO + conversion pôle IA |
| P1 | `/automatisation` | SEO + conversion pôle Automatisation |
| P1 | `/seo` | SEO + conversion pôle SEO |
| P1 | `/diagnostic-ia` | Lead generation, qualification |
| P2 | Pages ville × expertise | SEO local longue traîne |
| P2 | `/nos-realisations` | Preuve sociale, confiance |
| P3 | `/blog/[slug]` | SEO éditorial, trafic organique |
| P3 | `/a-propos`, `/contact` | Confiance, accessibilité |

### 1.4 Navigation principale

**Header (desktop)** :
```
[Logo CA-TECH]   Services ▾   Loïc   Réalisations   Blog   [Diagnostic IA →]
```

**Menu Services (dropdown)** :
```
┌─────────────────────────────────────────────────────┐
│  Intelligence Artificielle   │  Automatisation       │
│  SEO                         │  Développement Web    │
│  Design & Identité           │                       │
└─────────────────────────────────────────────────────┘
```

**Header (mobile)** :
```
[Logo]                              [☰]
→ Drawer latéral avec tous les liens + CTA "Diagnostic IA" en bas
```

**Footer** :
```
[Logo + Slogan]
Expertise : IA | Automatisation | SEO | Dev Web | Design
Villes    : Paris | Lyon | Dijon | Troyes
Légal     : Mentions légales | CGV | Politique de confidentialité
Contact   : Email | LinkedIn | Téléphone
© 2026 CA-TECH — Tous droits réservés
```

---

## 2. Parcours utilisateurs

### 2.1 Persona 1 — Dirigeant PME (parcours principal)

```
Recherche Google
"conseil IA entreprise [ville]"
        ↓
Page pilier SEO ville × expertise
(Hero → Bénéfices → Preuves → Offre → Process → FAQ → CTA)
        ↓
CTA "Lancer mon Diagnostic IA"
        ↓
Loïc — Diagnostic conversationnel (5-7 questions)
        ↓
Rapport personnalisé (email automatique)
        ↓
CTA "Réserver mon RDV découverte"
        ↓
Calendly 30 min
        ↓
Proposition commerciale packagée
        ↓
Devis signé + acompte
```

### 2.2 Persona 2 — Fondateur startup (parcours direct)

```
LinkedIn (post fondateur / recommandation)
        ↓
Homepage
        ↓
Section Loïc (hero ou section dédiée)
        ↓
/loic — Démo interactive
        ↓
CTA "Parler à l'équipe"
        ↓
/contact ou /devis
```

### 2.3 Persona 3 — Commerçant local (parcours SEO local)

```
Google Maps / Recherche locale
"agence seo [ville]" ou "création site [ville]"
        ↓
Page pilier locale
        ↓
Section FAQ (réponse à sa douleur principale)
        ↓
CTA "Demander un devis gratuit"
        ↓
/devis (formulaire multi-étapes)
        ↓
Email de confirmation + appel de qualification
```

### 2.4 Persona 4 — Direction marketing (parcours réalisations)

```
Recommandation directe / LinkedIn
        ↓
/nos-realisations
        ↓
Étude de cas spécifique (landing + agent IA)
        ↓
CTA "Discuter de votre projet"
        ↓
/contact
```

### 2.5 Parcours Loïc (fil rouge de tous les personas)

```
Tout visiteur peut à tout moment interagir avec Loïc
(widget persistant en bas à droite sur toutes les pages)
        ↓
Loïc engage → diagnostic → qualification
        ↓
Rapport → Proposition → RDV
```

---

## 3. Design System

### 3.1 Principes de design

| Principe | Description |
|----------|-------------|
| **Premium minimaliste** | Inspiré Apple, Stripe, Vercel, Linear. Beaucoup d'espace blanc. Hiérarchie typographique forte. |
| **IA-first** | Le design exprime l'intelligence : animations précises, feedback immédiat, micro-interactions fluides. |
| **Confiance** | Pas de fioriture. Chaque élément justifie sa présence. Lisibilité maximale. |
| **Mobile-first** | Conçu sur 375 px, étendu progressivement. |
| **Performance** | Aucune animation qui bloque le rendu. CSS natif prioritaire. |

### 3.2 Couleurs

#### Palette principale

| Token | Valeur | Usage |
|-------|--------|-------|
| `--color-primary` | `#0066FF` | CTA, liens actifs, accents, icônes clés |
| `--color-primary-dark` | `#0A2540` | Fond hero, sections sombres, titres sur fond blanc |
| `--color-primary-light` | `#E8F0FF` | Fonds de cartes légères, tags, badges |
| `--color-white` | `#FFFFFF` | Fond principal, texte sur fond sombre |
| `--color-black` | `#0A0A0A` | Texte courant sur fond blanc |

#### Palette secondaire (nuances grises)

| Token | Valeur | Usage |
|-------|--------|-------|
| `--color-gray-50` | `#F9FAFB` | Fonds de sections alternées |
| `--color-gray-100` | `#F3F4F6` | Fonds de cartes, inputs |
| `--color-gray-200` | `#E5E7EB` | Bordures légères, séparateurs |
| `--color-gray-400` | `#9CA3AF` | Texte secondaire, placeholders |
| `--color-gray-600` | `#4B5563` | Texte tertiaire, sous-titres |
| `--color-gray-900` | `#111827` | Titres, texte fort |

#### Palette sémantique

| Token | Valeur | Usage |
|-------|--------|-------|
| `--color-success` | `#10B981` | Validation, confirmation |
| `--color-warning` | `#F59E0B` | Alertes légères |
| `--color-error` | `#EF4444` | Erreurs formulaires |
| `--color-info` | `#3B82F6` | Informations neutres |

#### Dégradés

| Token | Valeur | Usage |
|-------|--------|-------|
| `--gradient-primary` | `linear-gradient(135deg, #0066FF 0%, #0A2540 100%)` | Hero sections, CTAs premium |
| `--gradient-subtle` | `linear-gradient(180deg, #F9FAFB 0%, #FFFFFF 100%)` | Transitions de sections |
| `--gradient-glow` | `radial-gradient(ellipse at 50% 0%, rgba(0,102,255,0.15) 0%, transparent 70%)` | Effets de profondeur hero |

### 3.3 Typographie

#### Famille de polices

| Rôle | Police | Fallback |
|------|--------|---------|
| Titres (display) | `Inter` | `system-ui`, `-apple-system`, `sans-serif` |
| Corps | `Inter` | `system-ui`, `-apple-system`, `sans-serif` |
| Code / technique | `JetBrains Mono` | `Courier New`, `monospace` |

> **Choix technique** : Inter uniquement. Pas de serif. Une seule famille = cohérence maximale + performance (1 seul fichier font).

#### Échelle typographique

| Token | Taille | Line-height | Weight | Usage |
|-------|--------|-------------|--------|-------|
| `--text-xs` | `12px` | `1.5` | `400` | Labels, badges, captions |
| `--text-sm` | `14px` | `1.5` | `400` | Texte secondaire, meta |
| `--text-base` | `16px` | `1.6` | `400` | Corps de texte courant |
| `--text-lg` | `18px` | `1.6` | `400` | Intro paragraphes |
| `--text-xl` | `20px` | `1.4` | `500` | Sous-titres de section |
| `--text-2xl` | `24px` | `1.3` | `600` | Titres de cartes, H3 |
| `--text-3xl` | `30px` | `1.2` | `700` | H2 mobile |
| `--text-4xl` | `36px` | `1.15` | `700` | H2 desktop |
| `--text-5xl` | `48px` | `1.1` | `800` | H1 mobile |
| `--text-6xl` | `60px` | `1.05` | `800` | H1 desktop |
| `--text-7xl` | `72px` | `1.0` | `900` | Display hero premium |

#### Règles typographiques

- H1 : toujours `--text-6xl` desktop / `--text-5xl` mobile, weight `800`.
- H2 : `--text-4xl` desktop / `--text-3xl` mobile, weight `700`.
- H3 : `--text-2xl`, weight `600`.
- Corps : `--text-base`, line-height `1.6`, color `--color-gray-900`.
- Sous-titres de section : `--text-sm`, uppercase, letter-spacing `0.1em`, color `--color-primary`, weight `600`. Toujours au-dessus du H2.
- Longueur de ligne idéale : 60-75 caractères (max-width `65ch` sur les blocs de texte).

### 3.4 Espacement (spacing scale)

Système basé sur une base de `4px` :

| Token | Valeur | Usage typique |
|-------|--------|---------------|
| `--space-1` | `4px` | Micro-espacement intérieur |
| `--space-2` | `8px` | Padding icônes, gaps fins |
| `--space-3` | `12px` | Espacement intra-composant |
| `--space-4` | `16px` | Padding cartes mobile |
| `--space-5` | `20px` | Gap entre éléments liés |
| `--space-6` | `24px` | Padding cartes desktop, gap grille |
| `--space-8` | `32px` | Section interne |
| `--space-10` | `40px` | Padding section mobile |
| `--space-12` | `48px` | Gap section |
| `--space-16` | `64px` | Padding section desktop |
| `--space-20` | `80px` | Espacement entre sections mobile |
| `--space-24` | `96px` | Espacement entre sections desktop |
| `--space-32` | `128px` | Hero padding top/bottom |

### 3.5 Grille & Layout

| Breakpoint | Largeur | Colonnes | Gutter |
|-----------|---------|----------|--------|
| Mobile S | `375px` | 4 | `16px` |
| Mobile L | `428px` | 4 | `20px` |
| Tablet | `768px` | 8 | `24px` |
| Desktop | `1024px` | 12 | `24px` |
| Desktop L | `1280px` | 12 | `32px` |
| Wide | `1440px` | 12 | `40px` |

**Container max-width** : `1280px`, centré, padding horizontal `--space-6` mobile / `--space-10` desktop.

**Règle de mise en page** : les sections alternent fond blanc (`--color-white`) et fond gris très léger (`--color-gray-50`). Pas de bordures entre sections — les changements de fond créent la séparation.

### 3.6 Ombres

| Token | Valeur | Usage |
|-------|--------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Cartes au repos |
| `--shadow-md` | `0 4px 16px rgba(0,0,0,0.08)` | Cartes au hover |
| `--shadow-lg` | `0 8px 32px rgba(0,0,0,0.12)` | Modales, drawers |
| `--shadow-blue` | `0 4px 24px rgba(0,102,255,0.25)` | CTA buttons, éléments actifs |

### 3.7 Bordures & Radius

| Token | Valeur | Usage |
|-------|--------|-------|
| `--radius-sm` | `6px` | Badges, tags, inputs |
| `--radius-md` | `10px` | Cartes standard |
| `--radius-lg` | `16px` | Cartes grandes, modales |
| `--radius-xl` | `24px` | Sections cards premium |
| `--radius-full` | `9999px` | Pills, avatars, boutons arrondis |

**Bordures** : `1px solid --color-gray-200` pour les cartes sur fond blanc. Pas de bordure sur fond gris.

### 3.8 Iconographie

**Bibliothèque unique** : [Lucide Icons](https://lucide.dev/) — cohérente, légère, open source.

**Règles d'utilisation** :
- Taille standard : `20px` dans le corps, `24px` dans les navigations, `32px` dans les features.
- Toujours accompagné d'un label texte (accessibilité).
- `aria-hidden="true"` sur l'icône + texte visible OU `aria-label` si l'icône est seule.
- Couleur : hérite du texte parent (`currentColor`). Accents en `--color-primary`.

### 3.9 Tokens d'animation

| Token | Valeur | Usage |
|-------|--------|-------|
| `--duration-fast` | `150ms` | Hover, focus, états actifs |
| `--duration-normal` | `250ms` | Transitions composants |
| `--duration-slow` | `400ms` | Entrées de sections, reveals |
| `--duration-xslow` | `600ms` | Animations hero, illustrations |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrées (spring naturel) |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Transitions d'état |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Micro-interactions satisfaisantes |

---

*Fin de la Passe 1 — Architecture, Parcours, Design System*

---

## 4. Composants réutilisables

Chaque composant est défini par : son **anatomie** (structure interne), ses **états** (repos, hover, focus, disabled, loading), ses **variantes** et ses **règles d'accessibilité**.

---

### 4.1 Button

**Variantes**

| Variante | Usage | Style |
|----------|-------|-------|
| `primary` | CTA principal de page | Fond `--color-primary`, texte blanc, shadow-blue au hover |
| `secondary` | CTA secondaire | Bordure `--color-primary`, texte `--color-primary`, fond transparent |
| `ghost` | Actions tertiaires, nav | Fond transparent, texte `--color-gray-600`, hover fond `--color-gray-100` |
| `danger` | Actions destructives | Fond `--color-error`, texte blanc |
| `white` | Sur fond sombre / hero | Fond blanc, texte `--color-primary-dark` |

**Tailles**

| Taille | Padding | Font-size | Height |
|--------|---------|-----------|--------|
| `sm` | `8px 16px` | `14px` | `36px` |
| `md` | `12px 24px` | `16px` | `44px` |
| `lg` | `16px 32px` | `18px` | `52px` |
| `xl` | `20px 40px` | `20px` | `60px` |

**Anatomie**
```
[icône gauche?] [label] [icône droite?]
```

**États**
- Repos : style de base, `transition: all --duration-fast --ease-out`
- Hover : légère élévation (`translateY(-1px)`), shadow intensifiée
- Focus : `outline: 2px solid --color-primary`, `outline-offset: 3px` (jamais supprimé)
- Active : `translateY(0)`, shadow réduite
- Loading : icône remplacée par un spinner, `cursor: not-allowed`, label conservé
- Disabled : opacité `0.4`, `cursor: not-allowed`

**Règles**
- Taille minimale tactile : `44×44px` (WCAG 2.5.5)
- Toujours un `aria-label` si le bouton ne contient qu'une icône
- `type="button"` explicite hors formulaire pour éviter les soumissions involontaires

---

### 4.2 Card

**Variantes**

| Variante | Usage |
|----------|-------|
| `default` | Service, feature, article blog |
| `highlight` | Carte mise en avant (pricing recommandé, cas client vedette) |
| `horizontal` | Étude de cas, témoignage long |
| `stat` | Chiffre clé, KPI |
| `agent` | Présentation d'un agent IA (Loïc, Agent RH…) |

**Anatomie Card `default`**
```
┌─────────────────────────────────────┐
│  [Icône / Illustration]             │
│  [Titre — --text-2xl]               │
│  [Description — --text-base]        │
│  [Tag(s)]                           │
│  [CTA → texte-lien]                 │
└─────────────────────────────────────┘
```

**Anatomie Card `highlight`**
```
┌─────────────────────────────────────┐  ← bordure --color-primary 2px
│  [Badge "Recommandé"]               │
│  [Titre]                            │
│  [Prix / résumé offre]              │
│  [Liste de bénéfices ✓]             │
│  [Button primary lg]                │
└─────────────────────────────────────┘
```

**États**
- Repos : `--shadow-sm`, radius `--radius-md`
- Hover : `--shadow-md`, `translateY(-4px)`, transition `--duration-normal --ease-out`
- Focus (tab) : outline sur le CTA interne

---

### 4.3 Section Header

Bloc réutilisable en tête de chaque section majeure.

**Anatomie**
```
[Sous-titre — pill colorée]      ← "NOS SERVICES", "COMMENT ÇA MARCHE"…
[H2 — titre principal]
[Paragraphe d'accroche — max 2 lignes, --text-lg, --color-gray-600]
```

**Règles**
- Toujours centré sur mobile, centré ou aligné gauche sur desktop selon contexte.
- Sous-titre : `--text-sm`, uppercase, `letter-spacing: 0.08em`, couleur `--color-primary`, fond `--color-primary-light`, padding `4px 12px`, radius `--radius-full`.
- Espacement bas vers le contenu : `--space-12` mobile / `--space-16` desktop.

---

### 4.4 Hero

Section d'accroche principale, unique par page.

**Anatomie Hero Homepage**
```
┌──────────────────────────────────────────────────────────┐
│  [Fond : --gradient-primary + --gradient-glow]           │
│                                                          │
│  [Pill badge : "Agent IA • Automatisation • SEO"]        │
│  [H1 — display 72px desktop]                             │
│  [Sous-titre — --text-xl, opacité 0.8]                   │
│  [Groupe CTA : Button white xl + Button ghost xl]        │
│  [Proof bar : logos clients ou stats clés]               │
│                                                          │
│  [Illustration / Démo Loïc — côté droit desktop]         │
└──────────────────────────────────────────────────────────┘
```

**Anatomie Hero Page Service**
```
┌──────────────────────────────────────────────────────────┐
│  [Fond blanc ou --color-gray-50]                         │
│  [Breadcrumb]                                            │
│  [Pill badge : service + ville]                          │
│  [H1 — --text-6xl]                                       │
│  [Sous-titre — --text-lg]                                │
│  [CTA unique primary]                                    │
│  [3 stats clés inline]                                   │
└──────────────────────────────────────────────────────────┘
```

---

### 4.5 Badge / Tag / Pill

```
[● texte]   ← statut en temps réel (Loïc disponible, En ligne…)
[texte]     ← catégorie, service, ville
[✓ texte]   ← bénéfice validé dans liste
```

**Tailles** : `sm` (12px) / `md` (14px)
**Couleurs** : primary, success, warning, gray, white-on-dark

---

### 4.6 Input / Form Field

**Anatomie**
```
[Label visible]                  ← toujours visible, jamais placeholder seul
[Input / Textarea / Select]
[Message d'aide ou d'erreur]
```

**États**
- Repos : fond `--color-gray-100`, bordure `--color-gray-200`, radius `--radius-sm`
- Focus : bordure `--color-primary` 2px, fond blanc, `box-shadow: 0 0 0 3px rgba(0,102,255,0.15)`
- Erreur : bordure `--color-error`, message rouge sous le champ
- Succès : bordure `--color-success`, icône ✓ dans le champ
- Disabled : opacité `0.5`, `cursor: not-allowed`

**Règles**
- Hauteur minimale : `44px` (WCAG)
- `autocomplete` renseigné sur tous les champs pertinents
- `aria-describedby` liant le champ à son message d'erreur

---

### 4.7 Progress Bar (formulaire multi-étapes)

```
Étape 2 sur 4
[████████░░░░░░░░]  50%
```

- Affichée en haut du formulaire `/devis`
- Fond `--color-gray-200`, remplissage `--color-primary`
- Transition de remplissage : `width --duration-slow --ease-out`
- Label textuel "Étape X sur Y" pour l'accessibilité (`aria-valuenow`, `aria-valuemax`)

---

### 4.8 Testimonial

**Anatomie**
```
┌──────────────────────────────────────┐
│  ❝ Citation courte et percutante ❞   │
│                                      │
│  [Avatar]  Prénom Nom                │
│            Poste, Entreprise         │
│  [★★★★★]  [Lien LinkedIn →]         │
└──────────────────────────────────────┘
```

**Variante carousel** : défilement automatique pausé au hover, boutons prev/next, indicateurs dots.

---

### 4.9 FAQ Accordion

**Anatomie**
```
[Question]                          [+]
─────────────────────────────────────
[Réponse — visible si ouvert]
```

- Un seul item ouvert à la fois (comportement exclusif).
- Animation d'ouverture : `max-height` de `0` à valeur calculée, `--duration-normal --ease-out`.
- Icône `+` pivote à `×` à l'ouverture (`rotate: 45deg`).
- Balisage : `<details>/<summary>` natif HTML ou ARIA `role="region"` + `aria-expanded`.
- Chaque FAQ génère un bloc Schema.org `FAQPage` (SEO rich result).

---

### 4.10 Stat / Chiffre clé

```
┌────────────────┐
│  +240%         │  ← valeur animée au scroll (countUp)
│  de leads      │  ← label
│  générés       │
└────────────────┘
```

- Animation countUp déclenchée à l'entrée dans le viewport (`IntersectionObserver`).
- `prefers-reduced-motion: reduce` → valeur affichée directement, sans animation.

---

### 4.11 Widget Loïc (persistant)

Présent sur **toutes les pages**, ancré en bas à droite.

**États**
```
Fermé :   [Avatar Loïc] [💬]   ← bouton flottant 56px
Ouvert :  ┌─────────────────────────┐
           │ Loïc — Consultant IA   │ [×]
           │ ─────────────────────  │
           │ [Messages]             │
           │ [Zone de saisie]  [→]  │
           └─────────────────────────┘
```

- Position : `fixed bottom-6 right-6`, z-index élevé
- Animation ouverture : `scale(0.8) → scale(1)` + `opacity 0 → 1`, `--duration-normal --ease-spring`
- Badge de notification sur le bouton fermé si Loïc a un message proactif
- Mobile : occupe 100% de la largeur au bas de l'écran quand ouvert

---

### 4.12 Navigation Header

**Desktop**
```
┌──────────────────────────────────────────────────────────────┐
│ [Logo]    Services ▾   Loïc   Réalisations   Blog   [CTA →] │
└──────────────────────────────────────────────────────────────┘
```
- Position : `sticky top-0`, `backdrop-filter: blur(12px)`, fond `rgba(255,255,255,0.85)`
- Transition opacité/blur au scroll (transparent → opaque dès 50px de scroll)
- Dropdown Services : apparition `--duration-fast`, ombre `--shadow-lg`

**Mobile**
```
┌─────────────────────────────┐
│ [Logo]              [Menu ☰]│
└─────────────────────────────┘
```
- Drawer latéral droit, largeur `80vw` max `320px`
- Overlay sombre derrière, fermeture par clic overlay ou swipe gauche
- Focus trap actif tant que le drawer est ouvert (accessibilité)

---

### 4.13 Breadcrumb

```
Accueil  /  Intelligence Artificielle  /  Conseil IA Paris
```

- `--text-sm`, couleur `--color-gray-400`, séparateur `/`
- Dernier item non cliquable, couleur `--color-gray-900`
- Balisage Schema.org `BreadcrumbList` (SEO)
- Affiché sur toutes les pages hors Homepage

---

### 4.14 Étapes de process (Stepper)

Utilisé sur les pages service et `/devis` pour rassurer.

```
①──────②──────③──────④
Audit  Plan  Livraison  Suivi
```

- Desktop : horizontal, ligne de connexion entre les cercles
- Mobile : vertical, ligne à gauche
- Cercle actif : fond `--color-primary`, texte blanc
- Cercle complété : fond `--color-success`, icône ✓
- Cercle inactif : fond `--color-gray-200`, texte `--color-gray-400`

---

## 5. Animations & micro-interactions

### 5.1 Principes

1. **But, pas décoration** — chaque animation guide l'attention ou confirme une action.
2. **Performance first** — uniquement `transform` et `opacity`. Jamais `top`, `left`, `width`, `height` animés.
3. **Respect de `prefers-reduced-motion`** — toutes les animations sont désactivées ou réduites à une simple apparition si l'utilisateur a activé ce paramètre système.
4. **Cohérence** — mêmes durées et courbes d'easing pour les mêmes types d'actions.

### 5.2 Animations de scroll (Reveal)

Chaque section/carte entre en scène à l'entrée dans le viewport.

| Type | Transformation | Durée | Délai |
|------|---------------|-------|-------|
| Fade up | `translateY(24px) opacity(0) → translateY(0) opacity(1)` | `400ms` | `0ms` |
| Fade up stagger | Même, décalé par enfant | `400ms` | `+80ms` par item |
| Fade in | `opacity(0) → opacity(1)` | `300ms` | `0ms` |
| Scale in | `scale(0.95) opacity(0) → scale(1) opacity(1)` | `350ms` | `0ms` |

**Implémentation** : `IntersectionObserver`, seuil `0.15`, classe CSS ajoutée à l'entrée.

### 5.3 Animations Hero

| Élément | Animation | Durée |
|---------|-----------|-------|
| Pill badge | Fade up | `400ms` delay `0ms` |
| H1 | Fade up | `500ms` delay `100ms` |
| Sous-titre | Fade up | `400ms` delay `200ms` |
| Groupe CTA | Fade up | `400ms` delay `300ms` |
| Proof bar | Fade in | `400ms` delay `500ms` |
| Illustration Loïc | Scale in + fade | `600ms` delay `400ms` |

### 5.4 Micro-interactions composants

| Composant | Interaction | Animation |
|-----------|-------------|-----------|
| Button primary | Hover | `translateY(-1px)`, shadow intensifiée, `150ms` |
| Button primary | Active | `translateY(0)`, `100ms` |
| Card | Hover | `translateY(-4px)`, shadow `--shadow-md`, `250ms` |
| Accordion FAQ | Ouverture | `max-height` expand, rotation icône, `250ms` |
| Widget Loïc | Ouverture | Scale + fade, `250ms --ease-spring` |
| Input | Focus | Bordure + glow blur, `150ms` |
| Stat countUp | Viewport enter | Comptage animé, `1200ms --ease-out` |
| Progress bar | Étape suivante | Width expand, `400ms --ease-out` |
| Nav header | Scroll | Blur + opacité, `200ms` |
| Menu mobile | Ouverture | Slide + fade, `300ms --ease-out` |
| Dropdown services | Hover/focus | Fade + slide down 8px, `200ms` |
| Testimonial carousel | Auto-advance | Crossfade, `400ms`, pause au hover |

### 5.5 Loading states

| Contexte | Pattern |
|----------|---------|
| Envoi formulaire | Button → spinner + label grisé |
| Chargement page | Skeleton screens (jamais spinner global) |
| Loïc — réponse IA | Typing indicator (3 points pulsants) |
| Diagnostic IA | Progress bar + étape courante |
| Image | Fond `--color-gray-100` en attente, fade à l'arrivée |

### 5.6 Transitions de page

- Transition douce entre pages : `opacity 0 → 1` en `200ms` (évite le flash blanc brutal).
- Scroll to top automatique à chaque navigation.
- Loïc widget persiste entre les pages sans re-render.

---

## 6. Stratégie Mobile

### 6.1 Philosophie

> « Mobile first » ne signifie pas « mobile acceptable ». Chez CA-TECH, l'expérience mobile est la référence de qualité. Le desktop est une extension.

**Objectif** : l'utilisateur mobile doit pouvoir comprendre l'offre, interagir avec Loïc et déposer un devis **sans aucune friction**, sur une connexion 4G standard.

### 6.2 Grille & espacement mobile

- Container : `100%` avec `padding: 0 20px`
- Colonnes : 4
- Sections : padding vertical `--space-16` (`64px`)
- Gap entre cartes : `--space-4` (`16px`)
- Texte H1 : `--text-5xl` (`48px`) — réduit à `40px` sur `375px` si nécessaire

### 6.3 Navigation mobile

- Header fixe, hauteur `60px`
- Logo à gauche (max-width `120px`)
- Bouton hamburger à droite (`44×44px`)
- Drawer : slide depuis la droite, overlay `rgba(0,0,0,0.4)` derrière
- Dans le drawer : liens verticaux `48px` de hauteur minimale, CTA "Diagnostic IA" en bas en `primary`
- Fermeture : bouton ×, clic sur l'overlay, swipe vers la droite

### 6.4 Sections mobiles

| Section | Adaptation |
|---------|-----------|
| Hero | Stack vertical : texte en haut, illustration en bas (ou supprimée) |
| Features 3 colonnes | 1 colonne, scroll vertical |
| Comparatif tableau | Scroll horizontal ou version accordion |
| Pricing 3 cartes | 1 carte visible, swipe horizontal |
| Testimonials | 1 visible, swipe ou carousel dots |
| Footer | Stack vertical, liens en colonnes 2×2 |
| Widget Loïc ouvert | Plein écran `100vw × 100vh`, bouton fermer en haut |

### 6.5 Touch & gestes

- Zone cliquable minimale : `44×44px` sur tous les éléments interactifs
- Swipe horizontal : carousel témoignages, pricing cards
- Swipe vertical : scroll naturel, drawer fermeture
- Pas de hover-only states (aucune info cachée derrière un hover sur mobile)
- Double-tap désactivé sur les CTA (évite zoom accidentel)

### 6.6 Performance mobile

- Aucune animation bloquante au premier paint
- Images : format WebP, `srcset` adapté (`375w`, `768w`, `1280w`), `loading="lazy"` sauf hero
- Police Inter : `font-display: swap`, préchargement des weights 400/600/800 uniquement
- JavaScript non-critique différé (`defer` / `async`)
- Core Web Vitals mobile cible :
  - LCP < 2.5s (image hero optimisée, préchargée)
  - CLS < 0.1 (dimensions réservées pour images et embeds)
  - INP < 200ms (pas de tâches longues JS au click)

### 6.7 Formulaire `/devis` sur mobile

- Multi-étapes obligatoires (max 2-3 champs par écran)
- Clavier adapté : `inputmode="email"`, `inputmode="tel"`, `inputmode="numeric"`
- Éviter les selects natifs (UX médiocre sur iOS) → remplacer par des boutons de choix visuel
- Bouton "Suivant" toujours visible sans scroll (position sticky bottom)
- Sauvegarde auto dans `localStorage` à chaque étape

---

## 7. Stratégie Desktop

### 7.1 Philosophie

Le desktop est l'environnement de la **décision**. Les visiteurs desktop ont plus de temps et de capacité d'attention. Le design doit offrir de la profondeur : plus de contenu, des preuves plus riches, des mises en page sophistiquées.

### 7.2 Grille & espacement desktop

- Container max-width : `1280px`, centré
- Colonnes : 12, gutter `32px`
- Sections : padding vertical `--space-24` (`96px`)
- Gap entre cartes : `--space-6` (`24px`) à `--space-8` (`32px`)

### 7.3 Mises en page desktop spécifiques

| Pattern | Utilisation |
|---------|------------|
| **50/50 texte + visual** | Pages service, section Loïc, features alternées |
| **3 colonnes cartes** | Services, avantages, cas clients |
| **4 colonnes stats** | Chiffres clés, KPI clients |
| **Grille masonry** | Portfolio réalisations |
| **Sidebar sticky** | Articles de blog (table des matières) |
| **Full-width hero** | Homepage, pages piliers |

### 7.4 Navigation desktop

- Header sticky, hauteur `72px`
- Dropdown Services : grille 2×3 avec descriptions courtes, icônes, et liens directs
- CTA "Diagnostic IA gratuit" toujours visible comme dernier élément du header
- Scroll progress bar optionnelle sur les articles longs

### 7.5 Hover states desktop

Les hover states enrichissent l'expérience desktop sans bloquer le mobile :
- Cards : élévation + ombre
- Liens : underline animé (width `0 → 100%` gauche à droite)
- CTA : léger déplacement vertical + shadow
- Images portfolio : overlay avec résumé du projet

### 7.6 Sidebar et contenu long

- Articles blog > 1500 mots : table des matières sticky à gauche (`240px`)
- Études de cas : sidebar avec résumé KPI sticky pendant le scroll
- Pages piliers : CTA sticky en sidebar après le hero pour ne jamais perdre la conversion

*Fin de la Passe 2 — Composants, Animations, Mobile/Desktop*

---

## 8. Wireframes textuels

> Chaque wireframe décrit la **hiérarchie des sections**, leur **contenu**, leur **layout** et leurs **règles de conversion**. L'ordre est l'ordre d'affichage à l'écran, du haut vers le bas.

---

### 8.1 Homepage `/`

**Objectif** : capter l'attention en < 3 secondes, qualifier l'intention du visiteur, orienter vers Loïc ou une page service.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HEADER STICKY
[Logo CA-TECH]  Services ▾  Loïc  Réalisations  Blog  [Diagnostic IA →]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 1 — HERO
Fond : --gradient-primary (bleu foncé)

  [Pill] ● IA · Automatisation · SEO · Dev Web

  L'Intelligence Artificielle
  au service de votre croissance.           [H1 — display]

  Cabinet de conseil IA pour les entreprises
  qui veulent croître vite et durablement.  [Sous-titre]

  [Lancer mon Diagnostic IA →]  [Voir nos réalisations]
  (Button white xl)              (Button ghost xl)

  ── Proof bar ──────────────────────────────────
  [Logo client 1]  [Logo client 2]  [Logo client 3]
  [Logo client 4]  [Logo client 5]
  « Rejoignez +50 entreprises accompagnées »

  [Illustration : interface Loïc animée — desktop droite]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 2 — CHIFFRES CLÉS
Fond : blanc

  [SOUS-TITRE PILL] NOS RÉSULTATS
  L'impact que nous créons pour nos clients.

  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │  +240%   │  │   72h    │  │  +50     │  │  > 90    │
  │  de leads│  │ délai de │  │  clients │  │ Lighthouse│
  │ générés  │  │ 1er livr.│  │ actifs   │  │  score   │
  └──────────┘  └──────────┘  └──────────┘  └──────────┘
  (Stat animé countUp au scroll)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 3 — NOS EXPERTISES
Fond : --color-gray-50

  [SOUS-TITRE PILL] NOS EXPERTISES
  Quatre pôles, une seule promesse : votre croissance.

  ┌───────────────────┐  ┌───────────────────┐
  │ 🤖 Intelligence   │  │ ⚡ Automatisation  │
  │    Artificielle   │  │                   │
  │ Agents, RAG,      │  │ Workflows, n8n,   │
  │ copilotes métier  │  │ scripts sur-mesure│
  │ [En savoir + →]   │  │ [En savoir + →]   │
  └───────────────────┘  └───────────────────┘

  ┌───────────────────┐  ┌───────────────────┐
  │ 📈 SEO            │  │ 💻 Dev Web        │
  │                   │  │                   │
  │ Audits, piliers,  │  │ Sites, e-commerce,│
  │ local, suivi      │  │ apps métier       │
  │ [En savoir + →]   │  │ [En savoir + →]   │
  └───────────────────┘  └───────────────────┘

  [Voir tous nos services →]  (lien texte centré)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 4 — LOÏC (mise en avant produit)
Fond : --color-primary-dark (sombre)
Layout 50/50 desktop : texte gauche, démo droite

  [SOUS-TITRE PILL blanc] RENCONTREZ LOÏC

  Votre premier consultant IA.           [H2 blanc]
  Disponible 24/7. Gratuit.

  Loïc diagnostique votre activité,
  qualifie vos besoins et vous remet
  un rapport personnalisé en 10 minutes.

  ✓ Diagnostic IA complet
  ✓ Rapport téléchargeable
  ✓ Proposition sur-mesure

  [Démarrer avec Loïc →]   (Button white lg)

  [DROITE : fenêtre chat animée simulant une conversation]
  Loïc : « Bonjour ! Quel est votre principal
           défi de croissance en ce moment ? »
  Vous :  « Nous perdons du temps sur la
           qualification de nos leads… »
  Loïc : « Parfait, je peux vous aider.
           Voici ce que nous allons analyser… »

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 5 — PROCESSUS
Fond : blanc

  [SOUS-TITRE PILL] COMMENT ÇA MARCHE
  De la première question au résultat mesurable.

  ①──────────②──────────③──────────④
  Diagnostic  Stratégie  Exécution   Suivi
  IA gratuit  & roadmap  & livraison  & impact

  [description courte sous chaque étape]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 6 — CAS CLIENTS (3 cartes)
Fond : --color-gray-50

  [SOUS-TITRE PILL] ILS NOUS FONT CONFIANCE
  Des résultats concrets, pas des promesses.

  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
  │[Secteur/Logo]│  │[Secteur/Logo]│  │[Secteur/Logo]│
  │ Agent IA SAV │  │ Automatisation│  │ Refonte SEO  │
  │ +180% satis. │  │ -14h/semaine │  │ ×3 trafic    │
  │ [Voir →]     │  │ [Voir →]     │  │ [Voir →]     │
  └──────────────┘  └──────────────┘  └──────────────┘

  [Voir toutes nos réalisations →]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 7 — TÉMOIGNAGES
Fond : blanc

  [SOUS-TITRE PILL] CE QU'ILS EN DISENT

  ❝ carousel de 4-6 témoignages ❞
  [Prénom Nom — Poste, Entreprise — ★★★★★]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 8 — CTA FINAL
Fond : --gradient-primary

  Prêt à faire croître votre entreprise
  avec l'Intelligence Artificielle ?      [H2 blanc]

  [Lancer mon Diagnostic IA gratuit →]    (Button white xl)
  « Gratuit · Sans engagement · Résultat en 10 min »

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FOOTER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WIDGET LOÏC (fixe bas droite)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 8.2 Page Service — Intelligence Artificielle `/intelligence-artificielle`

**Objectif SEO** : « conseil intelligence artificielle entreprise »
**CTA principal** : Diagnostic IA gratuit

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HEADER STICKY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BREADCRUMB
Accueil / Intelligence Artificielle

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 1 — HERO SERVICE
Fond : blanc

  [PILL] Intelligence Artificielle

  Déployez l'IA au cœur                 [H1]
  de votre activité.

  Agents conversationnels, copilotes métier,
  automatisation intelligente : nous concevons
  et déployons des solutions IA mesurables.

  [Lancer mon Diagnostic IA →]   [Voir nos réalisations]

  [3 stats : +240% leads · 72h premier livrable · +50 projets]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION 2 — CE QUE NOUS FAISONS (6 cartes)
  ┌────────────┐ ┌────────────┐ ┌────────────┐
  │ Chatbots   │ │ Copilotes  │ │ RAG /      │
  │ & agents   │ │ internes   │ │ bases de   │
  │ convers.   │ │ (RH, SAV…) │ │ connaissance│
  └────────────┘ └────────────┘ └────────────┘
  ┌────────────┐ ┌────────────┐ ┌────────────┐
  │ Génération │ │ Intégration│ │ Analyse &  │
  │ de contenu │ │ LLM in CRM │ │ reporting  │
  └────────────┘ └────────────┘ └────────────┘

SECTION 3 — BÉNÉFICES (layout 50/50)
  GAUCHE — Texte :
    Avant / Après
    ✗ Équipes saturées de tâches répétitives
    ✓ Agents IA qui traitent, qualifient, répondent

    ✗ Support débordé, temps de réponse > 24h
    ✓ SAV IA disponible 24/7, escalade humaine ciblée

    ✗ Données éparpillées, décisions à l'aveugle
    ✓ Copilote IA qui centralise et restitue l'essentiel

  DROITE — Illustration ou screenshot livrable IA

SECTION 4 — PROCESS (Stepper 4 étapes)
  ① Audit & cadrage   ② Design de l'agent
  ③ Déploiement       ④ Suivi & évolution

SECTION 5 — CAS CLIENT (étude de cas IA)
  Layout horizontal : contexte / solution / résultats
  [+180% de satisfaction SAV · -8h/semaine · 3 semaines de déploiement]
  [Lire l'étude de cas complète →]

SECTION 6 — TARIFS / FORMATS DE MISSION
  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
  │ Audit IA     │  │ Sprint IA    │  │ Projet IA    │
  │ 2 semaines   │  │ 4-6 semaines │  │ 2-4 mois     │
  │ Forfait fixe │  │ Forfait fixe │  │ Sur devis    │
  │ [Demander →] │  │ [Demander →] │  │ [Demander →] │
  └──────────────┘  └──────────────┘  └──────────────┘

SECTION 7 — FAQ (8 questions)
  Accordion — Schema.org FAQPage
  Ex : "Combien coûte un projet IA ?" / "Quel délai ?"
       "Faut-il changer nos outils ?" / "Comment mesurer le ROI ?"

SECTION 8 — CTA FINAL
  [Lancer mon Diagnostic IA gratuit →]

FOOTER + WIDGET LOÏC
```

---

### 8.3 Page Service — Automatisation `/automatisation`

**Structure identique à §8.2**, avec contenu spécifique :

- Hero : « Automatisez ce qui vous ralentit. »
- Features : workflows n8n/Make/Zapier, scripts Python/Node, lead-to-cash, synchro outils, veille & reporting
- Avant/Après : tâches manuelles → automatisées
- Cas client : automatisation lead-to-cash PME B2B (-14h/semaine)
- FAQ : « Quels outils connectez-vous ? », « Faut-il un ERP ? », « Délai de mise en place ? »

---

### 8.4 Page Service — SEO `/seo`

**Structure identique à §8.2**, avec contenu spécifique :

- Hero : « Soyez trouvé avant vos concurrents. »
- Features : audit technique, architecture éditoriale, pages piliers, SEO local, suivi positions, contenu IA-assisté
- Avant/Après : invisible → top 3 Google, trafic x3
- Cas client : refonte SEO TPE locale (+340% trafic en 6 mois)
- FAQ : « Combien de temps pour voir des résultats ? », « SEO local vs national ? », « Vous rédigez le contenu ? »

---

### 8.5 Page Service — Développement Web `/developpement-web`

**Structure identique à §8.2**, avec contenu spécifique :

- Hero : « Des sites qui performent. Pas juste qui existent. »
- Features : sites vitrines, e-commerce, landing pages, apps métier, interfaces agents IA
- Accent fort sur performance Lighthouse > 90, mobile-first, SEO intégré
- Cas client : refonte site vitrine PME (Lighthouse 45 → 96, +60% conversion)
- FAQ : « WordPress ou sur-mesure ? », « Quel délai ? », « Vous gérez l'hébergement ? »

---

### 8.6 Page Loïc `/loic`

**Objectif** : démontrer le produit, convaincre de l'utiliser, générer un premier diagnostic.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HEADER STICKY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION 1 — HERO LOÏC
Fond : --color-primary-dark

  [Avatar Loïc — illustration IA premium]

  Bonjour, je suis Loïc.                 [H1 blanc]
  Votre consultant IA.

  Je diagnostique votre activité, identifie
  vos opportunités de croissance et vous
  remet un rapport personnalisé en 10 min.

  [Démarrer le diagnostic →]  (Button white xl)
  « Gratuit · Sans engagement · 10 minutes »

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION 2 — CE QUE FAIT LOÏC (parcours visuel)
Fond : blanc
Stepper horizontal 7 étapes

  Visiteur → Diagnostic → Qualification
  → Rapport → Proposition → Projet → Maintenance

  [Description détaillée sous chaque étape]
  [Screenshot ou illustration de chaque étape]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION 3 — DÉMO INTERACTIVE
Fond : --color-gray-50

  [PILL] ESSAYEZ MAINTENANT

  Une vraie conversation avec Loïc.      [H2]

  [Widget chat pleine largeur — hauteur 480px]
  Message d'invitation de Loïc visible au chargement.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION 4 — EXEMPLE DE RAPPORT
Fond : blanc
Layout 50/50

  GAUCHE — Texte :
    Ce que contient votre rapport :
    ✓ Cartographie de vos opportunités IA
    ✓ Score de maturité digitale
    ✓ 3 quick-wins prioritaires chiffrés
    ✓ Roadmap sur 6 mois
    ✓ Estimation budgétaire

  DROITE — Aperçu rapport PDF (screenshot flouté premium)
    [Télécharger un exemple de rapport →]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION 5 — TÉMOIGNAGES
  3 témoignages de clients ayant utilisé Loïc
  « Le rapport était déjà plus complet que notre
    audit interne de 3 semaines. » — DG PME Lyon

SECTION 6 — FAQ LOÏC (6 questions)
  « Loïc est-il vraiment une IA ? »
  « Mes données sont-elles protégées ? »
  « Que se passe-t-il après le rapport ? »
  « Est-ce vraiment gratuit ? »

SECTION 7 — CTA FINAL
  [Démarrer mon diagnostic avec Loïc →]

FOOTER
```

---

### 8.7 Page Diagnostic IA `/diagnostic-ia`

**Objectif** : formulaire de diagnostic guidé, génère un rapport automatique.

```
HEADER STICKY (simplifié — pas de nav, juste logo + "Besoin d'aide ?")

SECTION 1 — INTRO
  Fond : blanc

  Votre diagnostic IA                   [H1]
  en 10 minutes.

  Répondez à 7 questions.
  Recevez votre rapport personnalisé par email.

  [Progress bar : Étape 1 sur 7]

SECTION 2 — FORMULAIRE MULTI-ÉTAPES
  Fond : --color-gray-50, carte centrée max-width 640px

  Étape 1 : Votre entreprise
    Secteur d'activité  [Select/Buttons visuels]
    Taille de l'équipe  [Boutons : 1-5 / 6-20 / 21-100 / 100+]

  Étape 2 : Vos défis prioritaires
    [Choix multiple, cards cliquables avec icônes]
    □ Trop de tâches répétitives
    □ Support client débordé
    □ Peu de visibilité Google
    □ Pipeline commercial lent
    □ Données éparpillées
    □ Autre

  Étape 3-6 : Questions approfondissement
    (outils actuels, budget approximatif, délai souhaité,
     objectif principal à 12 mois)

  Étape 7 : Vos coordonnées
    Prénom / Nom
    Email professionnel
    Téléphone (optionnel)
    [Recevoir mon rapport →]  (Button primary xl)

  Bouton sticky bas : [Suivant →]

SECTION 3 — CONFIRMATION (page post-envoi)
  ✓ Votre diagnostic est en cours d'analyse.
  Vous recevrez votre rapport sous 10 minutes.
  [Retour à l'accueil]  [Voir nos services]

FOOTER (minimal)
```

---

### 8.8 Page Réalisations `/nos-realisations`

```
HEADER STICKY

SECTION 1 — HERO
  [PILL] NOS RÉALISATIONS

  Des projets qui parlent                [H1]
  d'eux-mêmes.

  [Filtres catégorie : Tous | IA | Automatisation | SEO | Web | Design]

SECTION 2 — GRILLE PROJETS
  Fond : --color-gray-50
  Layout masonry desktop, 1 colonne mobile

  ┌─────────────────────────────┐
  │ [Image / Screenshot]        │
  │ [Catégorie pill]            │
  │ Nom du client / projet      │
  │ KPI principal : +180% leads │
  │ [Voir le cas client →]      │
  └─────────────────────────────┘
  (×6 à ×12 projets)

  [Charger plus →]  (lazy load, pas de pagination)

SECTION 3 — CTA
  Votre projet est le prochain.
  [Lancer mon Diagnostic IA →]

FOOTER + WIDGET LOÏC
```

---

### 8.9 Page Blog `/blog`

```
HEADER STICKY

SECTION 1 — HERO BLOG
  Le blog CA-TECH                        [H1]
  IA, Automatisation, SEO — pour les dirigeants.

  [Filtres : Tous | IA | Automatisation | SEO | Dev Web]

SECTION 2 — ARTICLE VEDETTE (pleine largeur)
  [Image large]  Titre · Catégorie · Date · Temps de lecture
  [Extrait 2 lignes]  [Lire l'article →]

SECTION 3 — GRILLE ARTICLES (3 colonnes desktop)
  ┌───────────┐ ┌───────────┐ ┌───────────┐
  │[Image]    │ │[Image]    │ │[Image]    │
  │Catégorie  │ │Catégorie  │ │Catégorie  │
  │Titre      │ │Titre      │ │Titre      │
  │Date · 5mn │ │Date · 7mn │ │Date · 4mn │
  │[Lire →]   │ │[Lire →]   │ │[Lire →]   │
  └───────────┘ └───────────┘ └───────────┘
  (pagination ou infinite scroll)

FOOTER + WIDGET LOÏC
```

---

### 8.10 Article de blog `/blog/[slug]`

```
HEADER STICKY

BREADCRUMB : Accueil / Blog / [Catégorie] / [Titre]

LAYOUT : 70% contenu / 30% sidebar sticky (desktop)

CONTENU PRINCIPAL :
  [Image hero article]
  [Catégorie pill]  [Date]  [Temps de lecture]  [Auteur]
  [H1 — titre article]
  [Chapô — --text-lg, --color-gray-600]
  [Partage social : LinkedIn, Twitter/X, copier lien]
  ─────────────────
  [Corps de l'article — --text-base, 65ch max]
  [Sous-titres H2, H3 bien hiérarchisés]
  [Blocs callout pour points importants]
  [Images avec légende]
  ─────────────────
  [CTA inline à mi-article : "Diagnostic IA gratuit →"]
  ─────────────────
  [Bio auteur]
  [Partage social (répété en bas)]

SIDEBAR STICKY (desktop) :
  [Table des matières — liens anchor]
  ───────────
  [Card CTA : "Lancer mon Diagnostic IA"]
  ───────────
  [3 articles connexes]

SECTION — ARTICLES CONNEXES (mobile, après le contenu)

FOOTER + WIDGET LOÏC
```

---

### 8.11 Page À propos `/a-propos`

```
HEADER STICKY

SECTION 1 — HERO
  Fond : --color-primary-dark

  Nous croyons que l'IA                  [H1 blanc]
  doit servir les humains.

  CA-TECH est un cabinet de conseil
  fondé avec une conviction simple :
  la technologie doit créer de la valeur
  concrète, mesurable, durable.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION 2 — NOTRE HISTOIRE
  Fond : blanc, layout 50/50

  GAUCHE — Texte narratif
    Depuis [année], nous accompagnons
    les TPE et PME françaises dans leur
    transformation IA.
    [Histoire courte, ton humain, authentique]

  DROITE — Photo d'équipe (vraie, pas de stock)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION 3 — NOS VALEURS (3 cartes)
  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
  │ 🎯 Impact    │  │ 🔍 Clarté   │  │ 🤝 Confiance │
  │ mesurable    │  │ pas jargon  │  │ & durée      │
  └──────────────┘  └──────────────┘  └──────────────┘

SECTION 4 — L'ÉQUIPE
  [Photo]  Prénom Nom — Rôle
  [Bio courte 2 lignes]
  [LinkedIn →]

SECTION 5 — NOS CHIFFRES
  [Stats countUp : clients, projets, villes, Lighthouse moyen]

SECTION 6 — CTA
  [Travailler avec nous →]

FOOTER + WIDGET LOÏC
```

---

### 8.12 Page Contact `/contact`

```
HEADER STICKY

SECTION 1 — HERO CONTACT
  Parlons de votre projet.               [H1]

  Réponse sous 24h ouvrées.
  Pas de démarchage. Juste un échange.

SECTION 2 — LAYOUT 50/50

  GAUCHE — Formulaire :
    Prénom *
    Nom *
    Email professionnel *
    Téléphone
    Sujet [Select : IA / Automatisation / SEO / Web / Autre]
    Message *    [Textarea 4 lignes]
    [Envoyer →]  (Button primary lg)
    Ou [Démarrer avec Loïc →]

  DROITE — Informations :
    [Email direct]
    [LinkedIn]
    [Téléphone]
    [Localisation : France — 100% remote + déplacements]
    ───────────
    « Vous préférez un RDV direct ? »
    [Réserver 30 min →]  (Calendly)

FOOTER + WIDGET LOÏC
```

---

### 8.13 Page Devis `/devis`

```
HEADER SIMPLIFIÉ (logo + "Questions ? [contact]")

SECTION 1 — INTRO
  Votre devis en 3 minutes.             [H1]
  Gratuit · Personnalisé · Sans engagement.

  [Progress bar : Étape X sur 4]

SECTION 2 — FORMULAIRE MULTI-ÉTAPES (carte centrée)

  Étape 1 — Votre projet
    [Cards cliquables avec icône et label]
    □ Intelligence Artificielle
    □ Automatisation
    □ SEO
    □ Développement Web
    □ Design & Identité
    □ Plusieurs services

  Étape 2 — Votre budget & délai
    Budget approximatif [Slider ou boutons visuels]
    < 2 000 € / 2-5 k€ / 5-15 k€ / > 15 k€
    Délai souhaité [Boutons : Urgent < 2 sem. / 1-2 mois / Pas de contrainte]

  Étape 3 — Décrivez votre besoin
    [Textarea "En quelques mots, quel est votre projet ?"]
    [Upload optionnel : brief, maquette, doc…]

  Étape 4 — Vos coordonnées
    Prénom / Nom / Email / Téléphone / Entreprise
    [Recevoir mon devis →]  (Button primary xl)
    Légal : [RGPD notice discrète]

SECTION 3 — RÉASSURANCE (sous le formulaire)
  ✓ Réponse sous 24h ouvrées
  ✓ Devis détaillé et transparent
  ✓ Sans engagement
  [★★★★★ Avis Google — 4.9/5]

FOOTER (minimal) + WIDGET LOÏC
```

---

### 8.14 Pages piliers ville × expertise

**Structure identique à la page service correspondante**, avec les adaptations :

- H1 : « Cabinet conseil IA à [Ville] »
- Meta title : « Conseil IA [Ville] — CA-TECH »
- Sections ajoutées : « Pourquoi CA-TECH à [Ville] » (1 section locale), Google Maps embed ou mention adresse locale
- Témoignages filtrés sur la ville si disponibles
- Breadcrumb : Accueil / Intelligence Artificielle / Conseil IA [Ville]
- Schema.org `LocalBusiness` avec adresse ville

*Fin de la Passe 3 — Wireframes textuels*

---

## 9. CTA & Parcours de conversion

### 9.1 Philosophie de conversion

> Un seul CTA principal par page. Jamais deux CTA de même poids en compétition. La hiérarchie visuelle guide le choix.

**Règle des 3 niveaux** :
- **Niveau 1 — CTA primaire** : action de conversion principale (Button primary lg/xl). Une par page.
- **Niveau 2 — CTA secondaire** : alternative moins engageante (Button secondary ou ghost). Optionnel.
- **Niveau 3 — CTA texte** : lien vers contenu complémentaire. Sans pression.

---

### 9.2 Catalogue des CTA

| CTA | Page(s) | Type | Niveau | Destination |
|-----|---------|------|--------|-------------|
| Lancer mon Diagnostic IA → | Homepage, pages service | Button primary xl | 1 | `/diagnostic-ia` |
| Démarrer avec Loïc → | Homepage (section Loïc), `/loic` | Button white xl | 1 | Widget Loïc ouvert ou `/loic` |
| Demander un devis gratuit → | Pages service, footer | Button primary lg | 1 | `/devis` |
| Réserver mon RDV découverte → | Rapport Loïc, email post-diagnostic | Button primary lg | 1 | Calendly 30 min |
| Voir nos réalisations → | Homepage, pages service | Button ghost lg | 2 | `/nos-realisations` |
| Lire l'étude de cas → | Sections cas client | Lien texte + icône | 3 | `/nos-realisations/[slug]` |
| Parler à l'équipe → | `/loic`, page startup | Button secondary | 2 | `/contact` |
| En savoir plus → | Cards expertise homepage | Lien texte | 3 | Page service |
| Voir tous nos services → | Homepage section expertises | Lien texte centré | 3 | `/developpement-web` (ou hub services) |
| Recevoir mon rapport → | `/diagnostic-ia` étape finale | Button primary xl | 1 | Envoi formulaire |
| Envoyer → | `/contact` | Button primary lg | 1 | Envoi formulaire |

---

### 9.3 Règles de placement des CTA

**Above the fold** — Le CTA primaire doit toujours être visible sans scroll sur mobile et desktop.

**Répétition stratégique** — Sur les pages longues (> 3 sections), le CTA primaire est répété :
- Dans le hero (avec Button xl)
- À mi-page (avec Button md inline dans une section)
- En fin de page (section CTA dédiée, avec Button xl, fond gradient)

**Jamais deux Button primary côte à côte.** Si deux actions sont proposées : primary + ghost, ou primary + lien texte.

**Micro-copy sous les CTA** — Systématiquement une ligne de réassurance sous le bouton principal :
- `/diagnostic-ia` : « Gratuit · Sans engagement · Résultat en 10 min »
- `/devis` : « Réponse sous 24h · Devis détaillé · Sans engagement »
- Calendly : « 30 min · Visio ou téléphone · Annulation libre »

---

### 9.4 Tunnel de conversion principal

```
ENTRÉE (trafic organique / paid / social)
        │
        ▼
Page pilier ou Homepage
[CTA primaire : Diagnostic IA]
        │
        ▼
/diagnostic-ia (7 questions, ~3 min)
        │
        ▼
Email automatique : Rapport personnalisé Loïc
[CTA email : Réserver mon RDV →]
        │
        ▼
Calendly — RDV découverte 30 min
        │
        ▼
Proposition commerciale (envoyée sous 48h)
        │
        ▼
/devis ou signature électronique
        │
        ▼
Acompte → Démarrage projet
        │
        ▼
Abonnement suivi mensuel (upsell naturel)
```

**Taux de conversion cibles (objectifs à 12 mois)** :

| Étape | Taux cible |
|-------|-----------|
| Visite → Diagnostic lancé | 8-12% |
| Diagnostic complété → Rapport envoyé | 85% |
| Rapport reçu → RDV réservé | 25-35% |
| RDV → Proposition envoyée | 80% |
| Proposition → Signature | 30-40% |

---

### 9.5 Tunnel alternatif — Devis direct

Pour les personas qui savent déjà ce qu'ils veulent (persona 3 — commerçant local) :

```
Page service locale (SEO local)
[CTA : Demander un devis gratuit →]
        │
        ▼
/devis (4 étapes, ~3 min)
        │
        ▼
Email de confirmation automatique
Appel de qualification (J+1)
        │
        ▼
Proposition envoyée
```

---

### 9.6 Points de friction à éliminer

| Friction | Solution |
|----------|---------|
| Formulaire trop long | Multi-étapes, max 3 champs par écran |
| Pas de preuve de réassurance | Micro-copy sous chaque CTA + étoiles Google |
| Prix non affichés = méfiance | Fourchettes de prix visibles sur pages service |
| Pas de retour immédiat | Email de confirmation automatique à chaque soumission |
| RDV difficile à trouver | Calendly intégré partout où un RDV est mentionné |
| Widget Loïc intrusif | S'ouvre uniquement sur action utilisateur (pas d'auto-pop après X sec) |

---

## 10. SEO intégré au design

> Le SEO n'est pas une couche ajoutée après le design. Chaque décision de structure, de hiérarchie et de contenu est prise avec le référencement naturel en tête.

### 10.1 Structure HTML sémantique

| Élément | Usage obligatoire |
|---------|------------------|
| `<header>` | Navigation principale |
| `<main>` | Contenu principal de chaque page |
| `<section>` | Chaque bloc thématique avec `aria-label` |
| `<article>` | Articles de blog, études de cas |
| `<aside>` | Sidebar blog |
| `<footer>` | Pied de page global |
| `<nav>` | Navigation principale + breadcrumb + pagination |
| `<h1>` | Un seul par page, contient le mot-clé principal |
| `<h2>` | Structurent les sections majeures |
| `<h3>` | Sous-sections dans chaque section |

**Règle absolue** : la hiérarchie des titres ne saute jamais de niveau (H1 → H2 → H3, jamais H1 → H3).

### 10.2 Métadonnées par type de page

**Homepage**
```
title: "CA-TECH — Cabinet Conseil IA, Automatisation & SEO"
description: "Cabinet de conseil spécialisé en Intelligence Artificielle, Automatisation et SEO. Nous faisons croître les entreprises françaises avec des solutions mesurables."
```

**Page service**
```
title: "[Service] — CA-TECH | [Ville si locale]"
description: "[Verbe action] [service] avec CA-TECH. [Bénéfice principal]. [Preuve sociale]. Diagnostic gratuit."
```

**Article blog**
```
title: "[Titre article] | Blog CA-TECH"
description: "[Résumé 1 phrase accrocheur reprenant le mot-clé principal]"
```

**Règles** :
- Title : 50-60 caractères max
- Description : 145-155 caractères max
- Chaque page a un `title` et une `description` uniques — zéro doublon

### 10.3 Open Graph & Twitter Cards

Présents sur toutes les pages :
```html
og:title        → même valeur que <title>
og:description  → même valeur que <meta description>
og:image        → image 1200×630px, branded, avec slogan
og:type         → "website" (pages) / "article" (blog)
og:url          → URL canonique
twitter:card    → "summary_large_image"
```

Image OG spécifique par page de service (générée dynamiquement ou pré-créée pour les 10 pages prioritaires).

### 10.4 Schema.org — Balisage structuré

| Page | Schema |
|------|--------|
| Toutes | `Organization` (nom, logo, URL, réseaux sociaux) |
| Homepage | `WebSite` + `SearchAction` |
| Pages service | `Service` + `LocalBusiness` (si ville) |
| Pages ville | `LocalBusiness` avec adresse, géo, horaires |
| Articles blog | `Article` (author, datePublished, image) |
| FAQ sections | `FAQPage` + `Question` + `Answer` |
| Réalisations | `CreativeWork` ou `WebPage` |
| À propos | `Person` (équipe) + `Organization` |
| Breadcrumb (toutes) | `BreadcrumbList` |

### 10.5 URLs & architecture

**Convention de nommage** :
- Tout en minuscules, tirets, sans underscore ni majuscules
- Mot-clé principal intégré dans l'URL
- Pas de paramètres (`?id=`, `?page=`) dans les URLs indexables

**Exemples** :
```
/intelligence-artificielle          ← pilier IA
/conseil-intelligence-artificielle-paris  ← local IA Paris
/blog/automatiser-qualification-leads    ← article blog
/nos-realisations/agent-ia-sav-pme      ← étude de cas
```

**Canonicals** : balise `<link rel="canonical">` sur toutes les pages. Les pages ville pointent vers elles-mêmes (pas vers la page service nationale).

### 10.6 Performance & SEO Core Web Vitals

Les Core Web Vitals sont un facteur de classement Google. Voir §12 pour les cibles détaillées.

Décisions de design qui impactent directement les CWV :

| Décision design | Impact CWV |
|----------------|-----------|
| Image hero avec `width` et `height` définis | CLS → 0 |
| Pas de `position: absolute` sans dimensions | CLS → 0 |
| Skeleton screens au lieu de spinners | LCP perçu meilleur |
| Font `font-display: swap` + preload | LCP réduit |
| Animations sur `transform/opacity` uniquement | INP réduit |
| Pas de script tiers bloquant (chat, analytics) | LCP réduit |

### 10.7 Maillage interne

**Règle** : chaque page pointe vers au moins 3 autres pages internes contextuellement liées.

**Priorités de maillage** :
- Articles de blog → page service correspondante (en CTA inline et dans l'intro)
- Pages service → pages ville correspondantes (section "Nous intervenons à…")
- Pages ville → page service nationale (breadcrumb + lien dans le corps)
- Homepage → toutes les pages P0 et P1
- Réalisations → pages service illustrées par chaque projet

**Ancres de liens** : descriptives et contenant le mot-clé cible — jamais "cliquez ici" ou "en savoir plus" seuls.

### 10.8 Vitesse de chargement perçue & SEO

- `<link rel="preload">` sur la police Inter et l'image hero de chaque page
- `<link rel="prefetch">` sur `/diagnostic-ia` et `/devis` (pages de conversion, visitées après le hero)
- Lazy loading sur toutes les images hors hero (`loading="lazy"`)
- Images hero : format WebP, max `200 Ko` après compression

---

## 11. Accessibilité WCAG AA

> Niveau cible : **WCAG 2.1 AA** sur l'ensemble du site. L'accessibilité est une contrainte de design, pas une option post-livraison.

### 11.1 Couleurs & contraste

| Combinaison | Ratio requis (AA) | Ratio CA-TECH |
|-------------|------------------|--------------|
| Texte courant noir `#0A0A0A` sur blanc | ≥ 4.5:1 | 21:1 ✓ |
| Texte blanc sur `--color-primary` `#0066FF` | ≥ 4.5:1 | 5.1:1 ✓ |
| Texte blanc sur `--color-primary-dark` `#0A2540` | ≥ 4.5:1 | 17:1 ✓ |
| Texte `--color-gray-600` `#4B5563` sur blanc | ≥ 4.5:1 | 7.6:1 ✓ |
| Texte `--color-gray-400` `#9CA3AF` sur blanc | ≥ 4.5:1 | **3.8:1 ✗** |

**Correction** : `--color-gray-400` ne doit jamais être utilisé pour du texte informatif. Usage limité aux placeholders (exemptés WCAG) et décorations.

**Texte grande taille** (≥ 18px regular ou 14px bold) : ratio minimum ≥ 3:1.

### 11.2 Navigation clavier

- **Focus visible** : outline `2px solid --color-primary`, `outline-offset: 3px` sur tous les éléments interactifs. Jamais `outline: none` sans alternative visible.
- **Ordre de tabulation** logique (suit l'ordre visuel).
- **Skip link** : `<a href="#main-content" class="skip-link">Aller au contenu principal</a>` visible au focus, en haut de page.
- **Traps de focus** : actifs dans les modales, drawers, widgets Loïc (tab reste dans la zone modale tant qu'elle est ouverte).
- **Fermeture Escape** : toute modale, drawer, dropdown se ferme avec `Escape`.

### 11.3 Images & médias

- **Alt text obligatoire** sur toutes les images informatives.
- **Alt vide** (`alt=""`) sur les images décoratives.
- **Règles d'alt text** :
  - Décrire le contenu et le contexte, pas juste l'objet (✗ "logo" → ✓ "Logo CA-TECH")
  - Moins de 125 caractères
  - Pas de préfixe "Image de…" ou "Photo de…"
- **Vidéos** (si futures) : sous-titres obligatoires, pas d'autoplay avec son.
- **Icônes seules** : `aria-label` ou `aria-hidden="true"` + label visible adjacent.

### 11.4 Formulaires

- **Labels visibles** associés via `for`/`id` sur tous les champs.
- **Messages d'erreur** : associés via `aria-describedby`, apparaissent immédiatement sous le champ concerné, en rouge avec icône ⚠.
- **Champs requis** : marqués `required` + `aria-required="true"` + indication visuelle (astérisque ou label "(obligatoire)").
- **Pas de CAPTCHA visuel** — si nécessaire, proposer une alternative audio ou utiliser Cloudflare Turnstile (invisible).
- **Autocomplete** renseigné : `name`, `email`, `tel`, `given-name`, `family-name`, `organization`.

### 11.5 Composants interactifs

| Composant | Pattern ARIA |
|-----------|-------------|
| Navigation header | `<nav aria-label="Navigation principale">` |
| Menu mobile (drawer) | `role="dialog"` + `aria-modal="true"` + `aria-label` |
| Dropdown services | `aria-haspopup="true"` + `aria-expanded` |
| Accordion FAQ | `<details>/<summary>` natif, ou `role="region"` + `aria-expanded` |
| Carousel témoignages | `aria-roledescription="carousel"` + boutons prev/next avec labels |
| Widget Loïc | `role="dialog"` + focus trap + `aria-label="Assistant Loïc"` |
| Progress bar formulaire | `role="progressbar"` + `aria-valuenow` + `aria-valuemax` |
| Tabs (si utilisées) | `role="tablist"` + `role="tab"` + `aria-selected` |
| Stat countUp | Valeur finale dans le DOM dès le chargement (l'animation est cosmétique) |

### 11.6 Préférences système respectées

| Préférence | Comportement |
|-----------|-------------|
| `prefers-reduced-motion: reduce` | Toutes les animations désactivées ou réduites à un simple fade |
| `prefers-color-scheme: dark` | Non requis WCAG, mais à prévoir en V2 (tokens prêts) |
| `prefers-contrast: high` | Bordures renforcées, couleurs plus tranchées |
| Zoom 200% (navigateur) | Mise en page reste lisible, pas de texte coupé ni overflow |

### 11.7 Checklist de validation

Avant toute mise en ligne, valider avec :
- **axe DevTools** (extension Chrome) — objectif : 0 violation critique
- **Lighthouse Accessibility** — objectif : score ≥ 95
- **Test navigation clavier** manuel (Tab, Shift+Tab, Enter, Escape, flèches)
- **Test lecteur d'écran** : VoiceOver (Mac/iOS) + NVDA (Windows) sur les 5 pages P0
- **Test zoom 200%** : vérifier qu'aucun contenu n'est tronqué

---

## 12. Performances attendues

### 12.1 Cibles Core Web Vitals

| Métrique | Définition | Cible mobile | Cible desktop |
|----------|-----------|-------------|--------------|
| **LCP** (Largest Contentful Paint) | Temps d'affichage du plus grand élément visible | < 2.5s | < 1.8s |
| **CLS** (Cumulative Layout Shift) | Stabilité visuelle de la page | < 0.1 | < 0.05 |
| **INP** (Interaction to Next Paint) | Réactivité aux interactions | < 200ms | < 100ms |
| **FCP** (First Contentful Paint) | Premier élément affiché | < 1.8s | < 1.2s |
| **TTFB** (Time to First Byte) | Réponse serveur | < 600ms | < 400ms |

### 12.2 Score Lighthouse cible

| Catégorie | Score cible |
|-----------|-------------|
| Performance | ≥ 90 |
| Accessibilité | ≥ 95 |
| Bonnes pratiques | ≥ 95 |
| SEO | 100 |

**Ces scores sont des exigences de livraison**, pas des objectifs optionnels.

### 12.3 Budget de poids de page

| Ressource | Limite par page |
|-----------|----------------|
| HTML initial | < 30 Ko (gzippé) |
| CSS critique (inline) | < 14 Ko |
| CSS total | < 80 Ko |
| JavaScript (blocking) | 0 Ko |
| JavaScript total (différé) | < 150 Ko |
| Images (page entière) | < 500 Ko |
| Polices | < 80 Ko (2 weights max par page) |
| **Total page (transfert)** | **< 1 Mo** |

### 12.4 Stratégie d'images

| Usage | Format | Règle |
|-------|--------|-------|
| Photos | WebP (+ JPEG fallback) | `srcset` 375w / 768w / 1280w |
| Icônes | SVG inline | Pas de sprite, SVG direct |
| Illustrations IA / UI | SVG ou WebP | Max 150 Ko |
| Image hero | WebP, préchargée | `<link rel="preload">`, `fetchpriority="high"` |
| Images hors hero | WebP, lazy | `loading="lazy"`, `decoding="async"` |
| Images blog | WebP | Max 120 Ko après compression |

Outil de référence : **Squoosh** (compression) + attributs `width` et `height` toujours renseignés (évite le CLS).

### 12.5 Stratégie de polices

```
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preload" as="font" href="inter-400.woff2" crossorigin>
<link rel="preload" as="font" href="inter-600.woff2" crossorigin>
<link rel="preload" as="font" href="inter-800.woff2" crossorigin>
```

- 3 weights maximum chargés : 400 (corps), 600 (sous-titres), 800 (titres)
- `font-display: swap` sur tous
- JetBrains Mono chargé uniquement sur les pages qui l'utilisent (blog technique)

### 12.6 JavaScript — règles de performance

- **Zéro script bloquant** dans `<head>` (hors analytics critique)
- Tous les scripts : `defer` ou `async`
- Widget Loïc : chargé après l'événement `DOMContentLoaded`
- Analytics (GA4) : chargé après `load` event, ou via `requestIdleCallback`
- Animations (`IntersectionObserver`) : natif, pas de librairie externe
- CountUp stats : librairie légère < 3 Ko, chargée `defer`
- Pas de jQuery, pas de Bootstrap

### 12.7 Cache & hébergement (Vercel)

- **CDN Vercel** : assets statiques servis depuis l'edge le plus proche
- Headers de cache :
  - Assets avec hash (`/assets/main.abc123.css`) : `Cache-Control: public, max-age=31536000, immutable`
  - HTML : `Cache-Control: public, max-age=0, s-maxage=3600, stale-while-revalidate=86400`
- **Prefetch** : Vercel précharge automatiquement les routes Next.js au hover des liens

### 12.8 Monitoring continu

| Outil | Usage | Fréquence |
|-------|-------|-----------|
| Google Search Console | Indexation, CWV terrain, erreurs crawl | Hebdomadaire |
| Google Analytics 4 | Trafic, conversions, entonnoirs | Quotidien |
| Lighthouse CI (GitHub Actions) | Vérification scores à chaque déploiement | À chaque commit |
| PageSpeed Insights | CWV terrain + labo | Mensuel |
| Hotjar / Microsoft Clarity | Heatmaps, enregistrements sessions | Continu, 30j glissants |
| Uptime Robot | Disponibilité 24/7 | Toutes les 5 min |

---

## Synthèse — Décisions clés de conception

| Décision | Justification |
|----------|--------------|
| Inter comme police unique | Performance + cohérence + lisibilité maximale |
| Loïc widget sur toutes les pages | Conversion permanente, preuve produit vivante |
| Multi-étapes sur tous les formulaires > 4 champs | Réduction friction mobile, taux de complétion |
| CTA unique par page | Clarté décisionnelle, taux de conversion |
| Skeleton screens partout | Performance perçue, zéro spinner global |
| Animations sur transform/opacity uniquement | INP < 200ms garanti, zéro jank |
| Alt text et focus visible non négociables | WCAG AA, SEO, audience élargie |
| Lighthouse ≥ 90 comme critère de livraison | SEO, CWV, expérience mobile, confiance |
| Schema.org FAQPage sur chaque FAQ | Rich results Google, CTR organique |
| Preload police + image hero | LCP < 2.5s mobile garanti |
| Pas de jQuery / Bootstrap | Budget JS < 150 Ko respecté |
| Breadcrumb sur toutes les pages hors homepage | SEO BreadcrumbList + orientation utilisateur |

---

*Document complet — UX/UI Specification CA-TECH v1.0*
*Aligné sur `STRATEGY.md` — Juillet 2026*
*Toute implémentation requiert la validation de ce document.*
