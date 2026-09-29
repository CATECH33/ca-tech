# AUTOMATISATION — Briefs visuels
## CA-TECH V2 — Section Automatisation
**Date :** 28 septembre 2026
**Référence :** `09-VISUAL-STORYBOARD.md` — section Automatisation

---

## Décision : CSS ou image ?

**CSS principalement, avec assets réels pour les icônes outils.**

Les diagrammes de workflow sont plus flexibles et maintenables en CSS.
Les vraies icônes (`gmail.webp`, `slack.webp`, etc.) sont utilisées dans la slide Actions — elles remplacent toute génération Midjourney pour cette slide spécifiquement.

---

## Contraintes visuelles absolues (rappel DESIGN.md)

```
INTERDIT dans cette section :
- Rouages, engrenages, robots
- Représentation physique de l'automatisation
- Couleurs vives autres que l'accent
- Animations loop continues (sauf si minimes)
- Flèches décoratives sans signification

REQUIS :
- Section light : fond #ffffff / #F2F4F6
- Diagrammes géométriques abstraits — logique, pas physique
- Accent #359BD9 uniquement sur les nœuds actifs
- Assets réels /public/automatisations/ pour les icônes
```

---

## Surface et structure

**Fond :** `#ffffff` White — section light
**Composition :** Centré, large. Visuel sur 70% de la largeur. Texte au-dessus.
**Indicateur de progression :** Points non numérotés (4px) — rempli = actif. Pas de numéros.
**Transitions :** fade out + translateY(-12px) → fade in + translateY(12px)

---

## Slide AUTO — Situation

**Intent :** Rendre visible l'accumulation silencieuse qui épuise les équipes.

**Visuel CSS :**
Boîte email stylisée — pile de 5 emails empilés avec expéditeur anonymisé, objet, timestamp.
Fond `#F2F4F6`, emails en cartes blanches, bordures légères.

```css
.auto-inbox {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 480px;
  margin: 0 auto;
}

.auto-email-card {
  background: #ffffff;
  border: 1px solid var(--border-lt);
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  opacity: 0;
  animation: email-drop 300ms ease-out forwards;
}

.auto-email-avatar {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: var(--bone-2);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 600;
  color: var(--t-light-2);
  flex-shrink: 0;
}

.auto-email-meta { flex: 1; }
.auto-email-sender { font-size: 13px; font-weight: 500; color: var(--t-light-1); }
.auto-email-subject { font-size: 13px; color: var(--t-light-2); margin-top: 2px; }
.auto-email-time { font-size: 12px; color: var(--t-light-3); flex-shrink: 0; }

.auto-email-card:nth-child(1) { animation-delay: 0ms; }
.auto-email-card:nth-child(2) { animation-delay: 100ms; }
.auto-email-card:nth-child(3) { animation-delay: 200ms; }
.auto-email-card:nth-child(4) { animation-delay: 300ms; }
.auto-email-card:nth-child(5) { animation-delay: 400ms; }

/* Badge non-lu sur le dernier */
.auto-email-badge {
  width: 7px; height: 7px;
  background: #e53e3e;
  border-radius: 50%;
  flex-shrink: 0;
}

@keyframes email-drop {
  from { opacity: 0; transform: translateY(-10px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

**Motion :** Les emails tombent en stagger 100ms. Le dernier porte un badge non-lu rouge sobre.

---

## Slide AUTO — Déclenchement

**Intent :** Montrer le moment de bascule — l'entrée d'un email déclenche le système.

**Visuel CSS :**
Un email se détache de la pile. Un trait relie l'email à un nœud "DÉCLENCHEUR".

```
[ Email ] ──────→ [ DÉCLENCHEUR ]
```

```css
.auto-trigger {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 40px;
}

.auto-trigger-source {
  border: 1px solid var(--border-lt);
  border-radius: 8px;
  padding: 12px 20px;
  background: #fff;
  font-size: 14px;
  color: var(--t-light-1);
  white-space: nowrap;
}

.auto-trigger-line {
  flex: 1;
  height: 2px;
  background: linear-gradient(to right, var(--border-lt), var(--accent));
  position: relative;
  overflow: hidden;
}

/* Trait qui se dessine */
.auto-trigger-line::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--accent);
  transform: scaleX(0);
  transform-origin: left;
  animation: draw-line 600ms ease-out forwards;
}

.auto-trigger-node {
  border: 2px solid var(--accent);
  border-radius: 8px;
  padding: 12px 20px;
  color: var(--accent);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: rgba(53,155,217,.06);
}

@keyframes draw-line {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
```

**Motion :** Le trait se dessine de gauche à droite (600ms). Le nœud pulse une fois à l'accent.

---

## Slide AUTO — Analyse

**Intent :** L'IA ne fait pas qu'exécuter — elle comprend et classe.

**Visuel CSS :**
Arbre de décision rayonnant depuis le nœud IA central.

```
         [ URGENCE ]
            ↑
[ Email ] → [ IA ] → [ FACTURATION ]
            ↓
         [ SUIVI ]
            ↓
         [ ARCHIVE ]
```

```css
.auto-tree {
  position: relative;
  padding: 40px;
  font-size: 13px;
}

.auto-tree-center {
  border: 2px solid var(--accent);
  background: rgba(53,155,217,.08);
  color: var(--accent);
  border-radius: 8px;
  padding: 10px 18px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.auto-tree-branch {
  border: 1px solid var(--border-lt);
  border-radius: 6px;
  padding: 8px 14px;
  color: var(--t-light-2);
  background: #fff;
  opacity: 0;
  animation: branch-appear 300ms ease-out forwards;
}

/* La branche active reçoit la couleur accent */
.auto-tree-branch--active {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(53,155,217,.06);
}

.auto-tree-branch:nth-child(1) { animation-delay: 0ms; }
.auto-tree-branch:nth-child(2) { animation-delay: 200ms; }
.auto-tree-branch:nth-child(3) { animation-delay: 400ms; }
.auto-tree-branch:nth-child(4) { animation-delay: 600ms; }

@keyframes branch-appear {
  from { opacity: 0; transform: scale(0.9); }
  to   { opacity: 1; transform: scale(1); }
}
```

**Motion :** Branches se dessinent en séquence. La branche active pulse en accent. Les autres restent neutres.

---

## Slide AUTO — Actions

**Intent :** Prouver l'intégration avec des outils réels — pas des icônes génériques.

**Visuel CSS + Real Assets :**
3 cartes outils côte à côte avec les vraies icônes disponibles dans `/public/automatisations/`.

```css
.auto-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.auto-action-card {
  background: #ffffff;
  border: 1px solid var(--border-lt);
  border-radius: var(--r-card);
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  min-width: 180px;
  opacity: 0;
  animation: card-appear 300ms ease-out forwards;
}

.auto-action-card:nth-child(1) { animation-delay: 0ms; }
.auto-action-card:nth-child(2) { animation-delay: 300ms; }
.auto-action-card:nth-child(3) { animation-delay: 600ms; }

.auto-action-icon {
  width: 32px; height: 32px;
  object-fit: contain;
}

.auto-action-label {
  font-size: 13px;
  color: var(--t-light-2);
  line-height: 1.4;
}

/* Check de confirmation */
.auto-action-check {
  margin-top: auto;
  font-size: 12px;
  color: #059669;   /* vert sobre */
  display: flex;
  align-items: center;
  gap: 5px;
  opacity: 0;
  animation: check-appear 200ms ease-out forwards;
}

.auto-action-card:nth-child(1) .auto-action-check { animation-delay: 300ms; }
.auto-action-card:nth-child(2) .auto-action-check { animation-delay: 600ms; }
.auto-action-card:nth-child(3) .auto-action-check { animation-delay: 900ms; }

@keyframes card-appear  { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes check-appear { from { opacity: 0; } to   { opacity: 1; } }
```

**Assets réels disponibles :**
- `/public/automatisations/gmail.webp` — "Email de confirmation envoyé"
- `/public/automatisations/slack.webp` — "Notification équipe commerciale"
- Carte CRM en CSS pur (icône : rectangle stylisé)

**Motion :** Cards apparaissent en stagger 300ms. Les checks apparaissent séquentiellement à 0.3s, 0.6s, 0.9s.

---

## Slide AUTO — Résultat

**Intent :** Le contraste entre avant et après — immédiat et chiffré.

**Visuel CSS :**
Deux colonnes — AVANT grisé / APRÈS net.

```
AVANT                        APRÈS
─────                        ─────
Ouvrir l'email        4 min  Le système
Lire et trier         5 min  a tout fait.
Saisir dans le CRM    8 min
Envoyer confirmation  3 min
─────
Total : 20 min               Total : 3 sec
```

```css
.auto-compare {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 0 32px;
  align-items: start;
}

.auto-compare-before {
  opacity: 0.45;
}

.auto-compare-divider {
  width: 1px;
  background: var(--border-lt);
  align-self: stretch;
}

.auto-compare-after {
  /* net et sobre */
}

.auto-compare-header {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--t-light-3);
  margin-bottom: 16px;
}

.auto-compare-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--t-light-2);
  padding: 6px 0;
}

.auto-compare-row .duration {
  color: var(--t-light-3);
  font-size: 13px;
}

.auto-compare-total {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-lt);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 22px;
  color: var(--t-light-1);
}

.auto-compare-total--after {
  color: var(--accent);
}
```

**Motion :** La colonne AVANT apparaît en premier (grisée, delay 0ms). La colonne APRÈS arrive en second (delay 400ms). Le `3 sec` compte à rebours.

---

## Prompt Midjourney — Fallback uniquement

À n'utiliser que si une image est demandée pour une communication externe (réseaux, présentation).

**Fallback workflow diagram :**
```
clean white background workflow diagram, 5 pill-shaped nodes connected by thin lines,
"EMAIL" → "DÉCLENCHEUR" → "IA" → "ACTIONS" → "CONFIRMÉ",
center node "IA" highlighted in tech blue #359BD9 with subtle glow,
other nodes: light gray #F2F4F6 fill, dark gray border,
thin directional arrows, 8px border radius,
IBM Plex Sans labels, minimal Figma-style, flat,
no decorations, no shadows except on highlighted node --ar 16:9 --style raw --v 6.1
```

**Fallback résultats comparatifs :**
```
split composition white background, left side: gray email icons with clock badges,
right side: green check marks with timestamps, clean minimal layout,
no people, no hands, pure UI icon aesthetic,
light gray palette left, tech blue #359BD9 accent right,
editorial tech brand --ar 16:9 --style raw --v 6.1
```

---

## Notes de production

- Section light (#ffffff) — contraste avec les sections dark adjacentes (IA, Web & SaaS)
- Les vraies icônes outils dans la slide Actions sont prioritaires sur toute génération
- Les transitions de slide sont cross-fade 300ms — pas de slide latéral
- Sur mobile : swipe horizontal, une slide à la fois, dots cliquables en bas
