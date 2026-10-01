---
domaine: video
modele: hyperframes-heygen
usage: Section AI — vidéo de fond ou showcase animé
version: 1.0
asset: catech-ai-loop.mp4 / catech-ai-loop.webm
ratio: 16:9
resolution: 1920x1080
duree: 5-6s loop
---

# Prompt — AI Section Loop Video (HyperFrames)

## Objectif

Vidéo ambiante pour la section IA de la homepage ou des pages services IA.
Représente des flux de données / conversations IA en mouvement doux.
Utilisée en arrière-plan ou dans une card de showcase.

## Concept visuel

Des lignes de données lumineuses traversent doucement l'écran horizontalement,
simulant des messages LLM en transit. Un ou deux nœuds pulsent au rythme d'une
réponse générée. Fond très sombre, traits fins.

## Prompt HyperFrames

```
Seamless 5-second loop background video.

Scene: Deep navy void (#05101E). Thin luminous data streams flow horizontally
from left to right, suggesting information transfer or LLM token generation.
2-3 glowing nodes in the frame pulse with a soft blue light (#359BD9) at
irregular intervals (0.8–1.2s cycle), simulating AI "thinking."

Data streams: 3-5 thin lines (1-2px), varying opacity (0.4–0.7),
slight vertical offset (±5px) as they traverse.
Pulse nodes: 20-30px circles, 0.2–0.6 opacity range, smooth easing.

Motion: Streams move at constant speed, 15% frame width per second.
No acceleration, no turbulence.

Loop: Streams exit right and re-enter left seamlessly.
No flash, no visible seam.

No text, no UI chrome, no people.
Pure data flow abstraction.

Output: 1920×1080, H.264 MP4, 24fps, < 2MB
```

## Variante — Conversations bubbles flottantes

```
Seamless 6-second loop. Abstract representation of AI conversation:
alternating soft glowing bubbles appear on left (user) and right (AI),
float upward gently and fade out. No text inside bubbles — pure light.
Cold blue + white color, deep navy background.
Minimal, elegant, hypnotic rhythm.
```

## Post-production ffmpeg

```bash
ffmpeg -i catech-ai-loop-raw.mp4 \
  -c:v libx264 -crf 30 -preset slow \
  -vf "scale=1920:1080" \
  -an -movflags faststart \
  catech-ai-loop.mp4
```

## Fichiers de destination

```
public/videos/ai/catech-ai-loop.mp4
public/videos/ai/catech-ai-loop.webm
```

## Note d'utilisation

Sur section AI, utiliser en background avec overlay CSS :

```css
.ai-section-bg video {
  opacity: 0.25;
  mix-blend-mode: screen;
}
```

