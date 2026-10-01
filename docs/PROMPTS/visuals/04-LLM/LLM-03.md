---
domaine: image
modele: midjourney
section: llm
concept: Knowledge System
version: 1.0
asset: catech-llm-knowledge-system-v1.webp
phase: 4
---

# LLM-03 — Knowledge System

## OBJECTIVE

Représenter la base de connaissance d'un LLM : vaste, structurée, accessible.
Évoque la bibliothèque de connaissances d'un expert sans recourir aux clichés bibliothèque.

## USE CASE

- Feature "Base de connaissance métier"
- Section "Nos LLM sont fine-tunés sur vos données"
- RAG / contexte vectoriel

## PROMPT

```
architectural library shot looking up at tall dark shelving systems,
shelves hold identical matte dark modules (not books) in precise rows,
cold blue recessed lighting between shelf rows creating depth,
infinite vertical perspective, no ceiling visible,
deep navy and charcoal materials, architectural minimalism,
no labels or text on modules, pure structural abstraction,
monumental scale, the human is suggested by the scale not shown,
shot on Sony A7R V, 24mm tilt from below, f/11,
--ar 9:16 --style raw --v 7 --q 2
--no books obvious, colorful spines, warm lighting, clutter, wood shelves, text labels, purple, neon
```

## VARIANTE — Format paysage

```
same concept adapted to 16:9:
horizontal rows of dark modules extending into perspective,
cold blue strip lights along each row,
low-angle view showing 4-5 rows receding,
--ar 16:9 --style raw --v 7 --q 2
```

## NEGATIVE CONSTRAINTS

- Pas de livres colorés reconnaissables
- Pas de lumière chaude / bibliothèque classique
- Pas d'étiquettes ou labels sur les modules
- L'abstraction est nécessaire — pas une vraie bibliothèque

## ASPECT RATIO

Principal : `--ar 9:16` — 1080×1920 px (fort impact vertical)
Variante : `--ar 16:9`

## EXPECTED COMPOSITION

```
[Vue du bas vers le haut]
[Rangées de modules fuyant vers le haut à l'infini]
[Lumières froides entre les rangées]
[Première rangée nette / rangées supérieures progressivement floues]
```

## COLOR DIRECTION

- Modules : Dark anthracite mat
- Éclairage de rangée : `#359BD9`
- Fond : `#05101E` visible entre modules

## CAMERA / LENS

Sony A7R V — 24mm — tilt up — f/11 — ISO 800

