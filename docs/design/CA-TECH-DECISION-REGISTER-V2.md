# CA-TECH — DECISION REGISTER V2
> Registre de décisions techniques — Architecture Frontend V2

**Version :** 1.0  
**Date :** 2026-10-01  
**Basé sur :** CA-TECH-FRONTEND-ARCHITECTURE-V2.md · audit App.jsx · vercel.json · index-src.html · sitemap.xml · components.json  
**Statut :** PRÊT POUR VALIDATION HUMAINE

---

## 1. Décisions déjà verrouillées

Ces décisions ne peuvent pas être rouvertes. Elles sont la base de l'architecture V2.

### Identité

| Décision | Valeur | Source |
|----------|--------|--------|
| Nom du produit | CA-TECH V2 | — |
| Palette de surface | Deep Navy `#05101E` / Navy `#102740` / Tech Blue `#1A4066` | VISUAL-DIRECTION.md |
| Accent principal | `#359BD9` (pas `#0066FF` du CLAUDE.md obsolète) | VISUAL-DIRECTION.md |
| Interdits couleur | Noir pur comme surface · Violet · Magenta · Rose · Neon | VISUAL-DIRECTION.md |
| Font display | Space Grotesk | VISUAL-DIRECTION.md |
| Font mono | JetBrains Mono | VISUAL-DIRECTION.md |

### Visuel

| Décision | Valeur | Source |
|----------|--------|--------|
| Anciens assets | Supprimés (38+) | PROMPT 19 exécuté |
| Logo | `/logos/logo-ca-tech-icon.svg` conservé | PROMPT 19 |
| Master Hero | HOME-01 U1 approuvé (2944×1648 PNG externe) | PROMPT 18 |
| HOME-01 U1 URL | `https://platform2.cdn.acedata.cloud/midjourney/dacd21b3-561d-4220-a32d-457ba1069c5b.png` | PROMPT 18 |
| HOME-02 | Pas encore généré — non bloquant Phase 1 | PROMPT 21 |
| Images | Midjourney (master style suffix défini) | VISUAL-ASSET-PRODUCTION.md |
| Vidéos | HyperFrames by HeyGen | VISUAL-ASSET-PRODUCTION.md |
| Pipeline visuel | Claude Design → Midjourney → HyperFrames → Claude Code | PROMPT 21 |
| Higgsfield | ABANDONNÉ — interdit dans le projet | PROMPT 21 |

### UX/UI

| Décision | Valeur | Source |
|----------|--------|--------|
| Numérotation décorative 01/02/03 | INTERDIT dans l'UI publique | PROMPT 21 |
| Grilles génériques de cards | INTERDIT — chaque section a sa propre composition | PROMPT 21 |
| Monospace omniprésent | INTERDIT — réservé aux métriques et code | PROMPT 21 |
| Direction éditoriale | Premium · Technologique · Éditorial | VISUAL-DIRECTION.md |
| Ordre sections homepage | Systems AVANT Digital Development | PROMPT 21 |

### Contenu

| Décision | Valeur | Source |
|----------|--------|--------|
| Photos fondateur/équipe | Vraies photos uniquement | PROMPT 21 |
| AI demo | Contenu préparé/enregistré — jamais live model call | PROMPT 21 |
| Backend | Supabase · Stripe · API Vercel · Manager · RGPD · Loïc widget — INTACT | PROMPT 21 |

---

## 2. OD-01 — Fallback Hero

### Problème

HOME-01 U1 (PNG externe, 2944×1648) doit être téléchargé, converti en WebP et placé dans `public/hero/` avant de pouvoir être utilisé dans `HeroSection.jsx`. Pendant la phase de développement — et en cas d'indisponibilité de l'asset — il faut un fallback fonctionnel pour que le Hero s'affiche correctement.

### Options

| Option | Description |
|--------|-------------|
| A — Terminal console | Garder le composant `HeroVisual` existant (interface "CA-TECH Intelligence Console" en React) |
| B — Placeholder WebP | Créer une image de remplacement branded (fond dégradé + logo) |

### Conséquences

**Option A — Terminal console (existant)**
- Déjà codé dans `HeroSection.jsx` — zéro effort
- Cohérent avec l'identité CA-TECH (démontre l'aspect technique)
- Conversion vers HOME-01 U1 = simple remplacement du composant `HeroVisual` par une `<img>`
- Aucun asset supplémentaire à produire

**Option B — Placeholder WebP**
- Nécessite production d'un asset (Midjourney ou design CSS)
- Moins communicant que le terminal console
- Double travail : créer le placeholder, puis le remplacer par U1

### Dépendances

- Dépend de la disponibilité du CDN externe (risque R-01 documenté)
- Dépend de la réalisation de la conversion PNG → WebP (tâche Phase 1)

### Décision proposée

**OPTION A — Terminal console conservé comme fallback.**

Le composant existant est fonctionnel, branded, et communique l'expertise IA de CA-TECH sans asset externe. La migration vers HOME-01 U1 se fait en une seule modification de `HeroSection.jsx` une fois l'asset matérialisé.

### Impact frontend

- `HeroSection.jsx` : aucune modification pour le fallback
- Quand U1 disponible : remplacer `<HeroVisual />` par `<img src="/hero/catech-hero-01.webp" ...>` avec les styles flottement et shadow
- Stratégie de basculement : flag conditionnel `const heroAsset = '/hero/catech-hero-01.webp'` — si asset présent, image ; sinon, HeroVisual

---

## 3. OD-02 — AI Showcase

### Problème

`AIShowcaseSection.jsx` doit montrer concrètement ce qu'est un agent IA CA-TECH. L'asset vidéo `public/loic/loic-ia.mp4` a été supprimé lors du reset visuel. Il faut décider comment incarner la démonstration de Loïc IA.

### Options

| Option | Description |
|--------|-------------|
| A — Animation code | Simuler une conversation Loïc via typing animation (React pur) |
| B — Nouveau recording | Enregistrer une nouvelle vidéo de démonstration Loïc via HyperFrames |

### Conséquences

**Option A — Animation code**
- Zéro dépendance externe — fonctionne immédiatement
- Aucun fichier vidéo (< 6 MB économisés au chargement)
- Contrôle total sur le contenu (texte facilement modifiable)
- Aspect "interface live" — cohérent avec le registre Opérationnel du Showcase System
- Seul inconvénient : moins réaliste qu'une vraie vidéo de Loïc en action

**Option B — Nouveau recording**
- Plus authentique — montre vraiment Loïc en fonctionnement
- Dépendance : Loïc doit être disponible et la session doit être enregistrée
- Dépendance HyperFrames : abonnement + production time
- Fichier vidéo ~6 MB : impact performance (LCP dégradé si autoplay)
- Risque : qualité vidéo insuffisante → re-enregistrement nécessaire

### Dépendances

- Option B bloque le développement de la section jusqu'à la livraison de la vidéo
- Option A peut être développée immédiatement et remplacée par la vidéo ultérieurement

### Décision proposée

**OPTION A — Animation code pour V1. Vidéo en V2.**

L'animation code est développée en Phase 1 (immédiatement). Elle utilise le registre Opérationnel du Showcase System : interface de chat simulée, messages qui apparaissent progressivement, curseur clignotant. La vidéo est produite en Phase 2 quand Loïc IA est prêt à être démontré.

### Impact frontend

- Implémenter `ConversationSimulator` : composant React avec `useEffect` + `setTimeout` qui affiche les messages séquentiellement
- Messages scriptés dans un tableau de données (facilement modifiables sans recodage)
- Utiliser les tokens motion : `duration.storytelling (1.0s)` pour l'effet typing
- Structure : fond navy panel, chrome bar (comme HeroVisual), messages alternant user/assistant

---

## 4. OD-03 — Automation Icons

### Problème

Les icônes des outils d'automatisation (n8n, Make, Zapier, Slack, Gmail, Google Calendar) ont été supprimées lors du reset. Il faut décider quelle source utiliser pour les reconstruire.

### Options

| Option | Description |
|--------|-------------|
| A — Logos officiels | SVG/PNG téléchargés depuis les brand assets de chaque outil |
| B — Midjourney custom | Icons flat générés en MJ cohérentes avec la palette CA-TECH |

### Conséquences

**Option A — Logos officiels**
- Reconnaissance immédiate par les visiteurs (n8n, Make, Zapier sont reconnaissables)
- Renforcent la crédibilité ("nous maîtrisons ces outils précisément")
- Cadre légal : la plupart des outils SaaS autorisent l'affichage de leur logo dans un contexte d'intégration/compatibilité
  - n8n : brand assets disponibles sur `n8n.io/brand-assets`, usage permis pour "partner/integration context"
  - Make : logo disponible, usage permis pour pages d'intégration
  - Zapier : usage permis en "integration badge" context
  - Gmail / Google Calendar : Google Brand Guidelines autorisent l'affichage en contexte de compatibilité produit
  - Slack : Brand Guidelines autorisent l'affichage comme intégration
- Format : SVG vectoriels → petits, scalables, pas de dépendance Midjourney
- Les logos officiels créent un léger contraste visuel avec la palette CA-TECH (couleurs propres à chaque outil)

**Option B — Midjourney custom icons**
- Cohérence totale avec la palette Deep Navy
- Zéro risque légal
- Moins de reconnaissance — le visiteur doit lire le label pour comprendre
- Risque esthétique : les icons générées MJ pour des outils spécifiques peuvent manquer de précision

### Dépendances

- Option A : aucune dépendance externe — SVGs disponibles immédiatement
- Option B : dépend d'une session Midjourney

### Décision proposée

**OPTION A — Logos officiels SVG.**

La reconnaissance des marques outils est un argument de crédibilité directe. Un visiteur qui voit le logo n8n ou Make comprend instantanément que CA-TECH utilise ces outils réellement. Les guidelines légales autorisent cet usage. Les logos sont affichés sur fond navy avec une légère désaturation/opacité pour les intégrer visuellement.

**Règle d'intégration :** Chaque logo est affiché à `opacity: 0.75`, filtré `grayscale(20%)`. Au hover : `opacity: 1`, `grayscale(0%)`. Cela préserve la cohérence visuelle CA-TECH tout en maintenant la reconnaissance.

### Impact frontend

- Créer `public/icons/tools/` avec les SVGs : n8n.svg, make.svg, zapier.svg, slack.svg, gmail.svg, google-calendar.svg, python.svg, nodejs.svg
- Dans `AutomationSection.jsx` : reconstruire la section icons avec ces SVGs
- Style : `filter: grayscale(20%)`, `opacity: 0.75`, `transition: filter 0.2s, opacity 0.2s`
- Hover : `filter: grayscale(0%)`, `opacity: 1`

---

## 5. OD-04 — Count-up Animation

### Problème

La section Positionnement doit afficher 4 métriques avec animation count-up au scroll. `src/lib/motion.js` ne contient pas encore ce variant. Il faut décider comment l'implémenter.

### Options

| Option | Description |
|--------|-------------|
| A — Library countUp.js | Dépendance npm `countup.js` (~7KB gzippé) |
| B — Framer Motion custom | Hook `useCountUp` utilisant `useMotionValue` + `useTransform` + `useInView` |

### Conséquences

**Option A — countUp.js**
- API simple : `new CountUp(el, 0, value, 2, { duration: 1.2 })`
- Ajoute ~7KB au bundle
- Dépendance supplémentaire à maintenir
- Ne s'intègre pas nativement dans le système motion Framer Motion

**Option B — Hook custom Framer Motion**
- Zéro nouvelle dépendance — Framer Motion est déjà dans le projet
- Cohérence totale avec `src/lib/motion.js`
- Implémantation : `useMotionValue(0)` + `animate()` avec `ease: ease.smooth` + `useTransform` pour formater la valeur
- Compatible avec `useReducedMotion` : désactiver l'animation si `prefersReduced`
- Légèrement plus de code initial mais parfaitement maintenable

```typescript
// Pattern d'implémentation
function useCountUp(target: number, duration = 1.2) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, v => Math.round(v))
  const isInView = useInView(ref, { once: true })
  useEffect(() => {
    if (isInView) animate(count, target, { duration, ease: ease.smooth })
  }, [isInView])
  return rounded
}
```

### Dépendances

- Dépend de la complétion de `src/lib/motion.js` (déjà planifiée Phase 1)
- La solution B peut être développée en même temps que les autres variants manquants

### Décision proposée

**OPTION B — Hook custom Framer Motion.**

Pas de nouvelle dépendance. Cohérence totale avec le système motion existant. Gestion `prefers-reduced-motion` gratuite. Le hook est ajouté dans `src/lib/hooks/useCountUp.js`.

### Impact frontend

- Créer `src/lib/hooks/useCountUp.js`
- Ajouter `counterReveal` variant dans `src/lib/motion.js` (pour l'animation d'entrée de la card métrique)
- Dans `PositionnementSection.jsx` : utiliser `<motion.span>` + `useCountUp()` pour chaque métrique numérique
- Pour les valeurs non-numériques (`< 1 sem.`, `2023`) : entrée `counterReveal` simple sans count-up

---

## 6. OD-05 — Loïc Widget

### Problème

Le CTA "Parler à Loïc" dans le header navigue actuellement vers `/contact` au lieu d'ouvrir le widget Loïc. Il faut décider comment l'intégration du widget doit fonctionner.

### Options

| Option | Description |
|--------|-------------|
| A — Script externe (actuel) | Conserver `/loic-widget.js` comme script `defer` dans `index-src.html` |
| B — Composant React | Réécrire le widget comme composant React avec lazy loading |

### Conséquences

**Option A — Script externe**
- Déjà intégré dans `index-src.html` ligne 80 : `<script src="/loic-widget.js" defer></script>`
- Le script expose une API globale (`window.LoicWidget.open()` ou similaire)
- Appel depuis React : `document.querySelector('[data-loic]')?.click()` ou API globale
- Le widget est maintenu séparément — sa logique est découplée du site
- Zéro risque de régresser l'interface Loïc en modifiant le site

**Option B — Composant React**
- Couplerait le code du widget avec la codebase React du site
- Risque de régression sur le backend Loïc (Supabase/Edge Functions)
- Temps de développement élevé sans bénéfice visible
- Contredirait la règle backend : "aucun live model call depuis le frontend"

### Dépendances

- Pour Option A : seul le CTA header doit être corrigé (1 ligne dans `Header.jsx`)

### Décision proposée

**OPTION A — Script externe conservé. DÉCISION VERROUILLÉE.**

Il n'y a pas de décision à prendre ici : l'Option B n'est pas viable. La seule action requise est de corriger l'action du CTA "Parler à Loïc" dans `Header.jsx` pour appeler l'API du widget au lieu de naviguer vers `/contact`.

**Implémentation du CTA corrigé :**
```javascript
// Header.jsx — corriger le onClick du CTA
const handleLoic = () => {
  if (window.LoicWidget?.open) {
    window.LoicWidget.open()
  } else {
    // Fallback si widget non chargé
    window.location.href = '/contact'
  }
}
```

### Impact frontend

- `Header.jsx` : remplacer `<Link to="/contact">` par `<button onClick={handleLoic}>` avec le même style
- Vérifier l'API exposée par `/loic-widget.js` pour connaître le nom exact de la méthode d'ouverture
- Tester : le widget s'ouvre sur click → sinon fallback /contact

---

## 7. OD-06 — Drag Carousel / Showcase

### Problème

Le composant `Showcase.jsx` (à construire) doit supporter drag/swipe sur mobile et desktop. Il faut choisir entre Framer Motion drag natif et une bibliothèque spécialisée. De plus, la navigation du showcase ne doit PAS afficher de numérotation publique de type "01 / 04".

### Options

| Option | Description |
|--------|-------------|
| A — Framer Motion `drag="x"` | Utiliser `motion.div drag="x" dragConstraints dragElastic` |
| B — embla-carousel | Bibliothèque React spécialisée (~3KB gzippé) |

### Conséquences

**Option A — Framer Motion drag**
- Zéro nouvelle dépendance (Framer Motion v13 déjà installé)
- API familière dans le contexte du projet
- `drag="x"` avec `dragConstraints` gère l'inertie et le rebond
- Nécessite du code custom pour les bounds, snap-to-slide, et l'indication de fin de liste
- Intégration avec le système motion existant (transitions, reduced-motion)

**Option B — embla-carousel**
- Purpose-built : snap-to-slide parfait, performance optimisée, touch natif
- API très simple : `useEmblaCarousel()` hook
- Gestion avancée : loop, autoplay, lazy images, accessible par défaut
- Ajoute une dépendance mais c'est ~3KB — coût faible
- Découplé de Framer Motion : animations d'entrée/sortie des slides à gérer séparément

### Dépendances

- La décision impacte le composant `Showcase.jsx` (à créer en Phase 1)
- Impacte aussi `DigitalExperiencesSection.jsx` et `PortfolioSection.jsx`

### Décision proposée

**OPTION A — Framer Motion drag="x".**

La cohérence du système motion prime. Framer Motion v13 gère l'inertie, les contraintes et les snap points nativement via `dragConstraints` + `onDragEnd` avec calcul du slide actif. La logique custom est acceptable dans ce contexte puisqu'elle s'intègre dans un système déjà maîtrisé.

**Specification complète du Showcase (sans numérotation) :**

```
Desktop
├── Track : overflow hidden, width 100%
├── Slides : flexbox, chaque slide flex-shrink-0
├── Peek : width = "calc(cardWidth + 40px)" → révèle le bord du suivant
├── Drag : drag="x", dragConstraints calculés dynamiquement, dragElastic 0.05
├── Snap : onDragEnd → calculer le slide le plus proche → animate() vers sa position
├── Arrows : boutons gauche/droite, visibles au hover de la section (desktop seulement)
└── Dots : • • • (cercles pleins) — actif blanc, inactif rgba(255,255,255,0.25)
           JAMAIS de "01 / 04" ou compteur numérique visible

Mobile
├── Touch : même logique drag, optimisé pointer events
├── Peek : 16px de débordement visible (indique qu'il y a du contenu)
├── 1 slide complet visible (pas 1.5)
└── Dots : identiques desktop

Keyboard
├── ArrowLeft : slide précédent
├── ArrowRight : slide suivant
├── Tab : navigation entre éléments interactifs dans le slide actif
└── Aria : role="group" aria-roledescription="slide" aria-label="Slide N sur M" (accessible mais invisible)

Reduced Motion
├── Transitions : instant (duration 0ms)
├── Drag : désactivé → navigation uniquement via arrows/dots/keyboard
└── Auto-play : désactivé

Gestion images
├── Slide visible : <img loading="eager">
├── Slides off-screen : <img loading="lazy">
└── Fallback : si image null → placeholder CSS branded (gradient + logo watermark)

Gestion vidéo
├── Vidéo dans slide : <video autoPlay muted loop playsInline> uniquement si slide actif
├── Slides inactifs avec vidéo : pause() via useEffect
└── Poster : toujours requis pour les vidéos

Auto-play (optionnel)
├── Activé uniquement sur showcases ambient (section AI)
├── Désactivé si prefersReduced
├── Pause au hover et au focus
└── Interval : 4000ms minimum
```

### Impact frontend

- Créer `src/components/showcase/Showcase.jsx` avec les specs ci-dessus
- `src/components/showcase/ShowcaseSlide.jsx`
- `src/components/showcase/ShowcaseDots.jsx` (jamais de chiffres)
- `src/components/showcase/ShowcaseArrows.jsx`

---

## 8. OD-07 — HOME-02

### Problème

HOME-01 U1 est le Master Hero. HOME-02 devrait être un second visuel éditorial pour enrichir le site (page intérieure, deuxième hero, visuel showcase). Le concept de HOME-02 n'a pas encore été défini.

### Options

| Option | Description |
|--------|-------------|
| A — Re-shoot cohérent avec U1 | Nouvelle session MJ dans le même style, même lighting, complémentaire à U1 |
| B — Concept différent | HOME-02 répond à un besoin visuel distinct (portrait consultant, scene de travail, etc.) |

### Conséquences

**Option A — Re-shoot cohérent avec U1**
- Crée une famille visuelle cohérente (deux images qui se ressemblent et se complètent)
- Utile pour les pages intérieures ou comme second hero desktop (version alternative)
- Dépendance : U1 doit d'abord être en production pour valider que son style fonctionne bien

**Option B — Concept différent**
- Plus de flexibilité — HOME-02 peut servir la section AIShowcase ou une page intérieure spécifique
- Risque de manque de cohérence visuelle si le style diverge de U1

### Dépendances

**BLOCAGE COMPLET sur OD-01 :** HOME-02 ne peut pas être défini avant que HOME-01 U1 soit en production et validé visuellement sur le site réel. Le contexte couleur, le rendu WebP, et l'interaction avec la palette navy doivent être observés en production.

### Décision proposée

**HOME-02 EST DIFFÉRÉ. Non-bloquant pour Phase 1.**

La décision de concept et de contenu de HOME-02 est repoussée à la Phase 2, après que HOME-01 U1 soit intégré et observé en production. Au moment de produire HOME-02, utiliser le même master style suffix Midjourney que U1 et décider du sujet en fonction du besoin visuel de la page intérieure la plus prioritaire.

### Impact frontend

- Aucun impact Phase 1
- Phase 2 : prévoir `public/hero/catech-hero-02.webp` dans le planning assets

---

## 9. Décisions bloquantes

### BLOCKER CRITIQUE — vercel.json route conflict

**Problème identifié lors de l'audit de code :**

```json
// vercel.json lignes 61-62 — ÉTAT ACTUEL
{ "source": "/services",        "destination": "/expertises/web-saas", "permanent": true },
{ "source": "/services/:path*", "destination": "/expertises/web-saas", "permanent": true }
```

**Conséquence :** Toute requête vers `/services/ia`, `/services/automatisation`, etc. est redirigée (301 permanent) vers `/expertises/web-saas`. Cela écrase les routes React Router définies dans `App.jsx`. Les routes `/services/*` sont **inopérantes en production** dans l'état actuel.

**Correction obligatoire avant déploiement :**
1. Supprimer les deux redirects `/services` et `/services/:path*` de `vercel.json`
2. Ajouter à la place des redirects 301 pour les anciennes routes `/expertises/*` → `/services/*`

### BLOCKER IMPORTANT — Sitemap obsolète

`public/sitemap.xml` contient uniquement des anciennes URLs (`/collaborateurs-ia`, `/automatisations`, `/catalogue`, `/tarifs`, `/loic`, `/realisations`). Aucune URL V2 (`/services/*`, `/projets`, `/a-propos`) n'est présente. Le sitemap est entièrement à réécrire.

### BLOCKER IMPORTANT — HOME-01 U1 non matérialisé

`public/hero/catech-hero-01.webp` n'existe pas. Le Hero rebuild ne peut pas être finalisé sans cet asset.

### Non-bloquants (peuvent être développés en parallèle)

| Situation | Impact | Action |
|-----------|--------|--------|
| Font Manrope dans globals.css | Visuel seulement | Changer au début de Phase 1 |
| Screenshots portfolio = null | Sections avec placeholders | Reconstruire quand screenshots disponibles |
| Automation icons supprimées | Section incomplète | Reconstruire avec logos officiels |
| AI Showcase sans vidéo | Animation code suffit en V1 | Non-bloquant |

---

## 10. Ordre recommandé des décisions

```
AUJOURD'HUI — Décisions à valider humainement
├── OD-05 : Loïc widget → VERROUILLÉ (script externe, un seul point à corriger)
├── OD-04 : Count-up → VERROUILLÉ (hook custom Framer Motion)
├── OD-01 : Fallback Hero → VERROUILLÉ (terminal console)
├── OD-02 : AI Showcase → VERROUILLÉ (animation code V1)
├── OD-03 : Automation icons → VERROUILLÉ (logos officiels SVG)
├── OD-06 : Drag carousel → VERROUILLÉ (Framer Motion drag)
└── OD-07 : HOME-02 → DIFFÉRÉ (bloqué sur HOME-01 production)

AVANT PREMIER COMMIT — Actions impératives
├── 1. Corriger vercel.json (BLOCKER critique)
├── 2. Télécharger et convertir HOME-01 U1 → WebP
└── 3. Mettre à jour sitemap.xml

PHASE 1 — Développement (voir checklist §12)
├── Font : Manrope → Inter
├── Routes : App.jsx + vercel.json + constants.js + nav components
├── motion.js : compléter les variants
├── Sections : rebuild Hero, Automation icons, AI Showcase animation
└── Assets portfolio : brancher quand disponibles

PHASE 2 — Décision HOME-02 possible
└── Après observation de HOME-01 U1 en production
```

---

## 11. Prérequis avant développement

### Prérequis techniques

- [ ] **CRITIQUE** : Télécharger HOME-01 U1 depuis le CDN externe
  - Source : `https://platform2.cdn.acedata.cloud/midjourney/dacd21b3-561d-4220-a32d-457ba1069c5b.png?imageMogr2/cut/2944x1648x0x0`
  - Convertir en WebP qualité 85
  - Placer dans `public/hero/catech-hero-01.webp`
  - Créer version mobile : `public/hero/catech-hero-mobile.webp` (crop 1080×1920 ou recadrage)
  - Créer poster : `public/hero/catech-hero-poster.webp` (optimisé < 80KB)
  - **Risque R-01** : l'URL CDN peut devenir indisponible à tout moment — télécharger immédiatement

- [ ] **CRITIQUE** : Télécharger les SVGs logos outils d'automatisation
  - n8n : `https://n8n.io/brand` → n8n.svg
  - Make : page brand assets → make.svg
  - Zapier : brand assets → zapier.svg
  - Gmail : Google Brand Guidelines → gmail.svg
  - Slack : Brand Guidelines → slack.svg
  - Google Calendar → google-calendar.svg
  - Placer dans `public/icons/tools/`

- [ ] **CRITIQUE** : Identifier l'API du widget Loïc
  - Lire `public/loic-widget.js` pour trouver la méthode d'ouverture (ex: `window.LoicWidget?.open()`)
  - Sans cette info, le CTA ne peut pas être corrigé correctement

### Prérequis de décision humaine

- [ ] Valider OD-01 à OD-07 tels que proposés dans ce document
- [ ] Valider la décision font : **Inter** (voir § Analyse Font ci-dessous)
- [ ] Valider la stratégie migration routes : `/services/*` avec redirects 301 depuis `/expertises/*`
- [ ] Confirmer les screenshots portfolio : vrais screenshots à prendre ou utiliser des placeholders CSS pendant Phase 1 ?
- [ ] Confirmer le texte exact du CTA Hero ("Démarrer avec Loïc" ou "Parler à Loïc")

---

### Analyse Font — Décision proposée

**État actuel :** `Manrope` dans `globals.css` + `index-src.html`  
**Spec VISUAL-DIRECTION.md :** `Inter` (confirmé [TYPE-B])

**Évaluation comparative :**

| Critère | Manrope | Inter |
|---------|---------|-------|
| Identité visuelle | Humaniste géométrique — légèrement "startup chaleureuse" | Néo-grotesque — neutre, technique, digital natif |
| Lisibilité corps | Très bonne à 16px+ | Excellente à toutes tailles, y compris 11px labels |
| Caractère éditorial | Distinctif, personnalité propre | Sobre, s'efface au profit du contenu |
| Cohérence CA-TECH | Acceptable | Aligné avec Stripe · Vercel · Linear (références CLAUDE.md) |
| Performance | Google Fonts, 5 weights | Google Fonts, 5 weights — identique |
| Disponibilité projet | Chargée dans index-src.html | À substituer dans index-src.html |
| Risque de changement | — | Minimal — Inter ≃ même chasse que Manrope |

**Décision proposée : INTER.**

Les trois références de design citées dans CLAUDE.md (Stripe, Vercel, Linear) utilisent toutes Inter ou une fonte néo-grotesque équivalente. Manrope a une personnalité légèrement plus chaude qui ne correspond pas au positionnement "cabinet IA technique premium" de CA-TECH V2. Inter à 16px avec `line-height: 1.6` est parfaitement lisible et s'efface pour laisser parler l'architecture visuelle.

---

### Analyse Routes — Stratégie de migration

**État actuel détaillé :**

```
App.jsx
├── /services/*     → Stub (définies mais pointent vers pages vides)
├── /expertises/ia              → ExpertiseIA (page existante)
├── /expertises/automatisation  → ExpertiseAuto (page existante)
├── /expertises/web-saas        → ExpertiseWeb (page existante)
├── /expertises/infrastructure  → ExpertiseInfra (page existante)
└── /expertises/*               → Stub

vercel.json (BLOCKER)
├── /services → /expertises/web-saas  [REDIRECT 301 — À SUPPRIMER]
└── /services/:path* → /expertises/web-saas  [REDIRECT 301 — À SUPPRIMER]

constants.js
└── EXPERTISE_CARDS href → /services/* déjà correct

sitemap.xml
└── Contient uniquement anciennes routes — entièrement obsolète
```

**Plan de migration (ordre obligatoire) :**

```
1. vercel.json
   SUPPRIMER :
     { "source": "/services",        "destination": "/expertises/web-saas" }
     { "source": "/services/:path*", "destination": "/expertises/web-saas" }
   
   AJOUTER :
     { "source": "/expertises/ia",              "destination": "/services/ia",              "permanent": true }
     { "source": "/expertises/automatisation",  "destination": "/services/automatisation",  "permanent": true }
     { "source": "/expertises/web-saas",        "destination": "/services/developpement",   "permanent": true }
     { "source": "/expertises/infrastructure",  "destination": "/services/ia",              "permanent": true }
     { "source": "/expertises/:path*",          "destination": "/services",                 "permanent": true }
     { "source": "/realisations",               "destination": "/projets",                  "permanent": true }

2. App.jsx
   SUPPRIMER les imports et routes ExpertiseIA / ExpertiseAuto / ExpertiseWeb / ExpertiseInfra
   (Ces pages sont des Stubs de l'ancien site — les nouvelles pages /services/* seront créées en Phase 2)
   CONSERVER toutes les routes /services/* existantes (pointent déjà vers Stub)
   CONSERVER /expertises/* comme catch-all (React Router fallback)

3. NavDesktop.jsx + NavMobile.jsx
   Vérifier que les liens nav utilisent /services/* (probablement déjà correct d'après constants.js)

4. sitemap.xml — réécriture complète avec URLs V2

5. index-src.html JSON-LD
   Mettre à jour les URLs dans serviceType / hasOfferCatalog qui pointent encore vers /creation-site-vitrine, /automatisations, etc.
```

---

### Analyse shadcn — Gouvernance des composants

**Configuration actuelle :** style "base-nova", plain JS (pas TypeScript), neutral base, cssVariables: true

**Composants installés :**
```
src/components/ui/
├── badge.jsx       — shadcn
├── button.jsx      — shadcn
├── button-link.jsx — custom (React Router + shadcn Button)
├── card.jsx        — shadcn
├── separator.jsx   — shadcn
├── MetricStat.jsx  — custom CA-TECH
├── Eyebrow.jsx     — custom CA-TECH
└── Tag.jsx         — custom CA-TECH
```

**Règles de gouvernance :**

```
COMPOSANTS SHADCN AUTORISÉS (usage modéré)
├── badge.jsx     → eyebrow badges, labels (avec override styles CA-TECH)
├── button.jsx    → base pour CTAs (avec override couleurs/radius CA-TECH)
├── button-link.jsx → CTAs avec navigation (composant custom existant)
└── separator.jsx → séparateurs discrets

COMPOSANTS SHADCN À UTILISER EN PHASE 2 (si besoin)
├── Sheet   → drawer mobile nav (alternative à NavMobile custom)
├── Dialog  → modals (formulaire devis, confirmations)
├── Form + Input + Select → formulaires contact/devis
└── DropdownMenu → nav desktop dropdown Expertises

COMPOSANTS SHADCN INTERDITS POUR LE SITE PRINCIPAL
├── card.jsx  → INTERDIT pour les sections site (trop générique, brise l'identité)
│              Exception : peut servir comme base interne dans Manager
├── Table     → INTERDIT — construire des layouts tabulaires custom
├── Tabs      → INTERDIT — construire le showcase system custom
└── Carousel  → INTERDIT — construire Showcase.jsx custom (OD-06)

RÈGLE GÉNÉRALE
Un composant shadcn ne doit jamais être visible tel quel dans le rendu final.
Tout composant shadcn utilisé doit recevoir des styles CA-TECH qui écrasent
l'esthétique shadcn par défaut (couleurs, radius, typography, spacing).
```

---

## 12. Checklist de démarrage frontend

### Avant d'écrire une seule ligne de code

- [ ] **OD-01 à OD-07 validés** par le décideur humain (ce document)
- [ ] **HOME-01 U1 téléchargé** et disponible localement (PNG → WebP → `public/hero/`)
- [ ] **API Loïc widget identifiée** (lire `public/loic-widget.js`)
- [ ] **Logos SVG outils** téléchargés dans `public/icons/tools/`
- [ ] **Decision font validée** (Inter confirmé)
- [ ] **Decision routes validée** (/services/* confirmé)

### Ordre d'implémentation Phase 1

```
SEMAINE 1 — Fondations
├── 1. globals.css : Manrope → Inter (+ test visuel toutes sections)
├── 2. index-src.html : Google Fonts Manrope → Inter
├── 3. vercel.json : supprimer redirects /services, ajouter redirects /expertises → /services
├── 4. App.jsx : nettoyer imports ExpertiseIA/Auto/Web/Infra obsolètes
├── 5. sitemap.xml : réécriture complète URLs V2
├── 6. src/lib/motion.js : compléter variants manquants (spring, distance, dropIn, popIn, etc.)
└── 7. npm run build → vérifier 0 erreur

SEMAINE 2 — Hero + sections critiques
├── 8. HeroSection.jsx : corriger H1 "votre croissance", CTA href /projets
├── 9. Header.jsx : corriger CTA "Parler à Loïc" → window.LoicWidget?.open()
├── 10. HeroSection.jsx : brancher HOME-01 U1 (si asset prêt) ou finaliser fallback terminal
├── 11. AutomationSection.jsx : reconstruire icons outils avec SVGs officiels
├── 12. AIShowcaseSection.jsx : implémenter ConversationSimulator (animation code)
└── 13. Showcase.jsx + ShowcaseDots.jsx + ShowcaseArrows.jsx : build du composant

SEMAINE 3 — Assets + tests
├── 14. Portfolio + Digital Experiences : brancher images quand disponibles (ou finaliser placeholders CSS)
├── 15. Test responsive : 375px / 768px / 1280px / 1440px
├── 16. Test reduced-motion
├── 17. Test navigation complète (tous les liens, redirects)
├── 18. Lighthouse : LCP < 2.5s · CLS < 0.1 · INP < 200ms
└── 19. npm run build final → 0 erreur → prêt pour commit
```

### Gate de déploiement (avant push)

- [ ] `npm run build` — 0 erreurs, 0 nouveaux warnings
- [ ] Toutes les routes `/services/*` accessibles en dev (`npm run dev`)
- [ ] Redirects `/expertises/*` → `/services/*` validés localement
- [ ] CTA "Parler à Loïc" ouvre le widget (ou fallback /contact si widget absent)
- [ ] HOME-01 U1 s'affiche correctement (ou terminal console fallback visible)
- [ ] Aucune console error en prod build
- [ ] Meta OG et JSON-LD mis à jour (URLs V2)

---

*Document créé le 2026-10-01 — Registre de décisions actif jusqu'à Phase 2.*  
*Toute décision validée ici doit être reportée dans CA-TECH-FRONTEND-ARCHITECTURE-V2.md.*
