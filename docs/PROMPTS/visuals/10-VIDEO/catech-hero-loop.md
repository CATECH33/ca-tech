---
domaine: video
modele: hyperframes-heygen
usage: Hero section — vidéo de fond en boucle
version: 1.0
asset: catech-hero-loop.mp4 / catech-hero-loop.webm
ratio: 16:9
resolution: 1920x1080
duree: 6-8s loop
---

# Prompt — Hero Loop Video (HyperFrames)

## Objectif

Vidéo ambiante en boucle seamless pour le fond de la section hero.
Remplace ou complète `public/videos/hero-home.mp4.mp4` (2MB, déjà présent).

> **STATUT** : `hero-home.mp4.mp4` (2MB) est déjà fonctionnel.
> Ce prompt est documenté pour upgrade ou remplacement futur.
> `hero-home.webm.mp4` (25MB) doit être recompressé — voir Pipeline §5.

## Concept visuel

Particules lumineuses bleues dérivent lentement dans un espace profond navy.
Mouvement ultra-lent, presque imperceptible. Pas d'action abrupte. Boucle fluide
sans point de départ visible.

## Prompt HyperFrames

```
Seamless 6-second loop background video.

Scene: Deep navy space environment (#05101E), ultra-fine luminous particles
drifting slowly from right to left and upward, cold blue light rays (#359BD9)
emerging from lower-left corner, volumetric depth with multiple particle layers
at different speeds creating parallax.

Motion: Extremely slow drift, maximum 2% of frame width per second.
Particles: 200-400 micro-dots at varying opacity (0.3–0.8), some larger nodes
pulsing gently at 0.5Hz.

Loop: Frame 0 and frame N-1 must match perfectly for seamless browser loop.
No flash, no cut, no visible seam.

No text, no UI, no people, no recognizable objects.
Pure atmospheric ambient loop.

Output: 1920×1080, H.264 MP4, 24fps, < 3MB
```

## Paramètres de rendu HyperFrames

```json
{
  "duration": 7,
  "resolution": "1920x1080",
  "fps": 24,
  "loop": true,
  "format": "mp4"
}
```

## Post-production ffmpeg

Après rendu HyperFrames :

```bash
# Recompression pour < 3MB
ffmpeg -i catech-hero-loop-raw.mp4 \
  -c:v libx264 -crf 28 -preset slow \
  -vf "scale=1920:1080" \
  -an -movflags faststart \
  catech-hero-loop.mp4

# Variante WebM
ffmpeg -i catech-hero-loop.mp4 \
  -c:v libvpx-vp9 -crf 35 -b:v 0 \
  -an \
  catech-hero-loop.webm

# Extraire poster frame
ffmpeg -ss 0.5 -i catech-hero-loop.mp4 \
  -frames:v 1 -q:v 2 poster.png
cwebp -q 90 poster.png -o catech-hero-poster.webp
```

## Fichiers de destination

```
public/videos/hero/catech-hero-loop.mp4
public/videos/hero/catech-hero-loop.webm
public/visuals/hero/catech-hero-poster.webp  (frame extraite)
```

## Intégration HTML

```jsx
<video
  autoPlay muted loop playsInline
  poster="/visuals/hero/catech-hero-poster.webp"
>
  <source src="/videos/hero/catech-hero-loop.webm" type="video/webm" />
  <source src="/videos/hero/catech-hero-loop.mp4" type="video/mp4" />
</video>
```

