# CA-TECH — Visual Direction
> Direction artistique détaillée — 13 sections de la homepage

**Version :** 1.0  
**Dépendances :** DESIGN.md v1.0 · INFORMATION-ARCHITECTURE.md · SHOWCASE-SYSTEM.md  
**Statut :** Source de vérité artistique — à respecter à l'implémentation

---

## Lecture de ce document

Chaque section est traitée comme une **scène autonome**. Elle a une personnalité, une tension visuelle, un rythme propre. La cohérence globale vient de la palette et des typographies — pas de la répétition de layout.

**Vocabulaire de notation :**
- `[BG]` = background
- `[TXT]` = couleur texte
- `[ACC]` = couleur accent
- `[TYPE-D]` = Space Grotesk (display)
- `[TYPE-B]` = Inter (body)
- `[TYPE-M]` = JetBrains Mono

---

---

## 01. NAVIGATION

### Identité visuelle

**Personnalité :** Invisible quand elle ne sert pas. Présente quand on en a besoin. Comme une surface de contrôle de cockpit — toujours là, discrète, fiable.

---

### Background & Couleur

**État initial (top de page, hero visible) :**
```
background: transparent
border-bottom: 1px solid transparent
```

**État scroll (dès 60px parcourus) :**
```
background: rgba(5, 16, 30, 0.82)
backdrop-filter: blur(24px) saturate(1.5)
-webkit-backdrop-filter: blur(24px) saturate(1.5)
border-bottom: 1px solid rgba(165, 172, 181, 0.10)
```

La transition entre les deux états dure `0.4s ease`. L'effet est subtil — la nav ne "pop" pas, elle se révèle progressivement comme si la fumée se dissipait.

---

### Typographie

```
[TYPE-B] · font-size: 13px · font-weight: 500
letter-spacing: 0.01em
color: #A5ACB5 (silver)

Hover: color: #F2F4F6 (cool white)
Actif: color: #F2F4F6 · underline 2px solid #359BD9 under item
```

Logo : utiliser `logos/logo-ca-tech-icon.svg` — aucune retouche CSS.

CTA "Parler à Loïc" : bouton primaire sm, `padding: 8px 16px`, `font-size: 12px`.

---

### Composition

```
[NAV — height: 64px — position fixed — z-index 100]

← Logo (28px height)    Expertises · Solutions · Réalisations · À propos    [Parler à Loïc] →
```

Gap entre items nav : `32px`.
Gap logo → items : `auto` (flex justify-between).
CTA à droite, jamais masqué avant 480px.

---

### Éléments secondaires

- Indicateur de page active : `2px` de hauteur, couleur `#359BD9`, aligné en bas de l'item, `width: auto`, `border-radius: 1px`
- Sur desktop, hover sur item : couleur change, pas de box, pas d'underline standard
- Aucune ombre sur la nav

---

### Animation

**Apparition initiale (chargement de page) :**
```
opacity: 0 → 1
y: -8 → 0
duration: 0.5s · ease: [0.16, 1, 0.3, 1]
delay: 0.1s
```

**Transition état scroll :** CSS `transition` uniquement (pas Framer Motion).

---

### Transition vers HERO

La nav est transparente sur le hero — le hero est donc visuellement pleine hauteur. La séparation n'est pas physique, elle est contextuelle (le hero a son propre fond profond).

---

---

## 02. HERO

### Identité visuelle

**Personnalité :** Un espace de commande. Sombre, précis, habité. On entre dans le système CA-TECH comme dans une salle de contrôle — tout est là, structuré, maîtrisé. L'IA n'est pas une promesse vague, elle est visible, elle tourne.

---

### Background

```
background: #05101E
```

**Couche 1 — Radial glow accent (haut-droite, côté interface) :**
```
position: absolute, top: -10%, right: -5%
background: radial-gradient(ellipse 70% 60%, rgba(53, 155, 217, 0.12) 0%, transparent 70%)
pointer-events: none · z-index: 0
```

**Couche 2 — Texture de bruit subtile (optionnel, performance permise) :**
Grain SVG `<feTurbulence>` en overlay à `opacity: 0.025` — crée une profondeur matérielle sans alourdir.

**Aucun dégradé violet. Aucun blob. Aucun effet générique startup.**

---

### Couleurs

```
Fond:               #05101E
Headline:           #F2F4F6 (cool white)
Sous-headline:      #A5ACB5 (silver)
Eyebrow:            #359BD9 (accent)
Bouton primaire:    fond #359BD9 · texte #FFFFFF
Bouton secondaire:  transparent · border #359BD9 · texte #359BD9
```

---

### Typographie

**Eyebrow :**
```
[TYPE-M] · 11px · 600 · letter-spacing: 0.14em · UPPERCASE
color: #359BD9
margin-bottom: 24px
```

**Headline H1 :**
```
[TYPE-D] · 80px · 700 · line-height: 1.0 · letter-spacing: -0.04em
color: #F2F4F6
max-width: 580px

Mobile: 40px
Tablet: 56px
Desktop: 80px
Wide: 88px
```

**Sous-headline :**
```
[TYPE-B] · 20px · 400 · line-height: 1.55 · letter-spacing: 0em
color: #A5ACB5
max-width: 480px
margin-top: 20px
```

---

### Composition

Layout : **Split asymétrique 55% texte / 45% visuel**

```
┌──────────────────────────────────────────────────────────┐
│  NAV (transparent)                                       │
├──────────────────────────────────────────────────────────┤
│                                         ╔══════════════╗ │
│  DIGITAL INTELLIGENCE STUDIO            ║              ║ │
│                                         ║  [INTERFACE  ║ │
│  L'IA qui transforme                    ║   MANAGER /  ║ │
│  votre croissance.                      ║   LOÏC]      ║ │
│                                         ║              ║ │
│  Le cabinet de conseil qui conçoit      ║              ║ │
│  et déploie l'IA pour les entreprises   ╚══════════════╝ │
│  qui veulent aller plus vite.                            │
│                                                          │
│  [Démarrer avec Loïc]  [Voir nos réalisations]          │
│                                                          │
│                            ↓                            │
└──────────────────────────────────────────────────────────┘
```

La zone texte est alignée **verticalement au centre** de la hauteur viewport (pas en haut).  
Le visuel flottant est légèrement décalé vers le **haut** (`top: -24px` relatif au centre).

---

### Visuel principal

**Source :** `portfolio/ca-tech-manager/dashboard.webp` — interface la plus representatif de CA-TECH comme produit

**Traitement :**
```
border-radius: 20px
box-shadow:
  0 40px 100px rgba(0, 0, 0, 0.55),
  0  0   80px rgba(53, 155, 217, 0.10)

width: 100% de sa colonne · max-width: 620px
aspect-ratio: 16/10
object-fit: cover
```

**Effet de profondeur :** légère perspective CSS `rotateY(-4deg) rotateX(2deg)` — donne une impression de 3D sans être agressive. Sur hover : revient à `rotateY(0deg)` en `0.6s ease`.

**Frame navigateur au-dessus (optionnel) :**
```
Barre 28px hauteur
Fond: rgba(255,255,255,0.04)
Dots: 3 cercles de 8px (blanc 20% opacité)
URL bar: text #A5ACB5 · font-size: 11px · [TYPE-M]
```

---

### Éléments secondaires

**Badge flottant — "Loïc est disponible" :**
```
Position: absolute · bottom: 24px · left: 24px (sur le visuel)
background: rgba(16, 39, 64, 0.90)
border: 1px solid rgba(53, 155, 217, 0.30)
border-radius: 8px
padding: 10px 14px
backdrop-filter: blur(8px)
```
Contenu :
```
[POINT VERT pulsant]  "Loïc est disponible"
[TYPE-B] · 12px · 500 · #F2F4F6
```

**Indicateur de scroll (bas du hero) :**
```
Position: absolute · bottom: 32px · left: 50% · transform: translateX(-50%)
Flèche chevron-down · stroke #A5ACB5 · 20px
Animation: bounce léger · y: 0 → 6 → 0 · 2s · ease-in-out · infini
```

---

### Animation

**Stagger d'entrée (après chargement page) :**
```
Eyebrow:      delay 0.1s · fadeUp y:16
Headline:     delay 0.2s · fadeUp y:32 · duration 0.8s
Sous-headline:delay 0.35s · fadeUp y:20
Boutons:      delay 0.48s · fadeUp y:16
Visuel:       delay 0.3s · fadeIn + scaleReveal 0.97→1 · duration 0.9s
Badge:        delay 0.7s · popIn
```

**Float infini du visuel :**
```
y: 0 → -10 → 0 · duration 7s · ease-in-out · infini
```

---

### Interaction

- `[Démarrer avec Loïc]` : hover `background: #4AAEE0 · y: -1px`
- `[Voir nos réalisations]` : hover `border-color: #4AAEE0`
- Visuel : hover `rotateY(-4deg) → 0deg` + scale légère
- Badge : hover `border-color: rgba(53,155,217,0.60)`

---

### Transition vers POSITIONNEMENT

Le hero s'arrête net — pas de fade. La section suivante (`#102740`) commence immédiatement, créant un **contraste de fond** net. Ce changement de fond est la "ponctuation" entre les deux sections.

---

---

## 03. POSITIONNEMENT

### Identité visuelle

**Personnalité :** La pause éditoriale. Après l'impact visuel du hero, cette section parle directement au dirigeant. Pas d'interface, pas de démo — juste des mots précis et des chiffres vrais. Comme la double page d'ouverture d'un rapport annuel de McKinsey.

---

### Background

```
background: #102740   ← Surface Panel
```

Aucune texture, aucun dégradé. Le changement de fond seul (`#05101E` → `#102740`) crée la séparation. C'est voulu — sobre, net, confidentiel.

**Ligne de séparation :** aucune. Le changement de fond suffit.

---

### Couleurs

```
Fond:           #102740
Eyebrow:        #359BD9
Headline:       #F2F4F6
Corps:          #A5ACB5
Chiffres mono:  #F2F4F6
Labels mono:    #A5ACB5 · opacity 0.7
Séparateur:     rgba(165, 172, 181, 0.12)
Citation:       #F2F4F6 · opacity 0.85
```

---

### Typographie

**Eyebrow :**
```
[TYPE-M] · 11px · 600 · UPPERCASE · letter-spacing: 0.14em · #359BD9
```

**Headline :**
```
[TYPE-D] · 48px · 600 · line-height: 1.1 · letter-spacing: -0.02em · #F2F4F6
max-width: 640px

Mobile: 32px
Tablet: 40px
```

**Corps :**
```
[TYPE-B] · 18px · 400 · line-height: 1.65 · #A5ACB5
max-width: 560px
```

**Chiffres métriques :**
```
[TYPE-M] · 40px · 600 · #F2F4F6
(les "valeurs" uniquement — le label en TYPE-B 13px)
```

**Citation éditoriale :**
```
[TYPE-D] · 32px · 400 · italic · line-height: 1.3
color: #F2F4F6 · opacity: 0.80
max-width: 800px · text-align: center
```

---

### Composition

Layout en **3 bandes horizontales** :

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  BANDE 1 — TEXTE                                        │
│  ┌──────────────────────┐  ┌──────────────────────┐     │
│  │ Eyebrow              │  │                      │     │
│  │ Headline (col 1-7)   │  │  (espace droit vide  │     │
│  │ Corps (col 1-6)      │  │   — respiration)     │     │
│  └──────────────────────┘  └──────────────────────┘     │
│                                                         │
│  ─ ─ ─ ─ ─ SÉPARATEUR border-subtle ─ ─ ─ ─ ─          │
│                                                         │
│  BANDE 2 — MÉTRIQUES                                    │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐         │
│  │  48h   │  │   4    │  │ 2023   │  │ <1sem  │         │
│  │ label  │  │ label  │  │ label  │  │ label  │         │
│  └────────┘  └────────┘  └────────┘  └────────┘         │
│                                                         │
│  ─ ─ ─ ─ ─ SÉPARATEUR border-subtle ─ ─ ─ ─ ─          │
│                                                         │
│  BANDE 3 — CITATION                                     │
│  "Pas une agence. Un cabinet qui exécute."              │
│  (centré · grande · italique)                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

Le texte de la bande 1 est **aligné à gauche**, jamais centré — ancrage éditorial fort.

---

### Visuel principal

**Aucun visuel illustratif.** La typographie EST le visuel. La section repose entièrement sur les mots et les chiffres — c'est son identité distinctive.

---

### Éléments secondaires

**Métriques :** chaque métrique est une micro-composition autonome :
```
[CHIFFRE — TYPE-M · 40px · #F2F4F6]
[LABEL — TYPE-B · 13px · #A5ACB5]
```
Séparées par `1px solid rgba(165,172,181,0.12)` vertical.

**Citation :** centrée, précédée d'un `—` em-dash en `#359BD9`. Seul élément centré de la section.

---

### Animation

**Bande 1 (texte) :**
```
Eyebrow:  fadeUp y:12 · delay 0s · 0.5s
Headline: fadeUp y:24 · delay 0.1s · 0.7s
Corps:    fadeUp y:16 · delay 0.2s · 0.6s
```

**Bande 2 (métriques) :**
```
Séparateur: width: 0% → 100% · delay 0.3s · 0.8s (ligne se trace)
Chaque métrique: fadeUp y:16 · stagger 0.08s
Chiffres: count-up de 0 à valeur finale · 1.2s · delay 0.5s
```

**Bande 3 (citation) :**
```
fadeIn · scale: 0.98 → 1.00 · delay 0.6s · 0.9s
```

---

### Transition vers AI SHOWCASE

Le fond revient à `#05101E` (Canvas) — contraste inverse du précédent. Le passage `#102740` → `#05101E` est net, sans fondu. La prochaine section est plus profonde, plus immersive.

---

---

## 04. AI SHOWCASE

### Identité visuelle

**Personnalité :** Une fenêtre ouverte sur un système en fonctionnement. Le visiteur n'est plus spectateur — il est observateur d'une interface réelle. Comme regarder par le hublot d'une salle de serveurs allumée la nuit.

---

### Background

**Section wrapper :**
```
background: #05101E
```

**Panel sticky (droite) — le showcase visuel :**
```
background: #102740
border-radius: 20px
border: 1px solid rgba(165, 172, 181, 0.12)
box-shadow:
  0 32px 80px rgba(0, 0, 0, 0.45),
  0  0   60px rgba(53, 155, 217, 0.08)
```

---

### Couleurs

```
Fond section:     #05101E
Fond panel:       #102740
Fond interface:   #05101E (interface Loïc sur fond encore plus sombre)
Glow:             rgba(53, 155, 217, 0.08)
Texte slide:      #F2F4F6
Texte secondaire: #A5ACB5
Label slide:      #359BD9 · TYPE-M
Interface:        couleurs de l'interface Loïc réelle
```

---

### Typographie

**Label slide :**
```
[TYPE-M] · 11px · 600 · UPPERCASE · letter-spacing: 0.14em · #359BD9
```

**Titre slide :**
```
[TYPE-D] · 32px · 600 · line-height: 1.2 · #F2F4F6
```

**Description slide :**
```
[TYPE-B] · 16px · 400 · line-height: 1.6 · #A5ACB5
max-width: 380px
```

**Numérotation :**
```
[TYPE-M] · 80px · 700 · #1A4066 (très atténué — déco)
position absolute · top: -20px · left: -10px
```

---

### Composition

Layout : **Sticky Split**

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  ┌──────────────────────┐  ┌──────────────────────────┐  │
│  │                      │  │                          │  │
│  │  [TEXTE SCROLLABLE]  │  │   [INTERFACE STICKY]     │  │
│  │                      │  │                          │  │
│  │  01 — Agent IA       │  │  ┌──────────────────────┐│  │
│  │  Le premier          │  │  │ ● ● ●  loic.ca-tech  ││  │
│  │  consultant IA       │  │  ├──────────────────────┤│  │
│  │  disponible 24h/24   │  │  │                      ││  │
│  │                      │  │  │  [INTERFACE LOÏC]    ││  │
│  │  ─ · ─               │  │  │                      ││  │
│  │  (scroll →)          │  │  │                      ││  │
│  │  02 — Diagnostic     │  │  │                      ││  │
│  │                      │  │  └──────────────────────┘│  │
│  │  (scroll →)          │  │                          │  │
│  │  03 — Rapport        │  │  [dots pagination]       │  │
│  │                      │  │                          │  │
│  └──────────────────────┘  └──────────────────────────┘  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

La hauteur totale du wrapper = `3 × 100vh` (un viewport par slide de contenu à gauche).  
Le panel droit est `position: sticky, top: 64px` — reste visible pendant tout le scroll.

**Colonne gauche :** `col 1–5`, `padding-top: 120px`  
**Colonne droite :** `col 6–12`, interface sticky

---

### Visuel principal

**Vidéo ou interface :** `public/loic/loic-ia.mp4` (si perf OK) — sinon screenshot animé.

**Frame navigateur :**
```
height: 28px
border-radius: 20px 20px 0 0
background: rgba(255,255,255,0.04)
dots: 3 × 8px · rgba(255,255,255,0.20)
URL bar: "loic.ca-tech.fr" · TYPE-M · 11px · #A5ACB5
```

**Typing animation** visible dans l'interface (voir MOTION-SYSTEM.md §8).

---

### Éléments secondaires

**Numéros décoratifs :** `01`, `02`, `03` en grand TYPE-M `80px` `#1A4066` (très atténués) — positionnés en absolu derrière chaque bloc texte. Ne gênent pas la lecture, ajoutent de la profondeur.

**Tags capacités IA** (en bas du dernier bloc texte) :
```
background: rgba(53, 155, 217, 0.10)
border: 1px solid rgba(53, 155, 217, 0.20)
border-radius: 4px
padding: 4px 10px
TYPE-M · 12px · #359BD9
```

---

### Animation

**Panel sticky :** entre au scroll avec `scaleReveal 0.97 → 1.00 · 0.8s`  
**Contenu texte :** chaque bloc : `fadeUp y:24 · whileInView · once`  
**Transition entre panels :** crossfade de l'interface (`opacity 0 → 1 · 0.5s`)  
**Typing Loïc :** déclenché quand le panel entre dans le viewport

---

### Interaction

- Flèche "slide suivant" sur le panel → avance le contenu gauche ET change le visuel
- Tags capacités : hover accent subtil
- Panel : hover `box-shadow` légèrement plus fort

---

### Transition vers AUTOMATISATION

Section suivante : `#102740`. Changement de fond `#05101E` → `#102740`. La section automation est plus "active", plus lumineuse — le passage de fond traduit ce changement d'énergie.

---

---

## 05. AUTOMATISATION

### Identité visuelle

**Personnalité :** Un réseau de connexions actif. La section doit sembler **en mouvement** — des données qui circulent, des processus qui s'exécutent. Moins intime que l'AI showcase, plus mécanique, plus puissant.

---

### Background

```
background: #102740
```

**Texture grille technique (très subtile) :**
```
background-image:
  linear-gradient(rgba(53, 155, 217, 0.04) 1px, transparent 1px),
  linear-gradient(90deg, rgba(53, 155, 217, 0.04) 1px, transparent 1px)
background-size: 48px 48px
```

---

### Couleurs

```
Fond:                #102740
Nœuds idle:          background rgba(5,16,30,0.80) · border rgba(165,172,181,0.20)
Nœuds trigger:       border rgba(53,155,217,0.50) · background rgba(53,155,217,0.10)
Nœuds actifs:        border #359BD9 · glow rgba(53,155,217,0.20)
Connexions:          stroke rgba(165,172,181,0.25)
Particules flux:     fill #359BD9
Headline:            #F2F4F6
Résultat chiffré:    #F2F4F6 · TYPE-M
Label résultat:      #A5ACB5
```

---

### Typographie

**Eyebrow :**
```
[TYPE-M] · 11px · 600 · UPPERCASE · letter-spacing: 0.14em · #359BD9
```

**Headline :**
```
[TYPE-D] · 48px · 600 · line-height: 1.08 · letter-spacing: -0.02em · #F2F4F6
text-align: center · max-width: 720px · margin: 0 auto
```

**Description :**
```
[TYPE-B] · 17px · 400 · line-height: 1.65 · #A5ACB5
text-align: center · max-width: 540px
```

**Résultat chiffré :**
```
[TYPE-M] · 28px · 600 · #F2F4F6
```

---

### Composition

Layout : **Colonne centrée + diagramme pleine largeur**

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│           EYEBROW                                       │
│     Headline centrée                                    │
│     Description centrée (max-width 540px)               │
│                                                         │
│  ───────────────────────────────────────────────────    │
│                                                         │
│  ╔═══════════════════════════════════════════════════╗  │
│  ║                                                   ║  │
│  ║     [DIAGRAMME WORKFLOW SVG — PLEINE LARGEUR]     ║  │
│  ║                                                   ║  │
│  ║   [TRIGGER] → [NŒUD] → [NŒUD] → [OUTPUT]         ║  │
│  ║                    ↘ [NŒUD]                       ║  │
│  ║                                                   ║  │
│  ╚═══════════════════════════════════════════════════╝  │
│                                                         │
│  ───────────────────────────────────────────────────    │
│                                                         │
│   [RÉSULTAT 1]   [RÉSULTAT 2]   [OUTILS ICONS × 5]    │
│                                                         │
│         [CTA → voir une démo d'automatisation]          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

Le diagramme workflow est le **cœur visuel**. Il occupe `100%` de la largeur interne, `min-height: 280px`.

---

### Visuel principal

**SVG animé de workflow** (pas de capture d'écran) — construit avec des `<rect>`, `<path>`, `<circle>` SVG.

Alternativement : `public/automatisations/Automatisations.mp4` dans un wrapper sans frame navigateur, fondu aux bords via masque CSS (`mask-image: linear-gradient`).

**Icônes d'outils** disponibles dans `public/automatisations/` :
- `gmail.webp`, `slack.webp`, `whatsapp.webp`, `google-calendar.webp`
- Rendu : `28px × 28px`, `border-radius: 6px`, légère ombre

---

### Éléments secondaires

**Slide selector (4 boutons de workflow) :**
```
position: above le diagramme · flex row · gap: 8px
Bouton inactif: background transparent · border border-subtle · TYPE-B 13px · silver
Bouton actif:   background rgba(53,155,217,0.15) · border border-accent · TYPE-B 13px · #F2F4F6
```

**Résultats en bas du diagramme :**
Deux colonnes simples — chiffre + label. Pas de card. Pas de border. Juste typographie.

---

### Animation

**Apparition section :** headline + description `staggerNormal · whileInView`  
**Diagramme :** chaque nœud entre l'un après l'autre (`stagger 0.12s`), puis les connexions se tracent (`SVG stroke-dashoffset · 1.5s`)  
**Particules de flux :** démarrent après les connexions tracées  
**Résultats :** `fadeUp + count-up · delay 1s`

---

### Interaction

- Boutons workflow : click → change le diagramme affiché (`crossfade 0.4s`)
- Nœuds : hover `border-color accent · glow subtil`
- Icônes outils : hover `scale(1.08)`

---

### Transition vers LLM/MCP

Section suivante : `#05101E` (Canvas) avec glow radial. Passage `#102740` → `#05101E` — retour au fond le plus profond pour accueillir la section la plus éditoriale (grande typographie).

---

---

## 06. LLM / MCP

### Identité visuelle

**Personnalité :** Une section qui assume l'expertise technique sans l'expliquer. Les mots sont grands, les structures sont architecturales. Elle parle aux interlocuteurs qui savent — et aux autres, elle impressionne par la précision. Comme la page de couverture d'un white paper Anthropic.

---

### Background

```
background: #05101E
```

**Glow radial fort — point focal en haut au centre :**
```
position: absolute · top: 0 · left: 50% · transform: translateX(-50%)
width: 100% · height: 400px
background: radial-gradient(ellipse 80% 100%, rgba(53, 155, 217, 0.13) 0%, transparent 70%)
pointer-events: none
```

Ce glow crée un **halo technique** au-dessus de la headline. Impression de lumière émise par le système lui-même.

---

### Couleurs

```
Fond:              #05101E
Glow:              rgba(53, 155, 217, 0.13)
Eyebrow:           #359BD9
Headline:          #F2F4F6
Sous-texte:        #A5ACB5
Numéros blocs:     #359BD9 · TYPE-M (01, 02, 03)
Titres blocs:      #F2F4F6
Description blocs: #A5ACB5
Séparateurs:       rgba(165, 172, 181, 0.10)
Tags techno:       background rgba(53,155,217,0.10) · border rgba(53,155,217,0.20) · #359BD9
```

---

### Typographie

**Eyebrow :**
```
[TYPE-M] · 11px · 600 · UPPERCASE · letter-spacing: 0.18em · #359BD9
text-align: center
```

**Headline — GRANDE, CENTRÉE :**
```
[TYPE-D] · 64px · 700 · line-height: 1.03 · letter-spacing: -0.035em · #F2F4F6
text-align: center · max-width: 900px

Mobile: 36px
Tablet: 48px
Desktop: 64px
```

**Sous-texte :**
```
[TYPE-B] · 18px · 400 · line-height: 1.6 · #A5ACB5
text-align: center · max-width: 580px
```

**Numéros blocs :**
```
[TYPE-M] · 13px · 600 · #359BD9 · UPPERCASE · letter-spacing: 0.12em
```

**Titres blocs :**
```
[TYPE-D] · 22px · 600 · #F2F4F6
```

**Description blocs :**
```
[TYPE-B] · 15px · 400 · line-height: 1.65 · #A5ACB5
```

---

### Composition

Layout : **Tout centré. Pas d'images. Texte architectural.**

```
┌─────────────────────────────────────────────────────────┐
│                 ↑ GLOW RADIAL                           │
│                                                         │
│              LLM · AGENTS · MCP                         │
│                                                         │
│    "Des systèmes qui pensent,                           │
│     connectés à vos outils."                            │
│                                                         │
│    Sous-texte centré max-width 580px                    │
│                                                         │
│  ─────────────────────────────────────────              │
│                                                         │
│  ┌─────────────────────┬──────────────────────┐         │
│  │  01 — LLM SUR-MESURE│  02 — ARCHITECTURES  │         │
│  │  Titre              │  Titre               │         │
│  │  Description        │  Description         │         │
│  ├─────────────────────┴──────────────────────┤         │
│  │         03 — PROTOCOLES MCP                │         │
│  │         Titre · Description                │         │
│  └────────────────────────────────────────────┘         │
│                                                         │
│      [OpenAI] [Anthropic] [Llama] [LangChain] [...]     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Les 3 blocs techniques n'ont pas de border.** Séparés uniquement par `1px solid rgba(165,172,181,0.10)` entre les colonnes. Impression de grille architecturale, pas de cards.

---

### Visuel principal

**La headline est le visuel.** `64px`, `font-weight: 700`, centrée — elle commande l'espace.

**Élément secondaire fort :** chiffre isolé en très grand en arrière-plan (décoratif, très atténué) :
```
"128k"
TYPE-M · 200px · font-weight: 700
color: rgba(26, 64, 102, 0.35)  ← #1A4066 très transparent
position: absolute · z-index: 0
pointer-events: none
```
Ce chiffre représente `128 000 tokens` de contexte — ancre technique subliminale.

---

### Animation

**Headline :** `word-by-word reveal` (voir MOTION-SYSTEM.md `headlineReveal`) — chaque mot entre depuis le bas, stagger `0.04s`  
**Glow :** légère pulsation `opacity: 0.13 → 0.18 → 0.13` · `6s · ease-in-out · infini`  
**Chiffre décoratif "128k" :** `fadeIn · delay 0.5s · opacity 0 → 0.35`  
**3 blocs :** `stagger 0.08s · fadeUp y:20`  
**Tags :** `stagger 0.05s · scaleReveal`

---

### Interaction

- 3 blocs : hover `background: rgba(16,39,64,0.60) · border-radius 10px · transition 0.2s`
- Tags : non-interactifs (labels seulement)

---

### Transition vers DIGITAL EXPERIENCE

Section suivante : `#102740`. Passage `#05101E` → `#102740`. La section digital experience est plus "produit", plus chaude — le fond plus clair traduit ce glissement vers le concret.

---

---

## 07. DIGITAL EXPERIENCES

### Identité visuelle

**Personnalité :** La vitrine. Après 3 sections techniques/conceptuelles, cette section montre **ce que CA-TECH produit visuellement**. Élégante, fluide, presque élégante comme une galerie d'art numérique. Le visiteur fait défiler des projets comme dans une exposition.

---

### Background

```
background: #102740
```

**Aucune texture.** Surface propre pour que les screenshots des projets respirent.

---

### Couleurs

```
Fond:            #102740
Headline:        #F2F4F6
Eyebrow:         #359BD9
Description:     #A5ACB5
Card fond:       #05101E
Card border:     rgba(165, 172, 181, 0.12)
Tag projet:      #359BD9 · background rgba(53,155,217,0.12) · border rgba(53,155,217,0.20)
Overlay hover:   rgba(5, 16, 30, 0.40)
```

---

### Typographie

**Eyebrow :**
```
[TYPE-M] · 11px · 600 · UPPERCASE · letter-spacing: 0.14em · #359BD9
```

**Headline :**
```
[TYPE-D] · 48px · 600 · line-height: 1.08 · letter-spacing: -0.02em · #F2F4F6
text-align: LEFT ← (contraste fort avec section 06 centrée)
```

**Description :**
```
[TYPE-B] · 17px · 400 · #A5ACB5
text-align: left · max-width: 480px
```

**Nom projet sur card :**
```
[TYPE-D] · 20px · 600 · #F2F4F6
```

**Type de mission sur card :**
```
[TYPE-M] · 12px · 500 · #359BD9 · background rgba(53,155,217,0.12)
border-radius: 4px · padding: 3px 8px
```

---

### Composition

Layout : **Header gauche + Carousel horizontal**

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  EYEBROW (gauche)                                       │
│  Headline — "Des interfaces qui                         │
│   convertissent." (gauche · 48px)                       │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  ←[CARD 1]──────[CARD 2]──────[CARD 3]──[CARD 4 peek]→ │
│                                                         │
│   ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│   │              │  │              │  │             │  │
│   │ [SCREENSHOT] │  │ [SCREENSHOT] │  │[SCREENSHOT] │  │
│   │              │  │              │  │             │  │
│   │ ─────────── │  │ ─────────── │  │            │  │
│   │ [Tag] Nom   │  │ [Tag] Nom   │  │            │  │
│   │ Description │  │ Description │  │            │  │
│   └──────────────┘  └──────────────┘  └─────────────┘  │
│                                                         │
│         ● ○ ○ ○   [Voir tous les projets →]            │
└─────────────────────────────────────────────────────────┘
```

**Card dimensions desktop :**
```
width: 460px · height: 320px
border-radius: 16px  ← --radius-lg
overflow: hidden
```

**Image :** `height: 220px`, `object-fit: cover`, `border-radius: 16px 16px 0 0`  
**Contenu bas :** `padding: 20px 24px`, fond `#05101E`

**Peek du suivant :** `15%` de la card suivante visible à droite

---

### Visuel principal

Carousel avec 4 projets réels :
```
Card 1: portfolio/ca-tech-manager/dashboard.webp
Card 2: portfolio/cv-magic/home.webp
Card 3: portfolio/pasmal/dashboard.webp
Card 4: portfolio/pemous-money/home.webp
```

---

### Éléments secondaires

**Overlay au hover sur screenshot :**
```
background: rgba(5, 16, 30, 0.40)
backdrop-filter: blur(2px)
display: flex · align-items: center · justify-content: center
```
Texte overlay : `"Voir le projet →"` · TYPE-B 14px · #F2F4F6

**Dots navigation :** pattern pill étendu (voir SHOWCASE-SYSTEM.md §3)

---

### Animation

**Header :** `stagger · eyebrow + headline + description · fadeUp`  
**Cards :** entrent depuis la droite (`slideFromRight · stagger 0.1s`) au scroll  
**Drag :** cursor `grab → grabbing` · momentum fluide  
**Hover screenshot :** overlay `opacity 0 → 1 · 0.25s` + scale image `1 → 1.04 · 0.4s`

---

### Interaction

- Drag horizontal (`Framer Motion drag="x"`)
- Swipe sur mobile
- Click card → `/projets/[slug]`
- Hover screenshot → overlay + texte "Voir le projet →"

---

### Transition vers SYSTEMS

Section suivante : `#05101E` avec texture grid. Passage `#102740` → `#05101E` + texture. Changement de registre : du showcase produit vers le schéma technique.

---

---

## 08. SYSTEMS / INFRASTRUCTURE

### Identité visuelle

**Personnalité :** Une salle des machines. Propre, précis, sans ornement. Comme l'interface de monitoring d'un data center — tout est utile, rien n'est superflu. La section rassure sur la robustesse technique de CA-TECH.

---

### Background

```
background: #05101E
```

**Texture pixel grid (plus visible que section 05) :**
```
background-image:
  linear-gradient(rgba(53, 155, 217, 0.05) 1px, transparent 1px),
  linear-gradient(90deg, rgba(53, 155, 217, 0.05) 1px, transparent 1px)
background-size: 40px 40px
```

**Le grid donne une impression de schéma technique** — comme du papier millimétré technique.

---

### Couleurs

```
Fond:            #05101E
Grid texture:    rgba(53, 155, 217, 0.05)
Eyebrow:         #359BD9
Headline:        #F2F4F6
Description:     #A5ACB5
Icônes domaines: #359BD9 (stroke icons Lucide)
Titres domaines: #F2F4F6
Desc domaines:   #A5ACB5
Séparateurs:     rgba(165, 172, 181, 0.08) ← encore plus subtils que d'habitude
Stack tags:      TYPE-M · #A5ACB5 · background rgba(165,172,181,0.08)
```

---

### Typographie

**Eyebrow :**
```
[TYPE-M] · 11px · 600 · UPPERCASE · letter-spacing: 0.14em · #359BD9
```

**Headline :**
```
[TYPE-D] · 44px · 600 · line-height: 1.1 · letter-spacing: -0.02em · #F2F4F6
text-align: LEFT · max-width: 560px
```

**Description :**
```
[TYPE-B] · 17px · 400 · line-height: 1.65 · #A5ACB5
max-width: 480px
```

**Titres domaines :**
```
[TYPE-B] · 16px · 600 · #F2F4F6
```

**Description domaines :**
```
[TYPE-B] · 14px · 400 · #A5ACB5 · line-height: 1.5
```

**Stack tags :**
```
[TYPE-M] · 12px · 500 · #A5ACB5
background: rgba(165, 172, 181, 0.08)
border-radius: 4px · padding: 4px 10px
```

---

### Composition

Layout : **Asymétrique — texte haut-gauche, grille pleine largeur**

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  EYEBROW (gauche)                                       │
│  Headline (col 1-7)             [ESPACE DROIT VIDE]     │
│  Description (col 1-6)                                  │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │ ☁ Cloud  │  │ ⚡ Data   │  │ 🔒 Sécu  │  │⚙ APIs │  │
│  │ Titre    │  │ Titre    │  │ Titre    │  │ Titre  │  │
│  │ Desc     │  │ Desc     │  │ Desc     │  │ Desc   │  │
│  ├──────────┤  ├──────────┤  ├──────────┤  ├────────┤  │
│  │ Monitor  │  │ Scale    │  │  (6e)    │  │       │  │
│  │ Titre    │  │ Titre    │  │  Titre   │  │       │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘  │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  [Vercel] [Supabase] [Node.js] [Python] [PostgreSQL]    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Grille domaines :** `grid-template-columns: repeat(4, 1fr)` desktop, `2×3` tablet

**Domaines :** pas de card avec background — juste icône + texte + séparateur `border-right: 1px solid rgba(165,172,181,0.08)` sauf dernier de chaque ligne.

---

### Éléments secondaires

**Icônes :** Lucide React, `28px`, `stroke-width: 1.5`, couleur `#359BD9`

**Stack tags :** en ligne, `flex wrap`, `gap: 8px`. Style "terminal" — TYPE-M.

**Parallax grid texture :** au scroll, `background-position-y` décalé de `10%` — subtil effet de profondeur.

---

### Animation

**Headline + description :** `staggerNormal · fadeUp`  
**Grille :** vague de gauche à droite (`getGridItemDelay(i, 4)` du MOTION-SYSTEM.md §12)  
**Stack tags :** `stagger 0.04s · scaleReveal`  
**Grid texture :** parallax `useScroll · useTransform · 10%` décalage

---

### Interaction

- Domaines : hover `background: rgba(16,39,64,0.60) · border-radius: 8px · transition 0.2s` (le fond "s'allume" sans border explicite)
- Stack tags : non-interactifs

---

### Transition vers PORTFOLIO

Section suivante : `#102740`. Passage `#05101E` grid texture → `#102740` propre. La grille technique disparaît, l'atmosphère s'assouplit pour accueillir les images de projets.

---

---

## 09. PORTFOLIO / CASE STUDIES

### Identité visuelle

**Personnalité :** Une galerie d'exposition. Les projets sont mis en valeur comme des œuvres — pas dans des frames identiques, mais dans des compositions asymétriques. Le visiteur "découvre" les projets en explorant la page.

---

### Background

```
background: #102740
```

Aucune texture — le fond lisse met en valeur les images.

---

### Couleurs

```
Fond:            #102740
Headline:        #F2F4F6
Eyebrow:         #359BD9
Tag projet:      TYPE-M · #359BD9 · background rgba(53,155,217,0.12)
Overlay hover:   rgba(16, 39, 64, 0.75)
Metric value:    #F2F4F6 · TYPE-M
Metric label:    #A5ACB5 · TYPE-B
Lien projet:     #359BD9
```

---

### Typographie

**Eyebrow :**
```
[TYPE-M] · 11px · 600 · UPPERCASE · letter-spacing: 0.14em · #359BD9
```

**Headline :**
```
[TYPE-D] · 52px · 600 · line-height: 1.07 · letter-spacing: -0.025em · #F2F4F6
text-align: left
```

**Nom projet :**
```
[TYPE-D] · 24px · 600 · #F2F4F6
```

**Métrique :**
```
[TYPE-M] · 22px · 600 · #F2F4F6
```

**Label métrique :**
```
[TYPE-B] · 13px · 400 · #A5ACB5
```

---

### Composition

Layout : **Grille éditoriale asymétrique — images sans card, posées sur le fond**

```
┌─────────────────────────────────────────────────────────┐
│  EYEBROW                                                │
│  Headline "Construit. Livré. Mesuré."                   │
│                                                         │
│  ┌────────────────────────────────────┐ ┌────────────┐  │
│  │                                    │ │            │  │
│  │         [PROJET 1 — LARGE]         │ │ [PROJET 2] │  │
│  │         border-radius 16px         │ │   petit    │  │
│  │         col 1–8                    │ │   col 9-12 │  │
│  │         aspect-ratio 16/9          │ │   4:5      │  │
│  └────────────────────────────────────┘ └────────────┘  │
│  [Tag] Nom projet 1 · Métrique          [Tag] Nom 2     │
│                                                         │
│  ┌────────────┐  ┌──────────────────────────────────┐   │
│  │            │  │                                  │   │
│  │ [PROJET 3] │  │      [PROJET 4 — LARGE]          │   │
│  │   petit    │  │      col 5–12 · aspect 16/9      │   │
│  │   col 1-4  │  │                                  │   │
│  │   4:5      │  │                                  │   │
│  └────────────┘  └──────────────────────────────────┘   │
│  [Tag] Nom 3      [Tag] Nom projet 4 · Métrique         │
│                                                         │
│                    [Voir tous les projets →]             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Aucune card border**, **aucun background autour des images** — elles posent directement sur `#102740`. Les `border-radius: 16px` des images créent la délimitation.

---

### Visuel principal

```
Projet 1 (large): portfolio/ca-tech-manager/dashboard.webp
Projet 2 (petit): portfolio/cv-magic/home.webp
Projet 3 (petit): portfolio/pasmal/home.webp
Projet 4 (large): portfolio/pemous-money/home.webp
```

---

### Éléments secondaires

**Overlay au hover :**
```
background: rgba(16, 39, 64, 0.75)
border-radius: 16px (hérite de l'image)
flex column · justify-content: flex-end · padding: 28px
```

Contenu overlay :
```
[Tag projet]
[Nom projet — TYPE-D 22px]
[Métrique — TYPE-M 20px #F2F4F6]
[Voir le projet → TYPE-B 14px #359BD9]
```

**Numéros de projet** (optionnel — décoratif) : `01`, `02` en `TYPE-M · 11px · #A5ACB5 · opacity 0.5` au-dessus des images.

---

### Animation

**Headline :** `fadeUp y:24 · 0.7s`  
**Images :** `stagger 0.1s · scaleReveal 0.97→1 · 0.6s · whileInView`  
**Overlay hover :** `opacity 0 → 1 · 0.25s` + image `scale 1 → 1.04 · 0.4s`

---

### Interaction

- Hover image → overlay avec infos projet
- Click → `/projets/[slug]`
- CTA "Voir tous les projets" → `/projets`

---

### Transition vers PROCESS

Section suivante : `#05101E`. Passage `#102740` → `#05101E`. Retour au fond le plus profond pour la section process — plus sereine, plus narrative.

---

---

## 10. PROCESS

### Identité visuelle

**Personnalité :** La transparence. Cette section rassure en montrant comment fonctionne CA-TECH — pas de magie, pas de boîte noire. Un process clair, numéroté, horloge en main. Comme le planning d'un architecte affiché dans une agence premium.

---

### Background

```
background: #05101E
```

**Ligne centrale de la timeline :** seul élément graphique de la section.

---

### Couleurs

```
Fond:              #05101E
Eyebrow:           #359BD9
Headline:          #F2F4F6
Description:       #A5ACB5
Numéros inactifs:  border rgba(165,172,181,0.25) · background transparent
Numéros actifs:    background #359BD9 · color #FFFFFF
Ligne timeline:    stroke rgba(165,172,181,0.20) — tracée au scroll
Ligne passée:      stroke #359BD9 — segment déjà tracé
Titres étapes:     #F2F4F6
Desc étapes:       #A5ACB5
Durée étape:       TYPE-M · #359BD9 · 12px
```

---

### Typographie

**Eyebrow :**
```
[TYPE-M] · 11px · 600 · UPPERCASE · letter-spacing: 0.14em · #359BD9
text-align: center
```

**Headline :**
```
[TYPE-D] · 48px · 600 · line-height: 1.08 · letter-spacing: -0.02em · #F2F4F6
text-align: center
```

**Numéros étapes :**
```
[TYPE-M] · 14px · 600 · 
Cercle: 40px × 40px · border-radius: 50%
```

**Titres étapes :**
```
[TYPE-B] · 16px · 600 · #F2F4F6
margin-top: 16px
```

**Descriptions étapes :**
```
[TYPE-B] · 14px · 400 · #A5ACB5 · line-height: 1.55
max-width: 160px
```

**Durée :**
```
[TYPE-M] · 11px · 500 · #359BD9
margin-top: 6px
```

---

### Composition

Layout : **Timeline horizontale centrée**

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│               EYEBROW                                   │
│       "Un process clair. Des jalons tenus."             │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│   ①────────────②────────────③────────────④─────────── │
│   │            │            │            │             │
│  01           02           03           04             │
│ Diagnostic  Stratégie    Sprint 1    Exécution         │
│  1 semaine   3 jours      1 semaine   3–6 semaines     │
│                                                         │
│   ⑤────────────⑥                                       │
│   │            │                                        │
│  05           06                                       │
│ Validation  Livraison                                   │
│  2-3 jours   1 semaine                                  │
│                                                         │
│     [Démarrer un diagnostic gratuit avec Loïc →]        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

Sur desktop : les 6 étapes sur une seule ligne horizontale (si espace suffisant).  
Sur tablet/mobile : timeline verticale (voir §responsive).

---

### Éléments secondaires

**Ligne de connexion SVG :**
```
stroke: rgba(165, 172, 181, 0.20)
stroke-width: 1.5
stroke-dasharray: 6 4  ← tirets subtils
```

**Segment "actif" de la ligne** (portion tracée au scroll) :
```
stroke: #359BD9
stroke-width: 1.5
stroke-dashoffset: length → 0  (tracé progressivement)
```

---

### Animation

**Headline :** `stagger · eyebrow + headline · fadeUp`  
**Ligne tiretée :** apparaît d'un coup (`opacity 0 → 1 · 0.5s · delay 0.3s`)  
**Ligne accent :** tracée progressivement (`stroke-dashoffset · 1.8s · delay 0.5s`)  
**Cercles numéros :** `stagger 0.12s · scaleReveal 0.8→1 · spring`  
**Étapes (texte) :** `stagger 0.10s · fadeUp y:12 · delay 0.8s`  
**Pulse une fois par numéro** quand il entre dans le viewport (one-shot)

---

### Interaction

- Hover sur une étape → numéro `background: #359BD9 · color: #FFFFFF`
- CTA : hover `y: -1px · background: #4AAEE0`

---

### Transition vers EXPERTISE

Section suivante : `#102740`. Passage `#05101E` → `#102740`. La section expertise est plus dense, plus "catalogue" — le fond plus clair traduit ce passage à une vue d'ensemble.

---

---

## 11. EXPERTISE

### Identité visuelle

**Personnalité :** Le catalogue de compétences. Après la narration des sections précédentes, cette section offre une vue d'ensemble claire et exhaustive. Chaque pôle a sa propre icône, sa couleur d'accent, sa zone. Comme le portfolio de services d'un cabinet conseil de renom.

---

### Background

```
background: #102740
```

---

### Couleurs

```
Fond:              #102740
Eyebrow:           #359BD9
Headline:          #F2F4F6
Card fond:         rgba(5, 16, 30, 0.60)
Card border:       rgba(165, 172, 181, 0.12)
Card hover fond:   rgba(53, 155, 217, 0.06)
Card hover border: rgba(53, 155, 217, 0.30)
Icônes:            #359BD9 (Lucide, 32px)
Numéros:           TYPE-M · #1A4066 (très atténué — déco)
Titres cards:      #F2F4F6
Desc cards:        #A5ACB5
Tags services:     TYPE-M · 11px · rgba(165,172,181,0.60)
Lien card:         #359BD9
```

---

### Typographie

**Eyebrow :**
```
[TYPE-M] · 11px · 600 · UPPERCASE · letter-spacing: 0.14em · #359BD9
text-align: center
```

**Headline :**
```
[TYPE-D] · 44px · 600 · line-height: 1.1 · letter-spacing: -0.02em · #F2F4F6
text-align: center
```

**Titres cards :**
```
[TYPE-D] · 20px · 600 · #F2F4F6
```

**Description cards :**
```
[TYPE-B] · 14px · 400 · #A5ACB5 · line-height: 1.55
```

**Tags :**
```
[TYPE-M] · 11px · 500 · rgba(165, 172, 181, 0.60) · UPPERCASE · letter-spacing: 0.06em
```

---

### Composition

Layout : **Grille 3+2 centrée**

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    EYEBROW                              │
│        "Tout ce qu'il faut pour construire."            │
│                                                         │
│  ┌───────────────┐  ┌───────────────┐  ┌─────────────┐  │
│  │ 🤖            │  │ ⚡            │  │ 💻          │  │
│  │ 01            │  │ 02            │  │ 03          │  │
│  │ Intelligence  │  │ Automation    │  │ Dév. Web    │  │
│  │ Artificielle  │  │               │  │             │  │
│  │               │  │               │  │             │  │
│  │ Tags · Tags   │  │ Tags · Tags   │  │ Tags        │  │
│  │ En savoir +   │  │ En savoir +   │  │ En savoir + │  │
│  └───────────────┘  └───────────────┘  └─────────────┘  │
│                                                         │
│       ┌───────────────────────┐  ┌──────────────────┐   │
│       │ 🔍                    │  │ 🎨               │   │
│       │ 04                    │  │ 05               │   │
│       │ SEO                   │  │ Design           │   │
│       │                       │  │ & Identité       │   │
│       └───────────────────────┘  └──────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

Les 2 cartes de la ligne 2 sont **légèrement plus larges** que les 3 du dessus — compensant le nombre plus faible, maintenant une proportion équilibrée.

**Card structure :**
```
padding: 32px
border-radius: 10px  ← --radius-md
Numéro déco: TYPE-M · 48px · #1A4066 · position absolute top 16px right 20px
Icône: 32px · stroke 1.5 · #359BD9 · margin-bottom: 20px
Titre: TYPE-D 20px · margin-bottom: 10px
Description: TYPE-B 14px · margin-bottom: 20px
Tags: flex wrap · gap: 6px · margin-bottom: 24px
Lien: TYPE-B 13px 600 · #359BD9 · flex + chevron
```

---

### Éléments secondaires

Aucun élément graphique externe. La section repose sur la qualité des cards, les icônes cohérentes et la typographie.

**Point de différenciation subtil :** la première card (IA) a une légère bordure accent plus visible (`border: 1px solid rgba(53,155,217,0.25)`) pour signaler qu'elle est le pôle principal.

---

### Animation

**Headline :** `stagger · fadeUp`  
**Cards :** `staggerGrid(4, 3) · scaleReveal 0.97→1 · stagger 0.06s`  
**Hover :** `translateY(-3px) · border-color accent · background subtil · 0.2s`

---

### Interaction

- Hover card → lift + border accent
- Click card ou lien "En savoir plus" → `/services/[expertise]`

---

### Transition vers CTA FINAL

Section suivante : dégradé fort `#05101E → #102740 → #1A4066`. Le changement de background est **le plus marqué de toute la page** — c'est voulu pour que le CTA final se distingue visuellement de tout ce qui précède.

---

---

## 12. CTA FINAL

### Identité visuelle

**Personnalité :** L'invitation. Après le voyage de 11 sections, cette section est un espace à part. Épuré, centré, silencieux. Comme la dernière page d'un manifeste — une seule phrase, un seul acte. La décision appartient au visiteur.

---

### Background

**Dégradé unique — différent de toutes les autres sections :**
```
background: linear-gradient(135deg, #102740 0%, #05101E 45%, #1A4066 100%)
```

**Glow central fort :**
```
position: absolute · top: 50% · left: 50%
transform: translate(-50%, -50%)
width: 800px · height: 400px
background: radial-gradient(ellipse, rgba(53, 155, 217, 0.16) 0%, transparent 65%)
pointer-events: none
```

Ce glow est plus présent que partout ailleurs — c'est délibéré. La section doit "briller" légèrement, signaler son statut de conclusion et d'invitation.

---

### Couleurs

```
Fond:           dégradé (ci-dessus)
Glow:           rgba(53, 155, 217, 0.16)
Eyebrow:        #359BD9
Headline:       #F2F4F6
Description:    #A5ACB5
Bouton:         background #359BD9 · texte #FFFFFF · border-radius: 6px · padding: 16px 40px
Badge confiance: TYPE-B · 13px · #A5ACB5 · opacity 0.70
Lien secondaire: #359BD9
```

---

### Typographie

**Eyebrow :**
```
[TYPE-M] · 11px · 600 · UPPERCASE · letter-spacing: 0.18em · #359BD9
text-align: center · margin-bottom: 28px
```

**Headline — LA PLUS GRANDE DE TOUTE LA PAGE :**
```
[TYPE-D] · 64px · 700 · line-height: 1.02 · letter-spacing: -0.035em · #F2F4F6
text-align: center · max-width: 800px

Mobile: 36px
Tablet: 48px
```

**Description :**
```
[TYPE-B] · 18px · 400 · line-height: 1.65 · #A5ACB5
text-align: center · max-width: 520px · margin: 0 auto
```

**Bouton :**
```
[TYPE-B] · 16px · 600 · #FFFFFF
padding: 16px 40px · border-radius: 6px · font-size: 15px
```

**Badges confiance :**
```
[TYPE-B] · 12px · 400 · #A5ACB5 · opacity: 0.70
gap: 24px entre badges · séparateur "·"
```

---

### Composition

Layout : **Entièrement centré — section la plus épurée de la page**

```
┌─────────────────────────────────────────────────────────┐
│                  ╔ GLOW RADIAL ╗                        │
│                                                         │
│              COMMENÇONS                                 │
│                                                         │
│    "Prêt à transformer votre croissance ?"              │
│                                                         │
│    Description centrée · max-width 520px                │
│                                                         │
│          [Parler à Loïc — Gratuit]                       │
│                                                         │
│     Ou [demander un devis] directement.                  │
│                                                         │
│   SIRET visible · Basé en France · Réponse < 24h        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Aucun visuel, aucune image, aucune icône** — la pureté est le message.

**Hauteur minimum :** `60vh` desktop — la section respire.

---

### Éléments secondaires

**Badges de confiance :**
```
· SIRET 92xxxxxxxx · Basé en France · Réponse garantie < 24h ·
```

Centrés, discrets, en bas de la section — rassurance sans bruit.

---

### Animation

**Entrée dans le viewport :**
```
Eyebrow:     delay 0 · fadeUp y:16 · 0.5s
Headline:    delay 0.1s · fadeUp y:32 · 0.8s
Description: delay 0.25s · fadeUp y:16 · 0.6s
Bouton:      delay 0.4s · ctaBreath (scale 0.95→1.02→1.00 · one-shot)
Lien second: delay 0.5s · fadeIn
Badges:      delay 0.6s · fadeIn
```

**Glow :** pulsation très lente `opacity: 0.16 → 0.22 → 0.16 · 5s · ease-in-out · infini`

---

### Interaction

- Bouton : hover `background: #4AAEE0 · y: -1px · scale: 1.01`
- Lien "demander un devis" : hover `color: #4AAEE0 · underline`

---

### Transition vers FOOTER

Le footer commence sans rupture nette — même registre profond. Le `border-top: 1px solid rgba(165,172,181,0.10)` est la seule séparation, subtile.

---

---

## 13. FOOTER

### Identité visuelle

**Personnalité :** La clôture propre. Aucune surprise, aucune distraction — le footer confirme la fiabilité de CA-TECH par son organisation claire et sa sobriété. Comme le dos de couverture d'un document professionnel.

---

### Background

```
background: #05101E
border-top: 1px solid rgba(165, 172, 181, 0.10)
```

---

### Couleurs

```
Fond:          #05101E
Logo:          utiliser SVG original · aucune modification
Tagline:       #A5ACB5 · opacity 0.80
Col titres:    #F2F4F6 · font-weight 600
Col liens:     #A5ACB5
Col liens hover: #F2F4F6 · transition 0.18s
Séparateurs:   rgba(165, 172, 181, 0.08)
Barre légale:  #A5ACB5 · opacity 0.50
```

---

### Typographie

**Logo :** SVG `logo-ca-tech-icon.svg`, `height: 24px`, pas de CSS custom.

**Tagline :**
```
[TYPE-B] · 14px · 400 · #A5ACB5 · opacity: 0.80
```

**Titres colonnes :**
```
[TYPE-B] · 13px · 600 · #F2F4F6 · UPPERCASE · letter-spacing: 0.06em
margin-bottom: 16px
```

**Liens :**
```
[TYPE-B] · 14px · 400 · #A5ACB5
line-height: 2.0 (espace généreux entre liens)
```

**Barre légale :**
```
[TYPE-B] · 12px · 400 · #A5ACB5 · opacity: 0.50
```

---

### Composition

Layout : **4 colonnes desktop, 2 colonnes tablet, 1 colonne mobile**

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌──────────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │
│  │ Logo CA-TECH │ │EXPERTISES│ │NAVIGATION│ │ LÉGAL  │  │
│  │ Tagline      │ │IA        │ │Projets   │ │Adresse │  │
│  │              │ │Automation│ │À propos  │ │SIRET   │  │
│  │ [Réseaux]    │ │Dev Web   │ │Blog      │ │Contact │  │
│  │              │ │SEO       │ │Contact   │ │CGV     │  │
│  │              │ │Design    │ │Devis     │ │ML      │  │
│  └──────────────┘ └──────────┘ └──────────┘ └────────┘  │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  © 2024 CA-TECH     Mentions légales · Cookies · CGV   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Padding footer :** `80px 0 40px` desktop · `60px 0 32px` mobile

---

### Éléments secondaires

**Réseaux sociaux :**
```
Icônes Lucide · 18px · stroke 1.5
color: #A5ACB5 · hover: #F2F4F6
display: flex · gap: 16px · margin-top: 20px
```

**Barre de séparation avant mentions légales :**
```
height: 1px
background: rgba(165, 172, 181, 0.08)
margin: 40px 0 24px
```

---

### Animation

**Aucune.** Le footer est statique. Aucune animation de scroll reveal. Il est simplement là, disponible.

---

### Interaction

- Liens : hover `color: #F2F4F6 · transition 0.18s`
- Réseaux sociaux : hover `color: #F2F4F6 · scale(1.05)`
- Liens légaux : standard

---

---

## Synthèse — Personnalités des 13 sections

| # | Section | Fond | Layout | Personnalité |
|---|---------|------|--------|-------------|
| 01 | Navigation | Transparent → Frosted | Barre fixe | Cockpit — invisible quand inutile |
| 02 | Hero | `#05101E` + glow | Split 55/45 | Salle de commande — impact immédiat |
| 03 | Positionnement | `#102740` | Bandes éditoriales | Rapport annuel McKinsey — chiffres vrais |
| 04 | AI Showcase | `#05101E` | Sticky split | Hublot sur serveur actif — Loïc tourne |
| 05 | Automatisation | `#102740` + grid | Full-width diagram | Réseau de connexions vivant |
| 06 | LLM/MCP | `#05101E` + glow | Centré grande typo | White paper Anthropic — expertise assumée |
| 07 | Digital Experiences | `#102740` | Carousel drag | Galerie d'art numérique |
| 08 | Systems | `#05101E` + pixel grid | Asymétrique technique | Salle des machines — monitoring |
| 09 | Portfolio | `#102740` | Grille éditoriale asym. | Exposition — images sans cadre |
| 10 | Process | `#05101E` | Timeline horizontale | Planning d'architecte — transparent |
| 11 | Expertise | `#102740` | Grille 3+2 | Catalogue cabinet conseil premium |
| 12 | CTA Final | Dégradé unique | Centré épuré | Manifeste — une phrase, un acte |
| 13 | Footer | `#05101E` | 4 colonnes | Dos de couverture — fiable, propre |

**Alternance des fonds :**
```
Hero (#05101E) → Positionnement (#102740) → AI (#05101E) → Automation (#102740)
→ LLM (#05101E) → Digital (#102740) → Systems (#05101E) → Portfolio (#102740)
→ Process (#05101E) → Expertise (#102740) → CTA (dégradé) → Footer (#05101E)
```
Chaque passage de fond crée une "ponctuation visuelle" sans divider ni bordure.
