---
phase: 10
date: 2026-09-29
tool: HyperFrames by HeyGen
status: PREPARATION — ne pas générer avant validation visuelle en staging
source_images:
  hero01: "27c6bec5-02ff-4a3f-8d18-2efdccdabaec (R2-V4)"
  hero02: "b55a381b-3148-4b4b-814d-e8526ae359bf (R2-V1)"
  mobile: "75213809-9801-4cdb-a3f2-f1b3b416bdf5 (R1-V1)"
---

# HERO — Direction HyperFrames

Ce document prépare la direction d'animation pour les trois visuels hero sélectionnés.
Aucune génération vidéo ne doit être lancée avant que les images statiques soient
validées en staging sur le site réel.

---

## Principes généraux d'animation

**Règle absolue :** Le mouvement révèle, il ne distrait pas.
Chaque animation doit renforcer la perception de profondeur et d'échelle déjà présente dans l'image statique.

- Durée de boucle : **8–12 secondes** (loop seamless)
- Easing : Cubic out pour les démarrages, linear pour les loops
- Vitesse : Lente (0.2%–0.8% de l'image par seconde)
- Grain : Un léger grain cinématographique sur la vidéo finale renforce la texture "shot on camera"
- Aucun flou de mouvement : Les images sont nettes — ne pas ajouter de motion blur artificiel
- Pas de transitions : Le hero est une image unique animée, pas un carousel

---

## HERO-01 — Canyon architectural (R2-V4)

**Image source :** `hero01-r2-v4.png`
**Résolution source :** 1456×816 px
**Concept visuel :** Deux ailes de building concaves enveloppant le spectateur, vues depuis le sol

### Animation principale — Slow push in

```
Keyframe 0s   : Scale 1.00 — vue complète du canyon architectural
Keyframe 6s   : Scale 1.04 — légère approche vers le bas de l'image (l'immeuble "se rapproche")
Keyframe 12s  : Scale 1.00 — retour (loop seamless, imperceptible)
```

**Axe du zoom :** centré légèrement bas (anchor-y: 60%) pour accentuer la profondeur vers le ciel entre les deux ailes.

### Animation alternative — Vertical breathe

```
Keyframe 0s   : translateY(0px)
Keyframe 4s   : translateY(-6px)
Keyframe 8s   : translateY(0px)
Keyframe 12s  : translateY(-6px)  → loop
```

Simule un léger "flottement" comme si la ville respirait. Plus subtil que le push-in.

### Overlay texte recommandé

```
Position texte  : Centre vertical, légèrement haut (y: 30%)
Couleur texte   : #F2F4F6 (Cool White)
Ombre texte     : 0 2px 40px rgba(5,16,30,0.8)
Zone sûre       : Éviter le bas 20% (grille de fenêtres dense)
```

### Masque gradient recommandé

```css
background: linear-gradient(
  to bottom,
  rgba(5,16,30,0.60) 0%,    /* top : zone texte */
  rgba(5,16,30,0.00) 40%,   /* milieu : image pure */
  rgba(5,16,30,0.70) 100%   /* bas : fondu vers section suivante */
);
```

---

## HERO-02 — Consultant panoramique (R2-V1)

**Image source :** `hero02-r2-v1.png`
**Résolution source :** 1456×816 px
**Concept visuel :** Silhouette debout tiers gauche, vide sombre absolu tiers droit

### Animation principale — Drift left

```
Keyframe 0s   : translateX(0px), Scale 1.02
Keyframe 10s  : translateX(-10px), Scale 1.02
Keyframe 20s  : translateX(0px), Scale 1.02  → loop
```

Légère dérive vers la gauche amplifie l'impression de hauteur et de mouvement "hors champ".
La figure reste dans le tiers gauche tout au long du cycle — ne jamais la sortir du cadre.

### Contrainte de cadrage impérative

La figure humaine doit rester visible en entier durant toute la durée de l'animation.
Le zoom et le translate ne doivent pas rogner la tête ou les pieds de la silhouette.

```
Zone protégée figure : x 0%–35%, y 15%–95%
Marge de sécurité    : 5% sur chaque bord de la zone protégée
```

### Overlay texte — Tiers droit

```
Position texte  : x 55%–90%, y 30%–70% (tiers droit, centré verticalement)
Couleur texte   : #F2F4F6 (Cool White)
Accent          : #359BD9 pour le sous-titre / badge eyebrow
```

La zone droite est déjà noire pur dans l'image — aucun gradient supplémentaire nécessaire.
Un gradient très léger peut renforcer la transition image/texte :

```css
background: linear-gradient(
  to right,
  rgba(5,16,30,0.00) 0%,    /* figure : image pure */
  rgba(5,16,30,0.20) 40%,   /* transition subtile */
  rgba(5,16,30,0.55) 100%   /* zone texte : lisibilité */
);
```

### Animation alternative — Atmospheric parallax

Pour une version plus sophistiquée, séparer la figure (layer avant) de la cityscape (layer arrière) :
```
Layer cityscape : translateX(-8px) sur 15s (mouvement lent)
Layer figure    : translateX(-3px) sur 15s (mouvement 40% plus lent = profondeur)
```

---

## HERO-MOBILE — Skyscraper vertical (R1-V1)

**Image source :** `hero-mobile-r1-v1.png` (dans round2/../ — à récupérer du task 75213809)
**Résolution source :** 960×1200 px
**Concept visuel :** Tour vue depuis le sol, grille LED bleue convergeant vers le haut

### Animation principale — Slow ascent

```
Keyframe 0s   : translateY(0px), Scale 1.05
Keyframe 8s   : translateY(-12px), Scale 1.05
Keyframe 16s  : translateY(0px), Scale 1.05  → loop
```

Mouvement ascendant lent qui renforce le sentiment d'altitude infinie.
La grille de fenêtres défile imperceptiblement vers le haut.

### Zone texte mobile

```
Position texte  : y 5%–35% (haut de l'image, zone sombre naturelle)
Couleur texte   : #F2F4F6
Taille          : Headline réduite vs desktop (mobile responsive)
```

### Masque gradient mobile

```css
background: linear-gradient(
  to bottom,
  rgba(5,16,30,0.75) 0%,    /* haut : zone texte opaque */
  rgba(5,16,30,0.10) 30%,   /* dégradé vers l'image */
  rgba(5,16,30,0.00) 60%,   /* fenêtres LED pures */
  rgba(5,16,30,0.40) 100%   /* bas : fondu section suivante */
);
```

---

## Spécifications d'export HyperFrames

```yaml
format: WebM (VP9) + MP4 (H.264) fallback
resolution_desktop: 1920x1080
resolution_mobile: 960x1200
framerate: 24fps
duration: 12s (seamless loop)
quality: CRF 28 (WebM) / CRF 24 (MP4)
audio: none
autoplay: true
muted: true
loop: true
preload: metadata
```

### Ordre de priorité pour l'intégration

1. **Priorité 1 :** HERO-02-R2-V1 (figure + vide) — le plus polyvalent, texte overlay naturel
2. **Priorité 2 :** HERO-01-R2-V4 (canyon architectural) — pour A/B test ou variante saisonnière
3. **Priorité 3 :** HERO-MOBILE-R1-V1 — uniquement sur breakpoint ≤ 640px

---

## Prérequis avant génération HyperFrames

- [ ] Images statiques validées visuellement en staging (vrai navigateur, vrai écran)
- [ ] Headline hero définitif validé (longueur, saut de ligne sur mobile)
- [ ] Gradient overlay réglé manuellement en CSS avant de baker dans la vidéo
- [ ] Test sur fond video désactivé (users avec prefers-reduced-motion) — image statique fallback définie
- [ ] Compression cible : < 3 MB pour desktop WebM, < 1.5 MB pour mobile
