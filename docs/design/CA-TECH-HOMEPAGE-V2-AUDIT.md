# CA-TECH — HOMEPAGE V2 AUDIT

> Audit complet de conformité visuelle et technique  
> **Date :** 2026-10-01  
> **Sources :** VISUAL-DIRECTION.md · CA-TECH-FRONTEND-ARCHITECTURE-V2.md · INFORMATION-ARCHITECTURE.md · SHOWCASE-SYSTEM.md · MOTION-SYSTEM.md · code réel inspecté  
> **Périmètre :** toutes les sections homepage + showcase + composants partagés  
> **Règle :** ZÉRO modification du code dans ce document

---

## Executive Summary

La homepage CA-TECH V2 est **fonctionnelle et cohérente sur le plan palette/typographie** mais présente des **divergences de layout et de contenu** par rapport aux spécifications. Aucune section n'est à reconstruire intégralement (0 RED). Dix sections nécessitent des corrections ciblées (10 YELLOW). Deux sections sont conformes (2 GREEN).

Les divergences les plus importantes :

1. **Hero** — H1 dit "votre entreprise" (spec : "votre croissance") ; layout full-bleed image au lieu de split 55/45 ; CTAs vers des mauvaises destinations
2. **Positionnement** — Métriques locales différentes de `constants.js/METRICS` ; count-up OD-04 absent ; citation éditoriale absente
3. **AI Showcase** — Panel non sticky ; typing animation absente
4. **Portfolio + Digital Experiences** — 8 images WebP manquantes (`image: null`)
5. **Showcase.jsx** — Drag/swipe absent, accessibilité ARIA insuffisante
6. **LLM** — `@keyframes glowPulse` absent de `globals.css` → bug silencieux
7. **Systems + Expertise** — Icônes Lucide définies dans les données mais non rendues dans les composants

**Bilan assets :** 8 WebP portfolio (PF-01→PF-04) bloquants · 1 vidéo Loïc (HyperFrames) · 2 backgrounds MJ optionnels · 3 SVG tools OD-03

---

## 1. Hero

### État actuel

Layout full-bleed : image couvre tout le fond avec scrim gradient gauche (#05101E) → texte flottant au-dessus gauche. Aucun visuel flottant droite. `min-height: 100dvh`, `paddingTop: 64px`.

Contenu réel :
- Eyebrow : `"CA-TECH"` (plain span 11px)
- H1 : `"L'intelligence qui transforme votre entreprise."` — accent sur "votre entreprise."
- Sous-headline : `"IA générative · Automatisation · LLM · MCP · Systèmes digitaux"` (liste, 16px)
- CTA primaire : `"Découvrir CA-TECH"` → `/services`
- CTA secondaire : `"Parler à CA-TECH"` → `/contact`
- Glow accent : absent (scrim seulement)
- Stats bas de hero : absentes
- Scroll indicator : absent

### Conformité V2

| Spec | Actuel | Conformité |
|------|--------|-----------|
| H1 : "votre croissance" | "votre entreprise" | ❌ |
| Eyebrow : badge "Agence IA-First · Basé en France" + dot | Plain "CA-TECH" | ❌ |
| Sous-headline : phrase éditoriale 20px | Liste avec `·` 16px | ❌ |
| CTA primaire : "Parler à Loïc" → widget | "Découvrir CA-TECH" → /services | ❌ |
| CTA secondaire : "Voir nos réalisations" → /projets | "Parler à CA-TECH" → /contact | ❌ |
| Split 55/45 texte/visuel | Full-bleed image fond | DIVERGE (mais défendable) |
| Stats bas (50+, <24h, France) | Absentes | ❌ |
| Glow radial top-right | Absent | ❌ |
| Scroll indicator animé | Absent | ❌ |
| HOME-01 WebP matérialisé | ✅ (89KB, 3 variants) | ✅ |
| Palette #05101E | ✅ | ✅ |
| Space Grotesk H1 | ✅ clamp(36px→72px) | ✅ |
| Animation stagger | ✅ imageReveal + stagger | ✅ |

### Problèmes

1. **Contenu H1 incorrect** : "votre entreprise" ≠ "votre croissance" — erreur textuelle simple
2. **CTAs incorrects** : labels et destinations divergent des specs et de la cohérence "Loïc"
3. **Stats bas de hero absentes** : section incomplète (50+, <24h, 100% France)
4. **Layout** : le full-bleed image est une alternative créative valide mais non spécifiée — à décider en Phase 2

### Assets nécessaires

- HOME-01 WebP : déjà présent ✅

### Corrections recommandées

1. H1 : "votre entreprise." → "votre croissance."
2. CTA primaire : "Parler à Loïc" → `window.LoicWidget?.open()` (fallback `/contact`)
3. CTA secondaire : "Voir nos réalisations" → `/projets`
4. Eyebrow : ajouter dot pulsant + "Agence IA-First · Basé en France"
5. Ajouter stats band en bas (3 stats sur border-top subtle)
6. Décision sur layout : valider full-bleed (actuel) OU implémenter split 55/45 (spec)

### Statut

**YELLOW** — Corrections de contenu obligatoires. Layout défendable mais à décider.

---

## 2. Positionnement

### État actuel

Layout two-column : gauche (texte + 3 métriques verticales), droite (4 pillars numérotés 01-04). Fond `#102740` correct.

Métriques hardcodées dans le composant (pas depuis `constants.js/METRICS`) :
```
{ value: '50+',   label: 'Projets livrés',     detail: 'PME et ETI' }
{ value: '80%',   label: 'Tâches automatisées', detail: 'en moyenne / client' }
{ value: '< 24h', label: 'Délai de réponse',    detail: 'garanti' }
```

METRICS dans `constants.js` (non utilisés dans PositionnementSection) :
```
{ value: '48h',      label: 'Premier livrable IA opérationnel' }
{ value: '5',        label: 'Pôles d\'expertise couverts' }
{ value: '2023',     label: 'Fondé à Dijon, actif en France' }
{ value: '< 1 sem.', label: 'Prototype livré en sprint' }
```

### Conformité V2

| Spec | Actuel | Conformité |
|------|--------|-----------|
| Headline : "Pas une agence web. Un cabinet d'intelligence digitale." | "IA, automatisation et web — réunis dans un seul partenaire." | ❌ |
| 4 métriques en bande 4 colonnes | 3 métriques verticales, données différentes | ❌ |
| Count-up animation OD-04 | Absent — valeurs statiques | ❌ |
| Citation éditoriale centrée bas | Absente | ❌ |
| CTA "En savoir plus →" /a-propos | Absent | ❌ |
| Fond #102740 | ✅ | ✅ |
| Palette correcte | ✅ | ✅ |
| Inter body | ✅ | ✅ |

### Problèmes

1. **OD-04 non implémenté** : count-up absent, `useCountUp` hook absent de `src/lib/hooks/`
2. **Incohérence données** : `METRICS` dans `constants.js` n'est pas utilisé par le composant → deux sources de données divergentes
3. **Citation éditoriale absente** : élément fort de la spec ("Pas une agence. Un cabinet qui exécute.") totalement absent
4. **Headline divergente** : message moins percutant que la spec
5. **Layout diverge** : two-column editorial ≠ 3 bandes horizontales (texte | métriques | citation)

### Assets nécessaires

Aucun asset image/vidéo. Section typographique.

### Corrections recommandées

1. Créer `src/lib/hooks/useCountUp.js` (OD-04)
2. Brancher le composant sur `import { METRICS } from '../../lib/constants'`
3. Appliquer count-up sur chaque valeur métrique
4. Ajouter citation éditoriale : "Pas une agence. Un cabinet qui exécute." centrée italique
5. Corriger headline vers spec ou valider la version actuelle par décision explicite

### Statut

**YELLOW** — OD-04 bloquant (count-up), métriques incohérentes avec constants.js, citation manquante.

---

## 3. AI Showcase

### État actuel

Layout side-by-side : `md:col-span-5` texte gauche + `md:col-span-7` interface droite. Panel interface **non sticky** (simple `whileInView`).

`LoicInterface` : conversation statique à 3 messages hardcodés + typing dots animés (3 points pulsants). Pas de typing animation progressive. Pas d'appel API. Aucune dépendance externe. Rendu premium ✅.

Frame navigateur : absent (spec veut bar "loic.ca-tech.fr" TYPE-M).
Numéros décoratifs 01/02/03 : absents.

### Conformité V2

| Spec | Actuel | Conformité |
|------|--------|-----------|
| Panel sticky `position:sticky, top:64px` | Non-sticky whileInView | ❌ |
| Typing animation progressive | Dots statiques, texte déjà affiché | ❌ |
| Frame navigateur browser | Absent | ❌ |
| Aucun appel API live | ✅ | ✅ |
| Aucune dépendance externe | ✅ | ✅ |
| Conversation simulée compréhensible | ✅ (50 leads/semaine → gain 8-12h) | ✅ |
| Fond panel #102740 | ✅ | ✅ |
| OD-02 : animation code V1 | ✅ implémenté | ✅ |
| Aucun cliché AI | ✅ | ✅ |
| Tags capacités 8 items | ✅ | ✅ |
| CTA "Essayer Loïc" → widget | → /contact | ❌ |

### Problèmes

1. **Panel non sticky** : l'effet scroll-driven 3×100vh est absent — section perd son identité visuelle forte
2. **Typing animation** : le texte est affiché d'emblée, pas de typewriter progressif
3. **Frame navigateur absent** : perd le caractère "fenêtre sur un vrai système"
4. **CTA incorrects** : vers /contact au lieu du widget Loïc

### Assets nécessaires

- Aucun asset Midjourney critique (l'interface CSS est suffisante pour V1)
- V-AI-01 : `public/loic/loic-ia-new.mp4` (HyperFrames — optionnel V2)

### Corrections recommandées

1. Implémenter `position: sticky` sur le panel droit (top: 64px)
2. Ajouter typing animation (caractère par caractère) sur le dernier message Loïc
3. Ajouter frame navigateur minimal (dots + "loic.ca-tech.fr")
4. CTA : `window.LoicWidget?.open()` (fallback /contact)

### Statut

**YELLOW** — Sticky absent = identité principale de la section perdue. Corrections nécessaires.

---

## 4. Automation

### État actuel

`WorkflowDiagram` : flex row de 5 nœuds animés (scale 0.8→1, stagger 0.15s) + ArrowRight entre nœuds + résultat "10h économisées" en bas. Fond interne `#102740`, border-radius 24px.

Outils : TOOL_TAGS texte seulement (`['n8n', 'Make', 'Zapier', ...]`). Espace réservé commenté dans le code : `{/* Tool icons — à reconstruire avec les nouveaux assets */}` ✅ (propre).

### Conformité V2

| Spec | Actuel | Conformité |
|------|--------|-----------|
| Fond section #102740 | ✅ | ✅ |
| Diagramme nœuds animés | ✅ (scale + stagger) | ✅ |
| Workflow TRIGGER→QUALIFY→CRM→EMAIL→DEVIS | ✅ (5 nœuds corrects) | ✅ |
| Résultat "10h économisées" | ✅ | ✅ |
| Grid texture 40×40px accent | ❌ absent | ❌ |
| Icônes SVG officiels (OD-03) n8n/Make/etc. | ❌ TOOL_TAGS texte seulement | ❌ |
| Connexions SVG tracées (stroke-dashoffset) | ❌ ArrowRight simples | ❌ |
| Headline centré | ✅ | ✅ |
| CTA → /services/automatisation | ✅ | ✅ |
| Couleur #F59E0B pour nœud CRM | ⚠️ (token warning) | ⚠️ |

### Problèmes

1. **OD-03 non implémenté** : icônes SVG officiels (n8n, Make, Zapier, Slack, Gmail, GCal) absentes — espace réservé propre mais vide
2. **Grid texture absente** : fond visuellement nu, spec demande lines 40×40px
3. **Connexions statiques** : ArrowRight SVG au lieu de stroke-dashoffset animé
4. **`#F59E0B` sur nœud CRM** : couleur `--color-warning` utilisée dans un contexte indicateur d'état — acceptable mais à signaler (pas dans palette principale)

### Assets nécessaires

- OD-03 : `public/icons/tools/n8n.svg`, `make.svg`, `zapier.svg`, `slack.svg`, `gmail.svg`, `google-calendar.svg` — SVGs officiels, téléchargeables depuis les sites des outils (sous licences permissives)

### Corrections recommandées

1. Ajouter grid texture CSS dans WorkflowDiagram (background-image linear-gradient)
2. Intégrer les logos SVG outils (OD-03) dans la zone au-dessus du résultat
3. Optionnel V2 : remplacer ArrowRight par SVG path animé stroke-dashoffset

### Statut

**YELLOW** — OD-03 bloquant (logos tools manquants). Grid texture correctible en pure CSS.

---

## 5. LLM & MCP

### État actuel

Glow radial top-center ✅. Word-by-word headline ✅ (implémenté manuellement en inline). 3 blocs en `grid md:grid-cols-3 gap-0` avec `borderRight` entre cols. Tags tech. CTA texte.

**Bug identifié :** `animation: 'glowPulse 4s ease-in-out infinite'` référencé dans le style inline du glow div — mais `@keyframes glowPulse` est **absent de `src/styles/globals.css`**. L'animation ne fonctionne pas silencieusement.

### Conformité V2

| Spec | Actuel | Conformité |
|------|--------|-----------|
| Fond #05101E | ✅ | ✅ |
| Glow radial top | ✅ (code présent mais animation cassée) | ⚠️ |
| Word-by-word headline | ✅ | ✅ |
| Tout centré | ❌ — container max-width 800px gauche-aligné | ❌ |
| 3 blocs sans cards (séparateurs only) | ✅ | ✅ |
| Numérotation 01/02/03 en mono accent | ❌ absente | ❌ |
| "128k" décoratif fond (optionnel) | Absent | — |
| Hover fond rgba(16,39,64) sur blocs | ✅ | ✅ |
| Tags tech 7 items | ✅ (Python et Node.js ajoutés) | ✅ |
| @keyframes glowPulse dans globals.css | ❌ BUG — absent | ❌ |

### Problèmes

1. **Bug `@keyframes glowPulse`** : absent de globals.css, la pulsation glow est silencieusement cassée
2. **Section non centrée** : `maxWidth: '800px'` sans `margin: 0 auto` → aligné à gauche. La spec exige "tout centré — seule section centrée"
3. **Numérotation blocs absente** : `01`, `02`, `03` en TYPE-M 13px accent manquants

### Assets nécessaires

Aucun asset externe. Section typographique pure.

### Corrections recommandées

1. Ajouter dans `globals.css` : `@keyframes glowPulse { 0%,100% { opacity:0.10 } 50% { opacity:0.18 } }`
2. Ajouter `margin: '0 auto'` sur le container max-width 800px
3. Ajouter numéros `01`, `02`, `03` en TYPE-M 13px #359BD9 au-dessus de chaque titre de bloc

### Statut

**YELLOW** — Bug glowPulse à corriger. Centrage et numérotation manquants.

---

## 6. Systems

### État actuel

Grid texture légère ✅ (rgba 0.03 — un peu plus subtil que spec 0.05 mais acceptable). 6 domaines en 2 sous-colonnes (3+3). Stack tags col droite. DomainItem avec ligne accent animée scaleX ✅.

**Problème critique** : `SYSTEM_DOMAINS` dans `constants.js` définit un champ `icon: 'Cloud'`, `'Database'`, etc. — mais `DomainItem` ne rend **aucune icône**. Le `icon` field est importé mais ignoré.

### Conformité V2

| Spec | Actuel | Conformité |
|------|--------|-----------|
| Fond #05101E + grid texture | ✅ | ✅ |
| 6 domaines : noms corrects | ✅ | ✅ |
| Icônes Lucide 28px #359BD9 par domaine | ❌ absentes | ❌ |
| Layout asymétrique 8/12 domaines + 4/12 stack | ✅ | ✅ |
| Stack tags col droite | ✅ | ✅ |
| CTA "Infrastructure & Conseil" | ✅ → /contact | ✅ |
| Ligne accent animée par domaine | ✅ scaleX | ✅ |
| Section bg canvas | ✅ | ✅ |

### Problèmes

1. **Icônes Lucide absentes** : `DomainItem` n'utilise pas `domain.icon` — chaque domaine devrait afficher son icône Lucide 28px #359BD9

### Assets nécessaires

Aucun — les icônes sont Lucide React (déjà installé).

### Corrections recommandées

1. Dans `DomainItem`, importer dynamiquement ou résoudre l'icône depuis `domain.icon` (string → composant Lucide)
2. Rendre `<IconComponent size={22} color="#359BD9" style={{marginBottom:'16px'}} />`

### Statut

**YELLOW** — Icônes absentes. Correction minimale (1 ligne de code + import).

---

## 7. Digital Experiences

### État actuel

Carousel horizontal avec `drag="x"`, `dragConstraints` dynamiques calculés via `useEffect`. `ProjectCard` avec hover lift ✅. `ProjectPlaceholder` CSS branded pour `image: null` ✅.

### Conformité V2

| Spec | Actuel | Conformité |
|------|--------|-----------|
| Fond #102740 | ✅ | ✅ |
| Carousel drag horizontal | ✅ Framer Motion drag="x" | ✅ |
| Cards width 480px | ❌ minWidth 360px / maxWidth 400px | ❌ |
| Peek 15% carte suivante | ❌ pas de overflow clip contrôlé | ❌ |
| Dots navigation | ❌ absents | ❌ |
| Images portfolio (4 WebP) | ❌ image: null → placeholder CSS | ❌ |
| cursor grab/grabbing | ✅ | ✅ |
| Overlay hover "Voir le projet →" | ❌ absent sur l'image | ❌ |
| SectionHeading align left | ✅ | ✅ |
| CTA "Voir tous les projets" | ✅ → /projets | ✅ |

### Problèmes

1. **8 images WebP manquantes** (PF-01→PF-04 + ca-tech-manager + cv-magic + pasmal + pemous-money) — blocage principal
2. **Cards trop petites** : minWidth 360px vs spec 480px
3. **Pas de dots** : navigation visuelle absente
4. **Pas d'overflow contrôlé** : le "peek" de la carte suivante non implémenté
5. **Pas d'overlay hover** sur la zone image

### Assets nécessaires

- PF-01 : `public/portfolio/ca-tech-manager/dashboard.webp` (Midjourney ou screenshot)
- PF-02 : `public/portfolio/cv-magic/home.webp`
- PF-03 : `public/portfolio/pasmal/home.webp`
- PF-04 : `public/portfolio/pemous-money/home.webp`

### Corrections recommandées

1. Passer `minWidth: '460px'` sur les cards
2. Ajouter dots (petits cercles 6px) en dessous du carousel
3. Gérer overflow avec `paddingLeft: '24px'` et masque gradiant droit visible
4. Ajouter overlay hover sur `ProjectPlaceholder` (même quand image null)
5. Brancher images dès production (WebP Midjourney)

### Statut

**YELLOW** — Images manquantes (attendues). Carousel fonctionnel mais incomplet visuellement.

---

## 8. Portfolio

### État actuel

Utilise `Showcase` + `ShowcaseNav`. Layout slide : info gauche (col-span-5) + image droite (col-span-7). `image: null` → placeholder CSS minimaliste.

### Conformité V2

| Spec | Actuel | Conformité |
|------|--------|-----------|
| Fond #102740 | ✅ | ✅ |
| Images 4 projets | ❌ image: null | ❌ |
| Layout grille éditoriale asymétrique (1 large + 1 petit) | ❌ slide unique info/image | DIVERGE |
| Métriques par projet | ✅ (#22C55E) | ✅ |
| Tags projets | ✅ | ✅ |
| Keyboard navigation | ✅ (Showcase.jsx) | ✅ |
| Progress bars nav (no numbers) | ✅ ShowcaseNav | ✅ |
| CTA "Voir le projet" | ✅ | ✅ |
| CTA "Tous les projets" | ✅ → /projets | ✅ |
| Eyebrow "Réalisations" | ✅ | ✅ |
| Headline "Construit, livré, mesuré." | ✅ | ✅ |

### Problèmes

1. **Images manquantes** : priorité critique — sans images les 2 sections portfolio/digital sont des placeholders CSS
2. **Layout diverge de spec** : le slide-by-slide est correct fonctionnellement mais la spec demande une grille éditoriale 2×2 asymétrique (grand+petit / petit+grand) — à décider en Phase 2

### Assets nécessaires

Mêmes PF-01→PF-04 que Digital Experiences (assets partagés).

### Corrections recommandées

1. Brancher images dès disponibilité (Midjourney ou screenshots réels)
2. Décision Phase 2 : valider layout slide actuel OU reconstruire en grille éditoriale asymétrique

### Statut

**YELLOW** — Images manquantes. Layout à valider.

---

## 9. Process

### État actuel

Timeline horizontale (hidden md:flex) + verticale mobile (flex md:hidden). Ligne accent scaleX animée. 6 étapes depuis `PROCESS_STEPS`. Durée + CTA en bas.

`PROCESS_STEPS` dans constants.js possède un champ `number: '01'` — **non rendu** dans ProcessSection (seuls `title`, `description`, `duration` sont affichés). Les dots sont de petits cercles 14px vides sans numéro.

### Conformité V2

| Spec | Actuel | Conformité |
|------|--------|-----------|
| Fond #05101E | ✅ | ✅ |
| 6 étapes correctes | ✅ | ✅ |
| Headline centré | ❌ align="left" dans SectionHeading | ❌ |
| Numéros 01-06 dans cercles 40×40px | ❌ dots 14px vides | ❌ |
| Ligne animée scaleX | ✅ | ✅ |
| Durée par étape | ✅ (color rgba(53,155,217,0.55)) | ✅ |
| Hover numéro → #359BD9 | ❌ pas de hover sur les dots | ❌ |
| CTA → widget Loïc | ❌ → /contact | ❌ |
| Timeline verticale mobile | ✅ | ✅ |

### Problèmes

1. **Numéros de cercles absents** : `number: '01'` dans PROCESS_STEPS n'est pas utilisé — les dots sont visuellement neutres sans repère de position
2. **Headline non centré** : spec demande text-align: center pour cette section
3. **Cercles trop petits** : 14px au lieu de 40×40px spec — perd l'effet de repère fort
4. **CTA incorrect** : vers /contact au lieu du widget Loïc

> **Note sur la numérotation** : les numéros dans les cercles de timeline sont des **indicateurs de position fonctionnels** (pas de la décoration stylistique). Ils ne violent pas la règle anti-numérotation décorative.

### Assets nécessaires

Aucun.

### Corrections recommandées

1. Agrandir les dots : `width: 40px, height: 40px, borderRadius: '50%'`
2. Afficher `step.number` à l'intérieur du cercle (TYPE-M 13px #359BD9)
3. Passer SectionHeading `align="center"`
4. CTA → `window.LoicWidget?.open()` (fallback /contact)

### Statut

**YELLOW** — Numéros absents des cercles. Corrections simples mais visibles.

---

## 10. Expertise

### État actuel

Layout liste éditoriale avec lignes horizontales animées (scaleX accent) ✅. 5 rows : titre+desc gauche (col-span-7), tags+lien droite (col-span-5). Hover : `translateY(-1px)` + ligne accent `#359BD9`.

**Divergence positive** : le layout liste éditoriale est **meilleur** que la spec grille 3+2 cards — il évite l'anti-pattern "6 cards identiques" et apporte un rythme visuel plus éditorial.

**Problème** : `EXPERTISE_CARDS` dans constants.js définit `icon: 'Brain'`, `'Zap'`, `'Network'`, etc. — mais `ExpertiseRow` n'importe et ne rend aucune icône Lucide.

### Conformité V2

| Spec | Actuel | Conformité |
|------|--------|-----------|
| Fond #102740 | ✅ | ✅ |
| 5 services corrects (avec llm-mcp + systemes) | ✅ | ✅ |
| Links vers /services/* | ✅ | ✅ |
| Icônes Lucide 32px #359BD9 | ❌ absentes | ❌ |
| Grille 3+2 cards | ❌ liste éditoriale — MIEUX | ✅ créatif |
| Hover lift + border accent | ✅ (translée y) | ✅ |
| Headline "Tout ce qu'il faut pour construire" | ✅ | ✅ |
| Sous-titre descriptif | ✅ | ✅ |
| Palette correcte | ✅ | ✅ |

### Problèmes

1. **Icônes absentes** : champ `icon` présent dans les données mais ExpertiseRow ne le rend pas — chaque ligne manque de son ancre visuelle gauche

### Assets nécessaires

Aucun — icônes Lucide (déjà installé).

### Corrections recommandées

1. Dans `ExpertiseRow`, importer les icônes depuis `lucide-react` et rendre `<IconComponent size={20} color="#359BD9" />` en début de ligne
2. Conserver le layout liste éditoriale (ne pas revenir à la grille cards)

### Statut

**YELLOW** — Icônes manquantes (correction simple). Layout éditorial = décision positive à conserver.

---

## 11. CTA

### État actuel

Section épurée centrée ✅. Dot grid discret ✅. Glow ambient centré ✅. Badge "Disponible maintenant" avec dot vert ✅. Headline 72px max ✅. Trust badges (SIRET, France, <24h) ✅. ButtonLink shadcn ✅.

### Conformité V2

| Spec | Actuel | Conformité |
|------|--------|-----------|
| Fond : dégradé `linear-gradient(135deg, #102740 0%, #05101E 45%, #1A4066 100%)` | `Section bg="canvas"` = #05101E flat | ❌ mineure |
| Glow radial fort centré | ✅ ellipse at 50% 30% | ✅ |
| Headline "Prêt à transformer votre croissance ?" | ✅ | ✅ |
| Bouton "Parler à Loïc — Gratuit" | ✅ label correct | ✅ |
| → widget Loïc | ❌ → /contact | ❌ |
| Lien secondaire "Demander un devis" → /devis | ✅ | ✅ |
| Trust badges | ✅ SIRET réel 93344494500012 | ✅ |
| Aucun emoji / rocket / gradient générique | ✅ | ✅ |
| Stagger animation | ✅ | ✅ |
| max-width centré | ✅ 680px | ✅ |

### Problèmes

1. **Dégradé absent** : fond flat #05101E au lieu du dégradé unique — différence visuelle mineure mais attendue
2. **CTA vers /contact** : devrait ouvrir le widget Loïc

### Corrections recommandées

1. Remplacer `Section bg="canvas"` par background inline dégradé `linear-gradient(135deg, #102740 0%, #05101E 45%, #1A4066 100%)`
2. CTA → `window.LoicWidget?.open()` (fallback /contact)

### Statut

**GREEN** — Section fonctionnelle et premium. Divergences mineures.

---

## 12. Footer

### État actuel

4 colonnes desktop ✅. Logo SVG ✅. Tagline ✅. LinkedIn (SVG inline) ✅. 3 colonnes nav : Expertises (5 services V2), Navigation (5 liens), Légal & contact (3 liens). Barre légale SIRET + adresse ✅. Copyright dynamique `{year}` ✅. Aucune animation ✅.

### Conformité V2

| Spec | Actuel | Conformité |
|------|--------|-----------|
| Fond #05101E | ✅ | ✅ |
| border-top 1px subtle | ✅ rgba(165,172,181,0.08) | ✅ |
| 4 colonnes desktop | ✅ | ✅ |
| Logo SVG | ✅ /logos/logo-ca-tech-icon.svg | ✅ |
| Expertises : 5 services V2 | ✅ (ia, auto, llm-mcp, systemes, dev) | ✅ |
| Pas d'animation | ✅ | ✅ |
| SIRET visible | ✅ 93344494500012 | ✅ |
| Adresse | ✅ Talant | ✅ |
| Hover liens cool-white | ✅ | ✅ |
| responsive 4→2→1 col | ✅ sm:grid-cols-2 md:grid-cols-4 | ✅ |
| Réseaux sociaux | ⚠️ LinkedIn only (1 réseau) | mineure |

### Problèmes

Mineurs seulement :
1. Un seul réseau social (LinkedIn) — spec indique "réseaux sociaux" au pluriel
2. `FOOTER_NAV.legal` : 3 liens (mentions, confidentialité, cookies) — pas de CGV ni de lien /loic

### Corrections recommandées

Aucune urgente. Ajouter d'autres réseaux quand présents.

### Statut

**GREEN** — Footer conforme. Divergences négligeables.

---

## Showcase Audit

**Showcase.jsx** (56 lignes) :

| Feature | Implémenté | Note |
|---------|-----------|------|
| AnimatePresence mode="wait" | ✅ | |
| slideVariants avec direction custom | ✅ | |
| Keyboard ArrowLeft/ArrowRight | ✅ | |
| useReducedMotion | ✅ | |
| Transition 0.45s ease | ✅ | |
| drag="x" Framer Motion | ❌ | Slides discrets seulement |
| Swipe touch natif | ❌ | Pas de pointer events |
| Loop/autoPlay | ❌ | |
| aria role="region" | ❌ | |
| aria-roledescription="carousel" | ❌ | |
| aria-live polite | ❌ | |
| Numérotation publique | ❌ aucune ✅ | Conforme spec |

**ShowcaseNav.jsx** :

| Feature | Implémenté | Note |
|---------|-----------|------|
| Progress bars (pas dots chiffrés) | ✅ | Conforme — pas de numérotation |
| aria-label prev/next | ✅ | |
| Disabled states | ✅ | |
| Hover accent | ✅ | |
| Numéros "X / Y" publics | ❌ aucun ✅ | Conforme spec |

**Corrections nécessaires :**
1. Ajouter `role="region"`, `aria-label`, `aria-roledescription="carousel"`, `aria-live="polite"` sur le wrapper
2. Optionnel V2 : remplacer AnimatePresence discret par drag="x" libre (OD-06)

---

## Typography Audit

### Conformité globale

| Token | Valeur | Usage | Conforme |
|-------|--------|-------|---------|
| `--font-display` | Space Grotesk | H1, H2, H3, noms projets | ✅ |
| `--font-body` | Inter | body, labels, CTA | ✅ |
| `--font-mono` | JetBrains Mono | eyebrows, métriques, numéros | ✅ |

### Section par section

| Section | Display | Body | Mono | Densité |
|---------|---------|------|------|---------|
| Hero | H1 72px ✅ | sous-headline 16px ✅ | eyebrow ✅ | Légère |
| Positionnement | headline 64px ✅ | corps 16px ✅ | métriques 28px ✅ | Moyenne |
| AI Showcase | headline via SectionHeading ✅ | conversation 13px ✅ | status "En ligne" ✅ | Légère |
| Automation | headline display-md ✅ | node labels 11px ✅ | résultat TYPE-M ✅ | Légère |
| LLM | headline 64px word-by-word ✅ | blocs 14px ✅ | eyebrow ✅ | Légère |
| Systems | headline display-md ✅ | domaines 13px ✅ | stack tags 12px ✅ | Moyenne |
| Digital Exp. | headline display-md ✅ | card desc 13px ✅ | — | Légère |
| Portfolio | headline 52px ✅ | desc 15px ✅ | — | Légère |
| Process | headline display-md ✅ | étapes 12px ✅ | durations 11px ✅ | Dense |
| Expertise | headline 52px ✅ | desc 14px ✅ | — | Dense |
| CTA | headline 72px ✅ | description 17px ✅ | — | Légère |
| Footer | — | titres cols 13px ✅ | liens 13px ✅ | Correcte |

**Sections à densité problématique :** Aucune. La densité est acceptable partout.
**Usage monospace hors rôle secondaire :** Aucun. JetBrains Mono utilisé uniquement sur eyebrows, métriques, numéros — correct.

---

## Color Audit

### Palette utilisée

| Couleur | Hex | Rôle | Usage trouvé | Conforme |
|---------|-----|------|-------------|---------|
| Deep Navy | #05101E | Fond canvas | Hero, LLM, Systems, Process, CTA, Footer | ✅ |
| Navy | #102740 | Fond panel | Positionnement, AI, Automation, DigitalExp, Portfolio, Expertise | ✅ |
| Tech Blue | #1A4066 | Elevated | AI Interface fond | ✅ |
| Accent | #359BD9 | CTAs, eyebrows, accents | Partout correct | ✅ |
| Silver | #A5ACB5 | Texte secondaire | Partout correct | ✅ |
| Cool White | #F2F4F6 | Headlines | Partout correct | ✅ |
| Success | #22C55E | Métriques, badge | CTA badge, métriques portfolio | ✅ |
| Warning | #F59E0B | Nœud CRM | AutomationSection 1 nœud | ⚠️ |

**Couleurs interdites trouvées :**
- Violet : ❌ absent ✅
- Rose/Magenta : ❌ absent ✅
- Orange : ❌ absent ✅
- Glow néon : ❌ absent ✅
- Noir pur : ❌ absent ✅

**Avertissement `#F59E0B`** : utilisé comme couleur de nœud CRM dans AutomationSection — c'est un indicateur d'état de workflow (amber = processing), pas un choix stylistique. Acceptable dans ce contexte mais à noter.

**Dégradé AI Showcase** : `linear-gradient(135deg, #359BD9, #1A4066)` sur l'icône Loïc — interne à un élément UI 36×36px, acceptable.

---

## Motion Audit

### motion.js — Completeness

| Export | Présent | Note |
|--------|---------|------|
| spring (snappy/smooth/gentle) | ✅ | |
| distance (xs→hero) | ✅ | |
| ease (smooth/decelerate/accelerate/snap/gentle) | ✅ | |
| fadeUp, fadeUpHeadline | ✅ | |
| fadeIn | ✅ | |
| imageReveal | ✅ | |
| scaleReveal | ✅ | |
| slideFromRight, slideFromLeft | ✅ | |
| dropIn, popIn, slideUp | ✅ | |
| wordReveal | ✅ (objet) | LLMSection l'implémente en inline |
| counterReveal | ✅ | useCountUp hook absent |
| staggerContainer, staggerFast, staggerSlow | ✅ | |
| staggerNormal, staggerGrid | ✅ | |
| showcaseSlide | ✅ | |
| staticVariants, staticContainer | ✅ | |
| viewport | ✅ `once:true, amount:0.10, margin: -80px` | |

**Tout présent dans motion.js.** ✅

### Bugs motion identifiés

1. **`@keyframes glowPulse` absent de globals.css** — LLMSection.jsx ligne 46 : `animation: 'glowPulse 4s ease-in-out infinite'` → l'animation ne s'exécute pas
2. **`useCountUp` hook absent** de `src/lib/hooks/` — `counterReveal` dans motion.js est exporté mais le hook d'implémentation n'existe pas encore

### Registres respectés

- Editorial (0.6–1.2s) : entrées sections ✅
- Interface (0.15–0.35s) : hover CTAs ✅
- Système (variable) : WorkflowDiagram stagger, LLM word-by-word ✅

---

## Responsive Audit

| Section | Mobile (375px) | Tablet (768px) | Desktop (1280px) |
|---------|---------------|---------------|-----------------|
| Hero | single col, paddingBottom 120px ✅ | ✅ | ✅ |
| Positionnement | grid-cols-1 ✅ | lg:grid-cols-12 ✅ | ✅ |
| AI Showcase | md:grid-cols-12 → 1 col ✅ | ✅ | col-span 5/7 ✅ |
| Automation | overflow-x auto sur nœuds ✅ | ✅ | ✅ |
| LLM | clamp(32→64px) ✅ | ✅ | ✅ |
| Systems | sm:grid-cols-2 ✅ | ✅ | 8/4 col ✅ |
| Digital Exp. | drag carousel 1 card ✅ | ✅ | ✅ |
| Portfolio | 1 slide ✅ | ✅ | ✅ |
| Process | timeline verticale (flex md:hidden) ✅ | hidden md:flex ✅ | horizontal ✅ |
| Expertise | grid-cols-1 ✅ | md:grid-cols-12 ✅ | ✅ |
| CTA | pleine largeur ✅ | ✅ | max-width 680px centré ✅ |
| Footer | grid-cols-1 → sm:grid-cols-2 ✅ | ✅ | md:grid-cols-4 ✅ |

**Point d'attention** : Hero `paddingBottom: 120px` sur petits mobiles (375px) peut sembler excessif si le texte est court — à vérifier visuellement.

---

## Accessibility Audit

| Check | Statut | Fichier |
|-------|--------|---------|
| `useReducedMotion` dans tous les composants animés | ✅ | Tous les fichiers |
| Skip-link `#main-content` | ✅ | App.jsx |
| Hero `aria-label="CA-TECH — Accueil"` | ✅ | HeroSection.jsx |
| Image hero `alt=""` (décorative) | ✅ | HeroSection.jsx |
| ShowcaseNav `aria-label` prev/next | ✅ | ShowcaseNav.jsx |
| LinkedIn `aria-label="LinkedIn CA-TECH"` | ✅ | Footer.jsx |
| Showcase `role="region"` | ❌ manquant | Showcase.jsx |
| Showcase `aria-roledescription="carousel"` | ❌ manquant | Showcase.jsx |
| Showcase `aria-live="polite"` | ❌ manquant | Showcase.jsx |
| Contraste `#A5ACB5` sur `#05101E` | ✅ ~4.6:1 (limite WCAG AA) | |
| Contraste `#A5ACB5` sur `#102740` | ⚠️ ~4.1:1 (borderline) | |
| Focus visible (`:focus-visible`) | ✅ globals.css | |

---

## Performance Audit

| Check | Statut |
|-------|--------|
| Hero `fetchpriority="high"` | ✅ |
| Hero `loading="eager"` | ✅ |
| Hero `<link rel="preload">` dans index-src.html | ✅ |
| Hero WebP 89KB (< 180KB budget) | ✅ |
| Images off-screen `loading="lazy"` | ✅ ProjectCard, ProjectSlide |
| Dimensions déclarées (CLS) | ✅ Hero (1920×1075) |
| Framer Motion tree-shakeable | ✅ imports sélectifs |
| CSS animations sur `transform/opacity` (GPU) | ✅ |
| Vidéos `preload="none"` | — (pas de vidéo active) |
| Build 0 erreurs | ✅ (2 warnings bénins) |

---

## Asset Production Requirements

### Midjourney (critique — bloquants)

| ID | Fichier cible | Section | Ratio | Priorité |
|----|--------------|---------|-------|---------|
| PF-01 | `public/portfolio/ca-tech-manager/dashboard.webp` | Digital Exp + Portfolio | 7:4 | **CRITIQUE** |
| PF-02 | `public/portfolio/cv-magic/home.webp` | Digital Exp + Portfolio | ~2:1 | **CRITIQUE** |
| PF-03 | `public/portfolio/pasmal/home.webp` | Digital Exp + Portfolio | ~2:1 | **CRITIQUE** |
| PF-04 | `public/portfolio/pemous-money/home.webp` | Digital Exp + Portfolio | 3:2 | **CRITIQUE** |
| SEO-01 | `public/og-image.webp` | Open Graph meta | 1.91:1 | HAUTE |
| AI-01 | `public/ai/catech-ai-showcase-loic.webp` | AI Showcase bg optionnel | 4:3 | MOYENNE |

> Les PF-01→PF-04 sont partagés entre `DigitalExperiencesSection` et `PortfolioSection`. 4 fichiers = 2 sections débloquées.

### HyperFrames (optionnel V2)

| ID | Fichier cible | Section | Priorité |
|----|--------------|---------|---------|
| V-AI-01 | `public/loic/loic-ia-new.mp4` | AI Showcase | HAUTE |
| V-HERO-01 | `public/hero/catech-hero-loop.mp4` | Hero bg loop | FAIBLE |

### Frontend/CSS only (aucun asset externe)

| Besoin | Fichier/Action | Section |
|--------|---------------|---------|
| `@keyframes glowPulse` | `globals.css` | LLM |
| `useCountUp` hook | `src/lib/hooks/useCountUp.js` | Positionnement |
| Icônes Lucide dans DomainItem | `SystemsSection.jsx` (1 ligne) | Systems |
| Icônes Lucide dans ExpertiseRow | `ExpertiseSection.jsx` (1 ligne) | Expertise |
| Dots navigation carousel | `DigitalExperiencesSection.jsx` | Digital Exp |
| Aria carousel | `Showcase.jsx` (4 attributs) | Portfolio |

### SVG outils (OD-03 — téléchargeables)

| Outil | Source officielle | Cible |
|-------|-----------------|-------|
| n8n | n8n.io/assets | `public/icons/tools/n8n.svg` |
| Make | make.com/press | `public/icons/tools/make.svg` |
| Zapier | zapier.com/brand | `public/icons/tools/zapier.svg` |
| Slack | slack.com/media-kit | `public/icons/tools/slack.svg` |
| Gmail | Google Material | `public/icons/tools/gmail.svg` |
| Google Calendar | Google Material | `public/icons/tools/google-calendar.svg` |

---

## Phase 2 Implementation Plan

### Priorité 1 — Bugs et corrections légales (< 1 jour)

1. **`globals.css`** — Ajouter `@keyframes glowPulse`
2. **`HeroSection.jsx`** — Corriger H1 "votre entreprise" → "votre croissance"
3. **`SystemsSection.jsx`** — Rendre icônes Lucide dans DomainItem
4. **`ExpertiseSection.jsx`** — Rendre icônes Lucide dans ExpertiseRow
5. **`LLMSection.jsx`** — Ajouter `margin: '0 auto'` sur le wrapper + numéros 01/02/03

### Priorité 2 — OD implémentation (2–3 jours)

6. **`src/lib/hooks/useCountUp.js`** — Créer le hook (OD-04)
7. **`PositionnementSection.jsx`** — Brancher METRICS de constants.js + count-up + citation éditoriale
8. **`ProcessSection.jsx`** — Agrandir cercles 40×40px + afficher numéros step.number + centrer headline

### Priorité 3 — Assets (selon production Midjourney)

9. **`public/portfolio/*.webp`** — Produire PF-01→PF-04 dès session Midjourney disponible
10. **`DigitalExperiencesSection.jsx`** — Brancher images + correction taille cards + dots
11. **`PortfolioSection.jsx`** — Brancher images

### Priorité 4 — Corrections UX avancées (1–2 jours)

12. **`Header.jsx` + `NavMobile.jsx`** — CTA → widget Loïc
13. **`CTASection.jsx`** — CTA → widget Loïc + dégradé fond
14. **`ProcessSection.jsx`** — CTA → widget Loïc
15. **`AIShowcaseSection.jsx`** — Ajouter sticky panel + typing animation + frame navigateur
16. **`Showcase.jsx`** — Accessibilité ARIA carousel + drag libre optionnel (OD-06)

### Priorité 5 — Outils automation (1 jour)

17. **`public/icons/tools/`** — Télécharger SVGs officiels (OD-03)
18. **`AutomationSection.jsx`** — Intégrer logos + grid texture CSS

---

## Blockers

| Blocker | Impact | Résolution |
|---------|--------|-----------|
| PF-01→PF-04 manquants | Digital Experiences + Portfolio = placeholders CSS | Session Midjourney |
| `useCountUp.js` absent | Positionnement sans count-up | Créer hook (30 min) |
| `@keyframes glowPulse` absent | LLM glow ne pulse pas | Ajouter 3 lignes globals.css |
| widget Loïc API non confirmée | CTAs → /contact partout | Lire `/public/loic-widget.js` pour trouver `window.LoicWidget.open()` |
| SVGs outils OD-03 manquants | AutomationSection sans logos | Télécharger depuis sites officiels |

---

## Files to modify

### Priorité immédiate

```
src/styles/globals.css                           → @keyframes glowPulse
src/components/sections/HeroSection.jsx          → H1 text, CTAs, stats bas
src/components/sections/LLMSection.jsx           → centrage, numéros blocs
src/components/sections/SystemsSection.jsx       → icônes Lucide DomainItem
src/components/sections/ExpertiseSection.jsx     → icônes Lucide ExpertiseRow
```

### Priorité Phase 2

```
src/lib/hooks/useCountUp.js                      → CRÉER (OD-04)
src/components/sections/PositionnementSection.jsx → METRICS, count-up, citation
src/components/sections/ProcessSection.jsx        → cercles 40px, numéros, centrage, CTA
src/components/sections/AIShowcaseSection.jsx     → sticky, typing, frame nav, CTA
src/components/sections/AutomationSection.jsx     → icons OD-03, grid texture
src/components/sections/DigitalExperiencesSection.jsx → taille cards, dots, brancher images
src/components/sections/PortfolioSection.jsx      → brancher images
src/components/showcase/Showcase.jsx              → ARIA carousel, drag optionnel OD-06
src/components/navigation/Header.jsx              → CTA widget Loïc
src/components/navigation/NavMobile.jsx           → CTA widget Loïc
src/components/sections/CTASection.jsx            → dégradé fond, CTA widget
```

---

## Files to preserve

```
src/lib/motion.js                                 → complet, ne pas modifier
src/lib/constants.js                              → données correctes V2
src/components/sections/CTASection.jsx            → quasi-conforme, modifier seulement le fond
src/components/footer/Footer.jsx                  → conforme
src/pages/Home.jsx                                → assemblage correct
src/App.jsx                                       → routes V2 correctes
src/main.jsx                                      → correct
src/components/layout/*                           → Section, Container, PageHero corrects
src/components/ui/*                               → shadcn components corrects
src/components/navigation/NavDesktop.jsx          → routes /services/* corrects
src/lib/hooks/useReducedMotion.js                 → correct
src/lib/utils.js                                  → correct
public/hero/*                                     → 4 assets WebP corrects
public/sitemap.xml                                → URLs V2 correctes
vercel.json                                       → routing V2 correct
build.sh                                          → correct
```

---

## Final Checklist

### Vérifications palette

- [x] Aucun noir pur `#000000`
- [x] Aucun violet / magenta / rose
- [x] Aucun orange (hors `#F59E0B` en indicateur d'état workflow — acceptable)
- [x] Aucun gradient AI générique
- [x] Aucun glow néon
- [x] Aucun cliché IA (robot, cerveau, hologramme)
- [x] Alternance canvas/panel respectée dans toutes les 11 sections

### Vérifications typographie

- [x] Space Grotesk sur tous les H1/H2/H3
- [x] Inter sur tous les body/labels/CTA
- [x] JetBrains Mono sur eyebrows, métriques, numéros seulement
- [x] Aucune section ressemblant à un dashboard SaaS générique
- [ ] LLMSection centrage à corriger

### Vérifications motion

- [x] `useReducedMotion` dans tous les composants animés
- [x] Variants déclarés hors composant (sauf word-by-word inline LLM — acceptable)
- [x] `viewport` standard appliqué
- [ ] `@keyframes glowPulse` à ajouter dans globals.css

### Vérifications CTAs

- [ ] Hero : corriger labels et destinations
- [ ] AIShowcaseSection : widget Loïc
- [ ] ProcessSection : widget Loïc
- [ ] CTASection : widget Loïc
- [ ] Header : widget Loïc (lire `/public/loic-widget.js` d'abord)
- [x] Footer : liens corrects
- [x] AutomationSection CTA → /services/automatisation ✅
- [x] ExpertiseSection CTA → /services/* ✅

### Vérifications assets

- [ ] PF-01→PF-04 WebP (4 images bloquantes)
- [x] HOME-01 U1 catech-hero-01.webp ✅
- [ ] SVGs outils n8n/Make/Zapier/Slack/Gmail/GCal
- [ ] SEO-01 og-image.webp
- [ ] V-AI-01 loic-ia-new.mp4 (optionnel V2)

---

## Bilan final

| Statut | Count | Sections |
|--------|-------|---------|
| **GREEN** | 2 | CTA · Footer |
| **YELLOW** | 10 | Hero · Positionnement · AI Showcase · Automation · LLM · Systems · Digital Experiences · Portfolio · Process · Expertise |
| **RED** | 0 | — |

**Fichiers à modifier en Phase 2 :** 15 fichiers  
**Fichiers à créer :** 1 (`useCountUp.js`) + 6 SVGs outils  
**Assets Midjourney à produire :** 4 critiques (PF-01→PF-04) + 1 haute (SEO-01) + 1 optionnel (AI-01)  
**Assets HyperFrames à produire :** 1 haute (V-AI-01) + 1 faible (V-HERO-01)  
**Assets frontend/CSS only :** 6 corrections sans asset externe

---

*Document généré le 2026-10-01 — Source de vérité pour Phase 2.*  
*Toute décision prise en Phase 2 doit être tracée dans CA-TECH-DECISION-REGISTER-V2.md.*
