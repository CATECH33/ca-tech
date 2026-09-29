# MIDJOURNEY PROMPTS — CA-TECH Visual Library
## Direction artistique · Version 1.0
**Date :** 28 septembre 2026
**Auteur :** CA-TECH Design System

---

## 1. Direction artistique globale

### Positionnement visuel

CA-TECH n'est pas une startup IA. C'est un cabinet technique sérieux.  
Chaque image doit prouver la rigueur avant de séduire.

**Références esthétiques :**
- Editorial commercial photography — Bloomberg Businessweek, Wired magazine
- Architectural model photography — Hélène Binet, Iwan Baan
- IBM corporate photography des années 70-80, modernisé
- Stripe.com atmospheric depth photography
- Linear.app dark editorial minimalism

**Ce que les images expriment :**  
Précision architecturale · Systèmes organisés · Intelligence comme structure · Infrastructure invisible et fiable · Profondeur technique

**Ce que les images refusent :**  
Technologie "futuriste" générique · IA comme magie ou menace · Personnes souriantes devant des écrans · Serveurs physiques et câbles · Cyberpunk · Néons · Hologrammes · Gradients violets · Particules flottantes

---

### Vocabulaire couleur pour Midjourney

Les codes hex ne sont pas interprétés par MJ. Utiliser les descriptions suivantes.

| Couleur CA-TECH | Description en prompt MJ |
|-----------------|--------------------------|
| `#05101E` Deep Navy | `very dark midnight navy blue, almost black` |
| `#102740` Navy | `deep navy blue, dark slate` |
| `#1A4066` Technical Blue | `dark teal blue, deep ocean blue` |
| `#359BD9` Accent | `cold cerulean blue, fiber optic glow, technical blue` |
| `#A5ACB5` Silver | `cool silver gray, brushed aluminum` |
| `#E0E0E3` Light Silver | `pale silver, soft platinum, cool white` |

---

### Paramètres MJ globaux

```
--style raw     →  Qualité éditoriale, supprime les effets MJ automatiques
--v 6.1         →  Modèle actuel le plus précis
--q 2           →  Qualité maximale (optionnel, 2× le coût en crédits)
```

Format par type :
- Heroes pages expertise : `--ar 16:9`
- Visuels slides (split 60%) : `--ar 4:3`
- Portfolio thumbnails : `--ar 16:9`
- Open Graph social : `--ar 2:1`
- Brand éditorial : `--ar 3:2`

---

### Légende

```
★ PRIMAIRE    — Image principale, usage direct dans la page
◈ FALLBACK    — Remplacement CSS si implémentation insuffisante
```

---

---

## 2. Section — Intelligence Artificielle

---

### `ia-hero-expertise` ★ PRIMAIRE

**Section concernée :** Page `/expertises/ia` — hero principal  
**Rôle narratif :** Représenter l'intelligence comme organisation systématique. Pas une métaphore (cerveau, réseau), une réalité : des données structurées par un système invisible.

| Champ | Détail |
|-------|--------|
| **Format** | `--ar 16:9` |
| **Cadrage** | Plan large, profondeur de champ sélective sur les bords |
| **Composition** | Tiers gauche = espace négatif pour le texte overlay / Centre-droite = sujet |
| **Sujet** | Centaines de micro-éléments géométriques : éparpillés à gauche, progressivement organisés en colonnes précises vers la droite. La structure émergente est le message. |
| **Environnement** | Void mathématique — navy presque noir, profondeur infinie |
| **Lumière** | Directionnelle haut-droit. La zone organisée capte plus de lumière que la zone chaotique. Aucune source visible. |
| **Palette** | Deep navy · points silver-blanc · accent cerulean froid sur la zone structurée |
| **Matériaux** | Abstraits. Points géométriques sans matière physique identifiable. |
| **Style** | Editorial commercial photography. Long exposure data visualization aesthetic. Pas de CGI. |
| **Contraintes** | Espace blanc minimum 30% à gauche pour overlay texte. Pas de surcharge. |
| **Éléments interdits** | Robots, cerveaux, neurones, réseaux neuronaux, graphiques, hologrammes, humains, orbes |

**Prompt Midjourney final :**
```
hundreds of tiny geometric data points scattered on the left gradually organizing into precise vertical columns on the right, viewed from directly above, very dark midnight navy blue void background, points in cool silver-white with faint cerulean fiber optic glow on the organized right section, vast empty negative space on the left third, mathematical precision in the structured zone, shallow depth of field blurring the far edges, editorial commercial photography aesthetic, no humans, no brain imagery, no neural network diagrams, no glowing orbs, pure abstract data taxonomy visualization as aerial architectural photography --ar 16:9 --style raw --v 6.1
```

---

### `ia-terminal-fallback` ◈ FALLBACK

**Section concernée :** Slide IA — Intelligence (si version CSS insuffisante)  
**Rôle narratif :** Loïc interroge des systèmes réels. La preuve est dans les appels de fonctions.

| Champ | Détail |
|-------|--------|
| **Format** | `--ar 4:3` |
| **Cadrage** | Ultra close-up — 3 lignes de log dans le tiers central |
| **Composition** | Centré sur les lignes de code, marges vides sombres |
| **Sujet** | Interface terminal : 3 lignes d'appels de fonctions API. Noms de fonctions en silver, paramètres en cerulean. Rien d'autre. |
| **Environnement** | Deep navy absolu. Aucun UI chrome. Aucune décoration. |
| **Lumière** | Émission propre du texte. Aucune source extérieure. |
| **Palette** | Navy / silver / cerulean uniquement |
| **Matériaux** | Typographie pure sur void |
| **Style** | UI product screenshot éditorial. Vercel CLI aesthetic. |
| **Contraintes** | 3 lignes maximum. Monospace. Aucun chrome d'interface. |
| **Éléments interdits** | Barre de titre, menus, sidebar, arbre de fichiers, syntax highlighting multicolore, icônes, avatars, couleurs autres que silver et cerulean |

**Prompt Midjourney final :**
```
dark terminal interface, exactly 3 lines of API function calls in IBM Plex Mono style font, function names in pale cool silver, parameter values in cold cerulean blue with soft glow, very dark midnight navy blue void background, no window chrome, no title bar, no sidebar, no file tree, no syntax highlighting besides silver and cerulean, code lines centered vertically in empty space, soft vignette on outer edges, premium dark developer tool aesthetic, Vercel CLI visual style, pure typographic composition, product screenshot quality --ar 4:3 --style raw --v 6.1
```

---

### `ia-response-fallback` ◈ FALLBACK

**Section concernée :** Slide IA — Action (si version CSS insuffisante)  
**Rôle narratif :** La réponse de Loïc : structurée, chiffrée, actionnable.

| Champ | Détail |
|-------|--------|
| **Format** | `--ar 4:3` |
| **Cadrage** | Close-up sur une carte de message, marges sombres visibles |
| **Composition** | Carte alignée gauche, occupe 70% de la largeur, centrée verticalement |
| **Sujet** | Une seule bulle message agent — corps de texte blanc, un chiffre en cerulean, zone d'action en bas avec séparateur et bouton fantôme |
| **Environnement** | Deep navy. Espace vide visible autour de la carte. |
| **Lumière** | Lueur diffuse interne depuis la carte. Navy légèrement plus clair que le fond. |
| **Palette** | Navy fond / blanc texte / cerulean sur les valeurs numériques |
| **Matériaux** | Surface carte : navy + 15% clarté. Bordure 1px rgba blanc 8%. |
| **Style** | Premium dark chat UI. Linear.app message card aesthetic. |
| **Contraintes** | Une seule carte. Aucun fil de conversation visible au-dessus. |
| **Éléments interdits** | Avatars, photos profil, icônes de chatbot, bulles multiples, interface messagerie complète, sidebar |

**Prompt Midjourney final :**
```
single dark AI agent response message card left-aligned, very dark midnight navy background, card background slightly lighter navy with 1px rgba white border, white body text 2 lines visible, one number highlighted in cold cerulean blue within the text, bottom action zone with hairline separator and ghost pill button in cerulean outline, no avatar, no profile photo, no conversation thread, no app chrome, 12px border radius, premium minimal dark chat interface, no decorative elements, product UI screenshot quality --ar 4:3 --style raw --v 6.1
```

---

---

## 3. Section — Automatisation

---

### `auto-hero-expertise` ★ PRIMAIRE

**Section concernée :** Page `/expertises/automatisation` — hero principal  
**Rôle narratif :** L'automatisation comme flux d'information propre et géométrique. Pas des rouages — un pipeline invisible et précis.

| Champ | Détail |
|-------|--------|
| **Format** | `--ar 16:9` |
| **Cadrage** | Vue d'ensemble légèrement plongeante |
| **Composition** | Flux de gauche à droite. Espace texte en haut-gauche. |
| **Sujet** | Trois flux parallèles de nœuds géométriques connectés par des lignes fines, se déplaçant de gauche à droite et convergeant en un point central lumineux. Les nœuds sont de petits disques métalliques précis. |
| **Environnement** | Surface très sombre légèrement réfléchissante, comme de l'ardoise polie. Profondeur de champ. |
| **Lumière** | Lumière froide cerulean émanant des points de connexion. Pas de source directe visible. |
| **Palette** | Navy sombre / nœuds silver / connexions cerulean / point central cerulean lumineux |
| **Matériaux** | Disques métalliques mats — chrome brossé. Lignes de connexion comme fibres optiques. |
| **Style** | Architectural model photography meets industrial precision photography. |
| **Contraintes** | Lisibilité des 3 flux distincts obligatoire. Espace négatif en haut pour overlay. |
| **Éléments interdits** | Rouages, engrenages, robots, convoyeurs mécaniques, flèches décoratives, humains, circuits imprimés |

**Prompt Midjourney final :**
```
three parallel streams of precisely spaced small metallic disc nodes connected by single hairline lines flowing from left to right, converging at a glowing cerulean central connection point, viewed from slightly above and to the side, very dark polished slate surface, nodes in brushed chrome silver, connector lines in cold cerulean blue like fiber optics, vast negative space above composition for text overlay, extreme geometric precision in spacing, no gears, no mechanical elements, no robots, no arrows, pure information flow architecture, architectural precision model photography aesthetic --ar 16:9 --style raw --v 6.1
```

---

### `auto-trigger-fallback` ◈ FALLBACK

**Section concernée :** Slide AUTO — Déclenchement (si version CSS insuffisante)  
**Rôle narratif :** Le moment exact où un signal entre et active le système.

| Champ | Détail |
|-------|--------|
| **Format** | `--ar 16:9` |
| **Cadrage** | Plan moyen, deux nœuds reliés par un trait dans un espace vide |
| **Composition** | Source à gauche, destination à droite, ligne de connexion en animation de dessin |
| **Sujet** | Deux rectangles arrondis (nœuds) reliés par une ligne fine. Nœud gauche neutre. Nœud droit légèrement lumineux cerulean. La ligne se dessine de gauche à droite. |
| **Environnement** | Void blanc/light — section light. Fond `#F2F4F6` cool white. |
| **Lumière** | Clarté naturelle froide. Pas de drama. Précision d'un schéma. |
| **Palette** | Cool white fond / nœuds silver outline / connexion cerulean / nœud actif cerulean glow |
| **Matériaux** | Flat design géométrique — pas de 3D. Précision Figma. |
| **Style** | Clean technical diagram on light background. Linear.app diagram aesthetic. |
| **Contraintes** | Fond clair obligatoire (section light). Minimalisme absolu. |
| **Éléments interdits** | 3D, ombres dramatiques, éléments décoratifs, textes dans les nœuds, flèches décoratives |

**Prompt Midjourney final :**
```
two rounded rectangle nodes connected by a thin horizontal line on a very light cool gray background, left node outlined in silver gray, right node glowing cold cerulean blue outline with very subtle fill, connection line in cerulean with implied motion drawing from left to right, centered composition with vast white negative space above and below, clean technical diagram aesthetic, Figma component diagram style, no 3D, no shadows, no decorative elements, no text labels visible, absolute geometric precision, white product documentation visual quality --ar 16:9 --style raw --v 6.1
```

---

### `auto-compare-fallback` ◈ FALLBACK

**Section concernée :** Slide AUTO — Résultat (si version CSS insuffisante)  
**Rôle narratif :** 20 minutes manuelles vs 3 secondes automatisées. La comparaison directe.

| Champ | Détail |
|-------|--------|
| **Format** | `--ar 16:9` |
| **Cadrage** | Split horizontal 50/50 |
| **Composition** | Gauche = colonne grisée (avant) / Droite = colonne nette (après) |
| **Sujet** | Deux colonnes typographiques : gauche avec liste de tâches en silver atténué, droite avec texte cerulean sobre et chiffre "3 sec" en display |
| **Environnement** | Fond blanc, séparateur hairline vertical, section light |
| **Lumière** | Clarté froide uniforme |
| **Palette** | Fond blanc / gauche silver 40% opacity / droite cerulean sur les chiffres / séparateur silver |
| **Matériaux** | Typographie pure |
| **Style** | Editorial typographic composition. Infographic épuré. |
| **Contraintes** | Fond clair. Texte illisible intentionnellement flou à gauche pour symboliser la complexité. |
| **Éléments interdits** | Graphiques, charts, icônes, illustrations, personnes |

**Prompt Midjourney final :**
```
split typographic composition on white background, left column showing 4 muted silver gray text lines slightly blurred representing complexity, right column showing one clean sharp text in cold cerulean blue representing the result, thin hairline divider between columns, editorial minimalist layout, Swiss typography design aesthetic, no charts, no graphs, no icons, no illustrations, pure typographic contrast between complexity and clarity, magazine editorial quality --ar 16:9 --style raw --v 6.1
```

---

---

## 4. Section — Web & SaaS

---

### `web-hero-expertise` ★ PRIMAIRE

**Section concernée :** Page `/expertises/web-saas` — hero principal  
**Rôle narratif :** L'interface comme architecture. Le produit numérique est une construction rigoureuse, pas une décoration.

| Champ | Détail |
|-------|--------|
| **Format** | `--ar 16:9` |
| **Cadrage** | 3/4 angle plongeant léger |
| **Composition** | Sujet centré-gauche. Espace négatif à droite pour texte. |
| **Sujet** | 4 à 5 panneaux rectangulaires translucides, empilés avec des écarts millimétriques précis. Chaque panneau porte une grille d'interface minimaliste à peine visible — pas de contenu lisible. |
| **Environnement** | Deep navy void. Les bords des panneaux capturent la lumière bleue froide. |
| **Lumière** | Lumière cerulean froide venant de sous les panneaux, illuminant les bords. Aucune source visible. |
| **Palette** | Deep navy / panneaux translucides dark / bords cerulean / grilles silver très atténuées |
| **Matériaux** | Verre fumé dark — translucide mais pas transparent. Bords comme du verre trempé avec finition polie. |
| **Style** | Apple product photography aesthetic applied to abstract architecture. Medium format editorial. |
| **Contraintes** | Les grilles sur les panneaux NE doivent PAS être lisibles comme une vraie interface. Abstraction requise. Espace négatif droite. |
| **Éléments interdits** | Laptop, MacBook, mains, navigateurs, URL visibles, device frames, interfaces lisibles avec contenu réel |

**Prompt Midjourney final :**
```
four translucent dark glass rectangular panels stacked in precise layered formation with exact equal gaps between each, each panel faintly engraved with abstract minimal grid lines barely visible, very dark midnight navy blue void background, cold cerulean blue light illuminating the edges of panels from beneath, viewed from elegant three-quarter angle slightly below eye level, no readable interface content, perfect geometric alignment, negative space to the right for text overlay, Apple product reveal photography lighting quality, no laptop, no hands, no browser, no device frame, architectural precision --ar 16:9 --style raw --v 6.1
```

---

### `web-structure-fallback` ◈ FALLBACK

**Section concernée :** Slide WEB — Structure (si version CSS insuffisante)  
**Rôle narratif :** L'architecture technique avant l'esthétique. L'arbre de composants comme preuve de rigueur.

| Champ | Détail |
|-------|--------|
| **Format** | `--ar 4:3` |
| **Cadrage** | Close-up sur 6-8 lignes de code en monospace |
| **Composition** | Code centré, marges sombres |
| **Sujet** | Arbre de composants React en monospace — noms de composants en silver, branches en rgba blanc très atténué. Structure hiérarchique clairement lisible. |
| **Environnement** | Deep navy void. Comme un terminal. |
| **Lumière** | Émission propre du texte. |
| **Palette** | Navy / branches rgba blanc 15% / composants silver clair |
| **Matériaux** | Typographie pure. Monospace. |
| **Style** | Premium dark code editor screenshot. VS Code dark theme, Linear quality. |
| **Contraintes** | Lignes de code centrées, pas de UI chrome. Aucune couleur d'accent. |
| **Éléments interdits** | Syntax highlighting coloré, icônes, sidebar, numéros de ligne visibles, barre d'onglets |

**Prompt Midjourney final :**
```
component tree code structure in monospace font on very dark midnight navy background, 7 indented lines showing hierarchical component names, tree branch characters in faint translucent white, component names in cool silver white, no syntax highlighting colors, no line numbers, no sidebar, no UI chrome, centered in void, depth of field soft on edges, VS Code dark theme aesthetic stripped to pure text, IBM Plex Mono font style, premium dark developer tool quality --ar 4:3 --style raw --v 6.1
```

---

---

## 5. Section — Infrastructure IT

---

### `infra-hero-expertise` ★ PRIMAIRE

**Section concernée :** Page `/expertises/infrastructure` — hero principal  
**Rôle narratif :** L'infrastructure comme architecture invisible et précise. Ce qu'on ne voit pas jusqu'au jour où ça tombe.

| Champ | Détail |
|-------|--------|
| **Format** | `--ar 16:9` |
| **Cadrage** | Vue frontale légèrement plongeante |
| **Composition** | Centré avec espace négatif symétrique gauche-droite et grand vide en haut |
| **Sujet** | Coupe transversale architecturale de 4 strates horizontales distinctes. Chaque strate a une texture légèrement différente mais partage la même palette. Strate supérieure en cerulean lumineux. Frontières entre strates en ligne hairline précise. |
| **Environnement** | Void profond navy autour. Comme un modèle architectural en présentation. |
| **Lumière** | Studio directionnel latéral droit. Bordures des strates capturent la lumière. |
| **Palette** | Navy profond / strates en navy + argent / strate CDN en cerulean |
| **Matériaux** | Surfaces mates avec texture légère — granit sombre poli. Bords précis comme découpe laser. |
| **Style** | Architectural model photography — Hélène Binet, Iwan Baan. Section de maquette architecturale. |
| **Contraintes** | 4 strates exactement. Lisibilité des frontières obligatoire. Grand espace vide en haut. |
| **Éléments interdits** | Serveurs physiques, câbles, racks, LEDs clignotantes, datacenters, équipements réseau, cadenas, boucliers |

**Prompt Midjourney final :**
```
architectural cross-section model of four distinct horizontal strata in precise formation, viewed slightly from above and front, topmost stratum glowing cold cerulean blue, lower strata in dark charcoal and midnight navy with different subtle surface textures, hairline precise boundaries between each layer, very dark navy void background surrounding the model, studio directional side lighting catching layer edges, vast negative space above for text overlay, architectural model photography by Hélène Binet, no servers, no cables, no physical hardware, pure architectural abstraction --ar 16:9 --style raw --v 6.1
```

---

### `infra-layers-fallback` ◈ FALLBACK

**Section concernée :** Slide INFRA — Architecture (si version CSS insuffisante)  
**Rôle narratif :** Le diagramme en couches — CDN, Load Balancer, Services, Database.

| Champ | Détail |
|-------|--------|
| **Format** | `--ar 4:3` |
| **Cadrage** | Frontal, composition centrée |
| **Composition** | 4 couches empilées verticalement, CDN en haut en cerulean |
| **Sujet** | Diagramme technique vertical : 4 boîtes empilées avec labels. CDN/Edge fond cerulean. Load Balancer, Services (3 sous-nœuds), Database en navy/silver. |
| **Environnement** | Fond cool white (#F2F4F6). Section light. |
| **Lumière** | Lumière naturelle froide uniforme. Pas d'ombre. |
| **Palette** | Cool white fond / CDN cerulean / autres nœuds silver outline / labels navy |
| **Matériaux** | Flat design — pas de 3D. Diagramme Figma-style. |
| **Style** | Technical architecture diagram. Clean premium documentation visual. |
| **Contraintes** | Fond clair obligatoire. Labels lisibles mais abstraits. |
| **Éléments interdits** | 3D, ombres, équipements physiques, icônes techno, couleurs autres que la palette |

**Prompt Midjourney final :**
```
clean minimal IT architecture diagram on very light cool gray background, four horizontal tiers stacked vertically: top tier single box filled cold cerulean blue labeled CDN Edge in white text uppercase, second tier outlined box Load Balancer, third tier three smaller boxes side by side App API Auth, fourth tier three smaller boxes Database Cache Logs, 1px silver hairline borders, IBM Plex Sans style labels 11px uppercase, 8px border radius on all boxes, flat design no shadows, Figma architecture diagram quality --ar 4:3 --style raw --v 6.1
```

---

### `infra-metrics-fallback` ◈ FALLBACK

**Section concernée :** Slide INFRA — Supervision (si version CSS insuffisante)  
**Rôle narratif :** Le système se surveille lui-même. 4 métriques chiffrées, aucun graphique.

| Champ | Détail |
|-------|--------|
| **Format** | `--ar 16:9` |
| **Cadrage** | Plan large, 4 cartes en ligne |
| **Composition** | 4 cartes égales côte à côte, centrées |
| **Sujet** | 4 cartes métriques : `99.9% Uptime`, `<200ms Latence`, `0.01% Erreurs`, `14/mois Déploiements`. Valeurs en display bold blanc, labels en silver uppercase, bordure gauche cerulean 2px, point vert sobre. |
| **Environnement** | Fond `#102740` dark navy. Cartes légèrement plus sombres. |
| **Lumière** | Légère lueur cerulean venant de la bordure gauche de chaque carte. |
| **Palette** | Navy fond / cartes navy + 10% / valeurs blanc / labels silver / bordure cerulean / point #34d399 |
| **Matériaux** | Surface mate foncée. Bordure fine laser. |
| **Style** | Premium SaaS monitoring dashboard. Vercel Analytics dark mode. |
| **Contraintes** | Aucun graphique. Aucune courbe. Typographie pure. |
| **Éléments interdits** | Charts, graphiques, sparklines, histogrammes, icônes, avatars, logos d'outils |

**Prompt Midjourney final :**
```
four metric cards in a row on dark navy background, each card with large bold display numbers in white and small uppercase silver label below, left border accent 2px cerulean on each card, small green dot status indicator in bottom left of each card, card backgrounds slightly lighter than background, no charts, no graphs, no sparklines, no icons, pure typography monitoring dashboard, Vercel Analytics dark mode aesthetic, 4 metrics visible: uptime percentage, latency milliseconds, error rate percentage, deployments per month --ar 16:9 --style raw --v 6.1
```

---

---

## 6. Brand & Transversal

---

### `brand-og-image` ★ PRIMAIRE

**Section concernée :** Open Graph (Twitter/LinkedIn/WhatsApp share card) — toutes les pages  
**Rôle narratif :** Première impression sur les réseaux. Identité CA-TECH sans texte.

| Champ | Détail |
|-------|--------|
| **Format** | `--ar 2:1` |
| **Cadrage** | Plein cadre, composition centrée |
| **Composition** | Élément central minimal + espace négatif dominant (60%+) |
| **Sujet** | Réseau de 5 nœuds géométriques connectés par des lignes fines — disposition précise, pas aléatoire. Nœud central légèrement plus grand et cerulean. Les autres en silver. |
| **Environnement** | Deep navy void. Rien d'autre. |
| **Lumière** | Émission propre des nœuds. Nœud cerulean légèrement lumineux. |
| **Palette** | Navy / nœuds silver / nœud central cerulean |
| **Matériaux** | Points et lignes géométriques. Aucune texture de matière. |
| **Style** | Brand identity visual. Minimal. Reconnaissable. |
| **Contraintes** | Espace vide généreux — les textes OG (titre, description) s'overlayeront sur l'image. Pas de surcharge. |
| **Éléments interdits** | Texte, logos, lettres, humains, illustrations complexes, couleurs parasites |

**Prompt Midjourney final :**
```
five precisely spaced geometric nodes connected by single hairline lines, arranged in a deliberate non-random pattern, central node slightly larger with cold cerulean blue glow, outer nodes in cool silver, very dark midnight navy void background, vast negative space surrounding the composition, centered subject taking up only 40% of the frame, no text, no logos, pure minimal geometric network diagram, brand identity visual quality, Figma design system component aesthetic --ar 2:1 --style raw --v 6.1
```

---

### `brand-editorial-main` ★ PRIMAIRE

**Section concernée :** Image de marque principale — presentations, decks, réseaux sociaux  
**Rôle narratif :** L'essence de CA-TECH en une image. Utilisable dans n'importe quel contexte.

| Champ | Détail |
|-------|--------|
| **Format** | `--ar 3:2` |
| **Cadrage** | Plan d'ensemble, vision architecturale |
| **Composition** | Asymétrique. Poids visuel à droite. Grand vide à gauche. |
| **Sujet** | Vue en plongée sur une grille technique très fine — intersection de lignes orthogonales, quelques nœuds de connexion cerulean à des intersections clés. Impression de plan d'architecte pour un système invisible. |
| **Environnement** | Navy profond mat. Grille légèrement en relief — comme gravée dans la surface. |
| **Lumière** | Lumière rasante venant du bord gauche, révélant la grille en relief. Nœuds cerulean captent et intensifient la lumière. |
| **Palette** | Navy profond / grille silver très atténuée / nœuds cerulean |
| **Matériaux** | Surface gravée — comme une plaque mère architecturale, pas électronique. Métal sombre poli. |
| **Style** | Fine art editorial photography. Long exposure macro. Bloomberg cover photography quality. |
| **Contraintes** | Grand espace négatif à gauche. Subtilité — la grille ne doit pas dominer. |
| **Éléments interdits** | Circuits imprimés, PCBs, composants électroniques, textes, symboles techno, neons |

**Prompt Midjourney final :**
```
aerial view of a very fine orthogonal grid etched into a dark navy metal surface, subtle relief visible under raking side lighting from the left edge, several intersection nodes emitting precise cold cerulean light, vast dark negative space on the left third, grid occupying the right two-thirds, microscopic precision in the engraving, no text, no electronic components, no circuit board elements, pure architectural precision measurement grid, fine art editorial photography quality, Bloomberg magazine cover aesthetic, extreme material precision --ar 3:2 --style raw --v 6.1
```

---

---

## 7. Portfolio — Assets manquants

---

### `portfolio-pasmal` ★ PRIMAIRE

**Section concernée :** Section Réalisations — thumbnail projet Pasmal  
**Rôle narratif :** Montrer la qualité produit livrable pour une app web premium. Preuve de capacité.

| Champ | Détail |
|-------|--------|
| **Format** | `--ar 16:9` |
| **Cadrage** | Frontal, screenshot interface |
| **Composition** | Sidebar gauche + zone principale droite |
| **Sujet** | Application web sombre premium — sidebar avec navigation sobre, zone principale avec tableau de données propre et quelques metric cards en en-tête. Accent cerulean sur l'élément actif. |
| **Environnement** | Fond deep navy. Section dark. |
| **Lumière** | Luminosité interne de l'interface. |
| **Palette** | Navy fond / silver texte / cerulean sur actif / bordures rgba blanc 8% |
| **Matériaux** | Interface UI flat |
| **Style** | Premium dark SaaS application screenshot. Linear / Notion dark quality. |
| **Contraintes** | Aucun device frame. Aucune barre de navigateur visible. Aucun logo reconnaissable. |
| **Éléments interdits** | Device frames, barre d'URL, logos d'outils connus, texte lisible avec données personnelles, photos profil, couleurs vives |

**Prompt Midjourney final :**
```
dark premium web application screenshot, very dark navy sidebar on the left with 5 minimal navigation items in silver, one item highlighted in cerulean, main content area with 3 metric cards at top showing large white numbers and silver labels, data table below with 6 rows of clean data, subtle 1px rgba white borders, tech blue accent on selected row, no device frame, no browser chrome, no recognizable brand logos, premium dark SaaS dashboard aesthetic, Linear app quality, pixel perfect UI --ar 16:9 --style raw --v 6.1
```

---

### `portfolio-pemousmoney` ★ PRIMAIRE

**Section concernée :** Section Réalisations — thumbnail projet PemousMoney (finance personnelle)  
**Rôle narratif :** Montrer la capacité à livrer une app fintech dark premium. Lisibilité immédiate.

| Champ | Détail |
|-------|--------|
| **Format** | `--ar 16:9` |
| **Cadrage** | Frontal, centré sur les éléments financiers |
| **Composition** | Balance principale en haut centré, transactions en dessous |
| **Sujet** | Dashboard finances personnelles dark — grand chiffre de solde en blanc en haut, liste de transactions sous-jacente propre et lisible, indicateurs simples sans graphiques. Accent cerulean sur le solde positif. |
| **Environnement** | Deep navy fond. Aucun décor. Interface pure. |
| **Lumière** | Luminosité interne. Accent cerulean sur les valeurs clés. |
| **Palette** | Navy / blanc sur valeurs principales / silver sur labels / cerulean sur positif |
| **Matériaux** | Interface UI flat, premium |
| **Style** | Dark fintech app screenshot. Mercury / Monzo dark quality. Typography-forward. |
| **Contraintes** | Aucun graphique (courbes, histogrammes). Typographie pure. Aucun device frame. |
| **Éléments interdits** | Graphiques, charts, pie charts, courbes, maps, device frames, navigateur, couleurs autres que la palette, vert/rouge clichés fintech |

**Prompt Midjourney final :**
```
minimal personal finance dark web app, large white display balance number centered at top, clean transaction history list below showing 5 rows with date and amount, income amount in cold cerulean, expenses in pale silver, very dark midnight navy background, no charts, no graphs, no pie charts, no sparklines, typography-forward fintech aesthetic, Mercury bank dark mode quality, no device frame, no browser chrome, 1px rgba white borders on transaction rows, absolute premium dark UI --ar 16:9 --style raw --v 6.1
```

---

---

## 8. Récapitulatif — Images à générer

### Par section · Par priorité

#### ★ PRIMAIRES — Générer en premier

| Nom interne | Section | Format | Usage |
|-------------|---------|--------|-------|
| `ia-hero-expertise` | /expertises/ia | 16:9 | Hero page IA |
| `auto-hero-expertise` | /expertises/automatisation | 16:9 | Hero page Auto |
| `web-hero-expertise` | /expertises/web-saas | 16:9 | Hero page Web |
| `infra-hero-expertise` | /expertises/infrastructure | 16:9 | Hero page Infra |
| `brand-og-image` | Toutes les pages | 2:1 | Open Graph |
| `brand-editorial-main` | Brand/présentations | 3:2 | Image de marque |
| `portfolio-pasmal` | Section Réalisations | 16:9 | Thumbnail projet |
| `portfolio-pemousmoney` | Section Réalisations | 16:9 | Thumbnail projet |

**8 images primaires** · Générer dès que les pages expertise sont en développement.

---

#### ◈ FALLBACKS — Générer si le CSS est insuffisant

| Nom interne | Section | Slide | Format |
|-------------|---------|-------|--------|
| `ia-terminal-fallback` | IA | Intelligence | 4:3 |
| `ia-response-fallback` | IA | Action | 4:3 |
| `auto-trigger-fallback` | Automatisation | Déclenchement | 16:9 |
| `auto-compare-fallback` | Automatisation | Résultat | 16:9 |
| `web-structure-fallback` | Web & SaaS | Structure | 4:3 |
| `infra-layers-fallback` | Infrastructure | Architecture | 4:3 |
| `infra-metrics-fallback` | Infrastructure | Supervision | 16:9 |

**7 images fallback** · Générer uniquement si le rendu CSS est jugé insuffisant lors des tests.

---

### Par expertise

```
INTELLIGENCE ARTIFICIELLE
└── ia-hero-expertise         ★ primaire
└── ia-terminal-fallback      ◈ fallback slide 3
└── ia-response-fallback      ◈ fallback slide 4

AUTOMATISATION
└── auto-hero-expertise       ★ primaire
└── auto-trigger-fallback     ◈ fallback slide 2
└── auto-compare-fallback     ◈ fallback slide 5

WEB & SAAS
└── web-hero-expertise        ★ primaire
└── web-structure-fallback    ◈ fallback slide 2

INFRASTRUCTURE IT
└── infra-hero-expertise      ★ primaire
└── infra-layers-fallback     ◈ fallback slide 1
└── infra-metrics-fallback    ◈ fallback slide 5

BRAND
└── brand-og-image            ★ primaire
└── brand-editorial-main      ★ primaire

PORTFOLIO
└── portfolio-pasmal          ★ primaire
└── portfolio-pemousmoney     ★ primaire
```

**Total : 15 images** (8 primaires · 7 fallbacks)

---

## 9. Notes de production

**Variations recommandées :**  
Pour chaque image primaire, générer 4 variations (U1-U4) puis upscale la meilleure. Pour les fallbacks, 2 variations suffisent.

**Seed MJ :**  
Conserver le seed de `ia-hero-expertise` pour maintenir la cohérence de la série heroes (même palette de lumière). Utiliser `--seed [n]` sur les autres heroes.

**Formats de livraison :**
- Sources : PNG 4x (via Upscale MJ)
- Web : WebP optimisé, max 400ko par image
- Hébergement : `/public/assets/mj/` ou `/public/expertise/`

**Test d'intégration obligatoire :**  
Chaque image doit être testée avec un texte overlay blanc + cerulean avant validation finale. L'espace négatif prévu dans chaque composition a été calibré pour l'overlay.
