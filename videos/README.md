# Vidéos Hero CA-TECH

Architecture des vidéos hero à générer par **Claude Design**.

## Convention de nommage

Chaque page principale possède sa vidéo hero au format `hero-[page].mp4` (+ version `.webm` pour la home et les solutions).

## Liste des vidéos

| Fichier | Page cible | Statut |
|---|---|---|
| `hero-home.mp4` | Accueil / index | Présent |
| `hero-home.webm` | Accueil (fallback WebM) | À générer |
| `hero-solutions.mp4` | Solutions | À générer |
| `hero-solutions.webm` | Solutions (fallback WebM) | À générer |
| `hero-methodologie.mp4` | Méthodologie | À générer |
| `hero-ia.mp4` | Intelligence Artificielle | À générer |
| `hero-automatisation.mp4` | Automatisation | À générer |
| `hero-realisations.mp4` | Réalisations / Portfolio | À générer |
| `hero-contact.mp4` | Contact | À générer |

## Spécifications recommandées

- Format principal : **MP4 (H.264)** — compatibilité universelle
- Fallback : **WebM (VP9)** — poids réduit pour navigateurs modernes
- Résolution : **1920×1080** (Full HD)
- Durée : **8–15 secondes** en boucle
- Poids cible : **< 3 Mo** (mobile first, performance first)
- Audio : **aucun** (les vidéos hero sont muettes)

## Utilisation HTML

```html
<video autoplay muted loop playsinline preload="metadata">
  <source src="/videos/hero-home.webm" type="video/webm">
  <source src="/videos/hero-home.mp4" type="video/mp4">
</video>
```
