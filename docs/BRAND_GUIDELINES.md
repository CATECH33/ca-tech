# Brand Guidelines — Cahier des charges identité visuelle
## CA-TECH · Cabinet de conseil IA-first · Version 1.0 · Juillet 2026

> Ce document définit l'identité visuelle et éditoriale de CA-TECH. Il est la référence pour toute production graphique, rédactionnelle ou digitale. Aucun écart n'est autorisé sans validation explicite.
>
> Documents de référence : `STRATEGY.md` · `UX_UI_SPECIFICATION.md`

---

## Table des matières

1. [Positionnement de marque](#1-positionnement-de-marque)
2. [Logo](#2-logo)
3. [Palette de couleurs](#3-palette-de-couleurs)
4. [Typographie](#4-typographie)
5. [Iconographie](#5-iconographie)
6. [Photographie & Illustration](#6-photographie--illustration)
7. [Ton éditorial & Voix de marque](#7-ton-éditorial--voix-de-marque)
8. [Mise en page & Grille](#8-mise-en-page--grille)
9. [Animations & Motion design](#9-animations--motion-design)
10. [Déclinaisons par support](#10-déclinaisons-par-support)
11. [Exemples d'usage correct et incorrect](#11-exemples-dusage-correct-et-incorrect)
12. [Critères de validation](#12-critères-de-validation)

---

## 1. Positionnement de marque

### 1.1 Identité fondamentale

**CA-TECH est un cabinet de conseil IA-first.**

Ce n'est pas une agence web. Ce n'est pas une ESN. Ce n'est pas une startup tech généraliste.

CA-TECH aide les dirigeants de PME, fondateurs et responsables marketing à transformer concrètement leur activité grâce à l'Intelligence Artificielle, l'Automatisation, le SEO et le Développement Web — dans cet ordre de priorité stratégique.

### 1.2 Slogan officiel

> **« L'Intelligence Artificielle au service de votre croissance. »**

Le slogan est invariable. Il ne peut pas être abrégé, modifié, traduit ou remplacé par une formulation alternative dans les supports officiels.

**Avec majuscules** : Intelligence Artificielle (toujours)
**Avec guillemets français** « » dans les titres et citations
**Sans guillemets** dans les sous-titres et headlines courants

### 1.3 Positionnement en une phrase

> CA-TECH est le cabinet de conseil qui rend l'IA opérationnelle pour les entreprises qui veulent croître, pas juste expérimenter.

### 1.4 Valeurs de marque

| Valeur | Ce que ça signifie pour CA-TECH |
|--------|--------------------------------|
| **Clarté** | L'IA est complexe. Nos explications ne le sont pas. |
| **Résultats** | Chaque mission se mesure. Pas de jargon sans chiffres derrière. |
| **Confiance** | Nos clients nous délèguent des sujets critiques. On le mérite. |
| **Avance** | Nous intégrons les outils d'aujourd'hui pour les usages de demain. |
| **Proximité** | Cabinet humain, pas une plateforme froide. Loïc en est la preuve. |

### 1.5 Personnalité de marque

| Attribut | Définition pour CA-TECH |
|----------|------------------------|
| Expert sans condescendance | Sait de quoi il parle. Ne l'étale pas. |
| Moderne sans excès | Design premium mais accessible. |
| Direct | Phrases courtes. Pas de rhétorique creuse. |
| Rassurant | Le client est en de bonnes mains. |
| Ambitieux | Voit les enjeux à 3-5 ans, pas juste le projet immédiat. |

### 1.6 Ce que CA-TECH n'est pas

| Éviter | Pourquoi |
|--------|----------|
| « Agence web » | Sous-positionne. On ne fait pas que des sites. |
| « Startup » | Pas notre registre. On parle aux décideurs. |
| « Experts en IA » | Trop générique, trop galvaudé. |
| « Solutions digitales » | Jargon vide, ancré dans les années 2010. |
| « Nous accompagnons » | Passif et flou. Préférer « nous déployons », « nous automatisons ». |

---

## 2. Logo

### 2.1 Concept

Le logo CA-TECH est un logotype typographique. Il repose sur la force du nom, la lisibilité et la cohérence avec l'esthétique des marques tech de référence (Vercel, Linear, Stripe).

Il n'utilise pas d'icône ou de pictogramme séparé du nom. La marque est le nom.

### 2.2 Versions du logo

| Version | Usage |
|---------|-------|
| **Principal** (fond clair) | Site, documents, présentations sur fond blanc ou gris clair |
| **Inversé** (fond sombre) | Header transparent, footer, sections sombres, Loïc widget |
| **Monochrome noir** | Impression noir et blanc, broderie, gravure |
| **Monochrome blanc** | Supports entièrement sombres, transparents |
| **Favicon / App icon** | Carré `CA` uniquement, lisible à 16×16px |

### 2.3 Construction

```
┌──────────────────────────────────────┐
│                                      │
│   CA-TECH                            │
│                                      │
└──────────────────────────────────────┘
```

- Police : Inter · weight `800` (ExtraBold)
- Tracking : `letter-spacing: -0.03em` (légèrement resserré)
- Trait d'union `-` : partie intégrante du logo, jamais un espace
- Casse : MAJUSCULES · `text-transform: uppercase`
- Couleur principale : `--color-primary-dark` `#0A2540`
- Couleur inversée : `#FFFFFF`

> **Note d'implémentation** : le logo doit être fourni en SVG natif, pas en PNG. Le SVG permet le changement de couleur via CSS (`fill: currentColor`) pour la version inversée.

### 2.4 Zone de protection

La zone de protection autour du logo est égale à **la hauteur de la lettre "C"** sur chaque côté. Aucun élément graphique ou textuel ne peut entrer dans cette zone.

```
  ↕ X
X ←→ CA-TECH ←→ X
  ↕ X

  (X = hauteur de la lettre C)
```

### 2.5 Tailles minimales

| Support | Taille minimale |
|---------|----------------|
| Écran (web) | `80px` de large |
| Impression | `20mm` de large |
| Favicon | `32×32px` (version `CA` uniquement) |

En dessous de ces tailles, la lisibilité n'est plus garantie.

### 2.6 Favicon & App icon

Favicon : lettres `CA` uniquement · fond `#0066FF` · texte blanc · coins arrondis (`border-radius: 20%`)

Dimensions à produire :
- `16×16px` · `32×32px` · `48×48px` (favicon browser)
- `180×180px` (Apple Touch Icon)
- `192×192px` · `512×512px` (PWA / Android)
- `1200×630px` avec logo centré (Open Graph default image)

### 2.7 Interdits logo

| Interdit | Raison |
|----------|--------|
| Déformer les proportions | Altère la lisibilité |
| Utiliser une couleur hors palette | Incohérence de marque |
| Ajouter un dégradé sur les lettres | Lisibilité dégradée |
| Ajouter une ombre portée | Ringard, hors charte |
| Entourer d'un cadre ou d'un fond non validé | Altère la zone de protection |
| Séparer `CA` et `TECH` | Le trait d'union est structurant |
| Utiliser une graisse autre qu'ExtraBold | Perd l'impact |

---

## 3. Palette de couleurs

### 3.1 Couleurs primaires

| Nom | Variable CSS | Valeur HEX | Usage |
|-----|-------------|-----------|-------|
| **Bleu primaire** | `--color-primary` | `#0066FF` | CTA, liens actifs, accents, icônes feature |
| **Bleu foncé** | `--color-primary-dark` | `#0A2540` | Hero fond, titres forts, footer section |
| **Bleu clair** | `--color-primary-light` | `#E8F0FF` | Fonds de cards, badges, hover states |

### 3.2 Couleurs neutres

| Nom | Variable CSS | Valeur HEX | Usage |
|-----|-------------|-----------|-------|
| Blanc | `--color-white` | `#FFFFFF` | Fond principal, texte inversé |
| Gris 50 | `--color-gray-50` | `#F9FAFB` | Sections alternées (arrière-plan léger) |
| Gris 100 | `--color-gray-100` | `#F3F4F6` | Fonds inputs, hover subtil |
| Gris 200 | `--color-gray-200` | `#E5E7EB` | Bordures, séparateurs |
| Gris 400 | `--color-gray-400` | `#9CA3AF` | Placeholder inputs · **jamais pour du texte courant** |
| Gris 600 | `--color-gray-600` | `#4B5563` | Texte secondaire, descriptions |
| Gris 900 | `--color-gray-900` | `#111827` | Titres, texte principal sur fond clair |

### 3.3 Couleurs sémantiques

| Nom | Variable CSS | Valeur HEX | Usage |
|-----|-------------|-----------|-------|
| Succès | `--color-success` | `#10B981` | Confirmation, état validé, check |
| Avertissement | `--color-warning` | `#F59E0B` | Alerte non critique |
| Erreur | `--color-error` | `#EF4444` | Erreur formulaire, action destructive |

### 3.4 Dégradés

| Nom | Valeur CSS | Usage |
|-----|-----------|-------|
| `--gradient-primary` | `linear-gradient(135deg, #0066FF 0%, #0A2540 100%)` | Hero homepage, CTA final, sections premium |
| `--gradient-subtle` | `linear-gradient(180deg, #F9FAFB 0%, #FFFFFF 100%)` | Sections de transition, arrière-plans doux |

**Glow hero** (en supplément du gradient) :
```css
radial-gradient(ellipse 80% 60% at 30% 50%, rgba(0,102,255,0.25) 0%, transparent 70%)
```
Positionné à gauche du hero homepage, au-dessus du gradient.

### 3.5 Règles d'utilisation des couleurs

**Contraste obligatoire (WCAG AA)**

| Combinaison | Rapport | Résultat |
|-------------|---------|----------|
| `#FFFFFF` sur `--color-primary` `#0066FF` | 4.6:1 | ✓ AA |
| `#FFFFFF` sur `--color-primary-dark` `#0A2540` | 16.5:1 | ✓ AAA |
| `--color-gray-900` sur `#FFFFFF` | 19.5:1 | ✓ AAA |
| `--color-gray-600` sur `#FFFFFF` | 7.1:1 | ✓ AA |
| `--color-primary` sur `--color-primary-light` | 4.7:1 | ✓ AA |
| `--color-gray-400` sur `#FFFFFF` | 2.9:1 | ✗ Interdit pour texte |

**Règle absolue** : `--color-gray-400` ne peut jamais être utilisé comme couleur de texte courant. Réservé aux placeholders et horodatages non critiques.

### 3.6 Associations de fond

| Fond de section | Texte titres | Texte courant | CTA |
|-----------------|-------------|---------------|-----|
| `#FFFFFF` | `--color-gray-900` | `--color-gray-600` | `primary` |
| `--color-gray-50` | `--color-gray-900` | `--color-gray-600` | `primary` |
| `--color-primary-light` | `--color-primary-dark` | `--color-primary` | `primary` |
| `--gradient-primary` | `#FFFFFF` | `rgba(255,255,255,0.80)` | `white` |
| `--color-primary-dark` | `#FFFFFF` | `rgba(255,255,255,0.80)` | `white` |
| `--color-gray-900` `#111827` | `#FFFFFF` | `rgba(255,255,255,0.70)` | `white` |

### 3.7 Pattern d'alternance des sections

La page s'articule en alternant les fonds selon ce modèle, pour créer du rythme sans surcharge :

```
Header       → transparent (scroll) → blanc (blur)
Hero         → gradient-primary
Proof bar    → primary-dark (continuation du hero, pas de rupture)
Stats        → blanc
Expertises   → gray-50
Loïc         → gradient-primary (retour au bleu, choc visuel voulu)
Processus    → blanc
Cas clients  → gray-50
Témoignages  → blanc
CTA final    → gradient-primary (bookend visuel avec le hero)
Footer       → gray-900 #111827
```

---

## 4. Typographie

### 4.1 Police principale

**Inter — Google Fonts**

Inter est la seule police autorisée pour CA-TECH. Pas d'exception.

Raisons du choix :
- Lisibilité optimale sur écran à toutes les tailles
- Hinting exceptionnel pour les petits corps
- Adoption par les marques de référence (Linear, Vercel, Notion)
- Disponible gratuitement sur Google Fonts · chargement optimisé

**Import recommandé :**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload"
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap"
      as="style"
      onload="this.onload=null;this.rel='stylesheet'">
```

Graisses à charger : `400` (Regular) · `600` (SemiBold) · `800` (ExtraBold)

**Jamais charger** : 100, 200, 300 (trop léger pour l'écran) · 500, 700, 900 (redondant)

### 4.2 Échelle typographique

| Nom | Font-size desktop | Font-size mobile | Weight | Line-height | Usage |
|-----|------------------|------------------|--------|-------------|-------|
| `--text-xs` | `12px` | `12px` | `400` | `1.4` | Légal, timestamps |
| `--text-sm` | `14px` | `14px` | `400`/`500` | `1.5` | Labels, badges, micro-copy |
| `--text-base` | `16px` | `16px` | `400` | `1.6` | Corps de texte standard |
| `--text-lg` | `18px` | `18px` | `400`/`600` | `1.6` | Sous-titres, intros de section |
| `--text-xl` | `20px` | `18px` | `600` | `1.5` | Titres H3, citations témoignages |
| `--text-2xl` | `24px` | `22px` | `600` | `1.4` | Titres cards, sous-sections |
| `--text-3xl` | `30px` | `26px` | `700` | `1.3` | H2 secondaires |
| `--text-4xl` | `36px` | `30px` | `700` | `1.2` | H2 principales |
| `--text-5xl` | `48px` | `36px` | `800` | `1.1` | Stats, chiffres clés |
| `--text-6xl` | `60px` | `42px` | `800` | `1.05` | H1 pages internes |
| `--text-7xl` | `72px` | `48px` | `900` | `1.0` | H1 homepage |

### 4.3 Usages spécifiques

**Titres de section (H2)**
- `--text-4xl` · weight `700` · `--color-gray-900`
- Mobile : `--text-3xl`
- Sur fond sombre : `#FFFFFF`

**Pill de section (sous-titre au-dessus du H2)**
- `--text-sm` · weight `600` · `uppercase` · `letter-spacing: 0.08em`
- Couleur : `--color-primary` sur fond clair · `rgba(255,255,255,0.90)` sur fond sombre

**Corps de texte**
- `--text-base` · weight `400` · `line-height: 1.6` · `--color-gray-600`
- Jamais en dessous de `14px` pour du contenu informatif

**Liens inline**
- `--color-primary` · `text-underline-offset: 3px`
- Hover : `text-decoration: underline`

**Micro-copy sous CTA**
- `--text-sm` · weight `400` · `--color-gray-400` (ou `rgba(255,255,255,0.60)` sur fond sombre)
- `text-align: center`

### 4.4 Règles typographiques

| Règle | Détail |
|-------|--------|
| Police unique | Inter exclusivement · aucune police décorative |
| Pas d'italique systématique | Réservé aux citations de témoignages |
| Hiérarchie stricte | H1 → H2 → H3, jamais de saut de niveau |
| Max 2 graisses par bloc | Un titre + un corps. Pas plus. |
| Ponctuation française | Guillemets « » · espace fine avant `:;!?` (si CSS le permet) |
| Tirets | Tiret em `—` pour les incises · tiret demi-cadratin `–` pour les plages |
| Chiffres | Arabes uniquement dans les titres et stats |
| Majuscules | Réservées aux pills de section et aux labels d'indicateurs |

### 4.5 Ce qu'on n'écrit jamais

- Tout en majuscules dans un paragraphe (CRI)
- Phrases de plus de 25 mots dans un titre
- Trois points de suspension `...` (utiliser `…` entité `&hellip;`)
- Fautes de ponctuation : espace avant virgule / point, deux espaces, point final dans un titre
- `Etc.` dans un titre ou CTA

---

## 5. Iconographie

### 5.1 Bibliothèque unique : Lucide Icons

Toutes les icônes CA-TECH proviennent exclusivement de **Lucide Icons** (successeur de Feather Icons).

**Jamais mélanger** avec Font Awesome, Material Icons, Heroicons ou toute autre bibliothèque.

Site de référence : `lucide.dev`

### 5.2 Style iconographique

- Tracé `stroke` (linéaire) — jamais `fill` (plein) sauf exception (étoiles de notation)
- `stroke-width: 2` par défaut · `1.5` pour les grandes icônes (≥ 32px)
- Angles arrondis (`stroke-linecap: round` · `stroke-linejoin: round`) — c'est la valeur par défaut Lucide
- Couleur : `currentColor` — l'icône hérite de la couleur du parent

### 5.3 Tailles standard

| Contexte | Taille | Usage |
|----------|--------|-------|
| Inline dans texte | `16px` | Boutons sm, labels |
| Composant courant | `20px` | Boutons md/lg, inputs, nav |
| Navigation | `24px` | Header, mobile menu |
| Feature card | `32px` | Icônes de services sur les cards |
| Illustration section | `48px` | Icônes de processus (stepper) |

### 5.4 Icônes officielles par service

| Service | Icône Lucide | Justification |
|---------|-------------|---------------|
| Intelligence Artificielle | `Bot` | Agent, robot, IA conversationnelle |
| Automatisation | `Zap` | Rapidité, déclencheur automatique |
| SEO | `TrendingUp` | Croissance, montée en rankings |
| Développement Web | `Code2` | Code, technique |
| Design & Identité | `Pen` | Création, identité visuelle |
| Loïc (consultant) | `MessageCircle` | Chat, dialogue |
| Diagnostic IA | `Stethoscope` | Audit, analyse |
| Rapport | `FileText` | Document, livrable |
| Résultats | `BarChart2` | Métriques, performance |
| Confiance / Sécurité | `Shield` | Protection |
| Vitesse | `Clock` | Délai, réactivité |
| Clients | `Users` | Équipe, clientèle |

### 5.5 Icônes d'interface (réservées aux composants)

| Icône | Usage |
|-------|-------|
| `ChevronDown` | Dropdown, accordéon fermé |
| `ChevronLeft` / `ChevronRight` | Navigation carousel |
| `ChevronUp` | Retour haut de page |
| `X` | Fermer (modal, drawer, toast) |
| `Menu` | Hamburger mobile |
| `Send` | Envoyer message Loïc |
| `Check` | Validation, succès, liste bénéfices |
| `AlertCircle` | Erreur formulaire |
| `Info` | Toast information |
| `AlertTriangle` | Toast avertissement |
| `CheckCircle` | Toast succès |
| `XCircle` | Toast erreur |
| `Plus` | Accordéon fermé (alternative à ChevronDown) |
| `Search` | Champ de recherche |
| `ArrowRight` | CTA avec direction |
| `ExternalLink` | Lien sortant (LinkedIn, etc.) |
| `Home` | Breadcrumb — page d'accueil |
| `Star` | Étoile de notation (fill, exception) |

### 5.6 Accessibilité iconographique

- Icône **décorative** (accompagne du texte) : `aria-hidden="true"` obligatoire
- Icône **fonctionnelle** (seule, bouton icon-only) : `aria-label` descriptif obligatoire sur l'élément parent
- Jamais de texte alternatif vide `alt=""` sur une icône fonctionnelle

---

## 6. Photographie & Illustration

### 6.1 Style photographique

CA-TECH privilégie les **illustrations custom** et les **captures d'écran produit** aux photos de stock génériques.

Quand une photographie est nécessaire (témoignages, équipe, cas clients) :

| Critère | Directive |
|---------|-----------|
| Lumière | Naturelle, douce · jamais flash frontal |
| Ton | Chaleureux sans être orangé · palette froide-neutre |
| Sujets | Réels, expressifs · jamais les poses "business stock" génériques |
| Cadrage | Direct, proche · pas les silhouettes de dos dans un open space |
| Arrière-plan | Épuré, flou, neutre · éviter les décors chargés |
| Format export | WebP · ratio `1:1` (avatars) · `16:9` (hero, blog) · `4:3` (cards) |

**Photos interdites** : handshakes génériques · gens qui sourient devant un laptop · réunions en cercle de 8 personnes · skylines de villes.

### 6.2 Style d'illustration

Deux types d'illustrations sont utilisés chez CA-TECH :

**Type A — Interface produit (UI mockup)**
Captures d'écran ou maquettes du widget Loïc, du Manager, des rapports Diagnostic IA. Présentées dans un "device frame" minimal (bords arrondis, ombre légère). Pas de device réaliste type iPhone/MacBook.

**Type B — Illustration décorative (sections sombres)**
Formes géométriques abstraites, grilles de points, lignes de connexion neuronales. Palette : teintes bleu primaire en opacité réduite (`0.05 → 0.15`) sur fond sombre. Jamais de personnages illustrés cartoonesques.

### 6.3 Traitement des images

- Format : **WebP** exclusivement en production · fallback PNG pour les environments anciens
- `srcset` avec au minimum 2 densités : `1x` et `2x`
- `sizes` adapté au layout : `(max-width: 768px) 100vw, 50vw`
- `width` et `height` **toujours définis** pour éviter le CLS
- Images hero : `fetchpriority="high"` + `loading="eager"`
- Toutes les autres : `loading="lazy"`
- `alt` : descriptif et informatif · jamais vide sur une image porteuse de sens · `alt=""` sur les images purement décoratives

### 6.4 Avatars témoignages

- Format : carré `1:1` · minimum `200×200px` en source
- Rendu CSS : `border-radius: 50%` · `object-fit: cover`
- Toujours une vraie photo de la personne (pas d'avatar généré)
- Fond préféré : neutre (extérieur flou, blanc, gris)

---

## 7. Ton éditorial & Voix de marque

### 7.1 Principes fondamentaux

CA-TECH s'adresse à des **dirigeants**, **fondateurs** et **décideurs**. Ils sont intelligents, occupés et sceptiques par défaut envers les promesses tech.

Le ton CA-TECH est :

**Direct.** On dit ce qu'on fait. Sans détour. Sans "solutions innovantes".

**Concret.** Chaque affirmation est étayée par un chiffre, un exemple ou un résultat.

**Confiant sans arrogance.** On sait ce qu'on fait. On n'a pas besoin de le crier.

**Humain.** Le cabinet parle d'humain à humain. Loïc est la preuve qu'on y croit.

**Ambitieux.** On parle de croissance, de transformation, d'impact — pas de "petites améliorations".

### 7.2 Grille tonale

| Dimension | CA-TECH | Pas CA-TECH |
|-----------|---------|-------------|
| Registre | Professionnel et accessible | Académique ou familier |
| Complexité | Simple par défaut, précis si nécessaire | Jargon systématique |
| Émotion | Calme, rassurant, enthousiaste avec mesure | Alarmiste ou trop enthousiaste |
| Humour | Rare, sobre, jamais au détriment du client | Blagues, emojis en excès |
| Autorité | Expertise prouvée, chiffres | Superlatifs creux |

### 7.3 Formulations recommandées vs interdites

**Pour les services**

| Éviter | Préférer |
|--------|----------|
| « Solutions IA innovantes » | « Agents IA qui travaillent à votre place » |
| « Nous vous accompagnons » | « Nous déployons » / « Nous automatisons » |
| « Transformation digitale » | « +240% de leads qualifiés en 90 jours » |
| « État de l'art » | « Utilisé par [client concret] » |
| « Synergies » | Effacer et reformuler |
| « Notre expertise unique » | « Nos 50 clients ont en moyenne... » |

**Pour Loïc**

| Éviter | Préférer |
|--------|----------|
| « Chatbot IA » | « Consultant IA » |
| « Assistant virtuel » | « Consultant disponible 24h/7j » |
| « Powered by AI » | — (ne pas mentionner la tech, mentionner le résultat) |
| « Loïc peut répondre à vos questions » | « Loïc qualifie votre projet en 10 minutes » |

**Pour les CTA**

| Éviter | Préférer |
|--------|----------|
| « En savoir plus » | « Voir comment on a fait ×3 le trafic » |
| « Contactez-nous » | « Parler à l'équipe » |
| « Demander une démo » | « Lancer mon Diagnostic IA » |
| « Cliquez ici » | Toujours un verbe + bénéfice |

### 7.4 Règles de ponctuation et style

| Règle | Détail |
|-------|--------|
| Guillemets | « » (français) dans le contenu · "..." en code uniquement |
| Apostrophe | `'` typographique · jamais `'` droite dans le contenu visible |
| Majuscules | Intelligence Artificielle · Loïc · CA-TECH · Manager (produits) |
| Chiffres | Toujours en chiffres arabes dans les titres et stats (`50 clients`, `+240%`) |
| Pourcentages | `%` sans espace (`+240%`) |
| Monétaire | `2 000 €` (espace fine · espace avant €) ou `2K€` en usage informel |
| Tirets | Tiret em `—` dans les phrases · tiret demi-cadratin `–` dans les plages |
| Points de suspension | `…` (entité · pas trois points séparés `...`) |

### 7.5 Ton par page / contexte

| Contexte | Ton | Exemple |
|----------|-----|---------|
| Homepage hero | Impact maximal · court · fort | « L'IA qui travaille. Vous qui décidez. » |
| Page service | Éducatif + convaincant | « Voici ce qu'un agent IA peut faire pour votre SAV » |
| Page Loïc | Chaleureux + direct | « Bonjour, je suis Loïc. Parlez-moi de votre projet. » |
| Cas clients | Factuel + preuve sociale | « En 3 mois : ×3.4 de trafic organique. Voici comment. » |
| Blog | Pédagogique + avis éclairé | « Ce que personne ne vous dit sur l'automatisation des devis » |
| Formulaire | Guidant + rassurant | « Étape 2 sur 4 · Vous y êtes presque » |
| Erreur 404 | Humain + utile | « Cette page n'existe plus. Loïc peut vous aider à trouver ce que vous cherchez. » |
| Emails | Personnel + court | Objet < 50 chars · Corps < 150 mots · 1 CTA |

### 7.6 Ton de Loïc

Loïc a une personnalité distincte de la marque CA-TECH. Il est le consultant — pas le chatbot.

| Attribut Loïc | Manifestation |
|---------------|--------------|
| Professionnel et chaleureux | « Bonjour ! Je suis Loïc, consultant IA chez CA-TECH. » |
| Curieux | Pose des questions ouvertes avant de proposer des solutions |
| Concret | « Combien de devis envoyez-vous par semaine ? » (pas « Parlez-moi de votre activité ») |
| Honnête | Annonce quand il va passer la main à l'équipe humaine |
| Jamais robotique | Ne répond pas « Je suis désolé, je ne comprends pas votre demande » |

**Messages types Loïc** :
```
Ouverture       : "Bonjour ! Je suis Loïc. En quoi puis-je vous aider ?"
Qualification   : "Pour vous proposer la meilleure approche, j'ai besoin de comprendre votre contexte."
Transition      : "Je transmets votre projet à l'équipe. Vous recevrez un retour sous 24h."
Encouragement   : "Vous êtes à 2 étapes d'avoir votre diagnostic complet."
```

---

## 8. Mise en page & Grille

### 8.1 Grille de base

```
Mobile 375px
├── Colonnes : 4 colonnes
├── Gouttière : 16px
└── Marges latérales : 20px

Tablette 768px
├── Colonnes : 8 colonnes
├── Gouttière : 20px
└── Marges latérales : 32px

Desktop 1280px
├── Colonnes : 12 colonnes
├── Gouttière : 24px
└── Container max-width : 1200px · centré
└── Marges latérales : auto (centrage)
```

### 8.2 Container

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;  /* desktop */
}

@media (max-width: 768px) {
  .container { padding: 0 20px; }
}
```

### 8.3 Patterns de layout

| Pattern | Grille | Usage |
|---------|--------|-------|
| 50/50 | `6col + 6col` | Section Loïc, bénéfices Avant/Après |
| 55/45 | `7col + 5col` | Hero homepage (texte + illustration) |
| 3 colonnes | `4col × 3` | Services, features |
| 4 colonnes | `3col × 4` | Stats, équipe, logos |
| Pleine largeur | `12col` | Hero, CTA final, proof bar, footer |
| Sidebar | `8col + 4col` | Article blog, formulaire multi-étapes |

### 8.4 Espacement des sections

| Contexte | Padding haut/bas |
|----------|-----------------|
| Section standard (desktop) | `96px` |
| Section standard (mobile) | `64px` |
| Hero (desktop) | `160px haut / 120px bas` |
| Hero (mobile) | `120px haut / 80px bas` |
| Footer | `64px haut / 40px bas` |
| Proof bar | `32px haut / bas` |

### 8.5 Breakpoints

| Nom | Valeur | Comportement |
|-----|--------|-------------|
| `xs` | `375px` | Mobile compact (base) |
| `sm` | `428px` | Mobile large (iPhone Pro Max) |
| `md` | `768px` | Tablette portrait |
| `lg` | `1024px` | Tablette landscape / laptop |
| `xl` | `1280px` | Desktop (référence design) |
| `2xl` | `1440px` | Desktop large (max-width container) |

---

## 9. Animations & Motion design

### 9.1 Philosophie

CA-TECH utilise les animations pour **guider l'attention** et **confirmer les interactions** — jamais pour décorer.

Toute animation doit répondre à la question : **"Que communique-t-elle à l'utilisateur ?"**

### 9.2 Propriétés animables

**Autorisées :**
- `transform` (translate, scale, rotate)
- `opacity`
- `filter` (blur uniquement, avec parcimonie)

**Interdites :**
- `width` / `height` (provoque des recalculs de layout = jank)
- `top` / `left` / `right` / `bottom` (idem)
- `margin` / `padding` (idem)
- `background-color` en continu (acceptable à `150ms` pour les hover)

### 9.3 Tokens d'animation

| Token | Valeur | Usage |
|-------|--------|-------|
| `--duration-fast` | `150ms` | Hover, focus, états |
| `--duration-normal` | `250ms` | Composants (modal, dropdown) |
| `--duration-slow` | `400ms` | Reveals scroll, transitions de page |
| `--duration-slower` | `600ms` | Séquences complexes (hero) |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Éléments entrants (décélération) |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Éléments sortants |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Widget Loïc, cards (légère surdépassement) |

### 9.4 Patterns d'animation

**Scroll reveal (fadeUp)**
```css
.reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 400ms var(--ease-out), transform 400ms var(--ease-out);
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
```
Déclencheur : `IntersectionObserver` · seuil `0.15` · `once: true`.

**Stagger (enfants successifs)**
Chaque enfant d'une grille/liste reçoit un `transition-delay` de `+80ms` :
- Enfant 1 : `0ms`
- Enfant 2 : `80ms`
- Enfant 3 : `160ms`
- Maximum : `4 éléments staggerés` (au-delà, ça traîne)

**Hover card**
```css
.card {
  transition: transform 250ms var(--ease-out), box-shadow 250ms var(--ease-out);
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}
```

**CountUp** (stats)
Durée `1200ms` · `ease-out` · valeur finale présente dès le DOM (CSS animation par-dessus).

### 9.5 prefers-reduced-motion

**Règle absolue** : chaque animation doit être désactivée si l'utilisateur a demandé à réduire les animations.

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

CountUp : afficher la valeur finale directement sans défilement.
Hero sequence : afficher l'état final directement.
Carousel auto-advance : ne pas avancer automatiquement.

### 9.6 Ce qu'on n'anime jamais

- Texte qui se tape lettre par lettre (typewriter) — lent et daté
- Éléments qui rebondissent excessivement
- Fonds avec des particules en mouvement continu
- Rotations 3D sur des éléments de contenu
- Animations déclenchées à l'infini sans interaction

---

## 10. Déclinaisons par support

### 10.1 Site web

Référence principale de l'identité visuelle. Tous les composants définis dans `COMPONENT_GUIDELINES.md` s'appliquent.

Voir `HOMEPAGE_SPECIFICATION.md` pour le détail de la page d'accueil.

### 10.2 Présentations (slides)

**Fond** : `#0A2540` (premium, IA) ou `#FFFFFF` (lisibilité impression)

**Palette slides**
- Titres de slide : Inter ExtraBold `48px` · blanc sur fond sombre / `#0A2540` sur fond clair
- Corps : Inter Regular `20px` · `rgba(255,255,255,0.80)` sur fond sombre
- Accent : `#0066FF` uniquement pour les données importantes
- Jamais plus de 3 couleurs par slide

**Structure type**
1. Slide couverture : logo + titre + date
2. Sommaire
3. Slides de contenu (max 4 idées par slide)
4. Slide de conclusion + CTA
5. Slide de contact / Loïc

**Règle** : une idée par slide. Pas de bullets en cascade de 8 niveaux.

### 10.3 Documents PDF (rapports, devis)

**En-tête** : logo CA-TECH + nom du document + date · ligne de séparation `#E5E7EB`
**Pied de page** : `ca-tech.fr` · numéro de page · copyright

**Typographie PDF**
- Titres : Inter ExtraBold `24px` · `#0A2540`
- Sous-titres : Inter SemiBold `16px` · `#0066FF`
- Corps : Inter Regular `11px` (optimisé impression) · `#374151`
- Tableaux : alternance de lignes `#F9FAFB` / `#FFFFFF` · header `#0066FF` texte blanc

**Format** : A4 · marges `20mm` · PDF vectoriel (jamais de scan ou flatten)

### 10.4 Emails transactionnels

**Structure**
```
[Logo CA-TECH centré · largeur max 130px]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Titre H1 · Inter 24px · #0A2540]
[Corps 2-3 paragraphes courts · 16px · #374151]
[Bouton CTA · fond #0066FF · radius 8px · 44px de haut]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Footer email : adresse · désinscription · © CA-TECH]
```

- Largeur max email : `600px`
- Fond email : `#F9FAFB`
- Fond corps email : `#FFFFFF`
- Aucune image de fond (support email limité)
- Alt text sur toutes les images

**Ligne objet** : < 50 caractères · verbe d'action · no-caps-lock · pas d'emoji sauf usage prouvé

### 10.5 Réseaux sociaux

**LinkedIn (canal principal B2B)**

Format posts :
- Accroche ligne 1 : courte, intrigante, sans finir avec « … » mais assez pour créer la curiosité
- Corps : 3 à 7 lignes · une idée par ligne · aéré
- Conclusion : CTA soft ou question ouverte
- Hashtags : 3 à 5 · placés en fin · thématiques (`#IA` `#Automatisation` `#PME`)

Visuels LinkedIn :
- Format : `1200×627px` (landscape) ou `1080×1080px` (carré)
- Fond : gradient-primary ou blanc
- Logo en bas à droite · discret
- Texte sur image : maximum 20% de la surface (règle Facebook/Meta qui s'est standardisée)

**Format à éviter** : carrousels mal optimisés · montages photo génériques · posts "motivation du lundi"

### 10.6 Publicités digitales

**Google Ads**
- Titres : ≤ 30 caractères · mot-clé en tête · bénéfice
- Descriptions : ≤ 90 caractères · appel à l'action
- Extension appel : activer si campagne mobile

**Meta Ads (si utilisées)**
- Format principal : `1080×1080px` ou `9:16` vertical (Stories/Reels)
- Texte minimaliste sur visuel
- Accroche : problème / solution / preuve

### 10.7 Cartes de visite

**Recto**
- Fond : `#0A2540`
- Logo CA-TECH centré · blanc
- Slogan : « L'IA au service de votre croissance. » · `--text-sm` · `rgba(255,255,255,0.70)`

**Verso**
- Fond : `#FFFFFF`
- Prénom Nom · Titre
- Email · Téléphone · `ca-tech.fr`
- QR code → page de contact ou Loïc
- Ligne accent : `3px solid #0066FF` en bas

**Format** : `85×55mm` (standard) · coins arrondis `3mm` · impression offset 350g mat

---

## 11. Exemples d'usage correct et incorrect

### 11.1 Logo

| ✓ Correct | ✗ Incorrect |
|-----------|------------|
| Logo blanc sur fond `#0066FF` | Logo bleu sur fond bleu |
| Logo `#0A2540` sur fond blanc | Logo avec ombre portée |
| Logo vectoriel SVG redimensionnable | Logo PNG pixelisé |
| Zone de protection respectée | Texte collé au logo |
| Favicon `CA` sur fond bleu | Logo complet en favicon 16px |

### 11.2 Couleurs

| ✓ Correct | ✗ Incorrect |
|-----------|------------|
| Texte `--color-gray-600` sur fond blanc | Texte `--color-gray-400` sur fond blanc |
| CTA `#0066FF` sur fond blanc | CTA vert ou rouge sur fond blanc (hors état erreur) |
| Fond `#0A2540` + texte blanc | Fond `#003399` (bleu hors palette) + texte blanc |
| Badge `--color-primary-light` + texte `--color-primary` | Badge jaune (hors palette) |
| Gradient `135deg #0066FF → #0A2540` | Gradient arc-en-ciel multicolore |

### 11.3 Typographie

| ✓ Correct | ✗ Incorrect |
|-----------|------------|
| Inter ExtraBold `72px` pour le H1 homepage | Roboto Bold `72px` |
| `letter-spacing: -0.03em` sur les grands titres | `letter-spacing: 0.2em` sur les titres |
| Pill uppercase `14px` · `letter-spacing: 0.08em` | Pill minuscules sans tracking |
| Corps `16px` · `line-height: 1.6` | Corps `12px` · `line-height: 1.2` |
| Hiérarchie H1 → H2 → H3 | H1 direct suivi d'un H4 |

### 11.4 Ton éditorial

| ✓ Correct | ✗ Incorrect |
|-----------|------------|
| « Automatisez 80% de vos relances clients » | « Optimisez vos process grâce à nos solutions » |
| « +240% de leads en 3 mois » | « Des résultats significatifs pour nos clients » |
| « Parler à l'équipe » | « Cliquez ici pour nous contacter » |
| « Lancer mon Diagnostic IA » | « En savoir plus » |
| « Loïc qualifie votre projet en 10 minutes » | « Notre chatbot est disponible 24h/7j » |

---

## 12. Critères de validation

### 12.1 Checklist logo

- [ ] SVG vectoriel fourni (pas de PNG)
- [ ] Version claire et version inversée disponibles
- [ ] Favicon multi-résolutions livré
- [ ] Zone de protection respectée sur tous les supports
- [ ] Lisible à la taille minimale (`80px` écran · `20mm` print)

### 12.2 Checklist couleurs

- [ ] Aucune couleur hors palette utilisée
- [ ] Contraste texte/fond ≥ 4.5:1 vérifié (outil WebAIM Contrast Checker)
- [ ] `--color-gray-400` absent des textes courants
- [ ] Gradient `135deg` utilisé sur toutes les sections premium (pas un autre angle)
- [ ] Pattern d'alternance des sections respecté

### 12.3 Checklist typographie

- [ ] Inter uniquement, chargée en `400`, `600`, `800` uniquement
- [ ] Hiérarchie H1→H2→H3 sans saut
- [ ] 1 seul H1 par page
- [ ] Pill de section en uppercase + `letter-spacing: 0.08em`
- [ ] Corps `16px` · `line-height: 1.6` partout
- [ ] Aucun texte en dessous de `12px`

### 12.4 Checklist iconographie

- [ ] Lucide Icons exclusivement
- [ ] Icônes de service conformes au tableau (Bot, Zap, TrendingUp, Code2, Pen)
- [ ] `aria-hidden="true"` sur toutes les icônes décoratives
- [ ] `aria-label` sur toutes les icônes fonctionnelles seules
- [ ] `stroke-width: 2` respecté

### 12.5 Checklist ton éditorial

- [ ] Zéro "solution innovante", "accompagnement", "transformation digitale"
- [ ] Chaque CTA contient un verbe + bénéfice
- [ ] Chaque affirmation est étayée par un chiffre ou un exemple
- [ ] Intelligence Artificielle avec majuscules
- [ ] Guillemets français « » dans le contenu visible

### 12.6 Checklist animations

- [ ] `prefers-reduced-motion` implémenté globalement
- [ ] Aucune animation sur `width`, `height`, `top`, `left`
- [ ] Stagger limité à 4 éléments maximum
- [ ] Durée hover ≤ `150ms`
- [ ] Révélations scroll : `400ms --ease-out` + `IntersectionObserver`

---

*Document de référence — Identité de marque CA-TECH*
*Aligné sur `STRATEGY.md` · `UX_UI_SPECIFICATION.md` · `COMPONENT_GUIDELINES.md`*
*Version 1.0 — Juillet 2026 — En attente de validation avant application*
