---
domaine: image
modele: midjourney
section: hero
direction: C — Mobile / Vertical
version: 1.0
asset: catech-hero-mobile-v1.webp
ratio: 4:5
resolution: 960x1200
phase: 1
---

# HERO-MOBILE — Direction C : Mobile Vertical

## OBJECTIVE

Visuel hero dédié format mobile (4:5 ou 9:16). Composition verticale forte.
Ne pas dériver du hero desktop — créer une image pensée nativement pour l'écran mobile.

## USE CASE

- Hero background sur viewport < 768px
- Story Instagram / LinkedIn
- Aperçu application mobile
- `srcset` mobile dans le tag `<picture>`

## PROMPT

```
vertical architectural composition, dark premium technology environment,
tall server tower or architectural column rising from bottom center,
cold blue LED indicators scattered vertically, deep depth receding upward,
deep navy to near-black gradient from bottom to top,
strong vertical lines, minimal horizontal elements,
monumental scale feeling from low angle,
no people, no text, no UI,
clean negative space in upper third for text overlay,
hyperrealistic commercial photography,
shot on Sony A7R V, 35mm, f/5.6,
--ar 4:5 --style raw --v 7 --q 2
--no purple, neon, lens flare, horizontal composition, wide angle distortion
```

## VARIANTE 9:16 (Stories)

```
same concept, adapted for full vertical:
upper half deep navy abstract particle field,
lower half: clean architectural detail (keyboard edge, server edge, desk surface),
transition zone: soft blue light gradient,
strong sense of two worlds merging (digital above, physical below),
--ar 9:16 --style raw --v 7 --q 2
```

## NEGATIVE CONSTRAINTS

- Composition horizontale à éviter absolument
- Pas d'image desktop croppée — composition native verticale
- Zone supérieure (30%) réservée et sombre pour texte

## ASPECT RATIO

Principal : `--ar 4:5` — 960×1200 px
Stories : `--ar 9:16` — 1080×1920 px

## EXPECTED COMPOSITION

```
[Haut : zone sombre — texte hero CA-TECH]
[Milieu : élément architectural vertical montant]
[Bas : détail net, textures techniques]
[Ligne conductrice verticale centrale]
[Lumières froides sur les côtés]
```

## COLOR DIRECTION

- Gradient vertical : Deep Navy en haut → légèrement plus lumineux au bas
- Accent bleu uniquement sur les sources techniques
- Noir absolu en arrière-plan profond

## CAMERA / LENS

Sony A7R V — 35mm — f/5.6 — ISO 600
Légère perspective plongeante ou contre-plongeante selon concept retenu

## LIGHTING

Sources verticales. Lumière froide venant de bas en haut (technique, contre-intuitive).
Crée une sensation de profondeur vers le haut — attire le regard vers la zone texte.

## NOTES

À produire APRÈS sélection de la direction desktop (HERO-01 ou HERO-02).
Le mobile ne doit pas contraster visuellement trop fort avec le desktop.
Si HERO-01 retenu : adopter la même inspiration "corridor" en vertical.
Si HERO-02 retenu : adapter avec une fenêtre verticale panoramique.

