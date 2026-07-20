# Documentation — Architecture du Site CA-TECH
> Architecte Web Senior · Juillet 2026
> Sources : STRATEGY.md · UX_UI_SPECIFICATION.md · HOMEPAGE_SPECIFICATION.md · COMPONENT_GUIDELINES.md · BRAND_GUIDELINES.md · UX_UI_QUICKREF.md

---

## Table des matières

1. [Arborescence complète du site](#1-arborescence-complète-du-site)
2. [Navigation Desktop](#2-navigation-desktop)
3. [Navigation Mobile](#3-navigation-mobile)
4. [Pages principales](#4-pages-principales)
5. [Pages secondaires](#5-pages-secondaires)
6. [Pages SEO locales](#6-pages-seo-locales)
7. [Pages Blog](#7-pages-blog)
8. [Pages Portfolio](#8-pages-portfolio)
9. [Pages liées à Loïc](#9-pages-liées-à-loïc)
10. [Pages Diagnostic IA](#10-pages-diagnostic-ia)
11. [Pages commerciales](#11-pages-commerciales)
12. [CTAs utilisés sur chaque page](#12-ctas-utilisés-sur-chaque-page)
13. [Liens internes](#13-liens-internes)
14. [Parcours utilisateurs](#14-parcours-utilisateurs)
15. [Parcours SEO](#15-parcours-seo)
16. [Parcours commerciaux](#16-parcours-commerciaux)
17. [Parcours de conversion](#17-parcours-de-conversion)
18. [Composants réutilisables](#18-composants-réutilisables)
19. [Dépendances entre pages](#19-dépendances-entre-pages)
20. [Roadmap de création des pages](#20-roadmap-de-création-des-pages)

---

## 1. Arborescence complète du site

```
ca-tech.fr/
│
├── /                                    Homepage
│
├── SERVICES PILIERS
│   ├── /intelligence-artificielle       Service IA (pilier 1)
│   ├── /automatisation                  Service Automatisation (pilier 2)
│   ├── /seo                             Service SEO (pilier 3)
│   ├── /developpement-web               Service Dev Web (pilier 4)
│   └── /design-identite                 Service Design / Identité visuelle
│
├── SOUS-SERVICES DÉVELOPPEMENT WEB
│   ├── /creation-site-vitrine
│   ├── /creation-site-ecommerce
│   ├── /creation-landing-page
│   └── /developpement-sur-mesure
│
├── SOUS-SERVICES DESIGN
│   ├── /creation-logo
│   ├── /identite-visuelle
│   └── /creation-flyer
│
├── SEO LOCAL — Intelligence Artificielle (×10 villes)
│   ├── /conseil-ia-paris
│   ├── /conseil-ia-lyon
│   ├── /conseil-ia-dijon
│   ├── /conseil-ia-troyes
│   ├── /conseil-ia-marseille
│   ├── /conseil-ia-bordeaux
│   ├── /conseil-ia-nantes
│   ├── /conseil-ia-strasbourg
│   ├── /conseil-ia-toulouse
│   └── /conseil-ia-lille
│
├── SEO LOCAL — Automatisation (×10 villes)
│   ├── /automatisation-paris
│   ├── /automatisation-lyon
│   ├── /automatisation-dijon
│   ├── /automatisation-troyes
│   ├── /automatisation-marseille
│   ├── /automatisation-bordeaux
│   ├── /automatisation-nantes
│   ├── /automatisation-strasbourg
│   ├── /automatisation-toulouse
│   └── /automatisation-lille
│
├── SEO LOCAL — SEO (×10 villes)
│   ├── /agence-seo-paris
│   ├── /agence-seo-lyon
│   ├── /agence-seo-dijon
│   ├── /agence-seo-troyes
│   ├── /agence-seo-marseille
│   ├── /agence-seo-bordeaux
│   ├── /agence-seo-nantes
│   ├── /agence-seo-strasbourg
│   ├── /agence-seo-toulouse
│   └── /agence-seo-lille
│
├── SEO LOCAL — Développement Web (×10 villes)
│   ├── /creation-site-paris
│   ├── /creation-site-lyon
│   ├── /creation-site-dijon
│   ├── /creation-site-troyes
│   ├── /creation-site-marseille
│   ├── /creation-site-bordeaux
│   ├── /creation-site-nantes
│   ├── /creation-site-strasbourg
│   ├── /creation-site-toulouse
│   └── /creation-site-lille
│
├── LOÏC — Consultant IA
│   ├── /loic                            Présentation Loïc
│   ├── /diagnostic-ia                   Diagnostic IA (formulaire 10 min)
│   └── /rapport-ia/[token]              Rapport personnalisé (accès privé)
│
├── BLOG
│   ├── /blog                            Liste des articles
│   └── /blog/[slug]                     Article individuel
│
├── PORTFOLIO
│   ├── /nos-realisations                Galerie des projets
│   └── /nos-realisations/[slug]         Fiche projet détaillée
│
├── COMMERCIAL
│   ├── /devis                           Formulaire devis (3 min)
│   ├── /contact                         Formulaire contact
│   └── /commande-confirmation           Page de confirmation post-achat
│
├── INSTITUTIONNEL
│   └── /a-propos                        À propos / Équipe
│
└── LÉGAL
    ├── /mentions-legales
    ├── /politique-confidentialite
    └── /cgv
```

**Total pages statiques :** 14 pages principales + 5 sous-services Dev Web + 3 sous-services Design + 40 pages SEO locales + 3 pages Loïc = **~65 URLs** (hors slugs dynamiques blog et portfolio)

---

## 2. Navigation Desktop

### Structure Header (sticky — hauteur 72px)

```
┌────────────────────────────────────────────────────────────────────┐
│  [CA-TECH]    Services ▾    Loïc    Réalisations    Blog    [Diagnostic IA →]  │
└────────────────────────────────────────────────────────────────────┘
```

| Élément | Type | Destination | Notes |
|---------|------|-------------|-------|
| Logo CA-TECH | Lien | `/` | Inter ExtraBold 800, #0A2540, uppercase |
| Services | Dropdown | Méga-menu | Ouvre au hover + focus |
| Loïc | Lien simple | `/loic` | Accent identitaire fort |
| Réalisations | Lien simple | `/nos-realisations` | Preuve sociale |
| Blog | Lien simple | `/blog` | SEO + autorité |
| Diagnostic IA → | Button primary | `/diagnostic-ia` | CTA unique dans la nav |

### Méga-menu Services (dropdown)

```
┌─────────────────────────────────────────────────────────────┐
│  EXPERTISE PRINCIPALE         DÉVELOPPEMENT                 │
│  ■ Intelligence Artificielle  ■ Site Vitrine               │
│  ■ Automatisation             ■ E-commerce                 │
│  ■ SEO                        ■ Landing Page               │
│  ■ Développement Web          ■ Sur Mesure                 │
│                                                             │
│  DESIGN & IDENTITÉ                                          │
│  ■ Création Logo              ■ Identité Visuelle          │
│  ■ Création Flyer                                          │
└─────────────────────────────────────────────────────────────┘
```

**Comportement :**
- Apparaît au hover (150ms) et disparaît au mouseleave (avec délai 200ms)
- Focus trap quand navigation clavier
- `aria-expanded` sur le bouton déclencheur
- Fond blanc · border-radius 16px · box-shadow md · padding 32px
- Fermeture sur Escape

### États du Header

| Contexte | État |
|----------|------|
| Scroll = 0 | Transparent ou blanc selon page |
| Scroll > 0 | `backdrop-blur(12px)` + `background: rgba(255,255,255,0.85)` |
| Page dark (Hero #0A2540) | Logo et liens en blanc |
| Lien actif | Couleur #0066FF + font-weight 600 |

---

## 3. Navigation Mobile

### Header Mobile (hauteur 64px)

```
┌─────────────────────────────┐
│  [CA-TECH]              [☰] │
└─────────────────────────────┘
```

### Drawer (80vw — s'ouvre par la droite)

```
┌────────────────────────────┐
│ [✕]                        │
│                            │
│ Services                   │
│   › Intelligence Artificielle│
│   › Automatisation         │
│   › SEO                    │
│   › Développement Web      │
│   › Design & Identité      │
│                            │
│ Loïc                       │
│ Réalisations               │
│ Blog                       │
│ À propos                   │
│ Contact                    │
│                            │
│ ┌──────────────────────┐   │
│ │  Diagnostic IA →     │   │
│ └──────────────────────┘   │
│ Devis gratuit →            │
└────────────────────────────┘
```

**Comportement :**
- Ouverture : slide-in depuis la droite (250ms ease-out)
- Overlay sombre derrière (opacity 0 → 0.5)
- Focus trap actif quand ouvert
- Fermeture : bouton ✕, clic overlay, touche Escape
- `aria-expanded` sur le bouton ☰
- `aria-hidden` sur le contenu principal quand drawer ouvert
- CTA primaire en position fixe bas du drawer
- Services dépliables (accordion in-drawer)

### Widget Loïc (fixe bas-droite — présent sur toutes les pages)

```
Mobile :        [💬]  ← bouton rond 52px, bottom:16px, right:16px
Ouvert :        Plein écran, focus trap, Escape pour fermer
```

---

## 4. Pages principales

### `/` — Homepage

- **H1 :** « L'Intelligence Artificielle au service de votre croissance. »
- **CTA primaire :** Lancer mon Diagnostic IA →
- **Sections :** Hero · Proof Bar · Stats (3 chiffres) · 4 Expertises (cards) · Section Loïc · Process (4 étapes) · Cas clients (3) · Témoignages (carousel) · CTA final · Footer
- **Schema.org :** `WebSite` + `Organization`
- **Meta title :** CA-TECH — Cabinet de conseil IA · Automatisation · SEO · Dev Web
- **Meta description :** CA-TECH déploie l'IA au service de votre croissance. Diagnostic IA gratuit, automatisation des processus, SEO avancé, développement web sur mesure.

### `/intelligence-artificielle` — Service IA

- **H1 :** « Déployez l'IA au cœur de votre activité »
- **CTA primaire :** Lancer mon Diagnostic IA →
- **Sections :** Hero · Avant/Après · Features (6 cartes) · Process · Cas clients · Témoignages · FAQ (6 questions) · CTA final
- **Schema.org :** `Service`

### `/automatisation` — Service Automatisation

- **H1 :** « Automatisez ce qui vous ralentit »
- **CTA primaire :** Lancer mon Diagnostic IA →
- **Sections :** Hero · Avant/Après · Workflows exemples · Process · Cas clients · FAQ · CTA final
- **Schema.org :** `Service`

### `/seo` — Service SEO

- **H1 :** « Soyez trouvé avant vos concurrents »
- **CTA primaire :** Demander un devis gratuit →
- **Sections :** Hero · Avant/Après (trafic, positions) · Features · Process · Cas clients · FAQ · CTA final
- **Schema.org :** `Service`

### `/developpement-web` — Service Dev Web

- **H1 :** « Des sites qui performent. Pas juste qui existent. »
- **CTA primaire :** Demander un devis gratuit →
- **Sections :** Hero · Types de projets (cards) · Process · Portfolio (3) · Témoignages · FAQ · CTA final
- **Schema.org :** `Service`

### `/loic` — Présentation Loïc

- **H1 :** « Bonjour, je suis Loïc. Votre consultant IA. »
- **CTA primaire :** Démarrer le diagnostic →
- **Sections :** Hero · Présentation Loïc · Ce que Loïc fait · Parcours de consultation · Témoignages · CTA final
- **Schema.org :** `Service`

### `/nos-realisations` — Portfolio

- **H1 :** « Des projets qui parlent d'eux-mêmes »
- **CTA primaire :** Lancer mon Diagnostic IA →
- **Sections :** Hero · Filtres (catégories) · Grille projets · CTA final
- **Schema.org :** `CreativeWork`

### `/a-propos` — À propos

- **H1 :** « Nous croyons que l'IA doit servir les humains »
- **CTA primaire :** Travailler avec nous →
- **Sections :** Hero · Vision · Équipe · Valeurs · Process interne · Témoignages clients · CTA final
- **Schema.org :** `Organization` + `Person`

---

## 5. Pages secondaires

### Sous-services Développement Web

| Page | H1 | CTA |
|------|----|-----|
| `/creation-site-vitrine` | « Un site vitrine qui génère des contacts » | Devis gratuit |
| `/creation-site-ecommerce` | « Une boutique en ligne prête à vendre » | Devis gratuit |
| `/creation-landing-page` | « Une landing page qui convertit » | Devis gratuit |
| `/developpement-sur-mesure` | « Une application sur mesure à votre image » | Diagnostic IA |

**Structure type sous-service :**
Hero · Problème/Solution · Features (4–6 cartes) · Process · Portfolio filtré · FAQ (4 questions) · CTA final

### Sous-services Design

| Page | H1 | CTA |
|------|----|-----|
| `/creation-logo` | « Un logo qui vous représente » | Devis gratuit |
| `/identite-visuelle` | « Une identité visuelle mémorable » | Devis gratuit |
| `/creation-flyer` | « Des flyers qui attirent l'œil » | Devis gratuit |

### Pages commerciales secondaires

| Page | H1 | CTA |
|------|----|-----|
| `/devis` | « Votre devis en 3 minutes » | Recevoir mon devis |
| `/contact` | « Parlons de votre projet » | Envoyer |
| `/commande-confirmation` | « Merci, votre commande est confirmée » | — |

### Pages légales (sans nav secondaire, footer complet)

| Page | Contenu |
|------|---------|
| `/mentions-legales` | Éditeur, hébergeur, SIRET |
| `/politique-confidentialite` | RGPD, cookies, droits |
| `/cgv` | Conditions générales de vente |

---

## 6. Pages SEO locales

### Stratégie

Pages générées pour les 4 services × 10 villes = **40 pages** à terme.

**Villes Phase 1 (P1) :** Paris · Lyon · Dijon · Troyes  
**Villes Phase 2 (P2) :** Marseille · Bordeaux · Nantes · Strasbourg  
**Villes Phase 3 (P3) :** Toulouse · Lille

### Structure type page SEO locale

```
URL pattern : /[service]-[ville]   ex: /conseil-ia-paris

H1 : "[Service] à [Ville] — CA-TECH"
ex: "Conseil IA à Paris — CA-TECH"

Sections :
1. Hero local (mention ville + stats locales)
2. Présentation service (adapté au contexte local)
3. Pourquoi CA-TECH à [Ville]
4. Cas client local (si disponible)
5. FAQ locale (4–6 questions contextualisées)
6. CTA final

Schema.org : LocalBusiness + Service
```

### Tableau des 40 pages SEO locales

| Service | Paris | Lyon | Dijon | Troyes | 6 autres villes |
|---------|-------|------|-------|--------|-----------------|
| Intelligence Artificielle | `/conseil-ia-paris` | `/conseil-ia-lyon` | `/conseil-ia-dijon` | `/conseil-ia-troyes` | ×6 |
| Automatisation | `/automatisation-paris` | `/automatisation-lyon` | `/automatisation-dijon` | `/automatisation-troyes` | ×6 |
| SEO | `/agence-seo-paris` | `/agence-seo-lyon` | `/agence-seo-dijon` | `/agence-seo-troyes` | ×6 |
| Développement Web | `/creation-site-paris` | `/creation-site-lyon` | `/creation-site-dijon` | `/creation-site-troyes` | ×6 |

### Règles de contenu pages locales

- Minimum 800 mots de contenu unique par page
- Mention de la ville ≥ 5 fois dans le contenu
- 1 témoignage client local si disponible
- Breadcrumb obligatoire : Accueil > [Service] > [Service] à [Ville]
- `LocalBusiness` avec `addressLocality` et `areaServed`
- Pas de duplicate content : chaque ville a au moins 60% de contenu unique

---

## 7. Pages Blog

### `/blog` — Liste des articles

- **H1 :** « IA, Automatisation, SEO — pour les dirigeants »
- **Fonctions :** Filtres par catégorie · Search · Pagination (12 articles/page)
- **Cards articles :** Image · Catégorie (badge) · Titre · Extrait · Date · Temps de lecture · Auteur
- **Schema.org :** `Blog`

### `/blog/[slug]` — Article individuel

**Structure type article :**
```
1. Breadcrumb : Accueil > Blog > [Catégorie] > [Titre]
2. Hero article (image + titre + meta)
3. Table des matières (sticky sidebar desktop)
4. Corps de l'article
5. CTA inline (après §3 et en fin d'article)
6. Section auteur
7. Articles similaires (3 cards)
8. CTA final (Diagnostic IA)
```

- **H1 :** Titre de l'article (contient le mot-clé principal)
- **CTA inline :** Lancer mon Diagnostic IA → (après §3)
- **CTA final :** Diagnostic IA
- **Schema.org :** `Article` (ou `BlogPosting`)
- **Partage social :** Open Graph complet (og:image 1200×630)

### Catégories prévues

| Catégorie | Slug | Intention |
|-----------|------|-----------|
| Intelligence Artificielle | `ia` | Découverte / TOFU |
| Automatisation | `automatisation` | Découverte / TOFU |
| SEO | `seo` | Découverte / MOFU |
| Développement Web | `dev-web` | Découverte / MOFU |
| Cas clients | `cas-clients` | Preuve / BOFU |
| Guides pratiques | `guides` | Rétention / MOFU |

### Fréquence de publication cible

- Phase 1 : 2 articles/mois (piliers IA et Automatisation)
- Phase 2 : 4 articles/mois (tous services + cas clients)
- Phase 3 : 6–8 articles/mois (guides + veille sectorielle)

---

## 8. Pages Portfolio

### `/nos-realisations` — Galerie

**Filtres disponibles :**
- Tous
- IA & Automatisation
- Sites Vitrines
- E-commerce
- Landing Pages
- Design & Identité

**Card projet (structure) :**
```
┌──────────────────────┐
│    [Image projet]    │
├──────────────────────┤
│ [Badge: Catégorie]   │
│ Titre du projet      │
│ Client / Secteur     │
│ Résultat clé         │
└──────────────────────┘
```

- Grille : 3 colonnes desktop · 2 colonnes tablette · 1 colonne mobile
- Hover : légère élévation + overlay avec « Voir le projet »
- Pagination ou "Charger plus" (12 projets initiaux)

### `/nos-realisations/[slug]` — Fiche projet

**Structure type :**
```
1. Breadcrumb : Accueil > Réalisations > [Projet]
2. Hero projet (image full-width + titre + client)
3. Contexte & défi
4. Solution apportée
5. Résultats mesurables (Stats component)
6. Captures / Galerie
7. Technologies utilisées (badges)
8. Témoignage client
9. Projets similaires (3 cards)
10. CTA final
```

- **Schema.org :** `CreativeWork`
- **CTA :** Lancer mon Diagnostic IA → ou Demander un devis gratuit →

---

## 9. Pages liées à Loïc

### `/loic` — Présentation

**Objectif :** Humaniser Loïc comme consultant IA, expliquer la valeur, inciter au diagnostic.

**Sections :**
1. Hero — "Bonjour, je suis Loïc"
2. Ce que Loïc fait concrètement (3 colonnes)
3. Parcours d'une consultation (Stepper 7 étapes)
4. Exemples de diagnostics (cards anonymisés)
5. Témoignages post-diagnostic
6. FAQ Loïc (6 questions)
7. CTA final → Démarrer le diagnostic

**Micro-interaction :** Animation typing indicator dans le hero pour simuler une réponse Loïc

### `/diagnostic-ia` — Formulaire Diagnostic

**Objectif :** Qualifier le lead en 10 minutes, collecter les infos pour le rapport IA.

**Étapes du formulaire (Stepper visible) :**
```
Étape 1 — Votre entreprise (secteur, taille, CA)
Étape 2 — Vos défis actuels (cases à cocher)
Étape 3 — Vos outils actuels (CRM, ERP, etc.)
Étape 4 — Vos ambitions (objectifs à 12 mois)
Étape 5 — Vos coordonnées
→ Soumission → email de confirmation → rapport sous 24–48h
```

- **H1 :** « Votre diagnostic IA en 10 minutes »
- **Progress bar** visible à chaque étape
- **Validation temps réel** à chaque champ
- **Pas de Schema.org** (formulaire privé)
- **Post-soumission :** Page de confirmation inline + email automatique (Resend/EmailJS)

### `/rapport-ia/[token]` — Rapport personnalisé

**Accès :** URL unique générée après soumission diagnostic (token UUID)  
**Contenu :** Rapport HTML personnalisé avec score IA, recommandations, prochaines étapes  
**CTA :** Réserver mon RDV Calendly →  
**Durée de validité :** 30 jours (token expire)  
**Pas indexé** : `<meta name="robots" content="noindex">`

### Widget Loïc (global — toutes les pages)

**Position :** Fixe, bas-droite, z-index 1000  
**État fermé :** Bouton rond 52px, icône bulle + badge "Loïc"  
**État ouvert (desktop) :** Fenêtre 380×520px, chat interface  
**État ouvert (mobile) :** Plein écran  
**Comportement :** Jamais auto-ouvert · Focus trap quand ouvert · Escape pour fermer  
**Persistance :** État conservé en sessionStorage  

**Fonctionnalités V1 :**
- Message de bienvenue
- Boutons de choix rapides (diagnostic, devis, contact)
- Redirection vers formulaire Diagnostic IA
- Transfert vers humain si demande complexe

---

## 10. Pages Diagnostic IA

### Vue d'ensemble du parcours Diagnostic

```
Entrée multiple :
  - CTA "Diagnostic IA →" (nav, hero, CTA final)
  - Page /loic
  - Widget Loïc
  - Email de nurturing

       ↓

/diagnostic-ia
  Formulaire 5 étapes (10 min)
  Validation temps réel
  Progress bar visible

       ↓

Soumission
  → Confirmation inline ("Merci [Prénom], votre diagnostic est en cours")
  → Email automatique (accusé de réception)
  → Notification interne Manager (nouveau lead)

       ↓

Traitement (24–48h)
  Loïc / Équipe analyse les réponses
  Génération du rapport personnalisé

       ↓

/rapport-ia/[token]
  Rapport HTML personnalisé
  Score de maturité IA (0–100)
  Top 3 opportunités identifiées
  Recommandations priorisées
  CTA : Réserver RDV Calendly

       ↓

RDV Calendly 30 min
  Consultation stratégique
  Présentation proposition commerciale
```

### Points d'entrée vers `/diagnostic-ia`

| Source | Contexte | Priorité |
|--------|----------|----------|
| Header nav | Toutes les pages | P0 |
| Hero homepage | Arrivée directe | P0 |
| CTA final chaque page service | Intent fort | P0 |
| Page /loic | Persona qualifié | P0 |
| Widget Loïc (choix rapide) | Engagement actif | P1 |
| Articles blog (CTA inline) | MOFU/BOFU | P1 |
| Pages SEO locales | Intent local | P1 |
| Campagnes email | Nurturing | P2 |

---

## 11. Pages commerciales

### `/devis` — Formulaire Devis

**H1 :** « Votre devis en 3 minutes »  
**Micro-copy :** « Réponse sous 24h · Devis détaillé · Sans engagement »

**Étapes :**
```
Étape 1 — Type de projet (boutons visuels avec icônes)
  ○ Site Vitrine  ○ E-commerce  ○ Landing Page
  ○ Logo         ○ IA/Auto     ○ Autre

Étape 2 — Budget indicatif (slider ou ranges)
  < 1 000€ · 1 000–3 000€ · 3 000–10 000€ · > 10 000€

Étape 3 — Description du projet (textarea)

Étape 4 — Coordonnées + délai souhaité
```

**Post-soumission :**
- Confirmation inline
- Email automatique client (accusé de réception + récapitulatif)
- Notification interne Manager (nouveau devis)
- Réponse équipe sous 24h

**Intégrations :** Supabase (stockage) · Resend (emails) · Manager (notification)

### `/contact` — Formulaire Contact

**H1 :** « Parlons de votre projet »  
**Champs :** Prénom · Nom · Email · Téléphone (opt.) · Sujet · Message  
**CTA :** Envoyer →  
**Post-soumission :** Confirmation inline + email automatique

### `/commande-confirmation` — Confirmation post-achat

**Contexte :** Affiché après paiement Stripe réussi  
**Contenu :**
- Confirmation visuelle (icône check animée)
- Récapitulatif commande
- Prochaines étapes (Stepper)
- Email de confirmation (envoyé automatiquement)
- Accès espace client (lien vers Manager si compte créé)

---

## 12. CTAs utilisés sur chaque page

### Catalogue complet des CTAs

| Bouton | Destination | Taille | Style | Pages concernées |
|--------|-------------|--------|-------|------------------|
| Lancer mon Diagnostic IA → | `/diagnostic-ia` | xl | primary | Homepage, /ia, /automatisation, /loic, /blog/*, /nos-realisations |
| Démarrer avec Loïc → | `/diagnostic-ia` | xl | white | Sections sombres, CTA finaux |
| Demander un devis gratuit → | `/devis` | lg | primary | /seo, /dev-web, /creation-*, /design-* |
| Réserver mon RDV → | Calendly 30 min | lg | primary | /rapport-ia/[token] |
| Voir nos réalisations → | `/nos-realisations` | lg | ghost | Homepage (section portfolio), /dev-web |
| Parler à l'équipe → | `/contact` | md | secondary | /a-propos, pages légales |
| Recevoir mon rapport → | (soumission formulaire) | xl | primary | `/diagnostic-ia` |
| Recevoir mon devis → | (soumission formulaire) | xl | primary | `/devis` |
| Envoyer → | (soumission formulaire) | lg | primary | `/contact` |

### Micro-copy obligatoire sous CTA

| CTA | Micro-copy |
|-----|-----------|
| Diagnostic IA | « Gratuit · Sans engagement · Résultat en 10 min » |
| Devis gratuit | « Réponse sous 24h · Devis détaillé · Sans engagement » |
| RDV Calendly | « Créneau de 30 min · Sans engagement » |

### Règles CTA

- **1 seul CTA primaire** par page (jamais deux `Button primary` côte à côte)
- CTA secondaires en style `ghost` ou `secondary`
- Taille `xl` uniquement dans les heroes et CTA finaux de section
- Widget Loïc toujours présent en complément (sans remplacer le CTA primaire)

### CTA par page (détail)

| Page | CTA primaire | CTA secondaire |
|------|-------------|---------------|
| `/` | Diagnostic IA (xl primary) | Voir réalisations (lg ghost) |
| `/intelligence-artificielle` | Diagnostic IA | — |
| `/automatisation` | Diagnostic IA | — |
| `/seo` | Devis gratuit | Diagnostic IA (ghost) |
| `/developpement-web` | Devis gratuit | Voir réalisations (ghost) |
| `/loic` | Démarrer le diagnostic | — |
| `/diagnostic-ia` | Recevoir mon rapport | — |
| `/nos-realisations` | Diagnostic IA | — |
| `/nos-realisations/[slug]` | Diagnostic IA | Devis gratuit (ghost) |
| `/blog` | — | — |
| `/blog/[slug]` | Diagnostic IA (inline + final) | — |
| `/devis` | Recevoir mon devis | — |
| `/contact` | Envoyer | — |
| `/a-propos` | Travailler avec nous → /devis | Parler à l'équipe (ghost) |
| Pages SEO locales | Diagnostic IA | Devis gratuit (ghost) |

---

## 13. Liens internes

### Maillage interne — Matrice principale

| Page source | Pointe vers | Type de lien |
|-------------|-------------|--------------|
| Homepage | /ia, /automatisation, /seo, /dev-web | Cards services |
| Homepage | /loic | Section dédiée |
| Homepage | /nos-realisations | Section portfolio |
| Homepage | /diagnostic-ia | CTA primaire × 3 |
| /ia | /diagnostic-ia | CTA |
| /ia | /conseil-ia-paris, /conseil-ia-lyon... | Liens géographiques |
| /ia | /automatisation | Service complémentaire |
| /automatisation | /ia | Service parent |
| /automatisation | /automatisation-paris, ... | Liens géographiques |
| /seo | /developpement-web | Service complémentaire |
| /seo | /agence-seo-paris, ... | Liens géographiques |
| /developpement-web | /creation-site-vitrine, /creation-site-ecommerce, /creation-landing-page, /developpement-sur-mesure | Sous-services |
| /developpement-web | /creation-site-paris, ... | Liens géographiques |
| /developpement-web | /nos-realisations | Preuve sociale |
| /loic | /diagnostic-ia | CTA principal |
| /nos-realisations | /nos-realisations/[slug] | Fiches projets |
| /nos-realisations/[slug] | /devis | CTA |
| /blog/[slug] | /ia ou /seo ou /dev-web | Lien contextuel |
| /blog/[slug] | /diagnostic-ia | CTA inline |
| /blog/[slug] | Autres articles | Articles similaires |
| Pages SEO locales | /[service] | Page pilier parente |
| Pages SEO locales | /diagnostic-ia | CTA |
| /a-propos | /loic | Mention Loïc |
| /a-propos | /nos-realisations | Preuve sociale |

### Breadcrumbs (pages concernées)

```
/intelligence-artificielle     → Accueil > Services > Intelligence Artificielle
/automatisation                → Accueil > Services > Automatisation
/seo                           → Accueil > Services > SEO
/developpement-web             → Accueil > Services > Développement Web
/creation-site-vitrine         → Accueil > Développement Web > Site Vitrine
/conseil-ia-paris              → Accueil > Intelligence Artificielle > Paris
/agence-seo-lyon               → Accueil > SEO > Lyon
/nos-realisations/[slug]       → Accueil > Réalisations > [Projet]
/blog/[slug]                   → Accueil > Blog > [Catégorie] > [Titre]
```

### Liens pied de page (Footer)

```
Expertise : /ia · /automatisation · /seo · /dev-web · /design-identite
Villes     : /conseil-ia-paris · /conseil-ia-lyon · /conseil-ia-dijon · /conseil-ia-troyes
Légal      : /mentions-legales · /politique-confidentialite · /cgv
Contact    : /contact · pemoustaskit@gmail.com
Réseaux    : LinkedIn · (autres à définir)
```

---

## 14. Parcours utilisateurs

### Persona 1 — Dirigeant PME (35–55 ans, 500K–10M€ CA)

**Problème :** Perd du temps sur des tâches répétitives, entend parler d'IA mais ne sait pas par où commencer.

```
1. Google : "comment utiliser l'IA dans mon entreprise"
        ↓
2. Atterrit sur /blog/[article-ia-pme]
        ↓
3. Lit l'article, clique sur CTA inline → /diagnostic-ia
        ↓
4. Remplit le diagnostic (10 min)
        ↓
5. Reçoit email de confirmation
        ↓
6. Reçoit rapport personnalisé sous 24h → /rapport-ia/[token]
        ↓
7. Clique "Réserver mon RDV" → Calendly
        ↓
8. RDV 30 min → Proposition commerciale
        ↓
9. Signature → Client
```

**Durée parcours type :** 3 jours (article → RDV)  
**Taux de conversion attendu :** 8–12% (article → diagnostic)

### Persona 2 — Fondateur startup (25–40 ans)

**Problème :** Veut un site performant + automatisations pour scaler sans recruter.

```
1. LinkedIn / recommandation → Homepage
        ↓
2. Scroll hero + proof bar → Section services
        ↓
3. Clique /loic → Découvre Loïc
        ↓
4. Clique "Démarrer le diagnostic"
        ↓
5. Diagnostic → Rapport → RDV
        ↓
6. Ou : va directement sur /developpement-web → /devis
```

**Durée parcours type :** 1–2 jours  
**Taux de conversion attendu :** 15–20% (homepage → action)

### Persona 3 — Commerçant/artisan local

**Problème :** Pas de site, ou site vieillissant, besoin de visibilité locale.

```
1. Google : "création site [ville]" → Page SEO locale
        ↓
2. Lit la page /creation-site-[ville]
        ↓
3. Clique "Devis gratuit" → /devis
        ↓
4. Remplit le formulaire devis
        ↓
5. Reçoit devis sous 24h
        ↓
6. Appel téléphonique → Signature
```

**Durée parcours type :** 1–5 jours  
**Taux de conversion attendu :** 5–10% (page locale → devis)

### Persona 4 — Direction marketing grands comptes

**Problème :** Stratégie SEO insuffisante, ROI des campagnes à améliorer.

```
1. Google : "agence seo [ville]" → Page SEO locale
        ↓
2. Page service → Cas clients → Portfolio
        ↓
3. /a-propos → Crédibilité équipe
        ↓
4. /diagnostic-ia ou /devis
        ↓
5. RDV Calendly → Proposition
```

---

## 15. Parcours SEO

### Structure en silos thématiques

```
SILO 1 — Intelligence Artificielle
    Page pilier : /intelligence-artificielle
    ├── /conseil-ia-paris
    ├── /conseil-ia-lyon
    ├── /conseil-ia-dijon
    ├── /conseil-ia-troyes
    └── /blog/[articles-ia] (×N)

SILO 2 — Automatisation
    Page pilier : /automatisation
    ├── /automatisation-paris
    ├── /automatisation-lyon
    └── /blog/[articles-automatisation] (×N)

SILO 3 — SEO
    Page pilier : /seo
    ├── /agence-seo-paris
    ├── /agence-seo-lyon
    └── /blog/[articles-seo] (×N)

SILO 4 — Développement Web
    Page pilier : /developpement-web
    ├── /creation-site-vitrine
    ├── /creation-site-ecommerce
    ├── /creation-landing-page
    ├── /developpement-sur-mesure
    ├── /creation-site-paris
    └── /blog/[articles-dev-web] (×N)
```

### Intent mapping par type de page

| Type de page | Intent SEO | Stade funnel |
|-------------|------------|--------------|
| Pages piliers services | Navigationnel + Transactionnel | MOFU |
| Pages SEO locales | Transactionnel + Local | BOFU |
| Articles blog (guides) | Informationnel | TOFU |
| Articles blog (cas clients) | Commercial Investigation | MOFU/BOFU |
| Homepage | Navigationnel + Brand | TOFU |
| Pages /loic, /diagnostic-ia | Commercial Investigation | MOFU |

### Mots-clés cibles prioritaires

| Page | Mot-clé principal | Volume estimé |
|------|------------------|---------------|
| `/intelligence-artificielle` | "consultant IA entreprise" | 1 200/mois |
| `/automatisation` | "automatisation processus entreprise" | 900/mois |
| `/seo` | "agence SEO" | 5 000/mois |
| `/developpement-web` | "création site web sur mesure" | 3 500/mois |
| `/conseil-ia-paris` | "consultant IA Paris" | 400/mois |
| `/agence-seo-paris` | "agence SEO Paris" | 1 800/mois |
| `/creation-site-paris` | "création site web Paris" | 2 200/mois |

### Schémas Schema.org par type de page

| Type | Schemas |
|------|---------|
| Homepage | `WebSite` + `Organization` |
| Pages services | `Service` |
| Pages SEO locales | `LocalBusiness` + `Service` |
| Articles blog | `Article` / `BlogPosting` |
| Portfolio (liste) | — |
| Portfolio (fiche) | `CreativeWork` |
| FAQ sections | `FAQPage` |
| Breadcrumbs | `BreadcrumbList` |
| /a-propos | `Organization` + `Person` |

---

## 16. Parcours commerciaux

### Tunnel 1 — Diagnostic IA (flux principal)

```
AWARENESS
  Organique : Blog · SEO local · Pages piliers
  Paid : Google Ads · LinkedIn Ads
        ↓
INTEREST
  Homepage hero · Page /loic · Widget Loïc
        ↓
CONSIDERATION
  /diagnostic-ia  (formulaire 5 étapes)
  Déclencheur : CTA "Diagnostic IA" dans nav/hero/CTA finaux
        ↓
QUALIFICATION
  Rapport personnalisé /rapport-ia/[token]
  Score de maturité IA · Top 3 opportunités
        ↓
INTENT
  Réserver RDV Calendly 30 min (depuis rapport)
        ↓
CONVERSION
  Proposition commerciale → Devis (Manager)
  Signature → Client actif
        ↓
LOYALTY
  Accès Manager · Reporting mensuel · Évolutions
```

### Tunnel 2 — Devis direct (flux secondaire)

```
Entrée : Pages services, pages SEO locales, portfolio
        ↓
/devis — Formulaire 4 étapes (3 min)
        ↓
Notification interne → Manager (nouveau devis)
        ↓
Réponse équipe sous 24h (email + appel)
        ↓
Proposition → Signature
```

### Délais commerciaux cibles

| Étape | Délai cible |
|-------|-------------|
| Réception diagnostic → Rapport envoyé | < 48h |
| Réception devis → Réponse commerciale | < 24h |
| RDV → Proposition envoyée | < 48h |
| Relance prospect inactif | J+3, J+7, J+14 |

---

## 17. Parcours de conversion

### Micro-conversions (engagement pré-achat)

| Action | Valeur signal | Suivi |
|--------|--------------|-------|
| Temps sur page > 2 min | Intérêt fort | Analytics |
| Scroll > 75% d'une page service | Lecture complète | Analytics |
| Hover sur CTA (> 3s) | Hésitation → remarketing | Analytics |
| Ouverture Widget Loïc | Engagement actif | Analytics |
| Début formulaire diagnostic | Intent fort | Supabase |
| Début formulaire devis | Intent fort | Supabase |

### Macro-conversions

| Conversion | KPI | Cible Phase 1 |
|-----------|-----|---------------|
| Soumission diagnostic | Leads | 30/mois |
| Soumission devis | Demandes | 15/mois |
| RDV Calendly réservé | Leads chauds | 10/mois |
| Proposition envoyée | Opportunities | 8/mois |
| Contrat signé | Clients | 3–5/mois |

### Points de conversion optimisés

```
Page           Élément déclencheur          Optimisation prévue
──────────────────────────────────────────────────────────────
Homepage       Hero CTA                     A/B test copy ("Diagnostic" vs "Audit")
/loic          Bouton fin de Stepper        Social proof ajouté
/diagnostic-ia Progress bar visible         Réduction abandons
/devis         Types projet visuels         Clics +30% attendus
/blog/*        CTA inline §3               Intent matching (contextuel)
```

### Remarketing prévu (Phase 2)

- Visiteurs pages services sans conversion → Google Display (7 jours)
- Abandons formulaire diagnostic → Email J+1 "Vous aviez commencé..."
- Leads diagnostics non-convertis → LinkedIn (J+3 à J+30)

---

## 18. Composants réutilisables

### Composants UI globaux (présents sur toutes les pages)

| Composant | Fichier | Pages |
|-----------|---------|-------|
| Navigation Header | `Header.html` / `Header.jsx` | Toutes |
| Footer | `Footer.html` / `Footer.jsx` | Toutes |
| Widget Loïc | `WidgetLoic.html` / `WidgetLoic.jsx` | Toutes |
| Skip link | Inline | Toutes |

### Composants de contenu (sections réutilisables)

| Composant | Utilisation |
|-----------|-------------|
| `Hero` (4 variantes) | Homepage, services, pages locales, /loic |
| `HeroSimple` | Blog, portfolio, pages légales |
| `SectionHeader` | Toutes les sections avec titre + sous-titre |
| `Proof Bar` | Homepage + pages services piliers |
| `StatBlock` | Homepage, pages services, fiches portfolio |
| `Card` (7 variantes) | Services, portfolio, blog, témoignages |
| `FeatureGrid` (2×3) | Pages services |
| `BeforeAfter` | Pages services (split 50/50 desktop) |
| `Process Stepper` | Pages services, /loic |
| `FAQ Accordion` | Pages services, /loic, pages locales |
| `Testimonials Carousel` | Homepage, pages services |
| `CTA Final` (section) | Toutes les pages (avant footer) |
| `BreadcrumbNav` | Toutes sauf homepage |

### Composants de formulaire

| Composant | Utilisation |
|-----------|-------------|
| `Input` + validation | /diagnostic-ia, /devis, /contact |
| `Textarea` | /devis, /contact |
| `Select` | /diagnostic-ia (secteur) |
| `Checkbox` / `Radio` | /diagnostic-ia (défis, outils) |
| `ProgressBar` | /diagnostic-ia, /devis |
| `Stepper` (formulaire) | /diagnostic-ia (5 étapes), /devis (4 étapes) |

### Composants atomes

| Composant | Variantes | Notes |
|-----------|-----------|-------|
| `Button` | primary · secondary · ghost · white · danger · link | 4 tailles : sm/md/lg/xl |
| `Badge` / `Tag` / `Pill` | colored · outline · solid | Catégories, labels |
| `Toast` | success · error · warning · info | Confirmations formulaires |
| `Modal` | — | Focus trap obligatoire |
| `Skeleton Screen` | — | Loading states |
| `Typing Indicator` | — | Widget Loïc |

### Règles inter-composants

| Règle | Détail |
|-------|--------|
| Z-index scale | Base:1 · Sticky:100 · Dropdown:200 · Modal:300 · Toast:400 · Widget Loïc:1000 |
| Espacement sections | 96px desktop · 64px mobile |
| Gap cartes | 24px desktop · 16px mobile |
| Container | max-width:1280px · padding:40px desktop / 20px mobile |
| Radius | sm:6px · md:10px · lg:16px · xl:24px · full:9999px |
| Focus | `outline: 2px solid #0066FF; outline-offset: 3px` |
| Zones tactiles | Minimum 44×44px (WCAG) |

---

## 19. Dépendances entre pages

### Dépendances fonctionnelles

```
/diagnostic-ia
  ↳ DÉPEND DE : Supabase (stockage réponses) · Resend (email confirmation)
  ↳ ALIMENTE : Manager (notification lead) · /rapport-ia/[token]

/rapport-ia/[token]
  ↳ DÉPEND DE : /diagnostic-ia (soumission préalable) · Token UUID valide
  ↳ ALIMENTE : Calendly (RDV) · Manager (qualification lead)

/devis
  ↳ DÉPEND DE : Supabase (stockage devis) · Resend (email client + interne)
  ↳ ALIMENTE : Manager (nouveau devis) · Workflow email Loïc

/commande-confirmation
  ↳ DÉPEND DE : Stripe webhook (paiement confirmé) · /devis ou parcours e-commerce
  ↳ ALIMENTE : Manager (commande) · Email confirmation client

Widget Loïc
  ↳ DÉPEND DE : Déployé sur toutes les pages
  ↳ ALIMENTE : /diagnostic-ia (redirection principale)
```

### Dépendances SEO (maillage obligatoire)

```
Pages SEO locales → Page pilier parente (lien "Retour au service")
Pages piliers → Pages SEO locales (section "Nous intervenons à...")
Articles blog → Pages services concernés (lien contextuel)
Pages services → Articles blog associés (section "Nos guides")
Portfolio fiches → Services associés (lien contextuel)
```

### Dépendances de contenu

```
/nos-realisations/[slug]
  ↳ NÉCESSITE : Projet existant dans Supabase (table portfolio)
  ↳ NÉCESSITE : Témoignage client validé

/blog/[slug]
  ↳ NÉCESSITE : Article publié dans CMS (à définir)
  ↳ NÉCESSITE : Image hero 1200×630 (WebP)

/rapport-ia/[token]
  ↳ NÉCESSITE : Template rapport HTML
  ↳ NÉCESSITE : Loïc / Équipe pour analyse
```

### Dépendances design system

```
Toutes les pages
  ↳ Font : Inter (Google Fonts, preloaded)
  ↳ Icônes : Lucide Icons (CDN ou bundle)
  ↳ Tokens CSS : design-system.css (variables globales)
  ↳ Composants : components.css + components.js
```

### Matrice de risques dépendances

| Dépendance | Risque | Mitigation |
|-----------|--------|-----------|
| Supabase (BDD) | Panne → formulaires inaccessibles | Fallback email direct + toast d'erreur |
| Resend (emails) | Emails non envoyés | Log + retry + alerte interne |
| Stripe (paiements) | Webhook manqué | Idempotency key + reconciliation quotidienne |
| Calendly | Indisponible → RDV impossible | Fallback formulaire contact |
| Google Fonts (Inter) | Chargement lent | `font-display: swap` + preload |

---

## 20. Roadmap de création des pages

### Critères de priorisation

- **P0 :** Fondation — sans ces pages, pas de présence ni de conversion possible
- **P1 :** Acquisition — pages qui génèrent du trafic SEO et des leads
- **P2 :** Expansion — pages qui augmentent la portée géographique et sectorielle
- **P3 :** Optimisation — pages qui améliorent la rétention et la conversion avancée

---

### Priorité 0 — Fondation (Semaines 1–4)

Ces pages sont les prérequis absolus. Elles doivent être en production avant tout lancement.

| # | Page | Pourquoi P0 |
|---|------|-------------|
| 1 | `/` Homepage | Première impression, hub de navigation, SEO brand |
| 2 | Header + Footer | Composants globaux requis partout |
| 3 | Widget Loïc | Présent sur toutes les pages dès le lancement |
| 4 | `/loic` | Identité produit centrale, point d'entrée Loïc |
| 5 | `/diagnostic-ia` | Conversion principale — formulaire fonctionnel |
| 6 | `/devis` | Conversion secondaire — formulaire fonctionnel |
| 7 | `/contact` | Canal de secours obligatoire |
| 8 | `/mentions-legales` | Obligation légale |
| 9 | `/politique-confidentialite` | RGPD obligatoire |
| 10 | `/cgv` | Obligation commerciale |

**Livrables P0 :**
- Design system (tokens CSS, composants atomes)
- Header sticky + méga-menu
- Footer complet
- Widget Loïc V1 opérationnel
- Formulaires connectés Supabase + Resend

---

### Priorité 1 — Acquisition organique (Semaines 5–10)

Pages qui génèrent du trafic SEO et positionnent CA-TECH sur ses 4 piliers.

| # | Page | Mots-clés cibles | KPI |
|---|------|-----------------|-----|
| 11 | `/intelligence-artificielle` | "consultant IA entreprise" | Leads IA |
| 12 | `/automatisation` | "automatisation processus PME" | Leads Auto |
| 13 | `/seo` | "agence SEO" | Leads SEO |
| 14 | `/developpement-web` | "création site web sur mesure" | Leads Dev |
| 15 | `/nos-realisations` | "réalisations web IA" | Preuve sociale |
| 16 | `/nos-realisations/[slug]` (×3 projets) | — | Crédibilité |
| 17 | `/a-propos` | "cabinet conseil IA France" | Confiance |
| 18 | `/conseil-ia-paris` | "consultant IA Paris" | Leads local |
| 19 | `/automatisation-paris` | "automatisation Paris" | Leads local |
| 20 | `/agence-seo-paris` | "agence SEO Paris" | Leads local |
| 21 | `/creation-site-paris` | "création site Paris" | Leads local |
| 22 | `/blog` | — | Hub SEO |
| 23 | `/blog/[article-1]` (IA PME) | "IA pour PME" | TOFU |
| 24 | `/blog/[article-2]` (Auto) | "automatiser entreprise" | TOFU |
| 25 | `/blog/[article-3]` (SEO) | "améliorer référencement" | TOFU |

**Livrables P1 :**
- Pages services piliers (×4) finalisées avec FAQ + Schema.org
- 4 pages SEO locales Paris (vague 1)
- Blog opérationnel (3 articles initiaux)
- Portfolio (3 fiches projets)
- Schema.org sur toutes les pages P0 + P1

---

### Priorité 2 — Expansion et profondeur (Semaines 11–20)

Extension géographique, sous-services, et alimentation continue du blog.

| # | Bloc | Pages |
|---|------|-------|
| A | SEO local Lyon | `/conseil-ia-lyon` · `/automatisation-lyon` · `/agence-seo-lyon` · `/creation-site-lyon` |
| B | SEO local Dijon | `/conseil-ia-dijon` · `/automatisation-dijon` · `/agence-seo-dijon` · `/creation-site-dijon` |
| C | SEO local Troyes | `/conseil-ia-troyes` · `/automatisation-troyes` · `/agence-seo-troyes` · `/creation-site-troyes` |
| D | Sous-services Dev | `/creation-site-vitrine` · `/creation-site-ecommerce` · `/creation-landing-page` · `/developpement-sur-mesure` |
| E | Design & Identité | `/design-identite` · `/creation-logo` · `/identite-visuelle` · `/creation-flyer` |
| F | Portfolio élargi | `/nos-realisations/[slug]` (×5 projets supplémentaires) |
| G | Blog continu | 2 articles/mois (mois 3–5) |
| H | Rapport IA | `/rapport-ia/[token]` (template + logique) |

**Livrables P2 :**
- 12 pages SEO locales supplémentaires (Lyon, Dijon, Troyes)
- 4 sous-services Développement Web
- 3 sous-services Design & Identité
- Template rapport IA personnalisé
- 6–8 articles blog supplémentaires

---

### Priorité 3 — Optimisation et scale (Mois 6–12)

Extension à 10 villes, amélioration continue, features avancées.

| # | Bloc | Pages / Features |
|---|------|-----------------|
| A | SEO local ×6 villes | Marseille · Bordeaux · Nantes · Strasbourg · Toulouse · Lille (×4 services = 24 pages) |
| B | Blog scale | 4–6 articles/mois · Cas clients |
| C | Portfolio scale | `/nos-realisations/[slug]` (×10 projets total) |
| D | Loïc V2 | Widget Loïc amélioré (IA conversationnelle) |
| E | `/commande-confirmation` | Post-achat e-commerce et devis en ligne |
| F | Pages campagnes | Landing pages Ads (non-indexées) |
| G | Espace client | Accès Manager depuis site public |
| H | Multilingue | EN (si expansion internationale décidée) |

**Livrables P3 :**
- 24 pages SEO locales (6 nouvelles villes × 4 services)
- Loïc V2 déployé
- Blog ≥ 20 articles publiés
- Portfolio ≥ 10 projets
- Core Web Vitals ≥ 90 sur toutes les pages

---

### Tableau de bord Roadmap

```
PHASE        SEMAINES    PAGES CRÉÉES    PAGES CUMULÉES    FOCUS
──────────────────────────────────────────────────────────────────
P0 Fondation    1–4         10               10            Stack + Core
P1 Acquisition  5–10        15               25            SEO + Leads
P2 Expansion   11–20        25               50            Géo + Services
P3 Scale        6–12 mois   40+              90+           Autorité + Scale
```

### KPIs de validation par phase

| Phase | KPI | Cible |
|-------|-----|-------|
| P0 | Site en production, formulaires fonctionnels | Semaine 4 |
| P0 | Lighthouse ≥ 90 perf, 100 SEO | Semaine 4 |
| P1 | 3 pages en top 10 Google (mots-clés ciblés) | Mois 3 |
| P1 | 30 leads/mois via diagnostic | Mois 3 |
| P2 | 20 pages SEO locales indexées | Mois 5 |
| P2 | 10 articles blog publiés | Mois 5 |
| P3 | 50 leads/mois | Mois 9 |
| P3 | 5 clients signés/mois | Mois 12 |

---

*Document généré le 2026-07-03 · Architecte Web Senior CA-TECH*  
*Sources : STRATEGY.md · UX_UI_SPECIFICATION.md · HOMEPAGE_SPECIFICATION.md · COMPONENT_GUIDELINES.md · BRAND_GUIDELINES.md · UX_UI_QUICKREF.md*
