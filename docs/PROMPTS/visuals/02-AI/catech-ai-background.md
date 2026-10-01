---
domaine: image
modele: midjourney
usage: Section AI — arrière-plan ambiance (alternative au plain dark)
version: 1.0
asset: catech-ai-background.webp
ratio: 16:9
resolution: 1920x1080
---

# Prompt — AI Section Background

## Objectif

Fond atmosphérique pour la section AI de la homepage. Plus dense que le hero —
évoque des flux de données, des connexions neuronales légères, sans surcharger.
Utilisé comme background subtil derrière les cards et le texte de section.

## Prompt Midjourney

```
dark navy digital space, flowing data streams as thin luminous threads,
microscopic neural network pattern, cold electric blue #359BD9 filaments,
deep dark background #05101E dominant (85% of frame),
soft glowing nodes connected by hair-thin light lines,
infinite depth, receding perspective,
no geometric shapes, organic flowing structure,
ultra minimal density, breathing space between elements,
no text, no UI, no people,
premium technology visual identity background,
--ar 16:9 --style raw --v 7 --q 2
```

## Variante — Gradient latéral

```
deep navy to void black gradient background,
subtle AI neural mesh on left third only, fading right,
luminous blue particle drift, barely visible,
maximum 15% brightness on light elements,
editorial technology brand visual,
--ar 16:9 --style raw --v 7 --q 2
```

## Contraintes

- Le fond doit rester très sombre — opacity overlay sera appliqué en CSS
- Pas d'éléments dans le tiers central (zone du titre de section)
- Contraste suffisant pour texte `#F2F4F6` par-dessus
- Cohérent avec le hero mais différent (plus structuré, moins cosmique)

## Post-production

- Réduire la saturation de 15% pour éviter la concurrence avec le hero
- S'assurer que les bords sont sombres (pas de lumière en périphérie)

