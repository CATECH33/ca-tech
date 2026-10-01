# CA-TECH — Information Architecture
> Architecture UX du nouveau site — source de vérité pour la construction de l'interface

**Version :** 1.0  
**Basé sur :** DESIGN.md v1.0 · docs/STRATEGY.md · actifs réels du projet  
**Statut :** Validé avant implémentation

---

## Table des matières

1. [Logique narrative globale](#1-logique-narrative-globale)
2. [Sitemap UX](#2-sitemap-ux)
3. [Architecture Homepage — 13 sections](#3-architecture-homepage--13-sections)
4. [Architecture pages intérieures](#4-architecture-pages-intérieures)
5. [Actifs disponibles](#5-actifs-disponibles)
6. [Éléments nécessitant des animations](#6-éléments-nécessitant-des-animations)
7. [Checklist implémentation](#7-checklist-implémentation)

---

## 1. Logique narrative globale

Le visiteur de CA-TECH est un dirigeant, un fondateur, ou un décideur opérationnel. Il arrive avec une question : **"Qu'est-ce que CA-TECH peut faire pour moi ?"**

La homepage répond à cette question en trois temps :

```
TEMPS 1 — IMPACT IMMÉDIAT (sections 01–03)
  → Qui nous sommes, ce que nous faisons, pourquoi ça compte.
  → Message : "Nous sommes le cabinet IA qui exécute, pas seulement qui conseille."

TEMPS 2 — DÉMONSTRATION (sections 04–08)
  → Chaque expertise majeure est incarnée visuellement.
  → Message : "Voilà concrètement ce que nous construisons pour vous."

TEMPS 3 — CONFIANCE & CONVERSION (sections 09–13)
  → Portfolio réel, process clair, Loïc comme preuve vivante.
  → Message : "Nous l'avons déjà fait. Voici comment ça se passe."
```

**Principe de différenciation** : Chaque section des temps 2 et 3 utilise un layout différent. Pas de répétition de pattern.

---

## 2. Sitemap UX

### Routes prioritaires (Phase 1 — à construire)

```
/                               Homepage narrative complète
/services                       Hub services — overview 5 pôles
/services/ia                    Service IA — chatbots, agents, LLM, MCP, RAG
/services/automatisation        Service Automatisation — n8n, Make, scripts
/services/developpement         Service Développement Web — sites, apps, SaaS
/services/seo                   Service SEO — audit, piliers, local, suivi
/services/design                Service Design & Identité visuelle
/projets                        Portfolio complet — tous projets
/projets/ca-tech-manager        Cas client — Manager (app interne)
/projets/cv-magic               Cas client — CV Magic
/projets/pasmal                 Cas client — Pasmal
/projets/pemous-money           Cas client — Pemous Money
/a-propos                       L'équipe, la vision, Loïc, la méthode
/contact                        Formulaire + Loïc CTA
/devis                          Formulaire devis multi-étapes
/mentions-legales               Obligatoire
/politique-de-confidentialite   Obligatoire
/gestion-des-cookies            Obligatoire (Axeptio)
```

### Routes SEO locales (Phase 2)

```
/agence-ia-[ville]              ×10 villes (Paris, Lyon, Dijon, Troyes + 6)
/automatisation-[ville]         ×10 villes
/creation-site-[ville]          ×10 villes
/seo-[ville]                    ×10 villes
```

### Routes Blog (Phase 2)

```
/blog                           Index articles
/blog/[slug]                    Article individuel
```

### Routes techniques (existantes — à conserver)

```
/manager                        App Manager React (séparé, Vercel)
/admin/loic-ia/                 Interface admin Loïc
```

### Justification des routes retenues

| Route | Justification |
|-------|---------------|
| `/services/ia` | Pôle 1 de la stratégie — cœur de l'offre |
| `/services/automatisation` | Pôle 2 — différenciateur fort |
| `/services/developpement` | Pôle 4 — moyen d'implémentation, SEO fort |
| `/services/seo` | Pôle 3 — trafic organique, cas clients |
| `/services/design` | Pôle 5 — support, volume de recherche faible mais cohérence |
| `/projets` + sous-pages | Assets portfolio réels disponibles (4 projets + branding) |
| `/a-propos` | Confiance, Loïc, vision, équipe |
| `/contact` + `/devis` | Tunnel de conversion — séparé pour tracking précis |

---

## 3. Architecture Homepage — 13 sections

---

### SECTION 01 — Navigation

**Objectif :** Point d'entrée UX, orientation, CTA permanent, identité de marque.

**Message :** Présence premium. On sait où on est. On peut aller partout.

**Contenu :**
- Logo CA-TECH (SVG existant : `logos/logo-ca-tech-icon.svg`)
- Items de navigation : Expertises · Solutions IA · Réalisations · À propos
- CTA permanent : "Parler à Loïc" → ouvre widget Loïc
- Sur mobile : burger icon, menu fullscreen

**Hiérarchie :**
```
[Logo]                    [nav items ×4]                    [CTA "Parler à Loïc"]
```

**Layout :** Barre horizontale pleine largeur, `height: 64px`, `position: fixed`

**Interaction :**
- Transparent au chargement (`background: transparent`)
- Transition vers frosted glass après 80px de scroll
- Item actif : couleur `--color-cool-white`, underline accent `2px`
- Dropdown si items enfants : fond `--surface-overlay`, `border-radius: --radius-md`

**Animation :**
- Entrée page : `opacity: 0 → 1`, `y: -10 → 0`, durée `0.4s`
- Transition scroll : `background` + `border-bottom` en `0.3s ease`

**Responsive :**
- Desktop : layout décrit ci-dessus
- Tablet : items réduits (3 maximum), CTA visible
- Mobile : logo + burger, CTA en icône ou masqué (remplacé dans hero)

**CTA :** "Parler à Loïc" → lance le widget Loïc IA

---

### SECTION 02 — Hero

**Objectif :** Affirmer l'identité CA-TECH en 3 secondes. Capter. Qualifier le visiteur.

**Message :** "Nous construisons l'intelligence artificielle qui fait vraiment croître les entreprises."

**Contenu :**
- Eyebrow label : `DIGITAL INTELLIGENCE STUDIO`
- Headline H1 : **"L'IA qui transforme votre croissance."** (ou variante courte similaire)
- Sous-headline : "Cabinet de conseil spécialisé en IA, automatisation, développement web et SEO — pour les entreprises qui veulent aller plus vite que leurs concurrents."
- Button pair : `[Démarrer avec Loïc]` (primaire) + `[Voir nos réalisations]` (secondaire)
- Visuel hero flottant : screenshot ou composition de l'interface Manager / agent IA, avec glow accent
- Indicateur scroll subtil (flèche animée en bas)

**Hiérarchie :**
```
EYEBROW (overline, accent)
H1 (80px display, cool white)
SOUS-HEADLINE (20px, silver)
BOUTONS
────────────────
VISUEL FLOTTANT (droite ou centré en dessous selon layout)
```

**Layout :**
- Option A (retenue) : **Split 55/45** — texte à gauche (col 1-7), visuel à droite (col 8-12, légèrement débordant vers le haut)
- Height : `min-height: 100vh`, `padding-top: 64px` (hauteur nav)
- Background : `linear-gradient(135deg, #05101E 0%, #102740 60%)` + glow accent en haut à droite

**Visuel :**
- Composition floatante : mockup de l'interface Manager (`portfolio/ca-tech-manager/dashboard.webp`) ou interface agent IA
- `border-radius: --radius-2xl` (32px)
- `box-shadow: 0 32px 80px rgba(0,0,0,0.5), 0 0 60px rgba(53,155,217,0.12)`
- Animation flottement léger (keyframes up/down 8s)

**Interaction :**
- `[Démarrer avec Loïc]` → ouvre widget Loïc ou scroll vers section CTA si widget désactivé
- `[Voir nos réalisations]` → scroll vers section Portfolio (§09) ou → `/projets`
- Visuel : micro-hover `scale(1.01)` très léger

**Animation :**
- Entrée **staggerée** : eyebrow → headline → sous-headline → boutons → visuel
- Délai stagger : `0.08s` par élément
- Durée par élément : `0.7s`, `ease: [0.16, 1, 0.3, 1]`
- Visuel : entre depuis `y: 30, opacity: 0` avec léger délai (`0.3s`)
- Float continu visuel : `translateY(0px) ↔ translateY(-12px)`, durée 6s, ease in-out

**Responsive :**
- Mobile : layout **colonne unique** — texte centré, visuel en dessous (réduit), H1 : 40px
- Tablet : split 50/50 avec visuel réduit, H1 : 56px
- Desktop : split 55/45, H1 : 72–80px

**CTA :** Primaire "Démarrer avec Loïc", Secondaire "Voir nos réalisations"

---

### SECTION 03 — Positionnement

**Objectif :** Ancrer la différence CA-TECH face aux agences classiques. Installer la confiance initiale.

**Message :** "Nous ne faisons pas juste des sites. Nous construisons l'IA qui fait croître les entreprises."

**Contenu :**
- Eyebrow : `NOTRE POSITIONNEMENT`
- Headline : "Pas une agence web. Un cabinet d'intelligence digitale."
- Corps éditorial : 2–3 phrases clés sur la proposition de valeur (IA-first, exécution, mesurable)
- **Bande de métriques** : 4 chiffres significatifs en `--font-mono`

**Métriques (avec données réelles ou cibles crédibles) :**
```
[48h]      Premier livrable IA opérationnel
[4]        Pôles d'expertise couverts
[2023]     Fondé à Dijon, actif en France
[< 1 sem.] Prototype livré en sprint
```

- Séparateur éditorial : citation courte en grands caractères (italique, `--text-display-md`) centrée

**Hiérarchie :**
```
EYEBROW
HEADLINE (48px, display)
CORPS (body-lg, silver, max-width 640px)
───────────────────────────────
[METRIC] [METRIC] [METRIC] [METRIC]   ← 4 colonnes
───────────────────────────────
"CITATION ÉDITORIALE FORTE EN GRAND"
```

**Layout :**
- Fond : `--surface-panel` (#102740) — première rupture avec le canvas deep navy
- 2 zones : bloc texte à gauche (col 1-7) + métriques empilées à droite (col 8-12) OU métriques en bande pleine largeur en dessous
- Retenu : **texte pleine largeur en haut + bande métriques 4 colonnes + citation centrée en bas**

**Interaction :** Aucune interaction directe. Section éditoriale, scroll seul.

**Animation :**
- Métriques : compteur animé au scroll (`count-up`) — les chiffres défilent de 0 à leur valeur finale sur `1.2s`
- Citation : fade-up `0.8s` avec léger scale `0.98 → 1.00`
- Headline : fade-up standard

**Responsive :**
- Mobile : métriques en grille 2×2 (2 colonnes)
- Tablet : métriques en ligne de 4, réduites

**CTA :** Lien texte discret "En savoir plus sur notre approche →" vers `/a-propos`

---

### SECTION 04 — AI Showcase

**Objectif :** Montrer concrètement ce qu'est un agent IA CA-TECH. Incarner l'expertise IA.

**Message :** "Voici un agent IA réel que nous avons construit. Voici ce qu'il fait."

**Contenu :**
- Eyebrow : `INTELLIGENCE ARTIFICIELLE`
- Headline : "Des agents IA qui travaillent pour vous. Pas à votre place."
- Description courte : "Loïc, notre premier agent, est disponible 24h/24. Il qualifie, diagnostique, propose. Voici comment il fonctionne."
- **Showcase interactif** : démonstration de l'interface Loïc (widget ou screenshot animé)
- Sous-liste des capacités en tags mono :
  ```
  [Qualification leads]  [Diagnostic IA]  [Génération devis]  [Rapport automatique]
  [RAG documentaire]  [Agents métier]  [Intégration CRM]  [LLM sur-mesure]
  ```

**Hiérarchie :**
```
EYEBROW
HEADLINE (40px)
DESCRIPTION
SHOWCASE VISUEL (interface Loïc ou agent)   ← pièce centrale, grande
TAGS CAPACITÉS (grille 4 colonnes)
```

**Layout : STICKY PANEL**
- La section utilise un **scroll-driven sticky** : le texte défile sur la gauche (col 1-5) pendant que l'interface agent reste fixe à droite (col 6-12) — inspire une lecture approfondie
- Desktop : `position: sticky`, `top: 64px` pour le panel visuel
- Fond : Canvas (#05101E) — retour au fond principal
- Panel visuel : `--surface-panel`, `border-radius: --radius-xl`, glow accent

**Visuel :**
- Vidéo `loic/loic-ia.mp4` (asset existant) OU screenshot animé de l'interface Loïc
- Simuler une conversation en boucle (texte qui apparaît progressivement)
- `border-radius: --radius-xl` (24px)

**Interaction :**
- Bouton "Essayer Loïc maintenant" → lance widget Loïc
- Tags : hover avec `background: rgba(53,155,217,0.15)`, `border: --border-accent`

**Animation :**
- Sticky panel : reste visible pendant 3× la hauteur de la section
- Texte gauche : fade-up au scroll standard
- Interface Loïc : typing animation sur le texte de conversation
- Tags : stagger d'entrée au scroll (`0.05s` par tag)

**Responsive :**
- Mobile : layout colonne unique — texte + vidéo en dessous (no sticky), height auto
- Tablet : side-by-side mais no sticky, défilement normal

**CTA :** "Essayer Loïc" (primaire) + "Voir tous nos agents IA →" (lien texte vers `/services/ia`)

---

### SECTION 05 — Automation Showcase

**Objectif :** Rendre visible un workflow d'automatisation complexe. Démontrer l'impact concret.

**Message :** "Un workflow automatisé qui remplace 10 heures de travail manuel par semaine."

**Contenu :**
- Eyebrow : `AUTOMATISATION`
- Headline : "Vos process s'exécutent. Vous vous concentrez sur l'essentiel."
- Description : exemple concret (lead → qualification → devis → relance → facturation)
- **Diagramme de workflow animé** : nœuds et connexions (type n8n/Make visuel)
- Résultat chiffré : "10h économisées / semaine en moyenne"
- Tags outils : `[n8n]  [Make]  [Zapier]  [Scripts Node]  [Python]  [APIs]`

**Hiérarchie :**
```
EYEBROW · HEADLINE · DESCRIPTION
──────────────────────────────────
DIAGRAMME WORKFLOW ANIMÉ (pleine largeur, ~500px height)
──────────────────────────────────
[RÉSULTAT CHIFFRÉ] + [TAGS OUTILS]
```

**Layout : FULL-WIDTH VISUAL**
- Fond : `--surface-panel` (#102740) avec ligne de séparation gradient vers bas
- Le diagramme occupe **toute la largeur de la section** (max 1440px)
- Le texte est positionné **au-dessus** du diagramme, max-width 720px, centré
- Résultat et tags en **dessous** du diagramme, 2 colonnes

**Visuel :**
- Utiliser la vidéo `public/automatisations/Automatisations.mp4` (asset existant) dans un showcase browser-frame
- Alternativement : SVG animé représentant un workflow en nœuds connectés (Trigger → Email → CRM → Slack → Facture)
- Icônes des outils : gmail.webp, slack.webp, whatsapp.webp, google-calendar.webp (tous disponibles dans `public/automatisations/`)

**Interaction :**
- Nœuds du workflow : hover → `border-color: --border-accent-strong`, tooltip avec nom du nœud
- Connexions : animation de flux (particule qui se déplace le long du chemin) — SVG stroke-dashoffset animation

**Animation :**
- Workflow révélé nœud par nœud au scroll (IntersectionObserver)
- Connexions : tracées progressivement (SVG `stroke-dashoffset`)
- Résultats : compteur animé

**Responsive :**
- Mobile : diagramme en format réduit, scrollable horizontalement avec `overflow-x: auto`
- Tablet : diagramme complet en mode portrait réduit

**CTA :** "Voir une démo d'automatisation" (vers `/services/automatisation`) ou vidéo modal

---

### SECTION 06 — LLM / Agents / MCP

**Objectif :** Positionner CA-TECH sur le segment LLM et MCP — crédibilité technique avancée.

**Message :** "Nous maîtrisons les LLM, les architectures d'agents, et les protocoles MCP. Ce n'est pas de la vulgarisation."

**Contenu :**
- Eyebrow : `LLM · AGENTS · MCP`
- Headline : très grande, éditoriale : **"Des systèmes qui pensent, connectés à vos outils."**
- Sous-texte : "Nous concevons des architectures IA sur-mesure : RAG, chaînes d'agents, protocoles MCP, mémoire longue terme, routage contextuel."
- **3 blocs techniques** (sans cards — layout éditorial) :
  ```
  01. LLM sur-mesure        Fine-tuning, RAG, prompt engineering, évaluation
  02. Architectures agents   Multi-agents, mémoire, routage, orchestration
  03. Protocoles MCP         Context servers, tool-calling, intégrations systems
  ```
- Références technologiques en tags mono : `[OpenAI]  [Anthropic]  [Llama]  [LangChain]  [Supabase]`

**Hiérarchie :**
```
EYEBROW (mono, accent)
HEADLINE (64px, très grand, centré)
SOUS-TEXTE (18px, centré, max-width 640px)
───────────────────────────────────────────
[01 — bloc]     [02 — bloc]     [03 — bloc]   ← 3 colonnes, no card border
───────────────────────────────────────────
TAGS TECHNOS (centré, grille compacte)
```

**Layout : LARGE TYPOGRAPHY — éditorial centré**
- Fond : Canvas (#05101E) avec **glow radial en haut** (`radial-gradient(ellipse at 50% 0%, rgba(53,155,217,0.10), transparent 60%)`)
- Tout est centré — c'est la seule section à alignement centré
- Les 3 blocs : pas de border, pas de card — juste numéro en mono accent, titre display-sm, description body
- Séparation verticale par ligne fine `--border-subtle` entre les 3 blocs

**Interaction :**
- Les 3 blocs : hover → `background: rgba(16,39,64,0.6)`, `border-radius: --radius-md`, transition douce
- Tags : non-interactifs

**Animation :**
- Headline : **word-by-word reveal** — chaque mot entre avec `y: 20, opacity: 0`, stagger `0.04s`
- 3 blocs : entrée staggerée depuis le bas
- Glow : légère pulsation CSS `opacity: 0.6 ↔ 1.0` sur 4s (subtle, ne distrait pas)

**Responsive :**
- Mobile : blocs en colonne unique, headline 40px, centré
- Tablet : 3 colonnes conservées, taille réduite

**CTA :** Lien texte "Voir notre expertise IA →" vers `/services/ia`

---

### SECTION 07 — Digital Experiences

**Objectif :** Montrer la qualité des réalisations web — sites, apps, landing pages. Prouver par l'exemple.

**Message :** "Chaque interface que nous livrons est un produit de niveau Stripe / Vercel / Linear."

**Contenu :**
- Eyebrow : `DIGITAL EXPERIENCES`
- Headline : "Des interfaces qui convertissent. Des produits qui durent."
- 4 projets en preview horizontal : Manager, CV Magic, Pasmal, Pemous Money
- Chaque preview : image + nom projet + type + tag technologies

**Hiérarchie :**
```
EYEBROW · HEADLINE (gauche, pas centré)
──────────────────────────────────────
[CAROUSEL HORIZONTAL — 4 projets]
──────────────────────────────────────
Dots navigation + "Voir tous les projets →"
```

**Layout : HORIZONTAL SHOWCASE (scroll/carousel)**
- Fond : `--surface-panel` (#102740)
- Headline alignée à **gauche** (contrast avec section 06 centrée)
- Showcase : **carousel horizontal** avec 1.5 cartes visibles sur desktop (peek du suivant)
- Sur desktop wide : jusqu'à 2.5 cartes visibles
- Cards : `width: 480px`, `height: 320px`, `border-radius: --radius-lg` (16px)

**Visuel (assets disponibles) :**
```
Projet 1 — CA-TECH Manager    portfolio/ca-tech-manager/dashboard.webp
Projet 2 — CV Magic           portfolio/cv-magic/home.webp
Projet 3 — Pasmal             portfolio/pasmal/home.webp
Projet 4 — Pemous Money       portfolio/pemous-money/home.webp
```

**Interaction :**
- Drag horizontal (cursor grab/grabbing)
- Swipe mobile (touch events)
- Click sur une card → `/projets/[slug]`
- Navigation dots en dessous

**Animation :**
- Entrée : les cards arrivent depuis la droite (fade + translateX) au scroll
- Hover sur card : `scale(1.02)`, `box-shadow` accrue, overlay dark diminue
- Drag : momentum fluide

**Responsive :**
- Mobile : 1 carte pleine largeur, swipe
- Tablet : 1.5 cartes, swipe

**CTA :** "Voir tous les projets →" → `/projets`

---

### SECTION 08 — Systems / Infrastructure

**Objectif :** Légitimer CA-TECH sur l'infrastructure, le cloud, la data, la sécurité.

**Message :** "Nous construisons des systèmes robustes, pas des démos. Scalables, sécurisés, monitorés."

**Contenu :**
- Eyebrow : `SYSTÈMES · INFRASTRUCTURE · DATA`
- Headline : "L'architecture qui supporte votre croissance."
- Description : "De l'API au cloud, du pipeline data à la cybersécurité — nous concevons des systèmes qui tiennent quand ça compte."
- **Grille de domaines** — 6 domaines en composition technique :
  ```
  Cloud & Hébergement    Data & Pipelines
  APIs & Intégrations    Cybersécurité
  Monitoring             Scalabilité
  ```
- Stack technique : `[Vercel]  [Supabase]  [Node.js]  [Python]  [PostgreSQL]  [React]`

**Hiérarchie :**
```
(fond pleine largeur dark intense)
EYEBROW · HEADLINE · DESCRIPTION (texte à gauche, max-width col 1-7)
────────────────────────────────────────────
GRILLE 2×3 de domaines (pleine largeur col 1-12)
────────────────────────────────────────────
TAGS STACK (pleine largeur)
```

**Layout : DARK BAND — composition asymétrique**
- Fond : `#05101E` avec **texture grid subtile** : `background-image: linear-gradient(rgba(53,155,217,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(53,155,217,0.04) 1px, transparent 1px)`, `background-size: 40px 40px`
- Texte à gauche, grille occupe toute la largeur en dessous
- Domaines : pas de card — juste icône Lucide (24px, couleur accent), titre, description courte
- Séparateurs entre domaines : `--border-subtle` seulement

**Interaction :**
- Domaines : hover → légère illumination de l'icône accent, fond subtil
- Tags stack : non-interactifs

**Animation :**
- Entrée headline : fade-up standard
- Grille de domaines : entrée staggerée en vague (de gauche à droite, puis ligne suivante)
- Grid background : parallax très léger au scroll (`background-position-y`)

**Responsive :**
- Mobile : domaines en colonne unique, pas de grid background
- Tablet : grille 2×3 ou 3×2 conservée

**CTA :** Lien texte "Infrastructure & Conseil →" vers `/services/developpement` ou contact

---

### SECTION 09 — Portfolio / Case Studies

**Objectif :** Prouver par des projets réels. Donner confiance. Montrer la diversité des missions.

**Message :** "Voici ce que nous avons livré. Avec les résultats mesurables."

**Contenu :**
- Eyebrow : `RÉALISATIONS`
- Headline : "Construit, livré, mesuré."
- **4 cas clients en grille éditoriale** — pas de cards uniformes :
  - Projet 1 grand (col 1-8) + Projet 2 petit (col 9-12) sur ligne 1
  - Projet 3 petit (col 1-4) + Projet 4 grand (col 5-12) sur ligne 2
- Chaque projet : image, nom, tag type, 1 métrique business

**Structure d'un cas client :**
```
[Image projet — border-radius: --radius-lg]
[Tag : type de mission — pill accent]
[Nom du projet — heading-sm]
[Métrique : ex. "+180% trafic organique"]
[Lien "Voir le projet →"]
```

**Layout : GRILLE ÉDITORIALE ASYMÉTRIQUE**
- Fond : `--surface-panel` (#102740) — même fond que la section précédente (continuité)
- Alternance de tailles — crée du rythme visuel sans répétition
- La grille est à **largeur complète** (1200px), pas de padding central excessif
- Les images ne sont pas dans des cards — elles posent directement sur le fond

**Visuel (assets réels) :**
```
CA-TECH Manager  portfolio/ca-tech-manager/dashboard.webp   Type : App SaaS
CV Magic         portfolio/cv-magic/home.webp                Type : Web App
Pasmal           portfolio/pasmal/dashboard.webp             Type : Dashboard
Pemous Money     portfolio/pemous-money/home.webp            Type : Finance App
```

**Interaction :**
- Hover sur image → overlay accent `rgba(53,155,217,0.08)`, `scale(1.02)`, lien visible
- Click → `/projets/[slug]`

**Animation :**
- Entrée en vague : projet par projet, `y: 40 → 0`, stagger `0.1s`
- Images : entrance `scale: 0.98 → 1.00`

**Responsive :**
- Mobile : 1 colonne, tous les projets en pleine largeur
- Tablet : 2 colonnes uniformes

**CTA :** "Voir tous les projets" → `/projets`

---

### SECTION 10 — Process

**Objectif :** Rassurer le prospect sur le déroulé d'une mission. Réduire la friction.

**Message :** "Voici exactement comment ça se passe, de la première conversation à la livraison."

**Contenu :**
- Eyebrow : `NOTRE MÉTHODE`
- Headline : "Un process clair. Des jalons tenus."
- **6 étapes numérotées** (basé sur PROCESS/ existant) :
  ```
  01. Diagnostic     Audit IA / Automatisation / SEO (1 semaine)
  02. Stratégie      Roadmap priorisée, forfait défini, jalons clairs
  03. Sprint 1       Premier livrable "wow" livré en Semaine 1
  04. Exécution      Développement itératif, démos régulières
  05. Validation     Tests, ajustements, approbation
  06. Livraison      Mise en ligne + formation + documentation
  ```

**Hiérarchie :**
```
EYEBROW · HEADLINE (gauche)
──────────────────────────────────────
LIGNE HORIZONTALE avec 6 étapes numérotées
──────────────────────────────────────
[Durée indicative : "4 à 8 semaines selon la mission"]
CTA "Démarrer un diagnostic"
```

**Layout : TIMELINE HORIZONTALE**
- Fond : Canvas (#05101E) — retour au fond principal
- Étapes sur une ligne horizontale connectée par un trait `--border-subtle`
- Chaque étape : cercle numéro (mono accent), titre, description courte en dessous
- Sur tablet/mobile : timeline devient **verticale**

**Interaction :**
- Hover sur étape : numéro devient plein (`background: --color-accent`), texte `--color-cool-white`
- Étape active (au scroll sticky optionnel)

**Animation :**
- La ligne de connexion se trace de gauche à droite au scroll (SVG stroke-dashoffset)
- Les étapes apparaissent l'une après l'autre avec stagger
- Quand l'étape entre dans le viewport : cercle numéro "pulse" une fois

**Responsive :**
- Mobile : timeline verticale, chaque étape full-width
- Tablet : idem vertical ou horizontal condensé

**CTA :** "Démarrer un diagnostic gratuit avec Loïc" → widget Loïc

---

### SECTION 11 — Expertise

**Objectif :** Vue d'ensemble des 5 pôles d'expertise CA-TECH. Point d'entrée vers les pages services.

**Message :** "Cinq pôles d'expertise, une seule approche : livrer ce qui compte."

**Contenu :**
- Eyebrow : `EXPERTISES`
- Headline : "Tout ce qu'il faut pour construire et faire croître."
- **5 cartes de services** (une par pôle) :
  ```
  1. Intelligence Artificielle    Chatbots · Agents · LLM · MCP · RAG
  2. Automatisation               n8n · Make · Zapier · Scripts · Workflows
  3. Développement Web            Sites · Apps · SaaS · E-commerce · APIs
  4. SEO                          Audit · Piliers · Local · Contenu · Suivi
  5. Design & Identité            Logo · Charte · Flyer · Habillage digital
  ```

**Structure d'une carte expertise :**
```
[Icône Lucide — 32px — accent]
[Numéro — mono petit — silver]
[Titre — heading-sm — cool white]
[Description — body-sm — silver]
[Tags services — mono xs]
[Lien "En savoir plus →"]
```

**Layout : GRILLE 5 CARTES**
- Option retenue : **grille 3+2** (3 cartes en haut, 2 en bas, légèrement centrées)
- Fond : `--surface-panel` (#102740)
- Cards : `background: rgba(5,16,30,0.60)`, `border: --border-subtle`, `border-radius: --radius-md`
- Hover : `border-color: --border-accent`, `background: rgba(53,155,217,0.06)`

**Interaction :**
- Clic sur une carte → page service respective
- Hover : lift `translateY(-3px)`, border accent

**Animation :**
- Stagger d'entrée en grille : ligne 1 (cartes 1-3) puis ligne 2 (cartes 4-5)
- Délai stagger : `0.08s`

**Responsive :**
- Mobile : 1 colonne (5 cartes empilées)
- Tablet : 2 colonnes (3+2 conservé sur large tablet)

**CTA :** Chaque carte a son propre lien vers la page service

---

### SECTION 12 — CTA Final

**Objectif :** Convertir. C'est la dernière chance avant le footer.

**Message :** "Parlez à Loïc maintenant. Dans 10 minutes, vous saurez exactement ce que l'IA peut faire pour votre entreprise."

**Contenu :**
- Eyebrow : `COMMENÇONS`
- Headline grande : **"Prêt à transformer votre croissance ?"**
- Description : "Loïc, notre consultant IA, est disponible maintenant. Il analyse votre situation, identifie vos opportunités, et vous propose un plan d'action concret — en moins de 15 minutes."
- **Bouton unique** : `[Parler à Loïc — Gratuit]` (primaire, grand, `--btn-lg`)
- Ligne secondaire : "Ou [demandez un devis] directement." (liens texte)
- Badges de confiance : SIRET visible · Basé en France · Réponse < 24h

**Hiérarchie :**
```
EYEBROW
HEADLINE (48–56px, centré)
DESCRIPTION (centré, max-width 600px)
CTA UNIQUE (grand, centré)
LIGNE SECONDAIRE
BADGES
```

**Layout : SECTION ISOLÉE**
- Fond : **dégradé distinct** — `linear-gradient(135deg, #102740 0%, #05101E 50%, #1A4066 100%)` — crée une rupture visuelle claire
- Ou alternative : fond `--surface-panel` avec **glow accent fort** au centre
- Tout est centré
- Aucun élément visuel parasite — la section est épurée

**Interaction :**
- CTA unique : hover fort (scale + brightness), `transition: 0.2s`
- Click → lance widget Loïc OU → `/contact`

**Animation :**
- Entrée : le CTA fait une légère pulsation initiale (`scale: 1 → 1.02 → 1.00`) à l'entrée dans le viewport — une seule fois
- Headline : fade-up `0.8s`
- CTA : entrée avec `scale: 0.95 → 1.00`, après la headline

**Responsive :**
- Mobile : pleine largeur, bouton pleine largeur, headline 36px
- Idem tablet avec bouton centré

**CTA :** "Parler à Loïc — Gratuit" → widget Loïc | "Demander un devis" → `/devis`

---

### SECTION 13 — Footer

**Objectif :** Navigation secondaire, légal, contact, réseaux. Clôture l'expérience.

**Message :** Fiabilité. Localisation. Accessibilité.

**Contenu :**
- Bloc 1 — Identité : Logo CA-TECH + tagline + réseaux sociaux (LinkedIn, etc.)
- Bloc 2 — Expertises : liens vers les 5 services
- Bloc 3 — Navigation : Projets · À propos · Blog · Contact · Devis
- Bloc 4 — Légal : SIRET · Adresse · Mentions légales · Politique cookies · CGV
- Barre bottom : `© 2024 CA-TECH` · Mentions légales · Politique de confidentialité

**Layout :**
```
[Logo + tagline]    [Expertises]    [Navigation]    [Légal + contact]
────────────────────────────────────────────────────────────────────
© 2024 CA-TECH · Mentions légales · Politique de confidentialité
```

**Fond :** `#05101E`, `border-top: --border-subtle`  
**Colonnes :** 4 sur desktop, 2 sur tablet, 1 sur mobile  
**Liens :** `--text-body-sm`, `--color-silver`, hover `--color-cool-white`

**Interaction :** Liens standards. Réseaux sociaux → target blank.

**Animation :** Aucune. Le footer est statique.

**Responsive :** 4 → 2 → 1 colonnes

---

## 4. Architecture pages intérieures

### Page `/services/[expertise]` — structure type

```
01. Hero service          Headline + sous-headline + CTA + visuel
02. Promesse              Bénéfices clés (3 blocs "avant/après" ou "gain")
03. Ce qu'on livre        Détail des livrables et formats de mission
04. Preuves               Mini-portfolio (2-3 projets liés), chiffres
05. Process               Version condensée (4 étapes)
06. Tarifs / Formats      Grille de packages ou "à partir de"
07. FAQ                   6-10 questions spécifiques au service
08. CTA                   Loïc ou devis
09. Footer
```

### Page `/projets` — Portfolio hub

```
01. Hero                  "Tout ce que nous avons construit."
02. Filtres               Tous · IA · Automatisation · Web · Design
03. Grille projets        4 projets actuels + placeholder futurs
04. CTA                   "Discutons de votre projet"
```

### Page `/projets/[slug]` — Cas client

```
01. Hero                  Nom projet + image principale
02. Contexte              Client, secteur, problématique
03. Solution CA-TECH       Approche, stack, durée
04. Résultats             Métriques chiffrées
05. Visuels               Screenshots, vidéos
06. Stack technique       Tags
07. CTA                   "Un projet similaire ?"
```

### Page `/a-propos`

```
01. Hero éditorial        "Qui sommes-nous" — grande headline
02. Vision                Extrait STRATEGY.md §1
03. Loïc                  Présentation de l'agent IA principal
04. Positionnement        Le cabinet vs. les concurrents
05. Process               Méthode de travail
06. Valeurs               3-4 principes en éditorial
07. CTA                   Contact ou diagnostic
```

### Page `/contact`

```
01. Hero simple           "Parlons."
02. Widget Loïc           Premier point de contact
03. Formulaire            Nom, email, sujet, message (4 champs)
04. Infos pratiques       Email, LinkedIn, localisation
```

---

## 5. Actifs disponibles

### Vidéos

| Fichier | Usage suggéré |
|---------|---------------|
| `public/loic/loic-ia.mp4` | Section 04 AI Showcase — démo Loïc |
| `public/automatisations/Automatisations.mp4` | Section 05 Automation Showcase |
| `public/collaborateurs/Collaborateurs IA.mp4` | Section 11 Expertise ou page /services/ia |
| `public/hero-ca-tech.mp4` | Hero background optionnel (looping, muet) |

### Images portfolio

| Fichier | Projet | Section usage |
|---------|--------|---------------|
| `portfolio/ca-tech-manager/dashboard.webp` | Manager | Hero flottant (§02), Section 07, Section 09 |
| `portfolio/ca-tech-manager/clients.webp` | Manager | Section 09 |
| `portfolio/cv-magic/home.webp` | CV Magic | Section 07, 09 |
| `portfolio/pasmal/home.webp` | Pasmal | Section 07, 09 |
| `portfolio/pasmal/dashboard.webp` | Pasmal | Section 08, 09 |
| `portfolio/pemous-money/home.webp` | Pemous Money | Section 07, 09 |

### Images services

| Fichier | Usage suggéré |
|---------|---------------|
| `public/services/site-vitrine.webp` | Page /services/developpement |
| `public/services/ecommerce.webp` | Page /services/developpement |
| `public/services/logo-design.webp` | Page /services/design |
| `public/services/branding.webp` | Page /services/design |
| `public/services/flyer-design.webp` | Page /services/design |

### Icônes outils automatisation

Disponibles dans `public/automatisations/` :
`gmail.webp · slack.webp · whatsapp.webp · google-calendar.webp · telegram.webp · commercial-ia.webp`

### Logo CA-TECH

```
logos/logo-ca-tech-icon.svg     ← SVG vectoriel, usage principal
logos/logo-ca-tech-icon.png     ← Fallback PNG
assets/logos/logo-ca-tech.webp  ← WebP compressé
```

---

## 6. Éléments nécessitant des animations

### Animations critiques (bloquantes si absentes)

| Section | Animation | Implémentation |
|---------|-----------|----------------|
| S02 Hero | Stagger d'entrée des éléments texte + visuel | Framer Motion `staggerChildren` |
| S02 Hero | Float du visuel (up/down infini) | CSS `keyframes` ou Framer Motion `animate` |
| S04 AI Showcase | Sticky panel scroll-driven | CSS `position: sticky` |
| S05 Automation | Tracé des connexions workflow | SVG `stroke-dashoffset` |
| S10 Process | Tracé de la timeline | SVG `stroke-dashoffset` |
| S12 CTA | Pulsation initiale du bouton | Framer Motion `whileInView` one-shot |

### Animations secondaires (enrichissement)

| Section | Animation | Implémentation |
|---------|-----------|----------------|
| S03 Positionnement | Compteur animé des métriques | JS `count-up` library |
| S06 LLM/MCP | Word-by-word headline reveal | Framer Motion `variants` custom |
| S07 Showcase | Drag horizontal du carousel | Framer Motion `drag="x"` |
| S08 Infrastructure | Entrée staggerée des domaines | Framer Motion `staggerChildren` |
| S09 Portfolio | Hover lift sur images | CSS `transition: transform` |
| S11 Expertise | Hover lift sur cards | CSS `transition: transform` |

### Animations globales (toutes sections)

- Toutes les sections : **fade-up au scroll** (`y: 24 → 0, opacity: 0 → 1`) via `whileInView`
- `once: true`, `threshold: 0.1`
- Headlines : `y: 32`, corps : `y: 16` (atténuation proportionnelle à l'importance)

### Notes d'implémentation motion

```typescript
// Vérifier systématiquement avant toute animation
const shouldReduceMotion = useReducedMotion()

// Passer la valeur à tous les composants animés
const variants = shouldReduceMotion ? staticVariants : animatedVariants
```

---

## 7. Checklist implémentation

### Avant de coder chaque section

- [ ] Section correspond à la spec ci-dessus
- [ ] Layout différent de la section précédente (règle de diversité visuelle)
- [ ] Tokens DESIGN.md utilisés (pas de valeurs hardcodées)
- [ ] `prefers-reduced-motion` pris en compte
- [ ] Responsive mobile testé mentalement
- [ ] CTA présent si spécifié

### Avant mise en ligne

- [ ] Toutes les 13 sections présentes
- [ ] Loïc widget fonctionnel (S04, S10, S12)
- [ ] Assets portfolio chargés en lazy loading
- [ ] Vidéos : autoplay muted, loop, `playsInline`
- [ ] SEO : H1 unique, meta title/description, OG tags
- [ ] Accessibilité : focus visible, alt text, aria-labels
- [ ] Performance : LCP < 2.5s, CLS < 0.1
- [ ] Axeptio consent intégré (script existant dans index-src.html)
- [ ] JSON-LD Organization + WebSite (existant dans index-src.html)
