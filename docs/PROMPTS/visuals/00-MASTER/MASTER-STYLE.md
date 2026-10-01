---
domaine: system
version: 1.0
usage: Document de référence — ADN visuel CA-TECH commun à tous les prompts Midjourney
---

# MASTER STYLE — CA-TECH Visual DNA

> Ce document est la référence unique pour la cohérence visuelle de toute la bibliothèque Midjourney.
> Chaque prompt individuel DOIT respecter ces règles et peut y faire référence avec `[[MASTER-STYLE]]`.

---

## 1. Palette officielle

| Rôle | Couleur | Hex |
|------|---------|-----|
| Deep background | Deep Navy | `#05101E` |
| Secondary dark | Navy | `#102740` |
| Technical surface | Technical Blue | `#1A4066` |
| Accent lumineux | Light Tech Blue | `#359BD9` |
| Textures neutres | Silver | `#A5ACB5` |
| Surfaces claires | Light Silver | `#E0E0E3` |
| Texte / blanc | Cool White | `#F2F4F6` |

**Règle absolue :** Aucune image ne doit contenir de violet, rose, vert néon, orange, jaune vif.
**Règle absolue :** Le noir pur (`#000000`) ne doit pas dominer — utiliser Deep Navy `#05101E`.

---

## 2. Philosophie de lumière

```
cold, controlled, directional
```

- Sources de lumière froides exclusivement (blanc-bleu 5000-7000K)
- Lumière principal venant d'un seul côté ou de derrière le sujet
- Remplissage très doux avec ombre restant profonde
- Reflets subtils sur surfaces métalliques/verre (pas de lens flare)
- Glow uniquement sur sources lumineuses réelles (écrans, indicateurs LED)
- Profondeur de champ utilisée pour créer de la hiérarchie visuelle

---

## 3. Matériaux

Privilégier :
- Métal brossé froid (aluminium, acier)
- Verre sombre / dépoli
- Surface mate dark (kevlar, carbone, plastic premium)
- Papier mat blanc dans les rares compositions light
- Câbles, connecteurs, composants techniques réels

Éviter :
- Chrome brillant saturé
- Or / cuivre (trop chaud)
- Plastique générique brillant
- Textile mou sauf pour les personnages

---

## 4. Langage photographique

### Appareil et objectif

```
shot on Sony A7R V or similar medium format digital
85mm or 50mm prime lens (occasional 35mm for environmental)
wide angle (24mm) only for architectural establishing shots
no fisheye, no tilt-shift unless intentional
```

### Profondeur de champ

```
selective depth of field — subject sharp, background beautifully blurred
f/1.4 to f/2.8 for close subjects
f/5.6 to f/8 for technical/architectural context
never full DOF unless the entire scene is the subject
```

### Composition

```
Rule of thirds — sujet positionné au tiers, pas centré sauf effet éditorial fort
Breathing room — large zone de négatif pour texte overlay
Leading lines — lignes architecturales guidant l'œil vers le sujet
Layers — premier plan + sujet + arrière-plan flou = profondeur
Never: busy background, centered symmetrical subject, dead-center framing
```

---

## 5. Niveau de réalisme

```
hyperrealistic commercial photography — NOT CGI render
NOT 3D render aesthetic
NOT concept art
NOT illustration
Targeted look: premium product photography / editorial technology magazine
```

Références mentales (ne pas citer dans les prompts) :
- Couvertures Wired / Monocle
- Photography Stripe annual report
- Apple product pages
- Linear.app visual identity
- Vercel documentation headers

---

## 6. Atmosphère

```
silent, intelligent, controlled
premium digital studio
sophisticated technology environment
empty spaces as much as objects
restraint is more powerful than excess
```

---

## 7. Traitement des personnages

Les personnages servent à raconter une **situation**, pas à être le sujet principal.

### Règles

- Pas de visage net identifiable dans les shots larges (flou, contre-jour, hors-cadre)
- Gros plans mains/posture : visage peut être visible si expressif et naturel
- Toujours en contexte tech cohérent avec l'univers CA-TECH
- Jamais de sourire corporate "stock photo"
- Jamais de "person looking at camera with hologram"
- Corps entier uniquement si composition le justifie (architecture)

### Archétypes

**CHAR-01 — AI Consultant**
```
lean, 32-40yo, minimalist dark attire (black or navy turtleneck/suit),
short hair, precise gestures, calm focus,
environment: clean desk, premium laptop, soft screen light,
posture: studying something, not performing for camera
```

**CHAR-02 — Automation Specialist**
```
35-45yo, smart technical professional, clean dark shirt,
glasses optional, concentrated expression,
environment: multi-monitor setup, technical workspace,
posture: head down over keyboard or reviewing data on screen
```

**CHAR-03 — Developer / Builder**
```
25-35yo, casual-smart (quality crewneck or plain shirt),
strong focus, relaxed but engaged,
environment: minimal desk, mechanical keyboard, dark ambient,
posture: typing, or leaning back reviewing code
```

**CHAR-04 — Entrepreneur / Decision Maker**
```
35-50yo, commanding presence, minimal navy suit or elevated casual,
confident posture, strategic gaze,
environment: architectural premium space, boardroom or terrace,
posture: standing/thinking, not sitting at desk
```

**CHAR-05 — Technical Operator**
```
28-40yo, technical precision, operational dark attire,
focused, methodical,
environment: control-room adjacent, multiple tools visible,
posture: executing a task, not looking at camera
```

### Cohérence multi-images

Pour réutiliser un personnage entre plusieurs images Midjourney :
1. Générer d'abord l'image de référence seul (portrait ou scene)
2. Noter l'URL et le seed Midjourney
3. Utiliser `--cref [URL_REFERENCE]` dans les prompts suivants
4. Indiquer `--cw 50-100` selon le niveau de cohérence souhaité

---

## 8. Environnements

### Premium Tech Office
```
deep navy walls, indirect cold lighting, large windows with city view at night,
minimal furniture, premium materials, architectural details
```

### Digital Studio / Lab
```
dark space, multiple screens, controlled lighting panels,
cables organized, professional equipment visible
```

### Abstract Tech Space
```
non-representational environment, particle fields, geometric precision,
depth illusion, navy to black gradient
```

### Architectural / Corporate
```
glass and steel, night exterior or lobby, city lights reflected,
premium empty space, architectural lines
```

---

## 9. Contraintes de contraste

Toute image doit fonctionner avec du texte `#F2F4F6` posé dessus.

- Zones de texte prévues = fond foncé garanti (WCAG AA 4.5:1 minimum)
- Si l'image est un fond full-width, la zone centrale DOIT rester sombre
- Bords peuvent être plus lumineux (vignette inversée)

---

## 10. NEGATIVE PROMPT MASTER BLOCK

À inclure dans tous les prompts (adapter selon nécessité) :

```
--no cartoon, cheap stock photography, generic AI art, cyberpunk aesthetic,
gaming visual, purple neon, pink neon, green matrix, oversaturated colors,
excessive glow effects, floating hologram, generic robot, holographic brain,
AI startup template, fake readable text, watermark, logo text, brand text,
distorted hands, extra fingers, deformed faces, duplicate people, low quality,
plastic skin texture, uncanny valley, excessive lens flare, purple tones,
illustrated style, 3D render look, stock photo corporate smiles,
person looking at camera with glowing effects, busy chaotic composition
```

---

## 11. Suffixe standard

À appliquer sur tous les prompts sauf indication contraire :

```
--style raw --v 7 --q 2
```

Utiliser `--q 1` uniquement pour tests rapides.
Utiliser `--q 2` pour production.

---

## 12. Nomenclature des fichiers

```
catech-[section]-[descriptif]-[variant].[ext]

Exemples :
catech-hero-abstract-v1.webp
catech-ai-consultant-desk-v2.webp
catech-automation-workflow-v1.webp
```

---

## 13. Formats recommandés par usage

| Usage | Ratio | Résolution |
|-------|-------|------------|
| Hero desktop | 16:9 | 1920×1080 |
| Hero mobile | 4:5 | 960×1200 |
| Section background | 16:9 | 1920×1080 |
| Card image | 3:2 | 1200×800 |
| Card portrait | 4:3 | 1200×900 |
| Square social | 1:1 | 1200×1200 |
| Story / mobile | 9:16 | 1080×1920 |
| OG image | 1200:630 | 1200×630 |
| Character portrait | 2:3 | 800×1200 |

---

## 14. Ordre de priorité des assets

1. Asset réel CA-TECH (screenshot produit, photo réelle)
2. Mockup construit à partir d'un asset réel
3. Midjourney
4. CSS / SVG pur (pour éléments abstraits simples)

**Midjourney ne doit jamais simuler une interface CA-TECH inexistante.**

