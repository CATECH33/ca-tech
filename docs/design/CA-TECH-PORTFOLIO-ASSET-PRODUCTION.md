# CA-TECH — Portfolio Asset Production
## PF-01 → PF-04 — Direction artistique officielle

**Date** : 2026-10-01  
**Auteur** : Claude Design (direction artistique) + Claude Code (intégration future)  
**Source of truth** : DESIGN.md · VISUAL-DIRECTION.md · CA-TECH-DECISION-REGISTER-V2.md  
**Statut** : Prompts finalisés — en attente de génération Midjourney

---

## 1. MASTER STYLE PF — Langage visuel commun

Tous les 4 assets partagent le même langage visuel. Aucune exception.

### Fond & atmosphère
- **Fond** : dégradé profond `#05101E → #102740` — pas de noir pur, pas de blanc
- **Éclairage** : directionnel, studio, source unique haut-gauche ou haut-droit
- **Température** : froide — bleu-blanc uniquement, aucune teinte chaude (pas d'ambre, pas d'or, pas d'orange)
- **Grain** : léger grain cinématographique à ~3 % d'opacité — évite l'aspect "render 3D générique"
- **Profondeur** : depth of field léger, plan principal net, arrière-plan légèrement flou

### Interface & composition
- **Style** : product photography UI — visualisation photoréaliste d'interface métier, pas de device frame générique
- **Angle** : vue 3/4 avec perspective légère (rotateX -5° à -10°, rotateY ±8°) — dynamique sans être spectaculaire
- **Format** : 16:9 master (1920×1080 cible, exporté 1920×1080 WebP)
- **Densité** : interfaces riches mais lisibles — des données qui circulent, pas des maquettes vides
- **Texte in-image** : noms de colonnes, labels de métriques, intitulés de boutons — en anglais ou français neutre, jamais de lorem ipsum, jamais de lorem text visible

### Palette stricte
| Rôle | Valeur |
|---|---|
| Fond primaire | `#05101E` |
| Fond secondaire | `#102740` |
| Accent principal | `#359BD9` |
| Gris-argent | `#A5ACB5` |
| Blanc froid | `#F2F4F6` |
| Surface card | `rgba(16,39,64,0.8)` |

### Typographie in-image
- Interface labels : Inter ou Space Grotesk — cohérence avec la charte CA-TECH
- Pas de serif, pas de script, pas de police fantaisiste

### INTERDITS absolus
- Purple · violet · magenta · pink · orange · green · cyan néon
- Cyberpunk · hologrammes · robots · cerveau IA · circuits imprimés génériques
- Stock photo · fond blanc · fond noir pur
- Logo CA-TECH généré par Midjourney
- Visages de personnes · mains · corps
- Texte aléatoire lisible nonsensical (lorem ipsum illisible acceptable)

---

## 2. PF-01 — CA-TECH Manager (CRM / gestion commercial)

**Description produit** : Interface de gestion relation client — pipeline de deals, fiches contacts, suivi commercial, métriques équipe.

### Concept A — Pipeline Kanban CRM *(SÉLECTIONNÉ)*

**Rationale** : Le kanban de deals est l'archétype visuel du CRM. Immédiatement reconnaissable. Les colonnes colorées créent un rythme horizontal fort en 16:9. La notion de "deal en mouvement" communique la valeur métier sans ambiguïté. Angle idéal pour montrer l'aspect opérationnel d'un outil de travail quotidien.

**Composition** :
- Vue principale : board kanban 5 colonnes (Qualification → Proposition → Négociation → Gagné → Perdu)
- Cards de deals dans chaque colonne avec nom, montant, date, progress ring
- Header : métriques globales (MRR, pipeline total, taux de conversion) en band horizontale
- Sidebar navigation gauche (70px) : icônes nav, avatar utilisateur en bas
- Colonne "Gagné" légèrement mise en avant — `#359BD9` accent, cards légèrement brightened
- Fond : `#05101E` avec cards en `rgba(16,39,64,0.8)`

### Concept B — Business Intelligence / Analytics *(non retenu)*

Tableaux de bord analytics — graphes en courbes, donut charts, KPIs. Moins différenciant qu'un vrai CRM kanban. Risque de confusion avec PF-04 (finance).

### Concept C — Device mockup MacBook *(non retenu)*

Composition MacBook perspective. Trop générique, le device frame consomme de l'espace sans ajouter de valeur métier. L'interface nue est plus impactante.

---

### Prompt final PF-01

```
Dark navy SaaS CRM interface dashboard, kanban pipeline board with 5 vertical columns labeled Qualification, Proposal, Negotiation, Won, Lost, clean deal cards inside each column showing company name, deal amount, progress indicator, minimal sidebar navigation on left with icon buttons, top header metrics bar showing MRR total and conversion rate, column headers with subtle blue accent highlights on Won column, interface rendered in deep navy #05101E background with card surfaces rgba(16,39,64,0.85), text in cold white, accent color #359BD9, slight 3/4 perspective angle rotateX -6deg rotateY 8deg, single directional studio light from top-left, shallow depth of field, subtle film grain, ultra-clean minimal SaaS UI, premium product photography, no people, no device frames, no purple, no green, no orange, 8k render quality --ar 16:9 --style raw --v 6
```

**Negative prompt PF-01** :
```
purple, violet, magenta, pink, orange, green, neon, cyberpunk, hologram, robot, brain, circuit board, circuit traces, glowing orbs, dark background pure black, white background, device frame, laptop frame, macbook mockup, logo, watermark, text lorem ipsum, generic stock photo, people, hands, face, warm lighting, amber, gold, yellow, blurry interface, empty dashboard, sketch wireframe
```

---

## 3. PF-02 — CV Magic (IA de création de CV)

**Description produit** : Outil IA de création et optimisation de CV — transformation de brouillons en CV professionnels, scoring ATS, personnalisation par offre d'emploi.

### Concept A — Split-screen transformation avant/après *(SÉLECTIONNÉ)*

**Rationale** : La métaphore "avant/après" est le meilleur storytelling pour un outil de transformation. La gauche brute → droite polie communique instantanément la valeur. Le score de qualité IA en overlay donne une dimension tech sans être abstrait. C'est concret, démonstratif, et visuellement contrasté.

**Composition** :
- Split-screen vertical : gauche = document texte brut/désordonné (aspect notes), droite = CV mis en page avec sections propres
- Panel central flottant : "AI Score 94 / 100" avec jauge, labels "ATS Optimized", "Keywords matched"
- Interface minimaliste — fond noir froid, le document est l'héros
- Fine ligne de séparation au centre avec micro-arrow indicateur de transformation
- Coins du document droit légèrement brillants (studio light reflection)

### Concept B — Galerie de templates CV *(non retenu)*

Grid de 4-6 templates de CV. Moins distinctif, ressemble à un site de templates génériques.

### Concept C — Dashboard ATS Analysis *(non retenu)*

Métriques de compatibilité ATS. Trop proche d'un dashboard analytics — moins immédiatement compréhensible par un non-initié.

---

### Prompt final PF-02

```
Dark SaaS interface for AI-powered resume builder, split-screen layout dividing the view vertically, left side showing raw unformatted document text with scattered information, right side showing a clean polished professional resume with proper sections, headers, typography, floating center panel with AI quality score 94/100 gauge and ATS optimization badge, thin dividing line with transformation arrow indicator, interface background deep navy #05101E, document surfaces slightly lighter #102740, accent color #359BD9, cold white text, floating panel with subtle blue border glow, single studio light from top-right, 3/4 perspective angle subtle tilt, shallow depth of field, film grain, ultra-clean product UI, no people, no device frames, no purple, no warm colors, premium SaaS product photography, 8k --ar 16:9 --style raw --v 6
```

**Negative prompt PF-02** :
```
purple, violet, magenta, pink, orange, green, neon, cyberpunk, warm lighting, amber, portrait photo, person face, hand, body, device frame, laptop, macbook, generic stock photo, white background, pure black background, lorem ipsum placeholder, empty form, template gallery, wireframe, sketch, low quality, blurry
```

---

## 4. PF-03 — SHOPCA (marketplace e-commerce)

**Description produit** : Marketplace multi-vendeurs — catalogue produits, gestion boutique, commandes, paiement. Positionnement : e-commerce B2C premium.

### Concept A — Catalogue marketplace éditorial *(SÉLECTIONNÉ)*

**Rationale** : La grille catalogue est l'identité visuelle du e-commerce. Une grille 4 colonnes avec des cards produits premium + sidebar catégories + barre de recherche/filtres = le pattern de reconnaissance immédiat pour "marketplace". L'esthétique froide navy/blue transforme un catalogue standard en quelque chose de premium et distinctif.

**Composition** :
- Grille 4 colonnes de product cards : image produit (rectangulaire 3:4), nom, prix, rating
- Sidebar gauche : filtres/catégories avec checkboxes, price range slider
- Header : searchbar prominent avec filtres actifs (chips bleus), breadcrumb
- Cards premium : fond dark avec product highlight, badge "Best seller" ou "New" sur certaines cards
- Indication de "produits actifs" : 2-3 cards avec overlay de panier au hover
- Couleurs : fond `#05101E`, cards `#102740`, prix en `#359BD9`, ratings en étoiles argent

### Concept B — Page produit premium *(non retenu)*

Single product view. Moins évocateur du concept "marketplace" multi-produits.

### Concept C — Dashboard vendeur analytics *(non retenu)*

Vue analytics vendeur. Risque de confusion avec CA-TECH Manager et Pemous Money.

---

### Prompt final PF-03

```
Dark premium e-commerce marketplace interface, 4-column product grid catalog with clean product cards showing item image, product name, price in blue accent, silver star rating, minimal add-to-cart button, left sidebar with category filters, checkboxes, price range slider, top searchbar with active filter chips in blue, breadcrumb navigation, some cards with subtle Best Seller badge, deep navy background #05101E, card surfaces #102740, accent color #359BD9, cold silver text, slight 3/4 perspective angle, studio lighting from top-left, shallow depth of field, ultra-clean premium e-commerce product photography, no people wearing products, no warm colors, no purple, no green, no orange, film grain, 8k render --ar 16:9 --style raw --v 6
```

**Negative prompt PF-03** :
```
purple, violet, magenta, orange, warm tones, amber, yellow, neon, cyberpunk, white background, pure black, lifestyle photography, person wearing product, hands, face, body, cheap marketplace look, generic stock photo, busy cluttered interface, too many colors, device frame, laptop, macbook, lorem ipsum, empty grid, wireframe, sketch, low quality
```

---

## 5. PF-04 — PEMOUS MONEY (gestion financière / fintech)

**Description produit** : Application de gestion financière personnelle et patrimoniale — portefeuille, allocations, performance, suivi budgétaire.

### Concept A — Portfolio overview patrimonial *(SÉLECTIONNÉ)*

**Rationale** : La vue patrimoine globale (balance, allocation, performance) est le dashboard le plus iconique du fintech premium. La combinaison donut chart + ligne de performance + liste d'actifs crée un ratio signal/espace optimal pour du 16:9. La ligne de performance donne du mouvement sans animation. C'est distinctif de SHOPCA et CA-TECH Manager.

**Composition** :
- Header : valeur du portefeuille large en `#F2F4F6` ("€ 48,320") + variation journalière (`+2.4% aujourd'hui` en vert clair désaturé)
- Gauche : donut chart d'allocation (segments en nuances de bleu froid : `#359BD9`, `#1A4066`, `#A5ACB5`)
- Centre-droite : courbe de performance sur 12 mois (ligne fine `#359BD9` avec area fill subtle)
- Bas : liste d'actifs — 3-4 lignes (Équité, Obligations, Cash, Crypto) avec pourcentage et variation
- Cards de métriques en header : rendement annualisé, volatilité, ratio Sharpe
- Fond global `#05101E`, surfaces `#102740`

### Concept B — Spending analytics budgétaire *(non retenu)*

Catégories de dépenses, budget mensuel. Plus quotidien/consumer, moins premium et distinctif.

### Concept C — Multi-metric cards live *(non retenu)*

Grille de métriques en temps réel. Moins narratif, plus proche d'un dashboard Bloomberg générique.

---

### Prompt final PF-04

```
Dark premium fintech portfolio dashboard interface, large portfolio total value display in cold white showing 48320 EUR with positive daily change indicator, left section showing allocation donut chart with segments in cold blue tones, center-right performance line chart spanning 12 months with thin blue line #359BD9 and subtle area fill gradient, bottom asset allocation table showing 4 rows with equity bonds cash crypto and their performance percentages, top header metric cards showing annualized return volatility sharpe ratio, deep navy background #05101E, surface cards #102740, accent color #359BD9, argent silver text for labels, slight 3/4 perspective tilt, single studio light top-left, shallow depth of field, film grain, ultra-clean fintech product photography, premium financial dashboard, no people, no warm colors, no green neon, no orange, no purple, 8k --ar 16:9 --style raw --v 6
```

**Negative prompt PF-04** :
```
purple, violet, magenta, pink, orange, warm amber, neon green, cyberpunk, hologram, robot, brain, circuit board, white background, pure black, people, hands, face, device frame, laptop, stock market ticker tape, bloomberg terminal look, busy cluttered charts, too many indicators, generic finance stock photo, lorem ipsum, empty dashboard, wireframe, sketch, low quality render
```

---

## 6. Négatif global (commun aux 4 prompts)

À appliquer systématiquement en complément des négatifs spécifiques :

```
purple, violet, magenta, neon, cyberpunk, hologram, robot, AI brain, circuit board traces, glowing orbs, particle systems, warm lighting, orange, green neon, pure black background #000000, white background, device frame, generic laptop mockup, person face, hands, body parts, stock photography style, lorem ipsum placeholder text, empty interface, wireframe sketch, low resolution, blurry render, watermark, logo watermark, oversaturated, HDR overprocessed
```

---

## 7. Spécifications d'export

### Format de livraison
| Spec | Valeur |
|---|---|
| Résolution master | 1920 × 1080 px |
| Format export | WebP (qualité 90) |
| Format backup | PNG-24 |
| Ratio | 16:9 exact |
| Mode couleur | sRGB |
| Profil | sRGB IEC61966-2.1 |

### Naming convention
```
PF-01/dashboard.webp          (CA-TECH Manager — kanban CRM)
PF-01/dashboard-fallback.png  (backup PNG)
PF-02/home.webp               (CV Magic — split-screen)
PF-02/home-fallback.png
PF-03/catalog.webp            (SHOPCA — grille catalogue)
PF-03/catalog-fallback.png
PF-04/dashboard.webp          (Pemous Money — portfolio)
PF-04/dashboard-fallback.png
```

### Intégration (à faire en Phase d'intégration — pas maintenant)
- Destination : `public/portfolio/PF-01/dashboard.webp` etc.
- `<img>` avec `loading="lazy"` sauf premier projet (above fold → `loading="eager"`)
- `width="1920" height="1080"` pour éviter CLS
- `alt` descriptif en français (ex: "Interface CRM CA-TECH Manager — gestion pipeline commercial")
- Mettre à jour `PORTFOLIO_PROJECTS` dans `src/lib/constants.js` avec chemins réels

### Pipeline d'optimisation
1. Générer en Midjourney (--ar 16:9 --style raw --v 6)
2. Upscale via HyperFrames si nécessaire (x1.5 ou x2)
3. Conversion WebP via sharp ou squoosh (qualité 90)
4. Vérification dimensions exactes 1920×1080
5. Placement dans `public/portfolio/`
6. Mise à jour constants.js par Claude Code

---

## 8. Rapport de sélection

### Critères d'évaluation appliqués

1. **Reconnaissance immédiate** — le visiteur comprend le produit en < 2s
2. **Différenciation inter-projet** — les 4 visuels forment un set cohérent sans être identiques
3. **Richesse informationnelle** — des interfaces vivantes, pas des mockups vides
4. **Cohérence palette** — navy/blue/argent, aucune dérive chaude
5. **Potentiel de génération** — le prompt est précis sans être sur-contraint

### Matrice de sélection

| Projet | Concept retenu | Score reconnaissance | Score différenciation | Score richesse |
|---|---|---|---|---|
| PF-01 CA-TECH Manager | A — Pipeline Kanban | 9/10 | 9/10 | 8/10 |
| PF-02 CV Magic | A — Split-screen | 10/10 | 10/10 | 7/10 |
| PF-03 SHOPCA | A — Catalogue grille | 9/10 | 8/10 | 9/10 |
| PF-04 Pemous Money | A — Portfolio overview | 8/10 | 9/10 | 9/10 |

### Notes de différenciation

- **PF-01 vs PF-04** : l'un est une grille kanban horizontale (deals) / l'autre est courbe + donut (performance)
- **PF-02** est le seul split-screen — unique dans le set
- **PF-03** est le seul à avoir des "produits" physiques dans les cards — rompt visuellement avec les dashboards purs
- Les 4 utilisent le même fond mais des compositions radicalement différentes

---

## 9. Arborescence de livraison

```
docs/design/assets/portfolio/
├── PF-01/
│   └── (dashboard.webp à générer via Midjourney)
├── PF-02/
│   └── (home.webp à générer via Midjourney)
├── PF-03/
│   └── (catalog.webp à générer via Midjourney)
└── PF-04/
    └── (dashboard.webp à générer via Midjourney)
```

Les assets finaux seront déposés dans `public/portfolio/` lors de la phase d'intégration.

---

*Document produit par Claude Design — direction artistique CA-TECH.*  
*L'intégration React sera effectuée par Claude Code uniquement après validation manuelle des 4 visuels générés.*
