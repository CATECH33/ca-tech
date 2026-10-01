---
domaine: video
modele: hyperframes-heygen
usage: Section LLM / modèles — fond réseau neuronal animé
version: 1.0
asset: catech-llm-loop.mp4 / catech-llm-loop.webm
ratio: 16:9
resolution: 1920x1080
duree: 6-8s loop
---

# Prompt — LLM Neural Loop Video (HyperFrames)

## Objectif

Vidéo de fond pour la section LLM ou les pages dédiées aux modèles de langage.
Représente un réseau neuronal actif : propagation de signaux entre nœuds.
Plus structuré et géométrique que le hero loop (cosmique) ou le AI loop (flux).

## Concept visuel

Un réseau de nœuds disposés en grille semi-régulière. Des impulsions lumineuses
se propagent de nœud en nœud selon des chemins aléatoires mais fluides,
simulant une inférence neuronale. Fond très sombre, lumières froides.

## Prompt HyperFrames

```
Seamless 7-second loop background video.

Scene: Deep navy environment (#05101E). 15-20 nodes arranged in irregular grid,
connected by thin luminous filaments (#359BD9 at 0.15 opacity at rest).
Signal propagation: every 1.5 seconds, a new signal pulse originates from a
random node and travels along connections to neighboring nodes, cascading
outward. Pulse color: bright #359BD9 → white → fade. Travel speed: 0.3s per hop.

Visual style: Between 3-5 concurrent propagation waves at any moment.
Nodes glow when signal passes (0.4 → 0.9 opacity, 0.2s ease-in-out).
Filaments brighten briefly during signal travel.

Background: Deep navy, slight radial gradient darker at edges.
No text, no UI, no humans, no geometric perfection (slight organic irregularity).

Loop: Signal timing randomized but seam-safe via offset cycle.
Output: 1920×1080, H.264 MP4, 24fps, < 2.5MB
```

## Variante — Vue macro synaptique

```
Extreme close-up style neural synapse animation.
2-3 large nodes (200-300px) dominate the frame.
Thick bright connections pulse with slow rhythmic light.
Background: near-black (#020D18), dramatic contrast.
Cinematic feel, like a scientific documentary visualization.
```

## Post-production ffmpeg

```bash
ffmpeg -i catech-llm-loop-raw.mp4 \
  -c:v libx264 -crf 28 -preset slow \
  -vf "scale=1920:1080" \
  -an -movflags faststart \
  catech-llm-loop.mp4

# WebM pour navigateurs modernes
ffmpeg -i catech-llm-loop.mp4 \
  -c:v libvpx-vp9 -crf 35 -b:v 0 -an \
  catech-llm-loop.webm
```

## Fichiers de destination

```
public/videos/llm/catech-llm-loop.mp4
public/videos/llm/catech-llm-loop.webm
```

## Différenciation entre les 3 vidéos

| Vidéo | Style | Vitesse | Densité |
|-------|-------|---------|---------|
| hero-loop | Cosmique / particules | Ultra-lente | Faible |
| ai-loop   | Flux linéaires / LLM  | Lente       | Moyenne |
| llm-loop  | Réseau / propagation  | Pulsée      | Haute   |

Ces trois vidéos doivent être visuellement cohérentes (même palette, même
esthétique) mais distinctes dans leur mouvement pour éviter la répétition.

