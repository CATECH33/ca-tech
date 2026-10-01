---
domaine: image
modele: midjourney
usage: Hero section — poster frame fallback (reduced motion + preload)
version: 1.0
asset: catech-hero-poster.webp
ratio: 16:9
resolution: 1920x1080
---

# Prompt — Hero Poster Frame

## Objectif

Image statique représentant l'état initial (frame 0) de la vidéo hero.
Utilisée comme :
- Poster de la `<video>` (affiché pendant le chargement)
- Fallback si `prefers-reduced-motion: reduce`
- Preload LCP (image chargée en priorité)

## Option A — Dériver de la vidéo

Si la vidéo hero (`catech-hero-loop.mp4`) est produite en premier :
```bash
ffmpeg -ss 0.5 -i catech-hero-loop.mp4 -frames:v 1 -q:v 2 poster.png
cwebp -q 90 poster.png -o catech-hero-poster.webp
```

## Option B — Produire directement via Midjourney

Utiliser le même prompt que `catech-hero-main.md` en ajoutant :

```
[...même prompt que catech-hero-main...]
frozen frame, still moment, no motion blur,
--ar 16:9 --style raw --v 7 --q 2
```

## Spécifications techniques

- WebP 90% (légèrement plus qualité que les autres — c'est le LCP)
- Poids cible : < 150 KB
- Doit correspondre visuellement à la vidéo (pas de rupture visuelle au chargement)
