# Homepage — Cahier des charges détaillé
## CA-TECH · Page d'accueil · Version 2.0 · Juillet 2026

> Document de référence pour l'implémentation de la Homepage CA-TECH.
> Un développeur doit pouvoir créer cette page sans autre documentation.
> Aucune implémentation avant validation de ce document.
>
> Sources : `STRATEGY.md` · `UX_UI_SPECIFICATION.md` · `BRAND_GUIDELINES.md` · `COMPONENT_GUIDELINES.md`

---

## Table des matières

**Partie 1 (ce document)**
1. [Objectifs de la Homepage](#1-objectifs-de-la-homepage)
2. [Header](#2-header)
3. [Hero](#3-hero)
4. [Chiffres clés — Proof Bar](#4-chiffres-clés--proof-bar)
5. [Pourquoi choisir CA-TECH](#5-pourquoi-choisir-ca-tech)
6. [Nos Expertises](#6-nos-expertises)

**Partie 2 (document suivant)**
7. Démonstration de Loïc
8. Comment nous travaillons
9. Cas clients
10. Témoignages
11. Tarifs
12. FAQ
13. CTA Final
14. Footer
15. Règles transversales

---

## 1. Objectifs de la Homepage

### 1.1 Objectif business

La Homepage est la page de conversion principale de CA-TECH. Elle doit :

- Installer immédiatement le positionnement **cabinet de conseil IA-first** (pas une agence web)
- Convaincre un dirigeant de PME sceptique que l'IA est applicable à son activité **aujourd'hui**
- Générer des **Diagnostics IA** (CTA primaire) et des **demandes de devis** (CTA secondaire)
- Présenter Loïc comme le premier point d'entrée vers une relation commerciale
- Créer suffisamment de confiance pour qu'un visiteur froid accepte d'engager une conversation

**Cibles prioritaires :**

| Profil | Ce qu'il cherche | Ce qu'on lui montre |
|--------|-----------------|---------------------|
| Dirigeant PME 10-50 salariés | Preuve que l'IA fonctionne dans mon secteur | Cas clients + chiffres concrets |
| Fondateur startup | Partenaire technique fiable et rapide | Stack, délais, processus |
| Responsable marketing | Résultats SEO et leads mesurables | Stats + témoignages |
| DSI / Directeur technique | Sérieux, sécurité, architecture | Expertise tech + références |

### 1.2 Objectif SEO

**Mot-clé principal** : `cabinet conseil IA` · `conseil intelligence artificielle entreprise`

**Mots-clés secondaires ciblés sur la homepage** :
- `automatisation processus entreprise`
- `consultant IA PME`
- `agence SEO IA`
- `développement web sur mesure`
- `Loïc consultant IA`

**Objectifs SEO mesurables :**
- Position 1-3 sur `cabinet conseil IA` dans les 6 mois
- Position 1-5 sur `consultant IA PME France`
- Featured snippet sur "qu'est-ce qu'un consultant IA"
- Indexation complète en < 48h après mise en ligne
- Core Web Vitals : LCP < 2.5s · CLS < 0.1 · INP < 200ms

**Balises SEO de la page :**

```
<title>CA-TECH — Cabinet de Conseil IA · Automatisation · SEO · Dev Web</title>
<meta name="description" content="CA-TECH est le cabinet de conseil IA-first qui déploie l'Intelligence Artificielle, l'Automatisation et le SEO pour faire croître votre entreprise. Diagnostic gratuit en 10 minutes.">
<link rel="canonical" href="https://ca-tech.fr/">
```

**Open Graph :**
```html
<meta property="og:title" content="CA-TECH — L'IA au service de votre croissance">
<meta property="og:description" content="Cabinet de conseil spécialisé en IA, Automatisation, SEO et Dev Web. Diagnostic gratuit.">
<meta property="og:image" content="https://ca-tech.fr/og-homepage.jpg">
<meta property="og:url" content="https://ca-tech.fr/">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
```

**Schema.org — deux blocs JSON-LD :**

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "CA-TECH",
  "url": "https://ca-tech.fr",
  "logo": "https://ca-tech.fr/logo.svg",
  "description": "Cabinet de conseil IA-first spécialisé en Intelligence Artificielle, Automatisation, SEO et Développement Web.",
  "slogan": "L'Intelligence Artificielle au service de votre croissance.",
  "foundingDate": "2023",
  "areaServed": "FR",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "email": "contact@ca-tech.fr",
    "availableLanguage": "French"
  },
  "sameAs": [
    "https://www.linkedin.com/company/ca-tech"
  ]
}
```

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "CA-TECH",
  "url": "https://ca-tech.fr",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://ca-tech.fr/recherche?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

### 1.3 Objectif conversion

**Tunnel principal :**
```
Homepage → Diagnostic IA gratuit → Rapport personnalisé → Appel de qualification → Proposition commerciale
```

**Tunnel secondaire :**
```
Homepage → Widget Loïc → Qualification conversationnelle → Devis → Projet
```

**Taux de conversion cibles (à 3 mois) :**

| Événement | Taux cible |
|-----------|-----------|
| Taux de rebond global | < 45% |
| Scroll jusqu'à section Expertises | > 60% |
| Clic sur CTA Diagnostic IA | > 4% des sessions |
| Ouverture widget Loïc | > 8% des sessions |
| Scroll jusqu'au footer | > 25% |
| Temps moyen sur page | > 2min 30s |

### 1.4 KPI principaux (GA4)

| KPI | Mesure | Fréquence de suivi |
|-----|--------|-------------------|
| Sessions homepage | GA4 · Nombre de sessions | Hebdomadaire |
| Taux d'engagement | GA4 · Engaged sessions / sessions | Hebdomadaire |
| Clics CTA Diagnostic IA | GA4 · `cta_click` event | Quotidien |
| Ouvertures widget Loïc | GA4 · `loic_open` event | Quotidien |
| Scroll depth | GA4 · `scroll` à 25/50/75/90% | Hebdomadaire |
| Source de trafic | GA4 · Acquisition report | Hebdomadaire |

---

## 2. Header

### 2.1 Objectif

Permettre la navigation dans tout le site depuis n'importe quelle page. Créer la première impression de marque premium. Convertir immédiatement les visiteurs prêts à agir via le CTA visible en permanence.

### 2.2 Structure HTML

```html
<header role="banner">
  <a href="#main-content" class="skip-link">Aller au contenu principal</a>
  <nav role="navigation" aria-label="Navigation principale">
    [Logo] | [Liens nav] | [CTA]
  </nav>
</header>
```

Le header est **sticky** (reste en haut au scroll). Hauteur : `72px` desktop · `60px` mobile.

### 2.3 États visuels selon le scroll

| État | Déclencheur | Fond | Texte | Ombre |
|------|------------|------|-------|-------|
| Initial (sur hero gradient) | Position Y = 0 | `transparent` | `rgba(255,255,255,0.90)` | aucune |
| Scrollé | Position Y > 60px | `rgba(255,255,255,0.92)` + `backdrop-filter: blur(12px)` | `--color-gray-700` | `0 1px 0 rgba(0,0,0,0.08)` |

Transition : `background 200ms ease-in-out · backdrop-filter 200ms · box-shadow 200ms`.

Sur les **pages internes** (fond blanc dès le haut) : état "scrollé" appliqué par défaut dès le chargement.

### 2.4 Navigation desktop

**Liens :**
```
[Logo CA-TECH]    Services ▾    Loïc    Réalisations    Blog    [Diagnostic IA →]
```

- Logo : aligné gauche · `max-width: 130px` · lien vers `/`
- Liens : Inter `16px` · weight `500` · `gap: 32px`
- CTA "Diagnostic IA →" : `Button primary md` · toujours visible · libellé fixe

**Dropdown "Services" (au hover ET au focus) :**

```
┌──────────────────────────────────────────────────────────┐
│  🤖  Intelligence Artificielle    ⚡  Automatisation      │
│      Agents IA, copilotes, RAG        Workflows, scripts │
│                                                          │
│  📈  SEO                          💻  Dev Web             │
│      Audits, contenus, local          Sites, apps métier │
│                                                          │
│  🎨  Design & Identité                                    │
│      Logos, chartes graphiques, flyers                   │
└──────────────────────────────────────────────────────────┘
```

- Largeur dropdown : `520px`
- `border-radius: --radius-lg` · `--shadow-lg` · fond `#FFFFFF`
- Chaque item : icône `20px` + titre `--text-base` weight `600` + description `--text-sm` `--color-gray-500`
- Hover item : fond `--color-gray-50` · `--radius-md`
- Animation ouverture : `opacity 0→1` + `translateY(-6px→0)` en `200ms --ease-out`
- Fermeture : mouse leave · `Escape`

**Comportement des liens :**
- Hover : `--color-gray-900` + underline `2px solid --color-primary` slide gauche→droite en `200ms`
- Page active : `--color-primary` + underline fixe
- Focus : `outline: 2px solid --color-primary; outline-offset: 3px`

### 2.5 Navigation mobile

Bouton hamburger `44×44px` · icône `Menu` Lucide `24px`.

**Drawer mobile :**
- Largeur : `min(340px, 85vw)`
- Fond : `#FFFFFF`
- Animation : `translateX(100%→0)` en `300ms --ease-out`
- Overlay : `rgba(0,0,0,0.40)` · `opacity 0→1`
- Focus trap actif dès ouverture
- Fermeture : bouton `×` · clic overlay · swipe droit · `Escape`

**Contenu drawer (ordre) :**
```
[Logo CA-TECH]                    [× Fermer]
──────────────────────────────────────────────
Intelligence Artificielle         →
Automatisation                    →
SEO                               →
Développement Web                 →
Design & Identité                 →
──────────────────────────────────────────────
Loïc                              →
Réalisations                      →
Blog                              →
À propos                          →
──────────────────────────────────────────────
[Lancer mon Diagnostic IA →]   Button primary lg · pleine largeur
```

Hauteur minimale chaque lien : `52px` · padding `0 24px` · `--text-lg` weight `500`.

### 2.6 Accessibilité header

```html
<header role="banner">
  <a href="#main-content" class="skip-link">Aller au contenu principal</a>
  <nav aria-label="Navigation principale">
    <a href="/" aria-label="CA-TECH — Retour à l'accueil">
      <img src="/logo.svg" alt="CA-TECH" width="130" height="36">
    </a>
    <button aria-haspopup="true" aria-expanded="false" aria-controls="dropdown-services">
      Services <span aria-hidden="true">▾</span>
    </button>
    <div id="dropdown-services" role="menu" hidden>
      <a role="menuitem" href="/intelligence-artificielle">Intelligence Artificielle</a>
    </div>
    <button aria-label="Ouvrir le menu de navigation"
            aria-expanded="false"
            aria-controls="mobile-drawer">
      <!-- icône hamburger -->
    </button>
    <nav id="mobile-drawer" aria-label="Menu mobile" hidden>
      <!-- drawer content -->
    </nav>
  </nav>
</header>
```

**Skip link :**
- Premier élément du `<body>`
- Visuellement masqué · visible au focus clavier
- Fond `--color-primary` · texte blanc · `padding: 12px 24px` · `--radius-md`
- `href="#main-content"` → cible `<main id="main-content">`

### 2.7 Performance header

- Logo SVG avec `width` + `height` définis (évite CLS)
- Backdrop-filter déclenché uniquement via classe JS (évite perf hit au premier rendu)
- Dropdown : rendu dans le DOM dès le chargement (SEO des liens)

### 2.8 Analytics GA4 — Header

| Événement | Déclencheur | Paramètres |
|-----------|------------|-----------|
| `nav_click` | Clic lien nav | `{link_text, link_url, position: "header"}` |
| `nav_dropdown_open` | Survol/focus "Services" | `{element: "services_dropdown"}` |
| `nav_dropdown_click` | Clic item dropdown | `{service_name, link_url}` |
| `nav_mobile_open` | Clic hamburger | `{device: "mobile"}` |
| `cta_click` | Clic "Diagnostic IA" header | `{cta_text: "Diagnostic IA", cta_location: "header"}` |

---

## 3. Hero

### 3.1 Objectif

Communiquer la promesse de CA-TECH en moins de 3 secondes. Déclencher l'action immédiate ou la curiosité. C'est la section la plus importante de la page — chaque mot est pesé.

**Objectif business** : capter l'attention, qualifier le visiteur, déclencher le CTA primaire ou le scroll.

**Objectif SEO** : H1 contenant le mot-clé principal · première zone indexée.

### 3.2 Hiérarchie du contenu hero

```
[PILL BADGE]
[H1 — Titre principal]
[Sous-titre explicatif]
[Groupe CTA]
[Micro-copy de réassurance]
                                    [Illustration Loïc — droite]
```

### 3.3 H1 officiel

```
L'Intelligence Artificielle
au service de votre croissance.
```

- Police : Inter · weight `800` · `72px` desktop / `48px` tablette / `42px` mobile
- `letter-spacing: -0.03em`
- `line-height: 1.0`
- Couleur : `#FFFFFF`
- Le point final est **obligatoire**
- Retour à la ligne contrôlé via `<br>` après "Artificielle" sur desktop

### 3.4 Pill badge

```
✦ Cabinet de conseil IA-first
```

- Style : `pill-dark`
- Icône `Sparkles` Lucide `14px` ou `✦`
- `--text-sm` · weight `600` · uppercase · `letter-spacing: 0.06em`
- `margin-bottom: 24px` avant le H1

### 3.5 Sous-titre

```
CA-TECH déploie des agents IA, des automatisations sur mesure
et des stratégies SEO pour transformer votre activité en résultats mesurables.
```

- Inter · weight `400` · `20px` desktop / `16px` mobile
- `rgba(255,255,255,0.80)`
- `line-height: 1.6` · `max-width: 520px` · `margin-top: 20px`

**Variantes selon source de trafic :**

| Source UTM | Sous-titre affiché |
|-----------|-------------------|
| `utm_source=linkedin` | « Vos concurrents déploient déjà l'IA. Voici comment garder l'avance. » |
| `utm_source=google` | « De l'audit à l'agent IA opérationnel — en 4 semaines. » |
| Retour visiteur (cookie) | « Bon retour. Loïc a analysé votre secteur depuis votre dernière visite. » |
| Défaut | Texte standard ci-dessus |

### 3.6 Groupe CTA

```
[Lancer mon Diagnostic IA →]      [Voir nos réalisations]
       Gratuit · Sans engagement · Résultat en 10 minutes
```

**CTA primaire :**
- Libellé : `Lancer mon Diagnostic IA →`
- Style : `Button white xl`
- Lien : `/diagnostic-ia`
- `aria-label="Lancer mon diagnostic IA gratuit"`

**CTA secondaire :**
- Libellé : `Voir nos réalisations`
- Style : `Button ghost-white xl`
- Lien : `/nos-realisations`

**Micro-copy :**
- `Gratuit · Sans engagement · Résultat en 10 minutes`
- `--text-sm` · `rgba(255,255,255,0.60)` · centré

### 3.7 Visuel — Illustration Loïc (device frame)

Côté droit du hero (desktop uniquement) : interface de chat simulée.

**Dimensions** : `480px × 380px` desktop · masqué sur mobile · réduit centré sur tablette.

```
┌─────────────────────────────────────────┐
│ ● ● ●                          [⋯]    │  barre chrome · rgba(255,255,255,0.08)
│ 🔵 Loïc — Consultant IA                │
├─────────────────────────────────────────┤
│                                         │
│  Bonjour ! Je suis Loïc.              │  bulle Loïc · fond rgba(255,255,255,0.12)
│  En quoi puis-je vous aider ?          │
│                                         │
│       Combien de leads perdez-vous     │  bulle utilisateur · fond --color-primary
│       chaque semaine faute de suivi ?  │
│                                         │
│  [● ● ●]  Loïc rédige...              │  typing indicator
│                                         │
│  [Votre message...]              [→]  │
└─────────────────────────────────────────┘
```

**Styles device frame :**
- Fond : `rgba(255,255,255,0.08)`
- Bordure : `1px solid rgba(255,255,255,0.15)`
- `border-radius: --radius-xl` · `backdrop-filter: blur(8px)`
- Ombre : `0 24px 64px rgba(0,0,0,0.30)`

### 3.8 Fond du Hero

```css
background:
  radial-gradient(ellipse 80% 60% at 25% 50%, rgba(0,102,255,0.30) 0%, transparent 70%),
  linear-gradient(135deg, #0066FF 0%, #0A2540 100%);
```

- `min-height: 100vh` desktop · `min-height: 85vh` mobile
- Padding : `160px 0 120px` desktop / `120px 0 80px` mobile

### 3.9 Animation — Séquence Hero

**Entrée des éléments texte** (DOMContentLoaded) :

| Élément | Délai | Animation |
|---------|-------|-----------|
| Pill badge | `0ms` | `opacity 0→1` + `translateY(12px→0)` · `400ms` |
| H1 | `100ms` | `opacity 0→1` + `translateY(16px→0)` · `500ms` |
| Sous-titre | `250ms` | `opacity 0→1` + `translateY(12px→0)` · `400ms` |
| Groupe CTA | `400ms` | `opacity 0→1` + `translateY(8px→0)` · `400ms` |
| Micro-copy | `500ms` | `opacity 0→1` · `300ms` |
| Device frame | `600ms` | `opacity 0→1` + `scale(0.96→1)` · `500ms` |

**Séquence démo chat Loïc** (démarre à `800ms` après load) :

| Temps | Événement |
|-------|-----------|
| `800ms` | Typing indicator Loïc apparaît |
| `1800ms` | Message Loïc 1 : « Bonjour ! Je suis Loïc, consultant IA chez CA-TECH. » |
| `2600ms` | Typing indicator Loïc 2 |
| `3800ms` | Message Loïc 2 : « Combien d'heures votre équipe perd-elle sur des tâches répétitives ? » |
| `5000ms` | Bulle utilisateur (tapée lettre à lettre) : « Environ 10 heures… » |
| `6500ms` | Typing indicator Loïc 3 |
| `8000ms` | Message Loïc 3 : « En moyenne, nos clients récupèrent 8h/semaine dès le premier mois. » |
| `10000ms` | Bouton d'action dans le chat : « Lancer mon diagnostic → » |
| `14000ms` | Reset → replay |

**Bulles** : `scale(0.8→1)` + `opacity 0→1` · `250ms --ease-spring` · origine bas-gauche (Loïc) ou bas-droite (user).

**prefers-reduced-motion** : état final statique, zéro animation, zéro replay.

### 3.10 Responsive Hero

**Desktop ≥ 1024px**
```
CSS Grid : grid-template-columns: 55fr 45fr · gap: 64px · align-items: center
```

**Tablette 768–1023px**
```
Stack vertical · text-align: center · device frame 360px centré
CTAs pleine largeur
```

**Mobile < 768px**
```
Stack vertical · device frame masqué
H1 42px · sous-titre 16px · CTAs pleine largeur
```

### 3.11 Accessibilité Hero

- Un seul `<h1>` sur toute la page
- Contraste blanc sur gradient : ≥ 4.5:1 ✓
- Device frame : `aria-hidden="true"` (illustratif non interactif)
- CTA primaire : `aria-label` complet
- Séquence chat : non-annoncée aux lecteurs d'écran (contenu décoratif)

### 3.12 Performance Hero

- Fond CSS pur (zéro image réseau)
- Police Inter préchargée
- Aucun script bloquant avant premier rendu
- Device frame : HTML/CSS pur · `width`/`height` définis
- Animations JS : `requestAnimationFrame`

### 3.13 Analytics GA4 — Hero

| Événement | Déclencheur | Paramètres |
|-----------|------------|-----------|
| `hero_cta_click` | Clic CTA primaire | `{cta_text: "Lancer mon Diagnostic IA", cta_location: "hero"}` |
| `hero_secondary_cta_click` | Clic CTA secondaire | `{cta_text: "Voir nos réalisations", cta_location: "hero"}` |
| `hero_demo_completed` | Fin de la démo chat | `{demo_name: "loic_chat"}` |
| `hero_demo_cta_click` | Clic bouton dans démo | `{cta_location: "hero_demo"}` |

---

## 4. Chiffres clés — Proof Bar

### 4.1 Objectif

**Business** : briser le scepticisme immédiatement après le hero. Le visiteur cherche une preuve — on la donne avant qu'il en doute.

**Psychologique** : preuve sociale par les chiffres, ancrage de la valeur, effet de légitimité.

**SEO** : contenu textuel indexable, renforcement des mots-clés de performance.

### 4.2 Fond et continuité visuelle

- Fond : `--color-primary-dark` `#0A2540`
- Continuation visuelle directe du hero (même fond) → **pas de rupture**
- Séparateur haut : `1px solid rgba(255,255,255,0.08)`
- Padding : `40px 0`

### 4.3 Contenu des 4 stats

| # | Valeur | Label ligne 1 | Label ligne 2 |
|---|--------|--------------|--------------|
| 1 | `+240%` | de leads qualifiés | générés en moyenne |
| 2 | `72h` | pour un premier | agent IA livrable |
| 3 | `+50` | entreprises | accompagnées |
| 4 | `97` | score Lighthouse | en performance |

**Hiérarchie par stat :**
```
+240%                   ← --text-5xl · weight 800 · #FFFFFF
de leads qualifiés      ← --text-sm · rgba(255,255,255,0.70)
générés en moyenne      ← --text-sm · rgba(255,255,255,0.70)
```

**Séparateurs** entre stats : `1px solid rgba(255,255,255,0.12)` · hauteur `48px` · centré verticalement.

### 4.4 Animation countUp

- Déclencheur : `IntersectionObserver` · seuil `0.30`
- Valeur finale dans le DOM au chargement (SEO + a11y)
- countUp : animation par-dessus (progressive enhancement)
- Durée : `1200ms` · `ease-out`
- Symboles (`+`, `%`, `h`) : affichés dès le départ
- `prefers-reduced-motion` : valeur finale directe, sans animation
- Stagger d'entrée : `fadeUp` · `+80ms` par stat

### 4.5 Responsive

**Desktop** : 4 colonnes horizontales · `max-width: 1200px` · séparateurs verticaux

**Tablette** : grille `2×2` · `gap: 32px` · séparateurs disparaissent

**Mobile** : grille `2×2` · `gap: 24px` · valeur réduite à `--text-4xl`

### 4.6 Accessibilité

```html
<section aria-label="Chiffres clés CA-TECH">
  <dl>
    <div>
      <dd aria-label="+240 pourcent de leads qualifiés générés en moyenne">
        <span aria-hidden="true">+240%</span>
      </dd>
      <dt>de leads qualifiés générés en moyenne</dt>
    </div>
  </dl>
</section>
```

### 4.7 Analytics GA4

| Événement | Déclencheur | Paramètres |
|-----------|------------|-----------|
| `stats_viewed` | Section visible > 50% | `{section: "proof_bar"}` |

---

## 5. Pourquoi choisir CA-TECH

### 5.1 Objectif

**Business** : répondre à la question silencieuse "Pourquoi eux ?". Différencier CA-TECH des agences web génériques.

**SEO** : contenu riche en mots-clés de différenciation · paragraphes indexables.

**Psychologique** : confiance par preuves concrètes, pas promesses génériques.

### 5.2 Structure

```
[Section Header]
  Pill      : "NOTRE DIFFÉRENCE"
  H2        : "Pourquoi les dirigeants choisissent CA-TECH"
  Accroche  : "Pas une agence de plus. Un cabinet qui mesure chaque euro investi."

[Grille 2×2 — 4 cartes différenciatrices]

[Bloc 4 réassurances]
```

### 5.3 Les 4 cartes différenciatrices

**Card 1 — Résultats mesurables**
```
Icône  : BarChart2 (Lucide) · 32px · --color-primary
Titre  : "Chaque mission se mesure"
Texte  : "Aucun rapport vague. Chaque projet démarre avec des KPI définis et se termine avec
          une preuve de ROI. +240% de leads en moyenne sur nos missions IA."
Preuve : "Étude de cas : Agent IA SAV → +180% satisfaction client"
Lien   : → Voir nos cas clients  (/nos-realisations)
```

**Card 2 — Rapidité d'exécution**
```
Icône  : Zap · 32px · --color-primary
Titre  : "72h pour un premier livrable"
Texte  : "Nous livrons un premier résultat concret en 72 heures. Pas de phase de cadrage
          de 3 mois. L'action d'abord, l'optimisation ensuite."
Preuve : "50 projets livrés. Délai moyen d'activation : 72h"
Lien   : → Comment nous travaillons (#processus)
```

**Card 3 — IA opérationnelle**
```
Icône  : Bot · 32px · --color-primary
Titre  : "L'IA qui travaille vraiment"
Texte  : "Nous ne faisons pas de présentations PowerPoint sur l'IA. Nous déployons des
          agents qui travaillent dans votre SI, dès la semaine 1."
Preuve : "Loïc, notre consultant IA, qualifie vos projets en temps réel"
Lien   : → Découvrir Loïc (/loic)
```

**Card 4 — Accompagnement humain**
```
Icône  : Users · 32px · --color-primary
Titre  : "Un interlocuteur unique"
Texte  : "Pas de rotation d'équipe. Votre consultant CA-TECH connaît votre dossier
          de A à Z et répond en moins de 24h."
Preuve : "NPS moyen de nos clients : 74 (best-in-class B2B)"
Lien   : → Voir les témoignages (#temoignages)
```

### 5.4 Styles des cartes

- Variante : `Card default`
- Fond : `--color-white` · Bordure : `1px solid --color-gray-200`
- `--radius-lg` · `padding: 32px`
- Hover : `translateY(-4px)` + `--shadow-md` · `250ms --ease-out`
- Lien bas : `--color-primary` · `ArrowRight` Lucide `16px` · `translateX(4px)` au hover

### 5.5 Bloc de réassurance (sous les cartes)

```
✓ Devis gratuit et sans engagement     ✓ Réponse sous 24h
✓ Résultats mesurables garantis        ✓ Pas de contrat long terme
```

- Icône `Check` Lucide · `--color-success` · `16px`
- Texte : `--text-sm` · `--color-gray-600`
- Layout : `2×2` desktop · `1 colonne` mobile

### 5.6 Fond de section

`--color-gray-50` · contraste avec le blanc des sections adjacentes.

### 5.7 Responsive

**Desktop** : `grid 2×2` · `gap: 24px`
**Tablette** : `grid 2×2` · `gap: 16px`
**Mobile** : `1 colonne` · cards pleine largeur

### 5.8 Accessibilité

```html
<section aria-labelledby="why-ca-tech-title">
  <h2 id="why-ca-tech-title">Pourquoi les dirigeants choisissent CA-TECH</h2>
  <ul role="list">
    <li><article><!-- card --></article></li>
  </ul>
</section>
```

Icônes : `aria-hidden="true"`.

### 5.9 Animations

- Section header : `fadeUp` à l'entrée viewport
- Cards : stagger `fadeUp` · `+100ms` par carte

### 5.10 Analytics GA4

| Événement | Déclencheur | Paramètres |
|-----------|------------|-----------|
| `section_viewed` | Section visible > 30% | `{section: "why_ca_tech"}` |
| `card_click` | Clic lien carte | `{card_title, link_url}` |

---

## 6. Nos Expertises

### 6.1 Objectif

**Business** : présenter les 4 pôles dans l'ordre stratégique · déclencher les clics vers les pages services.

**SEO** : 4 liens internes vers les pages services · mots-clés de chaque service dans les titres et textes.

**Hiérarchie imposée :**
```
1. Intelligence Artificielle   (cœur de métier)
2. Automatisation              (levier immédiat)
3. SEO                         (acquisition long terme)
4. Développement Web           (moyen d'implémentation)
```
Ne jamais inverser cet ordre.

### 6.2 Structure

```
[Section Header]
  Pill     : "NOS EXPERTISES"
  H2       : "Quatre leviers pour votre croissance"
  Accroche : "De l'agent IA à la page qui convertit — CA-TECH maîtrise toute la chaîne."

[Grille 4 cartes]

[Lien global : → Voir toutes nos expertises]
```

### 6.3 Card — Intelligence Artificielle

```
Icône  : Bot (Lucide) · 32px · --color-primary
Badge  : [pill-primary "N°1 — Cœur de métier"]
Titre  : "Intelligence Artificielle"
Texte  : "Agents IA métier, copilotes, assistants RAG, automatisation cognitive.
          Nous déployons l'IA là où elle génère un retour mesurable dès les premières semaines."
KPIs   :
  → Agents déployés : 12+
  → Gain moyen : +180% productivité équipes
  → Délai premier livrable : 72h
CTA    : Découvrir l'offre IA →
Lien   : /intelligence-artificielle
Fond   : légère teinte --color-primary-light (card premium de la grille)
```

### 6.4 Card — Automatisation

```
Icône  : Zap (Lucide) · 32px · --color-primary
Titre  : "Automatisation"
Texte  : "Workflows N8N, Zapier, scripts Python. Vos processus répétitifs tournent seuls
          pendant que votre équipe se concentre sur ce qui compte vraiment."
KPIs   :
  → Processus automatisés : 80+
  → Temps récupéré : -14h/semaine en moyenne
  → ROI moyen : ×4 en 3 mois
CTA    : Automatiser mes processus →
Lien   : /automatisation
```

### 6.5 Card — SEO

```
Icône  : TrendingUp (Lucide) · 32px · --color-primary
Titre  : "SEO"
Texte  : "Audits techniques, piliers de contenu, SEO local et national. Vous êtes trouvé
          avant vos concurrents sur les requêtes qui convertissent."
KPIs   :
  → Trafic moyen ×3.4 en 6 mois
  → 100% des clients en page 1 sur leurs mots-clés cibles
  → Score technique moyen : 97/100
CTA    : Auditer mon SEO →
Lien   : /seo
```

### 6.6 Card — Développement Web

```
Icône  : Code2 (Lucide) · 32px · --color-primary
Titre  : "Développement Web"
Texte  : "Sites vitrines, e-commerce, applications métier. Chaque ligne de code sert
          un objectif business précis. Lighthouse ≥ 90, mobile-first, WCAG AA."
KPIs   :
  → Sites livrés : 30+
  → Score Lighthouse moyen : 97
  → Délai de livraison : 2 à 6 semaines
CTA    : Voir nos réalisations web →
Lien   : /developpement-web
```

### 6.7 Styles des cartes Expertises

- Variante : `Card default` avec icône en haut
- Fond : `--color-white` · Bordure : `1px solid --color-gray-200`
- `--radius-lg` · `padding: 28px`
- KPIs : liste `--text-sm` · `--color-gray-600` · puce `→` `--color-primary`
- Hover : `translateY(-4px)` + `--shadow-md` · `250ms --ease-out`
- Icône au hover : `scale(1.10)` · `150ms`
- **La card entière est un `<a>`** (unique lien → pas de liens imbriqués)

### 6.8 Liens internes (SEO-critiques)

| Card | URL | Anchor text |
|------|-----|-------------|
| IA | `/intelligence-artificielle` | "Découvrir l'offre IA" |
| Automatisation | `/automatisation` | "Automatiser mes processus" |
| SEO | `/seo` | "Auditer mon SEO" |
| Dev Web | `/developpement-web` | "Voir nos réalisations web" |
| Global | `/services` | "Voir toutes nos expertises" |

### 6.9 Fond de section

`--color-white` · contraste avec le `gray-50` de la section précédente.

### 6.10 Responsive

**Desktop ≥ 1024px** : `grid-template-columns: repeat(4, 1fr)` · `gap: 24px`

**Tablette 768–1023px** : `2 colonnes × 2 lignes` · `gap: 20px`

**Mobile < 768px** : `1 colonne` · `gap: 16px` · badge "N°1" masqué (trop chargé)

### 6.11 Accessibilité

```html
<section aria-labelledby="expertises-title">
  <h2 id="expertises-title">Quatre leviers pour votre croissance</h2>
  <ul role="list" aria-label="Nos expertises">
    <li>
      <a href="/intelligence-artificielle"
         aria-label="Intelligence Artificielle — Découvrir l'offre IA">
        <!-- card IA -->
      </a>
    </li>
  </ul>
  <a href="/services">Voir toutes nos expertises</a>
</section>
```

### 6.12 Animations

- Section header : `fadeUp` à l'entrée viewport
- Cards : stagger `fadeUp` · `+80ms` par card (0 / 80 / 160 / 240ms)

### 6.13 Analytics GA4

| Événement | Déclencheur | Paramètres |
|-----------|------------|-----------|
| `section_viewed` | Section visible > 30% | `{section: "expertises"}` |
| `expertise_card_click` | Clic card | `{expertise_name, link_url}` |
| `expertise_all_click` | Clic "Voir toutes" | `{cta_location: "expertises_section"}` |

---

## 7. Démonstration de Loïc

### 7.1 Objectif

**Business** : montrer Loïc en action pour lever les freins à l'engagement. Le visiteur doit comprendre en 30 secondes comment Loïc qualifie son projet et ce qu'il obtient en retour.

**SEO** : section riche en mots-clés conversationnels (`consultant IA`, `diagnostic IA`, `agent IA`). Contenu textuel indexable autour de Loïc.

**Psychologique** : la démonstration interactive crée un effet de familiarisation — le visiteur se projette dans une conversation réelle avant même d'avoir cliqué.

### 7.2 Structure de la section

```
[Section Header]
  Pill     : "LOÏC — CONSULTANT IA"
  H2       : "Rencontrez Loïc, votre consultant IA disponible 24h/7j"
  Accroche : "Loïc qualifie votre projet, analyse votre secteur et
              prépare votre diagnostic en quelques minutes."

[Layout 50/50]
[Gauche : démo chat animée]     [Droite : bénéfices + CTA]
```

### 7.3 Fond de section

```css
background: linear-gradient(135deg, #0066FF 0%, #0A2540 100%);
```

Même gradient que le hero — retour intentionnel au bleu pour créer un choc visuel et signaler que cette section est "premium" / produit phare.

Padding : `96px 0` desktop / `64px 0` mobile.

### 7.4 Côté gauche — Démo chat

**Fenêtre de chat simulée** (`480px × 460px` desktop) :

```
┌──────────────────────────────────────────────┐
│  🔵  Loïc — Consultant IA            ● En ligne│
├──────────────────────────────────────────────┤
│                                              │
│  Bonjour ! Je suis Loïc.                   │  ← bulle Loïc
│  Pour vous aider efficacement,              │
│  j'ai besoin de comprendre votre activité.  │
│                                              │
│  Quel est votre principal défi en ce moment ?│
│                                              │
│  [Générer plus de leads]                    │  ← boutons choix rapide
│  [Automatiser mes processus]                │
│  [Améliorer mon référencement]              │
│  [Autre chose]                              │
│                                              │
└──────────────────────────────────────────────┘
```

**Styles fenêtre Loïc (sur fond sombre) :**
- Fond : `rgba(255,255,255,0.08)`
- Bordure : `1px solid rgba(255,255,255,0.15)`
- `border-radius: --radius-xl`
- `backdrop-filter: blur(12px)`
- Ombre : `0 32px 80px rgba(0,0,0,0.40)`

**Bulles Loïc :**
- Fond : `rgba(255,255,255,0.12)` · texte `#FFFFFF` · `--radius-lg` (coin bas-gauche plat)

**Boutons de choix rapide :**
- Fond : `rgba(255,255,255,0.10)` · bordure `1px solid rgba(255,255,255,0.25)`
- Texte `rgba(255,255,255,0.90)` · `--text-sm` · `--radius-md`
- Hover : fond `rgba(255,255,255,0.20)` · `150ms`
- Ces boutons sont interactifs — ils ouvrent le vrai widget Loïc avec la réponse pré-remplie

### 7.5 Séquence d'animation de la démo

| Temps | Action |
|-------|--------|
| `0ms` | Fenêtre visible · zone messages vide |
| `600ms` | Typing indicator Loïc |
| `1600ms` | Message Loïc 1 : « Bonjour ! Je suis Loïc… » |
| `2400ms` | Typing indicator Loïc 2 |
| `3600ms` | Message Loïc 2 : « Quel est votre principal défi… » |
| `4400ms` | Boutons de choix apparaissent (stagger `+80ms` par bouton) |
| Hover bouton | Highlight du bouton survollé |
| Clic bouton | → Ouvre le widget Loïc avec contexte pré-rempli |

`prefers-reduced-motion` : état final statique (message + boutons visibles d'emblée).

### 7.6 Côté droit — Bénéfices + CTA

**Titre de la colonne :**
```
Ce que Loïc fait pour vous
```
`--text-2xl` · weight `700` · `#FFFFFF` · `margin-bottom: 24px`

**Liste des bénéfices :**
```
✓  Analyse votre secteur et vos concurrents
✓  Qualifie votre projet en 10 minutes
✓  Prépare un rapport personnalisé sous 24h
✓  Vous oriente vers la solution la plus rentable
✓  Disponible 7j/7, répond en quelques secondes
```

- Icône `Check` Lucide `18px` · `--color-success` `#10B981`
- Texte `--text-base` · `rgba(255,255,255,0.85)` · `line-height: 1.7`
- `gap: 12px` entre chaque item

**Badge de statut sous la liste :**
```
● Loïc est en ligne — Répond en quelques secondes
```
- Fond `rgba(16,185,129,0.15)` · bordure `1px solid rgba(16,185,129,0.30)`
- `--radius-full` · `padding: 8px 16px` · `--text-sm`
- Point `●` vert animé (pulsation `scale(1→1.4→1)` · `1500ms` · boucle infinie)

**CTA :**
```
[Démarrer avec Loïc →]         Button white lg · pleine largeur
Gratuit · Aucune inscription requise
```

**Lien secondaire sous CTA :**
```
Ou découvrir comment fonctionne Loïc →   /loic
```
`--text-sm` · `rgba(255,255,255,0.65)` · hover `rgba(255,255,255,1)`

### 7.7 Parcours utilisateur complet

```
Visiteur voit la section Loïc
  ↓
Il survole / lit les bénéfices
  ↓
Il regarde la démo animée
  ↓
Option A : Clic sur un bouton de choix rapide
  → Widget Loïc s'ouvre avec contexte pré-rempli
  → Conversation qualifiante démarre
  → Rapport personnalisé promis sous 24h
  → Lead capturé

Option B : Clic sur "Démarrer avec Loïc →"
  → Même tunnel que Option A

Option C : Clic sur "découvrir comment fonctionne Loïc"
  → Page /loic · présentation complète du produit
```

### 7.8 Intégration du widget Loïc

Quand l'utilisateur clique un bouton de choix rapide ou le CTA :
1. Le widget Loïc (coin bas-droite) s'ouvre
2. Le premier message est pré-rempli avec le choix de l'utilisateur
3. Loïc répond immédiatement avec une question de qualification contextuelle
4. Le scroll se fait automatiquement vers le bas pour révéler le widget ouvert (mobile)

```javascript
// Comportement attendu (pseudo-code, pas d'implémentation ici)
onButtonClick(choice) {
  openLoicWidget()
  prefillMessage(choice)
  triggerLoicResponse(choice)
  trackEvent('loic_demo_choice', { choice })
}
```

### 7.9 Responsive

**Desktop** : `grid 50/50` · `gap: 80px` · `align-items: center`

**Tablette** : `grid 50/50` · `gap: 40px` · fenêtre chat réduite à `360px`

**Mobile** : stack vertical · fenêtre chat en premier · bénéfices en dessous · `gap: 32px`

### 7.10 Accessibilité

- Section : `aria-labelledby="loic-demo-title"`
- Fenêtre chat démo : `aria-hidden="true"` si animation passive · `role="region"` si interactive
- Boutons de choix : `role="button"` · `aria-label` descriptif
- Badge statut : `aria-label="Loïc est en ligne"`
- CTA : `aria-label="Démarrer une conversation avec Loïc"`

### 7.11 Analytics GA4

| Événement | Déclencheur | Paramètres |
|-----------|------------|-----------|
| `loic_section_viewed` | Section visible > 40% | `{section: "loic_demo"}` |
| `loic_demo_choice` | Clic bouton choix rapide | `{choice_text, choice_index}` |
| `loic_cta_click` | Clic "Démarrer avec Loïc" | `{cta_location: "loic_section"}` |
| `loic_open` | Ouverture widget | `{trigger: "demo_section" | "cta"}` |

---

## 8. Comment nous travaillons

### 8.1 Objectif

**Business** : lever le frein principal des acheteurs B2B — la peur du processus opaque et des projets qui traînent. Montrer que CA-TECH est prévisible, cadré et rapide.

**SEO** : mots-clés de processus (`méthode de travail`, `processus IA`, `sprint`). Contenu structuré.

**Psychologique** : le visiteur doit pouvoir se projeter dans le projet avant même d'avoir signé. La clarté du processus rassure et qualifie.

### 8.2 Structure

```
[Section Header]
  Pill     : "NOTRE MÉTHODE"
  H2       : "De la première conversation au premier résultat — en 4 étapes"
  Accroche : "Un processus transparent, des livrables concrets, un calendrier tenu."

[Stepper 4 étapes — horizontal desktop / vertical mobile]

[Bloc réassurance — sous le stepper]
```

### 8.3 Fond de section

`--color-white` · contraste avec le gradient Loïc qui précède.

### 8.4 Les 4 étapes du Stepper

**Étape 1 — Diagnostic**
```
Icône    : Search (Lucide) · 28px · --color-primary
Numéro   : 01
Titre    : "Diagnostic"
Durée    : "Jour 1"
Texte    : "Loïc analyse votre activité, vos processus et vos objectifs.
            Vous recevez un rapport de diagnostic personnalisé sous 24h."
Badge    : [Gratuit]
```

**Étape 2 — Stratégie**
```
Icône    : Map (Lucide) · 28px · --color-primary
Numéro   : 02
Titre    : "Stratégie"
Durée    : "Jour 2 à 3"
Texte    : "Nous définissons ensemble les actions prioritaires, le budget,
            le calendrier et les KPI de succès de votre mission."
Badge    : [En 48h]
```

**Étape 3 — Exécution**
```
Icône    : Rocket (Lucide) · 28px · --color-primary
Numéro   : 03
Titre    : "Exécution"
Durée    : "Semaine 1 à N"
Texte    : "Notre équipe déploie, teste et affine. Vous avez accès à un
            dashboard de suivi en temps réel et un point hebdomadaire."
Badge    : [Premier livrable : 72h]
```

**Étape 4 — Résultats**
```
Icône    : BarChart2 (Lucide) · 28px · --color-primary
Numéro   : 04
Titre    : "Résultats"
Durée    : "Continu"
Texte    : "Mesure des KPI, optimisation continue, rapport de ROI mensuel.
            Nous ne disparaissons pas après la livraison."
Badge    : [ROI mesuré]
```

### 8.5 Styles du Stepper

**Cercle numéroté :**
- `56px × 56px` · `--radius-full`
- Fond : `--color-primary-light` · texte `--color-primary` · weight `800` · `--text-xl`
- Ligne de connexion entre cercles : `2px solid --color-gray-200` · positionnée au centre vertical du cercle

**Contenu sous le cercle :**
- Badge durée : `pill-primary` · `--text-xs`
- Titre : `--text-xl` · weight `700` · `--color-gray-900` · `margin-top: 12px`
- Texte : `--text-sm` · `--color-gray-600` · `line-height: 1.6` · `max-width: 200px`
- Badge action (Gratuit / En 48h…) : `pill-primary` · `margin-top: 8px`

### 8.6 Bloc de réassurance (sous le stepper)

```
┌─────────────────────────────────────────────────────────────────┐
│  🕐 Premier livrable en 72h    📊 Dashboard de suivi inclus     │
│  💬 Point hebdomadaire         📄 Rapport ROI mensuel           │
└─────────────────────────────────────────────────────────────────┘
```

Fond `--color-gray-50` · `--radius-lg` · `padding: 24px 32px` · bordure `1px solid --color-gray-200`.

**CTA sous le bloc :**
```
[Démarrer mon Diagnostic →]
```
`Button primary lg` · centré.

### 8.7 Responsive

**Desktop ≥ 1024px** : stepper horizontal · cercles reliés par ligne horizontale

**Tablette 768–1023px** : stepper horizontal · textes réduits · `--text-sm` sur descriptions

**Mobile < 768px** : stepper vertical · ligne à gauche · cercles `44px` · texte à droite

### 8.8 Animations

- Stepper : chaque étape en `fadeUp` avec stagger `+120ms`
- Ligne de connexion : `width: 0 → 100%` en `400ms` après apparition des deux cercles encadrants
- `prefers-reduced-motion` : tout visible d'emblée

### 8.9 Accessibilité

```html
<section aria-labelledby="process-title">
  <h2 id="process-title">De la première conversation au premier résultat — en 4 étapes</h2>
  <ol aria-label="Notre processus de travail">
    <li>
      <h3>Étape 1 — Diagnostic</h3>
      <p>Loïc analyse votre activité…</p>
    </li>
  </ol>
</section>
```

### 8.10 Analytics GA4

| Événement | Déclencheur | Paramètres |
|-----------|------------|-----------|
| `section_viewed` | Section visible > 30% | `{section: "process"}` |
| `process_cta_click` | Clic CTA sous processus | `{cta_location: "process_section"}` |

---

## 9. Cas clients

### 9.1 Objectif

**Business** : fournir la preuve ultime par des résultats réels, chiffrés, sectoriels. Le visiteur doit se reconnaître dans au moins un cas client.

**SEO** : mots-clés sectoriels + résultats mesurables + liens internes vers pages réalisations.

**Psychologique** : preuve sociale concrète + effet de légitimité + FOMO (d'autres en profitent déjà).

### 9.2 Structure

```
[Section Header]
  Pill     : "CAS CLIENTS"
  H2       : "Des résultats qui parlent d'eux-mêmes"
  Accroche : "Trois missions récentes. Des chiffres réels, vérifiables."

[Grille 3 cartes]

[CTA global : → Voir toutes nos réalisations]
```

Fond : `--color-gray-50`.

### 9.3 Les 3 cartes cas clients

**Cas 1 — Agent IA SAV (e-commerce)**
```
Tag service  : [IA] Intelligence Artificielle
Secteur      : E-commerce · Mode
Titre        : "Agent IA SAV — 3000 tickets/mois traités automatiquement"
KPIs         :
  +180%      satisfaction client (NPS 28 → 78)
  -73%       tickets traités par humains
  72h        délai de déploiement
Extrait      : "Un commerçant en ligne recevait 3000 demandes SAV par mois.
                Son équipe était débordée. En 72h, Loïc a déployé un agent
                qui traite 73% des tickets sans intervention humaine."
CTA          : Lire l'étude de cas →  (/nos-realisations/agent-ia-sav)
```

**Cas 2 — Automatisation devis (BTP)**
```
Tag service  : [Automatisation]
Secteur      : BTP · Artisanat
Titre        : "Devis automatisés — 14h récupérées par semaine"
KPIs         :
  -14h       par semaine sur la gestion des devis
  ×4         ROI en 3 mois
  0 erreur   de calcul depuis le déploiement
Extrait      : "Un artisan passait 14h par semaine à rédiger des devis manuellement.
                Nous avons automatisé le processus de A à Z : réception demande →
                calcul → envoi PDF signable en ligne."
CTA          : Lire l'étude de cas →  (/nos-realisations/automatisation-devis-btp)
```

**Cas 3 — SEO + IA (cabinet conseil)**
```
Tag service  : [SEO]
Secteur      : Services B2B · Conseil
Titre        : "Trafic organique ×3.4 en 6 mois"
KPIs         :
  ×3.4       trafic organique
  +12        positions gagnées sur les mots-clés cibles
  +67%       leads qualifiés issus du SEO
Extrait      : "Un cabinet de conseil B2B était invisible sur Google.
                Audit technique + stratégie de contenu IA + piliers thématiques :
                ×3.4 de trafic en 6 mois, sans budget publicitaire."
CTA          : Lire l'étude de cas →  (/nos-realisations/seo-cabinet-conseil)
```

### 9.4 Styles des cartes cas clients

- Variante : `Card case-study` (voir COMPONENT_GUIDELINES.md §3)
- Fond : `--color-white` · Bordure : `1px solid --color-gray-200` · `--radius-lg`
- `padding: 28px`
- KPIs : 3 chiffres en ligne · `--text-3xl` weight `800` `--color-primary` · label `--text-xs` `--color-gray-600`
- Séparateur KPIs : `1px solid --color-gray-200` · hauteur `40px`
- Hover : `translateY(-4px)` + `--shadow-md`
- Lien : `ArrowRight` Lucide · `translateX(4px)` au hover

### 9.5 CTA global

```
[→ Voir toutes nos réalisations]
```
`Button secondary lg` · centré sous la grille · lien `/nos-realisations`.

### 9.6 Responsive

**Desktop** : `grid 3 colonnes` · `gap: 24px`
**Tablette** : `grid 2 colonnes` · 3e carte cachée · lien "Voir toutes"
**Mobile** : `1 colonne` · cards empilées · toutes visibles (pas de masquage)

### 9.7 Accessibilité

```html
<section aria-labelledby="cases-title">
  <h2 id="cases-title">Des résultats qui parlent d'eux-mêmes</h2>
  <ul role="list" aria-label="Études de cas clients">
    <li>
      <article aria-label="Agent IA SAV — e-commerce">
        <!-- contenu carte -->
      </article>
    </li>
  </ul>
</section>
```

### 9.8 Analytics GA4

| Événement | Déclencheur | Paramètres |
|-----------|------------|-----------|
| `section_viewed` | Section visible > 30% | `{section: "case_studies"}` |
| `case_study_click` | Clic carte | `{case_title, service_type}` |
| `all_cases_click` | Clic "Voir toutes" | — |

---

## 10. Témoignages

### 10.1 Objectif

**Business** : valider par des tiers les promesses faites dans les sections précédentes. Le témoignage client est le signal de confiance le plus fort en B2B.

**SEO** : contenu textuel frais et unique · mots-clés de satisfaction client.

**Psychologique** : identification sociale — le visiteur se reconnaît dans les profils témoins.

### 10.2 Structure

```
[Section Header]
  Pill     : "ILS NOUS FONT CONFIANCE"
  H2       : "Ce que nos clients disent de CA-TECH"
  (pas d'accroche — les témoignages parlent d'eux-mêmes)

[Carousel témoignages]

[Ligne de logos clients — optionnelle]
```

Fond : `--color-white`.

### 10.3 Les 6 témoignages

**Témoignage 1**
```
Citation   : « En 3 semaines, Loïc a automatisé tout notre processus de relance client.
               On a récupéré 12h par semaine et nos leads ne tombent plus dans les oubliettes. »
Auteur     : Thomas M. — Directeur commercial, PME industrie · 35 salariés
Étoiles    : ★★★★★
Service    : Automatisation
```

**Témoignage 2**
```
Citation   : « Je craignais que l'IA soit trop complexe pour notre structure.
               CA-TECH nous a prouvé le contraire en 72h. Premier agent livré,
               premiers résultats mesurés. »
Auteur     : Sophie L. — Fondatrice, startup SaaS RH · 12 salariés
Étoiles    : ★★★★★
Service    : Intelligence Artificielle
```

**Témoignage 3**
```
Citation   : « Notre trafic organique a été multiplié par 3.4 en 6 mois. Sans une seule
               campagne payante. L'équipe CA-TECH sait exactement ce qu'elle fait en SEO. »
Auteur     : Marc D. — Directeur marketing, cabinet conseil B2B
Étoiles    : ★★★★★
Service    : SEO
```

**Témoignage 4**
```
Citation   : « Ce qui m'a convaincu, c'est leur honnêteté. Ils m'ont dit exactement
               ce qui était faisable et ce qui ne l'était pas. Et ils ont livré. »
Auteur     : Isabelle R. — Gérante, commerce de détail · Paris
Étoiles    : ★★★★★
Service    : Développement Web
```

**Témoignage 5**
```
Citation   : « Loïc répond à 3h du matin quand j'en ai besoin. Ce niveau de réactivité
               avec un résultat aussi concret, je n'avais jamais connu ça. »
Auteur     : Karim B. — CEO, agence événementielle
Étoiles    : ★★★★★
Service    : Intelligence Artificielle
```

**Témoignage 6**
```
Citation   : « NPS de 74 pour CA-TECH dans notre baromètre fournisseurs.
               C'est le meilleur score de toute notre liste de prestataires tech. »
Auteur     : Directrice des opérations, groupe retail national (confidentiel)
Étoiles    : ★★★★★
Service    : Automatisation + IA
```

### 10.4 Styles du carousel

- Variante : `Carousel testimonials` (voir COMPONENT_GUIDELINES.md §15)
- Un témoignage visible à la fois · largeur `max(600px, 80%)` · centré
- Auto-advance : `6000ms` · pause au hover
- Transitions : crossfade `opacity 0→1` en `400ms`
- Dots indicateurs : 6 points · actif `--color-primary` · `24px` pill

**Carte témoignage :**
- Fond `--color-gray-50` · `--radius-xl` · `padding: 48px 56px` desktop / `28px 24px` mobile
- Guillemet décoratif `❝` : `--text-7xl` · `--color-primary-light` · `opacity: 0.5`
- Citation : `--text-xl` · italic · `--color-gray-900` · `line-height: 1.6` · `max-width: 680px`
- Étoiles : `--color-primary` · `--text-sm`
- Avatar : `48px × 48px` · `--radius-full` · `border: 2px solid --color-white`
- Nom auteur : `--text-base` · weight `600` · `--color-gray-900`
- Poste : `--text-sm` · `--color-gray-500`
- Tag service : `tag-service` correspondant

### 10.5 Responsive

**Desktop** : carte `720px` · boutons prev/next visibles à droite et gauche
**Tablette** : carte `90%` · boutons prev/next sous la carte
**Mobile** : carte `100%` · swipe horizontal · dots sous la carte · boutons masqués

### 10.6 Accessibilité

```html
<section aria-labelledby="testimonials-title" aria-roledescription="carousel">
  <h2 id="testimonials-title">Ce que nos clients disent de CA-TECH</h2>
  <div aria-live="polite" aria-atomic="false">
    <blockquote>
      <p>« Citation… »</p>
      <footer>
        <cite>Thomas M. — Directeur commercial</cite>
      </footer>
    </blockquote>
  </div>
  <button aria-label="Témoignage précédent">←</button>
  <button aria-label="Témoignage suivant">→</button>
</section>
```

### 10.7 Analytics GA4

| Événement | Déclencheur | Paramètres |
|-----------|------------|-----------|
| `testimonial_viewed` | Slide > 50% visible | `{testimonial_index, author_role}` |
| `testimonial_nav` | Clic prev/next | `{direction: "prev"|"next"}` |
| `testimonial_swipe` | Swipe mobile | `{direction}` |

---

## 11. Tarifs

### 11.1 Objectif

**Business** : qualifier les prospects par le budget et lever le frein de l'opacité tarifaire. Pas de tarif exact — des fourchettes et des formats de mission.

**SEO** : mots-clés de pricing (`tarif consultant IA`, `prix automatisation PME`).

**Psychologique** : ancrage de valeur — présenter d'abord le format premium pour que le format intermédiaire paraisse accessible.

### 11.2 Structure

```
[Section Header]
  Pill     : "TARIFS"
  H2       : "Des formats adaptés à votre projet"
  Accroche : "Aucune surprise. Devis détaillé sous 24h, sans engagement."

[3 cartes formats de mission]

[CTA global : → Demander un devis gratuit]
[Micro-copy : "Réponse sous 24h · Devis détaillé · Zéro engagement"]
```

Fond : `--color-gray-50`.

### 11.3 Les 3 formats de mission

**Format 1 — Audit & Diagnostic**
```
Badge    : [ENTRÉE]
Titre    : "Audit & Diagnostic"
Prix     : "À partir de 490 €"
Délai    : "Livré en 48h"
Inclus   :
  ✓ Audit complet de votre activité par Loïc
  ✓ Rapport de 15 à 20 pages personnalisé
  ✓ Recommandations prioritaires actionnables
  ✓ Appel de restitution 45 minutes
  ✓ Plan d'action sur 90 jours
Idéal    : "Pour démarrer sans risque et comprendre où l'IA peut vous aider."
CTA      : [Demander mon audit →]    Button secondary lg
```

**Format 2 — Sprint IA (card highlight — recommandée)**
```
Badge    : [pill-primary "RECOMMANDÉ"]
Titre    : "Sprint IA"
Prix     : "À partir de 1 900 €"
Délai    : "Premier livrable en 72h"
Inclus   :
  ✓ Tout ce qui est dans l'Audit
  ✓ Déploiement d'un agent ou automatisation
  ✓ Formation de votre équipe (2h)
  ✓ Suivi 30 jours post-lancement
  ✓ Dashboard de KPI inclus
  ✓ Interlocuteur dédié
Idéal    : "Pour aller de l'idée au premier résultat en moins d'une semaine."
CTA      : [Démarrer mon Sprint →]   Button primary lg · pleine largeur
```

**Format 3 — Projet complet**
```
Badge    : [AVANCÉ]
Titre    : "Projet complet"
Prix     : "Sur devis"
Délai    : "Selon périmètre"
Inclus   :
  ✓ Audit + Sprint + iterations
  ✓ Intégrations SI personnalisées
  ✓ Agents IA sur mesure
  ✓ Accompagnement 3 à 12 mois
  ✓ Reporting mensuel ROI
  ✓ Accès prioritaire à Loïc
Idéal    : "Pour une transformation profonde et mesurable de votre activité."
CTA      : [Parlons de votre projet →]   Button secondary lg
```

### 11.4 Styles des cartes tarifs

- Format Audit & Sprint Projet : `Card default` · `--radius-lg` · `padding: 32px`
- Format Sprint (recommandé) : `Card highlight` · `border: 2px solid --color-primary` · fond `--color-primary-light`
- Hover : `translateY(-4px)` · `--shadow-md`
- Prix : `--text-3xl` weight `800` `--color-gray-900` · label "À partir de" `--text-sm` `--color-gray-500`
- Délai : `Badge pill-primary` sous le prix
- Liste inclus : icône `Check` `--color-success` · `--text-sm` · `--color-gray-700` · `gap: 8px`
- Label "Idéal pour" : `--text-sm` italic `--color-gray-500` · `border-top: 1px solid --color-gray-200` · `padding-top: 16px` · `margin-top: 16px`

### 11.5 Note tarifaire (sous les cartes)

```
💡 Ces tarifs sont indicatifs. Chaque projet est devisé sur mesure après un diagnostic gratuit.
   Loïc peut vous orienter vers le format le plus adapté à votre budget.
```
`--text-sm` · `--color-gray-500` · centré · `margin-top: 24px`

### 11.6 Responsive

**Desktop** : `grid 3 colonnes` · `gap: 24px`
**Tablette** : `grid 3 colonnes` · taille réduite · ou carousel si peu de place
**Mobile** : `1 colonne` · carte "Sprint" en premier (réordonnée)

### 11.7 Analytics GA4

| Événement | Déclencheur | Paramètres |
|-----------|------------|-----------|
| `section_viewed` | Section visible > 30% | `{section: "pricing"}` |
| `pricing_cta_click` | Clic CTA carte tarif | `{plan_name, cta_text}` |

---

## 12. FAQ

### 12.1 Objectif

**Business** : répondre aux objections de vente avant le CTA final. Chaque question représente une barrière à la conversion.

**SEO** : rich results FAQ sur Google · mots-clés de longue traîne · réponses indexables.

**Psychologique** : transparence = confiance. Une entreprise qui répond franchement aux questions difficiles rassure.

### 12.2 Structure

```
[Section Header]
  Pill     : "FAQ"
  H2       : "Les questions que vous vous posez"
  (pas d'accroche)

[Accordéon — 8 questions]

[CTA sous la FAQ : → Autre question ? Posez-la à Loïc]
```

Fond : `--color-white`.

### 12.3 Les 8 questions-réponses

**Q1 — Délai de démarrage**
```
Q : Combien de temps faut-il pour démarrer un projet avec CA-TECH ?
R : En moins de 48h. Après votre diagnostic gratuit avec Loïc, vous recevez
    un rapport et une proposition dans la journée. Si vous validez, nous
    commençons dès le lendemain. Premier livrable en 72h dans la plupart des cas.
```

**Q2 — Prérequis techniques**
```
Q : Faut-il avoir une équipe technique pour travailler avec vous ?
R : Non. Nous nous adaptons à votre niveau de maturité digitale. Que vous
    ayez une DSI structurée ou un seul ordinateur, nous livrons une solution
    qui s'intègre à votre environnement actuel. Loïc évalue ça dès le diagnostic.
```

**Q3 — Coût réel**
```
Q : Vos tarifs sont-ils transparents ou y a-t-il des coûts cachés ?
R : Nos tarifs affichés sont des points d'entrée. Votre devis est établi après
    le diagnostic et détaille chaque poste au centime près. Aucun surcoût sans
    votre accord écrit. Et le diagnostic est gratuit.
```

**Q4 — Résultats garantis**
```
Q : Garantissez-vous des résultats ?
R : Nous garantissons le respect des KPI définis ensemble au démarrage.
    Si les objectifs ne sont pas atteints au terme de la mission, nous
    prolongeons notre accompagnement sans frais supplémentaires jusqu'à
    ce qu'ils le soient. Nos engagements sont contractuels.
```

**Q5 — Loïc et la confidentialité**
```
Q : Mes données sont-elles en sécurité avec Loïc ?
R : Oui. Loïc ne stocke aucune donnée sensible. Les conversations sont
    chiffrées en transit, non utilisées pour l'entraînement de modèles tiers
    et supprimées sur demande. Nous respectons le RGPD et travaillons
    exclusivement avec des hébergements européens.
```

**Q6 — Différence avec une agence web**
```
Q : En quoi CA-TECH est-il différent d'une agence web classique ?
R : Une agence web crée des sites. CA-TECH déploie des systèmes qui génèrent
    de la croissance. Nous démarrons toujours par un diagnostic ROI, pas par
    une maquette. Et nous mesurons chaque euro investi avec des KPI définis
    contractuellement.
```

**Q7 — Secteurs couverts**
```
Q : Travaillez-vous avec tous les secteurs d'activité ?
R : Nous travaillons principalement avec des PME (5 à 200 salariés) dans les
    services B2B, le commerce, l'artisanat, les professions libérales et
    les startups. Certains secteurs réglementés (finance, santé) demandent
    une qualification spécifique — Loïc vous indiquera si c'est votre cas.
```

**Q8 — Sans engagement**
```
Q : Puis-je arrêter à tout moment ?
R : Pour les missions Sprint et Audit, le paiement est intégral à la commande.
    Pour les projets longs (3 mois et plus), chaque mois est facturé séparément
    avec un préavis de 30 jours. Pas de contrat longue durée imposé.
```

### 12.4 Styles de l'accordéon

- Variante : `FAQ Accordion` (voir COMPONENT_GUIDELINES.md §12)
- Comportement exclusif : un seul item ouvert à la fois
- Question fermée : `--text-lg` weight `600` `--color-gray-900` · icône `Plus` Lucide droit
- Question ouverte : `--color-primary` · icône `Plus` rotation `45deg` en `250ms`
- Réponse : `--text-base` `--color-gray-600` `line-height: 1.7`
- Animation : `max-height 0→auto` + `opacity 0→1` en `250ms --ease-out`
- Séparateurs : `1px solid --color-gray-200`
- `max-width: 760px` · centré dans le container

### 12.5 CTA sous la FAQ

```
Vous avez une autre question ?
[Posez-la à Loïc →]   Button primary md
```
Centré · `margin-top: 40px` · ouvre le widget Loïc.

### 12.6 Schema.org FAQPage

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Combien de temps faut-il pour démarrer un projet avec CA-TECH ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "En moins de 48h. Après votre diagnostic gratuit avec Loïc, vous recevez un rapport et une proposition dans la journée. Si vous validez, nous commençons dès le lendemain. Premier livrable en 72h dans la plupart des cas."
      }
    }
  ]
}
```
(répéter pour les 8 questions)

### 12.7 Analytics GA4

| Événement | Déclencheur | Paramètres |
|-----------|------------|-----------|
| `faq_open` | Ouverture accordéon | `{question_index, question_text}` |
| `faq_loic_click` | Clic CTA sous FAQ | `{cta_location: "faq_section"}` |

---

## 13. CTA Final

### 13.1 Objectif

**Business** : dernière chance de convertir avant que le visiteur quitte la page. Les visiteurs qui atteignent cette section ont manifestement de l'intérêt — ils méritent un CTA fort.

**SEO** : texte anchor riche · structure H2 contenant des mots-clés de conversion.

**Psychologique** : bookend visuel avec le hero (même gradient) — le parcours de page se boucle, renforçant la cohérence de marque.

### 13.2 Structure

```
[Section pleine largeur — gradient-primary]

  [Badge] : ✦ PRÊT À DÉMARRER ?

  [H2] : Votre premier résultat IA
          est à 72 heures.

  [Sous-texte] : Diagnostic gratuit · Rapport personnalisé · Premier livrable en 72h.
                 Pas d'engagement, pas de jargon — juste des résultats mesurables.

  [Button white xl] : Lancer mon Diagnostic IA →

  [Micro-copy] : Gratuit · Sans engagement · Réponse sous 24h

  [Lien secondaire] : Ou parler à Loïc maintenant →
```

### 13.3 H2 exact

```
Votre premier résultat IA
est à 72 heures.
```
- `--text-5xl` desktop / `--text-4xl` mobile · weight `800` · `#FFFFFF`
- `letter-spacing: -0.02em`
- Retour à la ligne contrôlé

### 13.4 Fond et styles

```css
background:
  radial-gradient(ellipse 70% 80% at 60% 50%, rgba(0,102,255,0.25) 0%, transparent 65%),
  linear-gradient(135deg, #0066FF 0%, #0A2540 100%);
```

- Padding : `120px 0` desktop / `80px 0` mobile
- Badge : `pill-dark` · texte `✦ PRÊT À DÉMARRER ?`
- `text-align: center` · `max-width: 640px` · centré

### 13.5 CTAs

**Primaire :**
- `Button white xl` · `padding: 20px 48px` · `--radius-md`
- Hover : `translateY(-2px)` + ombre renforcée

**Secondaire :**
```
Ou parler à Loïc maintenant →
```
- `--text-base` · `rgba(255,255,255,0.70)` · hover `rgba(255,255,255,1)` · `150ms`
- Déclenche l'ouverture du widget Loïc (pas de navigation)

### 13.6 Responsive

**Desktop** : centré · `max-width: 700px`
**Mobile** : texte réduit · CTA pleine largeur · lien secondaire sous le CTA

### 13.7 Analytics GA4

| Événement | Déclencheur | Paramètres |
|-----------|------------|-----------|
| `section_viewed` | Section visible > 30% | `{section: "cta_final"}` |
| `final_cta_click` | Clic CTA blanc | `{cta_location: "cta_final"}` |
| `final_loic_click` | Clic lien Loïc | `{cta_location: "cta_final_secondary"}` |

---

## 14. Footer

### 14.1 Objectif

**Business** : navigation globale du site · informations de contact · crédibilité légale.

**SEO** : liens internes vers toutes les pages importantes · maillage interne complet.

### 14.2 Structure desktop (4 colonnes)

```
┌─────────────────┬────────────────┬───────────────┬─────────────────┐
│  [Logo blanc]   │  Expertises    │  Pages        │  Contact        │
│                 │                │               │                 │
│  L'Intelligence │  IA            │  Loïc         │  📧 Email       │
│  Artificielle   │  Automatisation│  Réalisations │  📱 Téléphone   │
│  au service de  │  SEO           │  Blog         │  📍 Localisation│
│  votre          │  Dev Web       │  À propos     │                 │
│  croissance.    │  Design        │  Contact      │  [LinkedIn →]   │
│                 │                │  Devis        │                 │
└─────────────────┴────────────────┴───────────────┴─────────────────┘
─────────────────────────────────────────────────────────────────────────
  © 2026 CA-TECH — Tous droits réservés
  [Mentions légales]  [CGV]  [Politique de confidentialité]  [Sitemap]
```

### 14.3 Styles footer

- Fond : `#111827` (`--color-gray-900`)
- Padding section : `64px 0 40px`
- Titres colonnes : `--text-xs` · uppercase · `letter-spacing: 0.10em` · `rgba(255,255,255,0.40)` · `margin-bottom: 16px`
- Liens : `--text-sm` · `rgba(255,255,255,0.65)` · hover `rgba(255,255,255,1)` · `transition: 150ms`
- Logo : SVG blanc · `max-width: 110px`
- Slogan : `--text-sm` · `rgba(255,255,255,0.50)` · `margin-top: 12px` · `max-width: 190px`
- Séparateur barre basse : `1px solid rgba(255,255,255,0.08)` · `margin: 32px 0 24px`
- Copyright : `--text-xs` · `rgba(255,255,255,0.35)`
- Liens légaux : `--text-xs` · `rgba(255,255,255,0.45)` · hover `rgba(255,255,255,0.80)`

### 14.4 Liens footer (SEO — maillage interne)

**Colonne Expertises :**
- `/intelligence-artificielle` — "Intelligence Artificielle"
- `/automatisation` — "Automatisation"
- `/seo` — "SEO"
- `/developpement-web` — "Développement Web"
- `/design-identite` — "Design & Identité"

**Colonne Pages :**
- `/loic` — "Loïc"
- `/nos-realisations` — "Réalisations"
- `/blog` — "Blog"
- `/a-propos` — "À propos"
- `/contact` — "Contact"
- `/devis` — "Demander un devis"

**Colonne Contact :**
- `mailto:contact@ca-tech.fr` — "contact@ca-tech.fr"
- `tel:+33XXXXXXXXX` — Numéro de téléphone
- Adresse : ville principale
- LinkedIn : lien externe `rel="noopener noreferrer"` · icône `ExternalLink` Lucide `14px`

### 14.5 Responsive footer

**Desktop** : `grid 4 colonnes` · `gap: 48px`
**Tablette** : `grid 2 colonnes` · `gap: 32px`
**Mobile** : `1 colonne` · logo + slogan · liens en 2 colonnes · contact · légal

### 14.6 Accessibilité footer

```html
<footer role="contentinfo">
  <nav aria-label="Navigation footer — Expertises">…</nav>
  <nav aria-label="Navigation footer — Pages">…</nav>
  <address>
    <!-- contact -->
  </address>
  <nav aria-label="Liens légaux">…</nav>
</footer>
```

### 14.7 Widget Loïc (persistant)

Le widget Loïc est présent sur **toutes les pages**, positionné `fixed bottom-24px right-24px`, au-dessus du footer dans l'empilement z-index.

- État fermé : bouton `56px` fond `--color-primary` · icône `MessageCircle` Lucide `24px` blanc
- Badge notification : `16px` fond `--color-error` · `top-right` · visible si message non lu
- Tooltip hover (desktop) : « Parler à Loïc »
- Ne s'ouvre **jamais** automatiquement

---

## 15. Règles transversales

### 15.1 Liens internes — Cartographie complète

| Depuis la Homepage | Vers | Anchor text |
|-------------------|------|-------------|
| Header nav | `/intelligence-artificielle` | "Intelligence Artificielle" |
| Header nav | `/automatisation` | "Automatisation" |
| Header nav | `/seo` | "SEO" |
| Header nav | `/developpement-web` | "Développement Web" |
| Header nav | `/loic` | "Loïc" |
| Header nav | `/nos-realisations` | "Réalisations" |
| Header nav | `/blog` | "Blog" |
| Header CTA | `/diagnostic-ia` | "Diagnostic IA" |
| Hero CTA primaire | `/diagnostic-ia` | "Lancer mon Diagnostic IA" |
| Hero CTA secondaire | `/nos-realisations` | "Voir nos réalisations" |
| §5 Card 1 | `/nos-realisations` | "Voir nos cas clients" |
| §5 Card 2 | `#processus` (ancre) | "Comment nous travaillons" |
| §5 Card 3 | `/loic` | "Découvrir Loïc" |
| §5 Card 4 | `#temoignages` (ancre) | "Voir les témoignages" |
| §6 Card IA | `/intelligence-artificielle` | "Découvrir l'offre IA" |
| §6 Card Auto | `/automatisation` | "Automatiser mes processus" |
| §6 Card SEO | `/seo` | "Auditer mon SEO" |
| §6 Card Dev | `/developpement-web` | "Voir nos réalisations web" |
| §6 lien global | `/services` | "Voir toutes nos expertises" |
| §7 lien secondaire | `/loic` | "découvrir comment fonctionne Loïc" |
| §9 Card 1 | `/nos-realisations/agent-ia-sav` | "Lire l'étude de cas" |
| §9 Card 2 | `/nos-realisations/automatisation-devis-btp` | "Lire l'étude de cas" |
| §9 Card 3 | `/nos-realisations/seo-cabinet-conseil` | "Lire l'étude de cas" |
| §9 lien global | `/nos-realisations` | "Voir toutes nos réalisations" |
| Footer × 12 | (voir §14.4) | (voir §14.4) |

**Total liens internes homepage : ~28 liens** — excellent pour le maillage interne SEO.

### 15.2 Micro-interactions — Catalogue complet

| Élément | Déclencheur | Comportement | Durée |
|---------|------------|-------------|-------|
| Bouton primary | hover | `translateY(-1px)` + shadow renforcée | `150ms` |
| Bouton primary | active/click | `translateY(0)` + shadow réduite | `100ms` |
| Card | hover | `translateY(-4px)` + `--shadow-md` | `250ms` |
| Icône carte | hover (via card) | `scale(1.10)` | `150ms` |
| Lien texte nav | hover | underline slide gauche→droite | `200ms` |
| Flèche CTA | hover (via lien) | `translateX(4px)` | `150ms` |
| Dropdown | trigger | `opacity 0→1` + `translateY(-6px→0)` | `200ms` |
| Accordéon FAQ | click | `max-height` + `opacity` + rotation icône | `250ms` |
| Dot carousel | changement slide | `width 8px→24px` (pill) | `300ms` |
| Badge ● Loïc | passif | pulsation `scale(1→1.4→1)` | `1500ms boucle` |
| Scroll reveal | IntersectionObserver | `fadeUp` `opacity 0→1` + `translateY(20px→0)` | `400ms` |
| Stagger cards | IntersectionObserver | délai `+80ms` à `+100ms` par enfant | `400ms` |
| CountUp stats | IntersectionObserver | défilement numérique | `1200ms` |
| Skip link | focus clavier | `translateY(-100%→0)` | `150ms` |
| Widget Loïc ouverture | click bouton | `scale(0.85→1)` + `opacity 0→1` + `translateY(16px→0)` | `250ms spring` |
| Header transparency | scroll > 60px | `background blur` | `200ms` |

### 15.3 Messages de réassurance — Emplacements

| Message | Section | Format |
|---------|---------|--------|
| « Gratuit · Sans engagement · Résultat en 10 min » | Hero · sous CTAs | micro-copy |
| « Devis gratuit et sans engagement » | §5 Bloc réassurance | item liste |
| « Réponse sous 24h » | §5 Bloc réassurance | item liste |
| « Résultats mesurables garantis » | §5 Bloc réassurance | item liste |
| « Pas de contrat long terme » | §5 Bloc réassurance | item liste |
| « ● Loïc est en ligne » | §7 Badge statut | badge animé |
| « Gratuit · Aucune inscription requise » | §7 Sous CTA Loïc | micro-copy |
| « Premier livrable en 72h » | §8 Stepper étape 3 | badge |
| « Réponse sous 24h · Devis détaillé · Zéro engagement » | §11 Sous CTA tarifs | micro-copy |
| « Garanties contractuelles » | §12 FAQ Q4 | contenu réponse |
| « Gratuit · Sans engagement · Réponse sous 24h » | §13 CTA Final | micro-copy |

### 15.4 Emplacements des preuves sociales

| Preuve | Section | Format |
|--------|---------|--------|
| +240% leads · 72h · +50 clients · 97 Lighthouse | §4 Proof Bar | Stat countUp |
| NPS 74 · Résultats garantis | §5 Card 4 | Texte preuve |
| 3 cas clients avec KPIs chiffrés | §9 Cas clients | Cards |
| 6 témoignages avec nom + poste + étoiles | §10 Carousel | Témoignages |
| Étoiles ★★★★★ | §10 Carousel | Visuel |
| Logos clients (si disponibles) | §10 Après carousel | Proof bar |

### 15.5 Responsive global — Breakpoints et comportements

| Breakpoint | Comportement global |
|------------|-------------------|
| Mobile `< 768px` | 1 colonne · Device frame masqué · CTAs pleine largeur · Stepper vertical · Carousel swipeable |
| Tablette `768–1023px` | 2 colonnes · Device frame réduit · Stepper horizontal compact · Carousel prev/next sous la carte |
| Desktop `≥ 1024px` | Layout référence · Device frame visible · Stepper horizontal · Hover states actifs |
| Large `≥ 1280px` | Container centré `max-width: 1200px` · paddings augmentés |

**Règles mobiles prioritaires :**
- Navigation : drawer uniquement (pas de nav horizontale)
- Hero : pas de device frame (`display: none` sous `768px`)
- Grilles de cards : jamais plus de 2 colonnes sur mobile, idéalement 1
- Proof bar : grille `2×2` (pas 4 colonnes)
- Footer : 1 colonne uniquement
- Toutes les zones cliquables : `min-height: 44px` (WCAG 2.5.5)
- Polices : jamais en dessous de `14px`

### 15.6 Optimisations SEO — Récapitulatif complet

**Structure HTML :**
- Un seul `<h1>` · hiérarchie `H1 → H2 → H3` sans saut
- `<main id="main-content">` · `<header>` · `<footer>` · `<nav>` · `<section>` · `<article>` sémantiques
- `<time datetime="">` pour les dates
- `<address>` pour les coordonnées de contact

**Balises prioritaires :**
- `<title>` : ≤ 60 chars · mot-clé en tête
- `<meta description>` : 145–155 chars · phrase d'accroche + CTA
- `<link rel="canonical" href="https://ca-tech.fr/">`
- `<link rel="preload">` : police Inter + image OG

**Open Graph complet :**
- `og:title` · `og:description` · `og:image` (1200×630px WebP) · `og:url` · `og:type: website`
- `twitter:card: summary_large_image` · `twitter:title` · `twitter:description` · `twitter:image`

**Schema.org :**
- `Organization` (voir §1.2)
- `WebSite` avec `SearchAction` (voir §1.2)
- `FAQPage` (voir §12.6)

**Emplacements mots-clés dans le contenu :**

| Mot-clé | Emplacement |
|---------|-------------|
| `intelligence artificielle` | H1 · §6 titre card · §7 H2 |
| `cabinet conseil IA` | `<title>` · `<meta description>` · §1 Schema.org |
| `consultant IA` | §7 accroche · témoignage 2 · Footer |
| `automatisation processus` | §4 stat · §6 card · §8 process |
| `diagnostic IA` | CTA hero · header · §13 CTA final |
| `agent IA` | §6 card IA · §9 cas client 1 · §7 bénéfices |
| `SEO` | §6 card SEO · §9 cas client 3 · `<title>` |

**Liens sortants :** uniquement si nécessaire · `rel="noopener noreferrer"` sur tous · attribut `external` sur les liens LinkedIn.

### 15.7 Optimisations Core Web Vitals

**LCP — Largest Contentful Paint (cible : < 2.5s)**

| Action | Impact |
|--------|--------|
| Fond hero en CSS pur (pas d'image) | LCP = texte H1 · très rapide |
| Police Inter préchargée avec `rel="preload"` | Évite FOIT |
| `font-display: swap` sur Inter | Texte visible immédiatement |
| Logo SVG inline ou `fetchpriority="high"` | Premier paint rapide |
| Aucun script render-blocking avant `</body>` | Premier rendu non bloqué |
| CDN Vercel Edge Network | Latence < 50ms depuis FR |

**CLS — Cumulative Layout Shift (cible : < 0.1)**

| Action | Impact |
|--------|--------|
| `width` + `height` sur toutes les images | Réserve l'espace avant chargement |
| Logo avec dimensions fixes | Évite le saut au chargement |
| Police préchargée | Évite le saut de layout au swap |
| Hauteurs de sections définies en CSS | Pas de reflow au chargement JS |
| Device frame Loïc : dimensions fixes | CLS = 0 sur le hero |

**INP — Interaction to Next Paint (cible : < 200ms)**

| Action | Impact |
|--------|--------|
| Animations CSS (`transform/opacity`) | Pas de recalcul layout |
| `will-change: transform, opacity` sur éléments animés | GPU layer préparé |
| Événements JS non bloquants (`passive: true` sur scroll) | Scroll fluide |
| IntersectionObserver pour reveals | Pas de calcul sur scroll event |
| Lazy loading des images hors viewport | Pas de réseau bloquant |

**Budget de ressources :**

| Type | Budget |
|------|--------|
| HTML | < 20 Ko |
| CSS total | < 80 Ko |
| JS total (hors Loïc widget) | < 120 Ko |
| Police Inter (3 weights) | < 60 Ko |
| Images total | < 300 Ko |
| **Total page** | **< 600 Ko** |

### 15.8 Accessibilité WCAG AA — Récapitulatif complet

**Structure et navigation :**
- Skip link : `href="#main-content"` · premier élément du body
- Un seul `<h1>` · hiérarchie complète sans saut
- `<main>` · `<header>` · `<nav>` · `<footer>` avec `role` et `aria-label`
- `<section>` avec `aria-labelledby` sur chaque section

**Clavier :**
- Tous les éléments interactifs accessibles au `Tab`
- Ordre de focus logique (correspondant à l'ordre visuel)
- Focus trap dans : drawer mobile · modal · widget Loïc ouvert
- `Escape` ferme : dropdown · drawer · modal · widget Loïc
- Carousel : touches `←` `→` pour naviguer entre slides

**Contraste (vérifié) :**

| Combinaison | Rapport | WCAG |
|-------------|---------|------|
| Blanc `#FFFFFF` sur `#0066FF` | 4.6:1 | ✓ AA |
| Blanc sur `#0A2540` | 16.5:1 | ✓ AAA |
| `#111827` sur `#FFFFFF` | 19.5:1 | ✓ AAA |
| `#4B5563` sur `#FFFFFF` | 7.1:1 | ✓ AA |
| `#0066FF` sur `#E8F0FF` | 4.7:1 | ✓ AA |
| Blanc sur `rgba(255,255,255,0.80)` sur gradient | ≥ 4.5:1 | ✓ AA |

**Images et médias :**
- `alt` descriptif sur toutes les images informatives
- `alt=""` sur les images purement décoratives
- Device frame chat : `aria-hidden="true"`
- Icônes décoratives : `aria-hidden="true"`
- Icônes fonctionnelles seules : `aria-label` sur l'élément parent

**Formulaires (widget Loïc, diagnostic) :**
- `<label>` visible associé à chaque champ
- `aria-describedby` liant champ et message d'erreur
- `aria-invalid="true"` sur les champs en erreur
- `aria-required="true"` + `required` sur les champs obligatoires

**Préférences système :**
- `prefers-reduced-motion` : toutes les animations désactivées
- `prefers-color-scheme: dark` : non géré en v1 (fond clair imposé pour cohérence de marque)
- `prefers-contrast: more` : contrastes déjà WCAG AA — pas d'ajustement requis

### 15.9 Plan de tracking GA4 — Événements complets

**Événements de navigation :**

| Événement | Paramètres | Description |
|-----------|-----------|-------------|
| `page_view` | `page_title, page_location` | Auto · vue de la page |
| `scroll` | `percent_scrolled: 25/50/75/90` | Auto · profondeur de scroll |
| `nav_click` | `link_text, link_url, position` | Clic lien navigation |
| `nav_dropdown_open` | `element` | Ouverture dropdown |
| `nav_mobile_open` | — | Ouverture drawer mobile |

**Événements de conversion :**

| Événement | Paramètres | Description |
|-----------|-----------|-------------|
| `cta_click` | `cta_text, cta_location` | Tout clic sur un CTA |
| `hero_cta_click` | `cta_text` | CTA hero spécifiquement |
| `final_cta_click` | `cta_location: "cta_final"` | CTA final section |
| `loic_open` | `trigger` | Ouverture widget Loïc |
| `loic_message_sent` | `message_length` | Message envoyé à Loïc |
| `diagnostic_started` | — | Clic → `/diagnostic-ia` |
| `devis_started` | — | Clic → `/devis` |

**Événements d'engagement :**

| Événement | Paramètres | Description |
|-----------|-----------|-------------|
| `section_viewed` | `section` | Section visible > 30% |
| `expertise_card_click` | `expertise_name, link_url` | Clic carte expertise |
| `case_study_click` | `case_title, service_type` | Clic cas client |
| `testimonial_viewed` | `testimonial_index` | Slide témoignage visible |
| `faq_open` | `question_index, question_text` | Accordéon FAQ ouvert |
| `pricing_cta_click` | `plan_name` | Clic CTA tarif |
| `loic_demo_choice` | `choice_text` | Choix dans démo Loïc |
| `hero_demo_completed` | `demo_name` | Démo chat terminée |

**Conversions GA4 à marquer :**
- `diagnostic_started` → Conversion principale
- `devis_started` → Conversion secondaire
- `loic_message_sent` → Micro-conversion

### 15.10 Événements Google Ads (Conversion Tracking)

| Événement | Type | Description |
|-----------|------|-------------|
| Clic sur `/diagnostic-ia` | Conversion primaire | Lead généré |
| Clic sur `/devis` | Conversion secondaire | Intention devis |
| Message Loïc envoyé | Micro-conversion | Engagement qualifié |
| Scroll > 75% homepage | Signal d'engagement | Audience reciblage |

**Balise Google Ads :**
```html
<!-- Dans <head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-XXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-XXXXXXX');
</script>
```

**Audience de reciblage :**
- Visiteurs homepage sans conversion → campagne retargeting J+1 / J+7
- Visiteurs page `/diagnostic-ia` sans complétion → relance

---

## 16. Checklist de validation de la Homepage

### 16.1 Fonctionnel

- [ ] H1 exact : « L'Intelligence Artificielle au service de votre croissance. »
- [ ] Un seul H1 sur la page
- [ ] Hiérarchie H1 → H2 → H3 sans saut
- [ ] Toutes les sections présentes dans l'ordre défini
- [ ] Tous les CTAs mènent à la bonne URL
- [ ] Widget Loïc présent et fonctionnel sur toutes les résolutions
- [ ] Widget Loïc ne s'ouvre PAS automatiquement
- [ ] Dropdown nav fonctionnel au hover ET au focus clavier
- [ ] Drawer mobile fonctionnel (ouverture · fermeture · focus trap · Escape)
- [ ] Header transparent au sommet · blur/blanc après 60px de scroll
- [ ] CountUp stats déclenché à l'entrée dans le viewport
- [ ] Carousel témoignages : auto-advance 6s · pause au hover · swipe mobile
- [ ] Accordéon FAQ : comportement exclusif (un ouvert à la fois)
- [ ] Boutons choix rapide Loïc → ouvrent le widget avec contexte
- [ ] Liens internes : tous les 28 liens vérifiés et fonctionnels

### 16.2 Design

- [ ] Gradient hero : `135deg #0066FF → #0A2540` (angle exact)
- [ ] Proof bar : même fond `#0A2540` que la fin du hero (continuité visuelle)
- [ ] CTA Final : même gradient que le hero (bookend visuel)
- [ ] Police Inter uniquement : `400` `600` `800` chargées
- [ ] Icônes Lucide exclusivement · `stroke-width: 2`
- [ ] Aucune couleur hors palette
- [ ] Cards : hover `translateY(-4px)` + `--shadow-md`
- [ ] Animations sur `transform/opacity` uniquement

### 16.3 SEO

- [ ] `<title>` : ≤ 60 chars · mot-clé en tête
- [ ] `<meta description>` : 145–155 chars
- [ ] `<link rel="canonical" href="https://ca-tech.fr/">`
- [ ] Open Graph complet (6 balises)
- [ ] JSON-LD Organization : présent et valide
- [ ] JSON-LD WebSite : présent et valide
- [ ] JSON-LD FAQPage : 8 questions présentes
- [ ] `<link rel="preload">` : police Inter
- [ ] `loading="lazy"` sur toutes les images hors hero
- [ ] `alt` descriptif sur toutes les images informatives
- [ ] 28 liens internes présents

### 16.4 Accessibilité

- [ ] Skip link visible au focus
- [ ] Tous les éléments interactifs accessibles au clavier
- [ ] Focus visible sur tous les éléments (`outline: 2px solid #0066FF`)
- [ ] Focus trap : drawer mobile · widget Loïc
- [ ] `Escape` ferme : dropdown · drawer · widget Loïc
- [ ] `aria-expanded` sur dropdown · drawer · accordéon
- [ ] `aria-live="polite"` sur le carousel (slide actif)
- [ ] `aria-hidden="true"` sur tous les éléments décoratifs
- [ ] Contraste ≥ 4.5:1 vérifié (6 combinaisons — voir §15.8)
- [ ] Taille minimale zones cliquables : `44×44px`
- [ ] `prefers-reduced-motion` : toutes les animations désactivées

### 16.5 Performance

- [ ] LCP < 2.5s mesuré sur mobile 4G (PageSpeed Insights)
- [ ] CLS < 0.1 · `width` + `height` définis sur toutes les images
- [ ] INP < 200ms
- [ ] Lighthouse Performance ≥ 90
- [ ] Lighthouse Accessibility ≥ 95
- [ ] Lighthouse SEO = 100
- [ ] Lighthouse Best Practices ≥ 95
- [ ] Budget HTML < 20 Ko · CSS < 80 Ko · JS < 120 Ko · Total < 600 Ko
- [ ] Police Inter : `font-display: swap` + `rel="preload"`
- [ ] Aucun script render-blocking

### 16.6 Analytics

- [ ] GA4 configuré et événements testés dans DebugView
- [ ] `cta_click` tracé sur tous les CTAs
- [ ] `loic_open` tracé sur toutes les ouvertures widget
- [ ] `section_viewed` tracé sur les 8 sections principales
- [ ] `scroll` à 25/50/75/90% configuré
- [ ] Conversions GA4 marquées : `diagnostic_started` · `devis_started`
- [ ] Google Ads : balise de conversion présente
- [ ] Audiences de reciblage configurées

---

*Document complet — Homepage CA-TECH · Parties 1 et 2*
*Version 2.0 · Juillet 2026 · En attente de validation avant implémentation*
