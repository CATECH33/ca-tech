# VISUAL STORYBOARD — CA-TECH V2
## Homepage — Expérience éditoriale & produit
**Date :** 28 septembre 2026
**Statut :** À valider avant toute implémentation

---

## Principes directeurs

Ce storyboard refuse catégoriquement le modèle "agence IA template" :
bento grid, cartes glassmorphism, particules flottantes, dashboards décoratifs, orbes violets.

La référence de principe est Tomorro (Refero), dont on adapte **la philosophie**, pas l'identité :
- Les sections racontent quelque chose — elles ne l'annoncent pas
- Le scroll avance une histoire — il ne déroule pas une liste
- Les visuels prouvent — ils n'illustrent pas
- La typographie porte la direction artistique
- L'accent chromatique est unique et réservé aux moments d'intention

CA-TECH est un cabinet technique sérieux. Le site doit le sentir à la première seconde.

---

## Palette CA-TECH (rappel)

```
#05101E  Deep Navy      — canvas principal (dark)
#102740  Navy           — surfaces élevées dark
#1A4066  Technical Blue — cartes sur dark
#359BD9  Light Tech Blue — accent unique — action, emphasis
#A5ACB5  Silver         — texte secondaire sur dark
#E0E0E3  Light Silver   — bordures sur light
#F2F4F6  Cool White     — surfaces sur light
#ffffff  White          — fond sections light
```

**Règle absolue :** `#359BD9` est le seul accent. Jamais deux couleurs d'action.

---

## Système de slides — Règle de progression

La progression dans les slides est **communicée visuellement**, jamais numériquement.

**Interdit :** `01 / 04`, `SLIDE 2`, tirets de progression numérotés.

**Autorisé comme indicateur :**
- Barre de progression fine (1-2px, accent) qui s'étend horizontalement
- Points non numérotés (petits cercles, 4px) — rempli = actif
- Changement de composition lui-même (le visuel change = nouvelle slide)
- Opacité du texte (le texte actif est à pleine opacité, les inactifs s'effacent)

Le spectateur comprend où il en est par le contexte visuel — pas par un compteur.

---

## Architecture de la page

```
Hero
└── Typographie + atmosphère

Intelligence Artificielle
└── 5 slides sticky scroll

Automatisation
└── 5 slides sticky scroll

Web & SaaS
└── 5 slides sticky scroll

Infrastructure
└── 5 slides sticky scroll

Réalisations
└── Grid de projets

Notre approche
└── Parcours éditorial

CA-TECH
└── Fondateur + positionnement

Contact
└── CTA final
```

---

---

# SECTION — HERO

## 1. Intention narrative

Première impression immédiate : sérieux, précis, technique.
Pas une agence. Pas une startup. Un cabinet qui sait où il va.
Le titre doit claquer comme un titre de journal du Monde — pas comme un slogan publicitaire.

## 2. Message principal

> **"La technologie au travail."**

Sous-message : CA-TECH conçoit, automatise et déploie des systèmes numériques pour les entreprises.

## 3. Composition visuelle

**Surface :** `#05101E` Deep Navy — plein viewport.

**Zone gauche (dominant) :**
- Label de catégorie ultra-fin : `CA-TECH · CABINET TECHNOLOGIQUE` — majuscules, espacement 0.18em, silver tertaire, 11px.
- Ligne fine hairline (1px, rgba blanc 6%) sous le label — élément architectural.
- Headline : `LA TECHNOLOGIE / AU TRAVAIL.` — IBM Plex Sans Condensed 700, clamp(52px → 88px), lh 0.90, majuscules. Deux lignes. Blanche.
- Corps : une phrase sobre. Silver. 18px. Max-width 520px.
- Deux CTAs : pill primaire `#359BD9` + ghost blanc.

**Atmosphère :**
- Orb unique : gradient radial `rgba(53,155,217,0.10)` → transparent, 700px, blur 100px, positionné haut-droite, partiellement hors viewport. Opacité 0.35.
- Aucun autre élément décoratif.

**Ce qui n'est PAS là :**
- Aucun product mockup
- Aucune grille de cartes
- Aucun logo client
- Aucun chiffre statistique

Le hero est une déclaration typographique. C'est tout.

## 4. Nombre de slides

Aucune — pas de système de slides dans le hero.

## 5. Type de visuel

**CSS / Atmosphère** — orb uniquement.

## 6. Motion

| Élément | Entrée | Paramètres |
|---------|--------|-----------|
| Label + hairline | Fade up | delay 0ms, 400ms ease-out |
| Headline L1 | Fade up | delay 80ms, 500ms ease-out |
| Headline L2 | Fade up | delay 160ms, 500ms ease-out |
| Corps | Fade up | delay 280ms, 400ms ease-out |
| CTAs | Fade up | delay 380ms, 400ms ease-out |
| Orb | Apparaît immédiatement | Float lent 14s infini, translateY ±24px |

Toutes les entrées se jouent au premier render. Pas d'IntersectionObserver ici.

## 7. Comportement au scroll

Section normale — scroll standard. Pas de sticky.

## 8. Transition vers section suivante

Coupe nette Dark → Dark (IA).

## 9. Version mobile

- Headline : `clamp(40px, 10vw, 52px)` — toujours sur 2 lignes
- Corps : 16px
- Orb réduit : 400px, repositionné haut
- Un seul CTA au-dessus du fold

## 10. Niveau de priorité visuel

**Maximum** — c'est l'identité.

## 11. Asset nécessaire

CSS uniquement. Aucune image requise.

---

---

# SECTION — INTELLIGENCE ARTIFICIELLE

## 1. Intention narrative

Montrer que Loïc n'est pas un chatbot. C'est un agent qui **comprend**, qui **raisonne**, qui **agit**.
Le spectateur doit voir la différence avec un outil standard — sans qu'on le lui explique.

## 2. Message principal

> Vous posez une question. Un système intelligent agit à votre place.

## 3. Composition visuelle

**Structure :** Sticky scroll — section plein viewport qui avance au scroll.

**Split constant :**
- Gauche (40%) : texte fixe pendant les transitions — titre section, chapeau. Change de contenu à chaque slide.
- Droite (60%) : visuel qui évolue avec les slides.

**Surface :** `#05101E` Deep Navy.

**Indicateur de progression :** Barre fine accent (2px) en bas du visuel droit — s'étend de 0 à 100% au fil des slides.

## 4. Nombre de slides

**5 slides**

---

### Slide IA — Problème

**Copy :**
> "Un dirigeant de PME passe 2 heures par jour à chercher des informations dans ses propres outils."

**Visuel :**
Tableau éditorial — liste de tâches manuelles avec horodatages :
```
Vérifier les devis en attente           9:05
Relancer le client Martin               9:22
Mettre à jour le CRM                    9:48
Envoyer le rapport hebdomadaire        10:14
```
Style : fond `#102740`, texte silver, horodatages en tertaire. Sobre. Pas de couleur. Chaque ligne a un délai d'apparition.

**Asset :** CSS — tableau typographique

**Motion :** Les lignes apparaissent une à une en fade. L'ensemble exprime l'accumulation.

---

### Slide IA — Compréhension

**Copy :**
> Loïc lit votre question. Il identifie l'intention, les données nécessaires, les systèmes à consulter.

**Visuel :**
Une question posée en langage naturel dans une interface minimaliste :
```
"Combien de devis sont en attente de signature ?"
```
La bulle de texte s'écrit caractère par caractère (typing). Ensuite, un délai — puis un indicateur discret : trois points animés. L'attente est volontaire.

**Asset :** CSS — chat interface

**Motion :** Typing animation sur la question (25ms/caractère). Pause. Trois points.

---

### Slide IA — Intelligence

**Copy :**
> Loïc consulte vos systèmes. Il ne devine pas — il lit les données réelles.

**Visuel :**
Panneau de requêtes actives — style log épuré :
```
→ CRM.getDevis({ status: "pending" })
→ Calendar.getEvents({ this_week: true })
→ Slack.getMessages({ channel: "commercial" })
```
Chaque ligne apparaît séquentiellement, comme un terminal qui travaille. Les noms de fonctions en silver, les paramètres en accent. Pas de couleur parasite.

**Asset :** CSS — terminal log typographique

**Motion :** Lignes apparaissent en stagger 120ms. Accent pulse sur les paramètres.

---

### Slide IA — Action

**Copy :**
> La réponse est structurée. Les actions sont proposées.

**Visuel :**
Réponse de Loïc complète — bulle de conversation :
```
Vous avez 8 devis en attente — 16 800 € au total.
Les 3 les plus anciens : Dupont SAS, Martin & Fils, TechRenov.

→ Envoyer les rappels ?
```
Les chiffres clés en accent. La proposition d'action sur fond légèrement distinct — bouton fantôme.

**Asset :** CSS — message card

**Motion :** Fade in depuis le bas. Les valeurs s'illuminent en accent avec 80ms de délai.

---

### Slide IA — Résultat

**Copy :**
> En 4 secondes. Pas 2 heures.

**Visuel :**
Le même tableau qu'au début — mais tout est barré et remplacé par des confirmations :
```
✓ 8 devis identifiés automatiquement        0.4s
✓ 3 relances envoyées par email              0.8s
✓ CRM mis à jour                             1.1s
✓ Rapport Slack envoyé à l'équipe            1.4s
```
Lignes en vert foncé neutre (pas flashy), check en accent, horodatages ultra-rapides.

Sous le tableau : `2h → 4s` — IBM Plex Sans Condensed, comparaison directe. Aucun commentaire.

**Asset :** CSS — tableau de résultats

**Motion :** Lignes apparaissent en stagger. Le ratio `2h → 4s` compte à rebours.

## 5. Comportement

Auto-advance : la section occupe `height: calc(100dvh - var(--nav-h))`. Les slides avancent toutes les 3500ms dès que la section est visible dans le viewport (IntersectionObserver, threshold 0.4). L'avance s'arrête à la sortie du viewport. Aucune interaction requise.

## 6. Motion global

Transition entre slides : fade out + translateY(-12px) pour le texte sortant, fade in + translateY(12px) pour le texte entrant. Visuel : cross-fade avec 300ms overlap.

## 7. Transition vers section suivante

Coupe nette Dark → Light (Automatisation).

## 8. Version mobile

Le split disparaît. Visuel au-dessus, texte dessous. Navigation : swipe horizontal ou dots cliquables en bas. Pas de sticky scroll (trop complexe sur iOS).

## 9. Niveau de priorité visuel

**Très élevé.** C'est la première expertise — elle donne le ton.

## 10. Assets nécessaires

- CSS pur pour tous les visuels slides
- Aucune image — l'interface est la preuve

---

---

# SECTION — AUTOMATISATION

## 1. Intention narrative

Rendre visible ce qui est invisible. Un workflow automatisé est silencieux — le site doit lui donner une forme et une durée.

## 2. Message principal

> Ce que vous faisiez à la main en 20 minutes, le système le fait en 3 secondes.

## 3. Composition visuelle

**Structure :** Sticky scroll — 5 slides.

**Surface :** `#ffffff` White — section light.

**Composition :** Centré, large. Pas de split. Le visuel prend 70% de la largeur. Le texte est en dessous ou au-dessus du visuel — pas côte à côte.

## 4. Nombre de slides

**5 slides**

---

### Slide AUTO — Situation

**Copy :**
> Votre équipe reçoit 40 emails par jour. Chacun demande une action manuelle.

**Visuel :**
Boîte email stylisée — pile de 5 emails empilés, chacun avec :
- Expéditeur anonymisé (initiales)
- Objet en une ligne
- Temps depuis réception (1h, 3h, "hier"…)
- Aucun n'est ouvert

L'accumulation est le message. Fond `#F2F4F6`, emails en cartes blanches, bordures légères.

**Asset :** CSS — inbox stack

**Motion :** Les emails tombent en stagger depuis le haut. Le dernier porte un badge rouge discret (non-lu).

---

### Slide AUTO — Déclenchement

**Copy :**
> Un email entre. Le système s'active en moins d'une seconde.

**Visuel :**
Un email se détache de la pile. Un trait fin relie cet email à un nœud central — "DÉCLENCHEUR". Simple. Géométrique.

```
[ Email ] ──────→ [ DÉCLENCHEUR ]
```

Le trait se dessine de gauche à droite. Le nœud pulse une fois à l'accent.

**Asset :** CSS — connexion animée

**Motion :** Le trait se dessine (`stroke-dashoffset`). Le nœud s'illumine.

---

### Slide AUTO — Analyse

**Copy :**
> L'IA lit, classe, extrait. Elle sait déjà quoi faire.

**Visuel :**
Le nœud central explose en 4 branches — classification :
```
         [ URGENCE ]
            ↑
[ Email ] → [ IA ] → [ FACTURATION ]
            ↓
         [ SUIVI ]
            ↓
         [ ARCHIVE ]
```
Chaque branche s'illumine dans l'ordre — comme un diagnostic. L'accent est réservé à la branche qui correspond à cet email.

**Asset :** CSS — arbre de décision

**Motion :** Branches se dessinent en séquence. La branche active pulse en accent.

---

### Slide AUTO — Actions

**Copy :**
> Trois systèmes mis à jour. Simultanément. Sans intervention.

**Visuel :**
3 cartes outils côte à côte — avec les vraies icônes disponibles :
- `gmail.webp` — "Email de confirmation envoyé"
- `slack.webp` — "Notification équipe commerciale"
- CRM — "Fiche client mise à jour"

Chaque carte reçoit un check vert sobre à mesure que l'action s'accomplit. Timing : 0.3s, 0.6s, 0.9s.

**Asset :** Real assets (`/public/automatisations/`) + CSS

**Motion :** Les cards apparaissent en stagger. Les checks apparaissent séquentiellement.

---

### Slide AUTO — Résultat

**Copy :**
> 20 minutes de travail manuel. Remplacées par 3 secondes de système.

**Visuel :**
Comparaison directe — deux colonnes :

```
AVANT                        APRÈS
─────                        ─────
Ouvrir l'email        4 min  ·
Lire et trier         5 min  ·
Saisir dans le CRM    8 min  · Le système
Envoyer confirmation  3 min  · a tout fait.
─────                        ·
Total : 20 min               Total : 3 sec
```

Le côté "AVANT" est grisé. Le côté "APRÈS" est sobre, net, en accent pour les chiffres.

**Asset :** CSS — tableau comparatif

**Motion :** La colonne AVANT apparaît en premier (grisée), la colonne APRÈS arrive par transition. Le `3 sec` compte à rebours depuis `20 min`.

## 5. Comportement

Même mécanique que IA — auto-advance 3500ms, viewport-aware.

## 6. Transition vers section suivante

Coupe nette Light → Dark (Web & SaaS).

## 7. Version mobile

Centré, une slide à la fois, swipe horizontal.

## 8. Niveau de priorité visuel

**Élevé.** C'est la démonstration de valeur la plus immédiate.

## 9. Assets nécessaires

- `gmail.webp` ✓ disponible
- `slack.webp` ✓ disponible
- CSS pour tous les diagrammes
- Voir `02-AUTOMATION-VISUALS.md`

---

---

# SECTION — WEB & SAAS

## 1. Intention narrative

Montrer la qualité du travail livré — sans vanité. Ce n'est pas "regardez comme c'est beau". C'est "voici ce que nous construisons pour nos clients."

## 2. Message principal

> Du code propre, livré en semaines. Mobile-first, SEO natif, performant.

## 3. Composition visuelle

**Structure :** 5 slides auto-advance.

**Surface :** `#05101E` Deep Navy — section dark.

**Particularité :** Split inversé — le visuel est à gauche (60%), le texte est compact à droite (40%). L'inversion par rapport à IA crée un rythme dans la page.

## 4. Nombre de slides

**5 slides**

---

### Slide WEB — Idée

**Copy :**
> Avant d'écrire une ligne, on dessine la structure.

**Visuel :**
Wireframe simplifié CSS — blocs gris représentant les zones d'une page :
- Barre de navigation (fine)
- Zone hero (grande)
- 3 colonnes (features)
- Barre de pied (fine)

Fond `#102740`. Blocs en `rgba(255,255,255,0.06)`. Coins arrondis 4px. Aucun contenu — juste l'ossature.

**Asset :** CSS

**Motion :** Les blocs apparaissent de haut en bas, 60ms stagger. Aucune couleur d'accent.

---

### Slide WEB — Structure

**Copy :**
> L'architecture technique avant l'esthétique. Routes, composants, données.

**Visuel :**
Arbre de structure de composants — style technique :
```
App
├── Navigation
├── Hero
│   ├── Headline
│   └── CTAs
├── Features
│   └── Card × 3
└── Footer
```
Monospace, fond dark, branches en `rgba(255,255,255,0.15)`, noms de composants en silver.

**Asset :** CSS — arbre typographique

**Motion :** Branches se déploient de la racine vers les feuilles.

---

### Slide WEB — Interface

**Copy :**
> L'interface prend forme. Chaque composant a un rôle précis.

**Visuel :**
Deux cartes flottantes — desktop + mobile — légèrement décalées :
- Carte desktop : `ca-tech-manager/home.webp` — `rotate(-2deg)`, ombre `--shadow-mockup`
- Carte mobile (derrière) : représentation CSS simplifiée de l'interface mobile — `rotate(3deg)`, opacity 0.6

**Asset :** Real asset (`portfolio/ca-tech-manager/home.webp`) + CSS

**Motion :** Les deux cartes glissent depuis les côtés, s'installent dans leur position finale avec un rebond léger.

---

### Slide WEB — Produit

**Copy :**
> Le produit livré. Pages, fonctionnalités, données réelles.

**Visuel :**
Carte principale en plein cadre — `ca-tech-manager/dashboard.webp` — légèrement inclinée, ombre prononcée.
Badge flottant sur la carte : performance Lighthouse — typographie seule, pas d'icône :

```
98  Performance
100 Accessibilité
100 SEO
```

Fond dark, valeurs en blanc, labels en silver.

**Asset :** Real asset (`portfolio/ca-tech-manager/dashboard.webp`) + CSS badge

**Motion :** La carte scale from 0.9 to 1.0. Le badge pulse doucement.

---

### Slide WEB — Expérience finale

**Copy :**
> Chaque projet dans ce portfolio a commencé par une conversation de 30 minutes.

**Visuel :**
Stack de 3 cartes superposées avec les vrais projets :
- Fond : `cv-magic/home.webp` — `rotate(6deg)`, opacity 0.45
- Milieu : `ca-tech-manager/home.webp` — `rotate(3deg)`, opacity 0.7
- Avant : `ca-tech-manager/dashboard.webp` — `rotate(-2deg)`, opacity 1

Chaque carte : `border-radius: 16px`, `box-shadow: --shadow-mockup`.

**Asset :** Real assets (portfolio/) — 3 fichiers

**Motion :** Les cartes convergent depuis leurs positions initiales vers la composition finale.

## 5. Comportement

Auto-advance 3500ms, viewport-aware.

## 6. Transition vers section suivante

Coupe nette Dark → Light (Infrastructure).

## 7. Version mobile

Cards affichées en séquence, centrées, full-width. Swipe pour naviguer.

## 8. Niveau de priorité visuel

**Élevé.** La qualité des mockups doit inspirer confiance immédiatement.

## 9. Assets nécessaires

- `portfolio/ca-tech-manager/home.webp` ✓
- `portfolio/ca-tech-manager/dashboard.webp` ✓
- `portfolio/cv-magic/home.webp` ✓
- Voir `03-SAAS-VISUALS.md`

---

---

# SECTION — INFRASTRUCTURE

## 1. Intention narrative

Rendre l'invisible visible. L'infrastructure est ce qu'on ne voit pas — jusqu'au jour où ça tombe. Le site doit montrer que CA-TECH a cartographié, structuré et sécurisé chaque couche.

## 2. Message principal

> Une infrastructure qui s'oublie parce qu'elle ne tombe pas.

## 3. Composition visuelle

**Structure :** Sticky scroll — 5 slides.

**Surface :** `#ffffff` White — section light.

**Composition :** Centré. Le diagramme technique évolue slide après slide. Le texte est compact, au-dessus du visuel.

## 4. Nombre de slides

**5 slides**

---

### Slide INFRA — Architecture

**Copy :**
> Chaque couche a un rôle. Aucune n'est là par hasard.

**Visuel :**
Diagramme vertical en couches — fond `#F2F4F6`, couches superposées :
```
╔══════════════════════════════╗
║         CDN / Edge           ║  ← accent
╠══════════════════════════════╣
║       Load Balancer          ║
╠══════════════════════════════╣
║  App Server  │  API  │  Auth ║
╠══════════════════════════════╣
║   Database   │  Cache │ Logs ║
╚══════════════════════════════╝
```
Couche CDN en accent. Autres couches en bordure légère. Labels en IBM Plex Sans, 11px, 0.12em tracking.

**Asset :** CSS — diagramme en couches

**Motion :** Les couches se construisent de bas en haut (le fondement d'abord).

---

### Slide INFRA — Systèmes

**Copy :**
> Chaque service est défini, isolé, documenté.

**Visuel :**
Le diagramme précédent — mais chaque nœud s'illumine à tour de rôle avec un tooltip minimal :
- `CDN / Edge` → "Latence < 50ms"
- `Load Balancer` → "99.9% uptime"
- `App Server` → "Auto-scaling"
- `Database` → "Read replicas"

Tooltip : 1px border accent, fond `#F2F4F6`, texte silver, disparu après 600ms.

**Asset :** CSS — tooltips dynamiques

**Motion :** Les tooltips apparaissent séquentiellement, fade in/out.

---

### Slide INFRA — Connexions

**Copy :**
> Les flux sont cartographiés. Aucune dépendance cachée.

**Visuel :**
Les couches du diagramme restent — mais des lignes de connexion accent se dessinent entre elles, montrant les flux :
- Trait de CDN vers Load Balancer
- Trait de LB vers App + API + Auth
- Traits de App/API vers DB + Cache

Les traits se dessinent (`stroke-dashoffset`) de haut en bas. Couleur accent.

**Asset :** CSS — connexions SVG animées

**Motion :** Les traits se dessinent en séquence, 300ms chacun.

---

### Slide INFRA — Sécurité

**Copy :**
> Chiffré en transit. Chiffré au repos. Accès par rôles.

**Visuel :**
Le diagramme précédent — mais des badges de sécurité typographiques flottent sur chaque couche :
```
TLS 1.3      (sur CDN)
WAF          (sur LB)
IAM / RBAC   (sur Services)
AES-256      (sur DB)
```
Badges : `border-radius: 6px`, fond `rgba(53,155,217,0.08)`, bordure `rgba(53,155,217,0.3)`, texte accent, 11px.

**Asset :** CSS — badges overlay

**Motion :** Les badges apparaissent en scale 0.8→1 depuis l'extérieur, stagger 150ms.

---

### Slide INFRA — Supervision

**Copy :**
> Le système se surveille lui-même.

**Visuel :**
4 métriques de monitoring côte à côte — typographie pure, pas de graphiques :

```
99.9%       <200ms      0.01%       14/mois
Uptime      Latence     Erreurs     Déploiements
```

Valeurs : IBM Plex Sans Condensed 700, 40px, blanc sur fond dark (section light → fond de la carte en `#102740`).
Labels : silver, 11px, uppercase, 0.14em tracking.
Statut : point vert sobre (hex `#34d399`) à droite de chaque valeur.

**Asset :** CSS — métriques display

**Motion :** Les chiffres comptent vers leur valeur finale (count-up animation). Les points statut pulsent une fois.

## 5. Comportement

Auto-advance 3500ms, viewport-aware.

## 6. Transition vers section suivante

Coupe nette Light → Dark (Réalisations).

## 7. Version mobile

Diagramme simplifié (empilé en liste). Swipe pour les slides.

## 8. Niveau de priorité visuel

**Moyen-élevé.** L'abstraction technique doit rester lisible.

## 9. Assets nécessaires

- CSS pur
- Voir `04-INFRASTRUCTURE-VISUALS.md`

---

---

# SECTION — RÉALISATIONS

## 1. Intention narrative

La preuve par l'exemple. Pas de "nous sommes les meilleurs" — juste les projets.

## 2. Message principal

> Voici ce que nous construisons.

## 3. Composition visuelle

**Surface :** `#102740` Navy — section dark légèrement plus claire.

**Layout :** Grille 3 colonnes de cartes projet — pas de slides. Layout statique premium.

**Chaque carte :**
- Image plein cadre (aspect-ratio 16/9)
- Tags tech (pills, accent border)
- Titre projet (IBM Plex Sans 600, 20px, blanc)
- Description une ligne (silver, 13px)
- Pas de CTA par carte — la section entière mène à `/realisations`

**Hover :** Carte s'élève de 6px, image scale 1.04, bordure légèrement plus visible. Lent — 300ms.

## 4. Assets nécessaires

- `portfolio/ca-tech-manager/home.webp` ✓
- `portfolio/cv-magic/home.webp` ✓
- `portfolio/branding/logo1.webp` ✓
- `portfolio/pasmal/` — à vérifier
- `portfolio/pemous-money/` — à vérifier

## 5. Motion

Révélation standard (IntersectionObserver). Cards en stagger 100ms.

## 6. Transition vers section suivante

Coupe nette Dark → Light (Notre approche).

---

---

# SECTION — NOTRE APPROCHE

## 1. Intention narrative

Différencier. Beaucoup d'agences livrent du code. CA-TECH construit des systèmes. La méthode est la preuve de la rigueur.

## 2. Message principal

> Cinq étapes. Un engagement par étape.

## 3. Composition visuelle

**Surface :** `#ffffff` White — section light.

**Layout :** Liste éditoriale ordonnée — 5 étapes séparées par des lignes hairline (1px, `var(--border-lt)`).

```
────────────────────────────────────────────────────────
Comprendre     Cartographier avant d'écrire. Vos processus,
               vos contraintes, vos objectifs réels.
────────────────────────────────────────────────────────
Concevoir      Architecture, choix techniques, plan.
               Tout validé avec vous avant exécution.
────────────────────────────────────────────────────────
Construire     Développement itératif. Livraisons régulières.
               Vous voyez le système prendre forme.
────────────────────────────────────────────────────────
Déployer       Mise en production, tests, monitoring.
               Le système est opérationnel à la date convenue.
────────────────────────────────────────────────────────
Maintenir      Support réactif, mises à jour, évolutions.
               Votre système grandit avec votre entreprise.
────────────────────────────────────────────────────────
```

**Desktop :** Grille `[titre 200px] [description 1fr]`. Les titres sont en IBM Plex Sans 600, 20px, `#0D1F35`.  
**Aucun numéro `01/02/03` affiché.** La progression est lisible par la structure et les séparateurs. Le code utilise des numéros en data mais ne les rend pas visibles dans l'interface.

## 4. Motion

Chaque ligne `reveal` avec stagger 80ms.  
Hover sur une ligne : fond subtle `#F2F4F6`, transition 200ms.

## 5. Transition vers section suivante

Coupe nette Light → Dark (CA-TECH).

---

---

# SECTION — CA-TECH

## 1. Intention narrative

Humaniser sans être sentimental. Un nom, une conviction, une posture.

## 2. Message principal

> Un cabinet fondé sur la conviction que la technologie doit être utile, pas impressionnante.

## 3. Composition visuelle

**Surface :** `#05101E` Deep Navy.

**Split :** Texte gauche (60%) + stats droite (40%).

**Texte gauche :**
- Titre : "Construit par / des praticiens." — display, lh 0.90
- Deux paragraphes sobres
- Encadré fondateur :
  ```
  ─────────────────────────────────
  Jean Kevin PEMOU
  Consultant — Technologie, IA, Infrastructure
  ─────────────────────────────────
  ```

**Stats droite — grille 2×2 :**
- `2023` — Fondé en
- `PME` — Cœur de marché
- `IA-first` — Posture depuis l'origine
- `< 1 sem.` — De l'idée au prototype

Valeurs : IBM Plex Sans Condensed 700, 32px, blanc.  
Labels : silver, 11px, uppercase, 0.14em tracking.

## 4. Motion

Bio : reveal staggered. Stats : count-up animation au scroll.

## 5. Transition vers section suivante

Dark → Dark (Contact — même surface ou légèrement distincte).

---

---

# SECTION — CONTACT

## 1. Intention narrative

Convergence finale. Tout mène ici. Un seul appel à l'action.

## 2. Message principal

> Parlons de votre prochain système numérique.

## 3. Composition visuelle

**Surface :** `#102740` Navy — légèrement distincte de la section précédente.

**Layout :** Centré. Minimaliste.

```
[Eyebrow — ultra-fin]
Un projet à construire ?

[Headline — display, très grand]
PARLONS DE VOTRE
PROCHAIN SYSTÈME NUMÉRIQUE.

[CTA unique — pill accent]
Parler de votre projet
```

**Ce qui n'est PAS là :**
- Aucune information de contact répétée
- Aucun formulaire
- Aucun chiffre
- Aucune promesse de délai

Juste le titre et le bouton.

## 4. Motion

Reveal. Le bouton CTA a une subtile animation "breath" (`scale 1.0 → 1.015 → 1.0`, 3s, infini) — imperceptible au premier regard.

---

---

# Budget Motion — Décisions globales

## Librairie

**Pour les showcases (4 sections expertise) :** CSS + IntersectionObserver + `setInterval`. Auto-advance 3500ms déclenché à l'entrée dans le viewport (threshold 0.4), arrêté à la sortie.  
**Pour tout le reste :** CSS + IntersectionObserver.

Framer Motion n'est pas requis.

## Règles

| Autorisé | Interdit |
|----------|----------|
| Fade + translateY | Spin continu |
| Orb float lent | Parallax agressif |
| Stroke-dashoffset (diagrams) | Gradient text |
| Count-up (stats) | Autoplay non-contrôlé (sans viewport) |
| Auto-advance 3.5s (viewport-aware) | Transitions de page complexes |
| Scale breath (CTA) | Effets 3D/perspective |
| Cross-fade slides | Particules flottantes |
| Typing animation (IA) | Loop infinite hors viewport |

## prefers-reduced-motion

Toutes les animations — sans exception — sont désactivées.  
```css
@media (prefers-reduced-motion: reduce) {
  /* tout revient à opacity: 1, transform: none, transition: none */
}
```

---

---

# Checklist de validation

Avant toute implémentation :

- [ ] **Hero** — composition typographique validée
- [ ] **IA** — 5 slides, contenu et visuels CSS approuvés
- [ ] **Automatisation** — 5 slides, visuels approuvés
- [ ] **Web & SaaS** — 5 slides, qualité des screenshots jugée suffisante
- [ ] **Infrastructure** — 5 slides, diagrams CSS validés
- [ ] **Réalisations** — assets disponibles vérifiés
- [ ] **Framer Motion** — décision d'installation confirmée
- [ ] **Mobile** — swipe vs dots — décision confirmée
- [ ] **Midjourney** — décision sur les visuels à générer

---

# Points nécessitant validation

**1. Framer Motion**  
Les showcases sticky nécessitent `useScroll` / `useTransform`. À installer ?

**2. Longueur des showcases**  
5 slides × 4 sections = 20 slides au total. Cela représente environ `20 × 100vh = 2000vh` de scroll supplémentaire. C'est beaucoup. Alternative : 3 slides par section (15 slides) pour un page plus rapide à parcourir.

**3. Screenshots disponibles**  
La section Web & SaaS utilise 3 fichiers existants. Sont-ils assez récents et représentatifs ?

**4. Pasmal et PemousMoney**  
Ces projets (`portfolio/pasmal/`, `portfolio/pemous-money/`) peuvent compléter la section Réalisations si les assets sont présentables.

**5. Aucun numéro de section dans l'UI**  
Confirmé par le brief — mais la distinction entre sections devra être claire uniquement par la composition et la couleur de fond.
