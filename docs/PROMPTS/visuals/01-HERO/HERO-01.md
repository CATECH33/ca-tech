---
domaine: image
modele: midjourney
section: hero
direction: A — Abstract Architecture
version: 1.0
asset: catech-hero-abstract-v1.webp
phase: 1
---

# HERO-01 — Direction A : Abstract Architecture

## OBJECTIVE

Image principale hero desktop. Direction sans personnage — pure atmosphère technologique premium.
Communique l'intelligence, la profondeur, la précision sans recourir aux clichés AI.

## USE CASE

- Background full-width du hero CA-TECH homepage
- Poster `<video>` fallback si HyperFrames non disponible
- Image OG alternée

## PROMPT

```
dark premium server room corridor, deep perspective hallway of blurred technical equipment,
cold blue LED indicators on black chassis receding infinitely,
architectural precision, crisp floor and ceiling lines vanishing to center,
controlled studio lighting, ultra minimal composition,
deep navy #05101E dominant environment, accent cold blue light sources only,
no people, no UI, no text, no branding,
sharp foreground edge detail, deep background bokeh,
cinematic technology editorial photography,
shot on Sony A7R V, 24mm wide angle, f/8,
--ar 16:9 --style raw --v 7 --q 2
--no purple, neon, glow artifacts, lens flare, dust particles, generic data center cliche
```

## NEGATIVE CONSTRAINTS

- Pas de lumières chaudes (orange, ambre, rouge)
- Pas de particules ou effets numériques superposés
- Pas d'interfaces flottantes
- Pas de serveurs rack génériques avec voyants rouges
- Pas de composition symétrique plate

## ASPECT RATIO

`--ar 16:9` — 1920×1080 px

## EXPECTED COMPOSITION

```
[Perspective fuyante centre-gauche]
[Couloir/structure recule en profondeur]
[First plan droit : détail net d'une surface technique]
[Centre flou : profondeur infinie]
[Zone gauche : espace pour texte hero (fond sombre garanti)]
```

## COLOR DIRECTION

- 85% Deep Navy `#05101E` et noir architectural
- 12% accent bleu froid des indicateurs LED
- 3% highlights Silver sur arêtes métal

## CAMERA / LENS

Sony A7R V — 24mm wide angle — f/8 — ISO 400
Exposition longue légèrement pour accentuer les sources lumineuses

## LIGHTING

Lumières internes de l'environnement uniquement (LED techniques).
Pas de lumière studio visible. Ambiance naturelle à l'infrastructure.
Zone de négatif côté gauche garantie sombre.

## NOTES

Direction recommandée pour le **responsive** : la composition avec profondeur centrale
permet de recadrer en 4:5 mobile sans perdre l'impact (on garde la fuite perspective).
Si retenu : extraire le poster frame à 0.5s via ffmpeg pour le `<video poster>`.

