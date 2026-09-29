# INFRASTRUCTURE — Briefs visuels
## CA-TECH V2 — Section Infrastructure IT
**Date :** 28 septembre 2026
**Référence :** `09-VISUAL-STORYBOARD.md` — section Infrastructure

---

## Décision : CSS ou image ?

**CSS exclusif.** Les diagrammes techniques en CSS sont plus précis, plus maintenables et plus cohérents avec le design system que toute image générée.

Le diagramme évolue d'une slide à l'autre — c'est un organisme vivant, pas une illustration statique. Seul le CSS permet cette progression cohérente.

---

## Contraintes visuelles absolues (rappel DESIGN.md)

```
INTERDIT dans cette section :
- Racks de serveurs, câbles, matériel physique
- Images de datacenters
- Cadenas illustrés, boucliers
- Graphiques complexes (courbes, histogrammes)
- Toute représentation physique de l'infrastructure

REQUIS :
- Section light : fond #ffffff / #F2F4F6
- Langage abstrait et logique — couches, nœuds, badges
- La sécurité s'exprime par des badges typographiques
- Les métriques s'expriment par des chiffres, pas des graphiques
```

---

## Surface et structure

**Fond :** `#ffffff` White — section light
**Composition :** Centré. Le diagramme prend 70% de la largeur. Texte au-dessus.
**Indicateur de progression :** Dots (5px) — actif = accent pill 16px, inactifs = accent 30% sur fond light. Pas de numéros, pas de barre.
**Le diagramme évolue** slide après slide — pas de recomposition totale, mais des couches qui s'ajoutent.

---

## Slide INFRA — Architecture

**Intent :** Poser la structure — chaque couche a un rôle, aucune n'est là par hasard.

**Visuel CSS :**
Diagramme vertical en couches — fond `#F2F4F6`. Les couches se construisent de bas en haut.

```
╔══════════════════════════════╗
║         CDN / Edge           ║  ← accent
╠══════════════════════════════╣
║       Load Balancer          ║
╠══════════════════════════════╣
║  App Server  │  API  │  Auth ║
╠══════════════════════════════╣
║   Database   │  Cache │ Logs ║
╚══════════════════════════════╝
```

```css
.infra-diagram {
  background: var(--bone);
  border: 1px solid var(--border-lt);
  border-radius: var(--r-card);
  overflow: hidden;
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
}

.infra-tier {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  padding: 14px 24px;
  border-bottom: 1px solid var(--border-lt);
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--t-light-1);
  opacity: 0;
  animation: tier-appear 300ms ease-out forwards;
}

/* CDN — accent */
.infra-tier--cdn {
  background: var(--accent);
  color: #fff;
  border-bottom-color: rgba(255,255,255,0.2);
}

/* Load Balancer */
.infra-tier--lb {
  background: var(--bone);
}

/* Services — 3 colonnes */
.infra-tier--services {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 0;
  background: var(--bone);
}

.infra-service-node {
  padding: 12px;
  text-align: center;
  font-size: 11px;
  color: var(--t-light-2);
  border-right: 1px solid var(--border-lt);
}

.infra-service-node:last-child { border-right: none; }

/* Data — 3 colonnes */
.infra-tier--data {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 0;
  background: var(--bone-2);
  border-bottom: none;
}

.infra-data-node {
  padding: 10px;
  text-align: center;
  font-size: 11px;
  color: var(--t-light-3);
  border-right: 1px solid var(--border-lt);
}

.infra-data-node:last-child { border-right: none; }

/* Connecteurs verticaux */
.infra-conn {
  height: 20px;
  width: 1px;
  background: var(--border-lt);
  margin: 0 auto;
}

/* Stagger : build bottom-up */
.infra-tier--data     { animation-delay: 0ms; }
.infra-conn--3        { animation-delay: 120ms; }
.infra-tier--services { animation-delay: 240ms; }
.infra-conn--2        { animation-delay: 360ms; }
.infra-tier--lb       { animation-delay: 480ms; }
.infra-conn--1        { animation-delay: 600ms; }
.infra-tier--cdn      { animation-delay: 720ms; }

@keyframes tier-appear {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

**Motion :** Les couches se construisent de bas en haut (fondation d'abord). Les connecteurs apparaissent entre les couches.

---

## Slide INFRA — Systèmes

**Intent :** Chaque service est nommé, isolé, documenté.

**Visuel CSS :**
Le même diagramme — mais chaque nœud s'illumine tour à tour avec un tooltip minimal.

```css
/* Nœud actif — pulse accent */
.infra-node--active {
  background: rgba(53,155,217,0.08);
  border: 1px solid var(--accent-border);
  border-radius: 6px;
  color: var(--accent);
}

/* Tooltip */
.infra-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--bone);
  border: 1px solid var(--accent-border);
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 11px;
  color: var(--t-light-2);
  white-space: nowrap;
  pointer-events: none;
  animation: tooltip-appear 200ms ease-out both, tooltip-hide 200ms 600ms ease-in both;
  z-index: 10;
}

@keyframes tooltip-appear {
  from { opacity: 0; transform: translateX(-50%) translateY(4px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}

@keyframes tooltip-hide {
  from { opacity: 1; }
  to   { opacity: 0; }
}
```

**Séquence des tooltips :**
- `CDN / Edge` → "Latence < 50ms" — delay 0ms
- `Load Balancer` → "99.9% uptime" — delay 800ms
- `App Server` → "Auto-scaling" — delay 1600ms
- `Database` → "Read replicas" — delay 2400ms

**Motion :** Les tooltips apparaissent séquentiellement, fade in/out 200ms each.

---

## Slide INFRA — Connexions

**Intent :** Les flux sont cartographiés. Aucune dépendance cachée.

**Visuel CSS :**
Le diagramme reste — des lignes de connexion accent se dessinent entre les couches.

```css
/* Connecteur actif — accent et animé */
.infra-conn--active {
  background: var(--accent);
  animation: pulse-down 1.5s ease-in-out infinite;
  width: 2px;
}

@keyframes pulse-down {
  0%   { opacity: 0.3; }
  50%  { opacity: 1;   }
  100% { opacity: 0.3; }
}

/* Connecteur SVG pour les connexions diagonales */
.infra-connections-svg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: visible;
}

.infra-conn-path {
  fill: none;
  stroke: var(--accent);
  stroke-width: 1.5;
  stroke-dasharray: 200;
  stroke-dashoffset: 200;
  animation: draw-path 400ms ease-out forwards;
}

.infra-conn-path:nth-child(1) { animation-delay: 0ms; }
.infra-conn-path:nth-child(2) { animation-delay: 200ms; }
.infra-conn-path:nth-child(3) { animation-delay: 400ms; }
.infra-conn-path:nth-child(4) { animation-delay: 600ms; }
.infra-conn-path:nth-child(5) { animation-delay: 800ms; }

@keyframes draw-path {
  to { stroke-dashoffset: 0; }
}
```

**Flux à dessiner :**
- CDN → Load Balancer
- Load Balancer → App Server
- Load Balancer → API
- Load Balancer → Auth
- App Server → Database
- API → Cache

**Motion :** Les traits se dessinent (`stroke-dashoffset`) en séquence, 300ms chacun.

---

## Slide INFRA — Sécurité

**Intent :** La sécurité n'est pas un décor — c'est une spécification technique mesurable.

**Visuel CSS :**
Le diagramme précédent — des badges sécurité typographiques flottent sur chaque couche.

```css
.infra-security-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border: 1px solid var(--accent-border);
  border-radius: 6px;
  background: rgba(53,155,217,0.06);
  color: var(--accent);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
  opacity: 0;
  transform: scale(0.8);
  animation: badge-appear 250ms ease-out forwards;
}

.infra-security-badge:nth-child(1) { animation-delay: 0ms; }    /* TLS 1.3 / CDN */
.infra-security-badge:nth-child(2) { animation-delay: 150ms; }  /* WAF / LB */
.infra-security-badge:nth-child(3) { animation-delay: 300ms; }  /* IAM / Services */
.infra-security-badge:nth-child(4) { animation-delay: 450ms; }  /* AES-256 / DB */

@keyframes badge-appear {
  from { opacity: 0; transform: scale(0.8); }
  to   { opacity: 1; transform: scale(1); }
}
```

**Badges par couche :**
```
CDN / Edge    → TLS 1.3
Load Balancer → WAF
Services      → IAM / RBAC
Database      → AES-256
```

**Motion :** Les badges apparaissent en scale 0.8→1 depuis l'extérieur, stagger 150ms.

---

## Slide INFRA — Supervision

**Intent :** Le système prouve sa fiabilité — en chiffres, sans graphiques.

**Visuel CSS :**
4 métriques de monitoring — fond card `#102740` sur section light. Typographie pure.

```css
.infra-metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.infra-metric-card {
  background: var(--canvas-1);   /* #102740 */
  border: 1px solid rgba(53,155,217,0.2);
  border-left: 2px solid var(--accent);
  border-radius: var(--r-card);
  padding: 20px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.infra-metric-value {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(28px, 3vw, 40px);
  line-height: 1;
  color: var(--t-dark-1);
  font-variant-numeric: tabular-nums;
}

.infra-metric-label {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--t-dark-3);
}

.infra-metric-status {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--t-dark-3);
}

/* Point vert sobre */
.infra-status-dot {
  width: 6px; height: 6px;
  background: #34d399;
  border-radius: 50%;
  animation: dot-pulse 2s ease-in-out 1;
}

@keyframes dot-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(52,211,153,0.4); }
  50%  { box-shadow: 0 0 0 5px rgba(52,211,153,0); }
  100% { box-shadow: 0 0 0 0 rgba(52,211,153,0); }
}
```

**Métriques :**
```
99.9%       <200ms      0.01%       14/mois
Uptime      Latence     Erreurs     Déploiements
```

**Motion :** Les chiffres comptent vers leur valeur finale (count-up, 600ms). Les points statut pulsent une fois à l'apparition.

---

## Prompt Midjourney — Fallback uniquement

À n'utiliser que pour des communications externes (présentation, réseaux sociaux).

**Fallback architecture diagram :**
```
clean minimal IT architecture diagram, white #F2F4F6 background,
4 horizontal tiers stacked vertically with thin connecting lines:
top tier: single box "CDN / Edge" filled tech blue #359BD9 white text,
second tier: "Load Balancer" outlined box,
third tier: 3 boxes side by side "App" "API" "Auth",
bottom tier: 3 boxes "Database" "Cache" "Logs" slightly lighter,
1px hairline connections between tiers,
IBM Plex Sans labels 11px uppercase, 8px border radius,
minimal Figma-style technical diagram, flat, no 3D --ar 4:3 --style raw --v 6.1
```

**Fallback métriques supervision :**
```
minimal dark monitoring dashboard, deep navy #05101E background,
4 metric cards in a row:
"99.9% Uptime" "<200ms Latence" "0.01% Erreurs" "14/mois Déploiements",
IBM Plex Sans Condensed display numbers in white,
small uppercase labels in silver below numbers,
subtle green dot left of each value,
tech blue left border on each card,
no charts, no graphs, pure typography metrics --ar 16:9 --style raw --v 6.1
```

---

## Notes de production

- Section light (#ffffff) — les cartes métriques dark sur la slide Supervision créent le contraste
- Le diagramme évolue d'une slide à l'autre — prévoir un seul composant React avec état de slide
- Les badges sécurité sont des overlays positionnés en `absolute` sur leur couche respective
- Les connecteurs SVG nécessitent un positionnement précis — calculer les coordonnées selon la taille réelle du diagramme
- Sur mobile : diagramme simplifié (couches empilées en liste). Swipe pour les slides.
