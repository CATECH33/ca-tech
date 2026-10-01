---
domaine: image
modele: midjourney
usage: Open Graph — image de partage social homepage
version: 1.0
asset: catech-og-home.webp
ratio: 1200x630 (1.91:1)
resolution: 1200x630
---

# Prompt — Open Graph Homepage

## Objectif

Image de partage pour les liens sociaux (LinkedIn, Twitter/X, WhatsApp, iMessage).
Format OG standard 1200×630. Doit contenir le branding CA-TECH et la proposition de valeur.

## Option A — Composée en code (recommandée)

Générer via HTML/CSS statique avec screenshot :

```html
<!-- Fond hero-poster.webp + overlay + texte CA-TECH -->
<div style="width:1200px;height:630px;background:#05101E;position:relative;overflow:hidden;">
  <img src="catech-hero-poster.webp" style="width:100%;height:100%;object-fit:cover;opacity:0.3;">
  <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;">
    <div style="font-family:'Space Grotesk';font-size:64px;font-weight:700;color:#F2F4F6;letter-spacing:-2px;">CA-TECH</div>
    <div style="font-family:'Inter';font-size:24px;color:#359BD9;letter-spacing:1px;">L'IA au service de votre croissance</div>
  </div>
</div>
```

Avantages : typographie exacte, contrôle total, cohérence garantie.

## Option B — Midjourney + post-production texte

Si option A non disponible :

```
dark premium technology brand identity background,
deep navy #05101E, soft blue particle ambiance,
horizontal banner composition, centered visual weight,
space reserved center for text overlay,
no text generated, clean atmospheric background,
professional corporate technology aesthetic,
cold blue accent lighting, minimal,
--ar 1200:630 --style raw --v 7 --q 2
```

Ensuite ajouter le texte en post-production (Figma / Photoshop / Canvas).

## Spécifications techniques

- Dimensions exactes : 1200 × 630 px
- Format final : WebP 90% ou JPEG 92%
- Poids max : < 200 KB
- Vérifier le rendu sur : LinkedIn, Twitter card validator, WhatsApp preview

## Fichier de destination

```
public/og/catech-og-home.webp
```

Référencer dans `index.html` :
```html
<meta property="og:image" content="https://ca-tech.fr/og/catech-og-home.webp">
<meta name="twitter:image" content="https://ca-tech.fr/og/catech-og-home.webp">
```

