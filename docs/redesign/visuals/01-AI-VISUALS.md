# INTELLIGENCE ARTIFICIELLE — Briefs visuels
## CA-TECH V2 — Section IA
**Date :** 28 septembre 2026
**Référence :** `09-VISUAL-STORYBOARD.md` — section Intelligence Artificielle

---

## Décision : CSS ou image ?

**CSS exclusif.** Toutes les slides de cette section sont des interfaces typographiques.
L'interface est la preuve — aucune illustration ne peut mieux convaincre qu'une démonstration réelle.

Aucune image Midjourney n'est requise pour cette section. Les prompts ci-dessous sont des alternatives de dernier recours uniquement.

---

## Contraintes visuelles absolues (rappel DESIGN.md)

```
INTERDIT dans cette section :
- Robots, bras mécaniques, cerveaux stylisés
- Orbes violets, particules flottantes
- Glassmorphism, bento grids
- Graphiques décoratifs sans données réelles
- Toute illustration "IA générique"

REQUIS :
- L'interface elle-même est la preuve
- Fond #05101E sur toutes les slides
- Accent #359BD9 uniquement sur les moments d'intention
- Typographie IBM Plex Sans + monospace pour les logs
```

---

## Surface et structure

**Fond :** `#05101E` Deep Navy
**Split :** 40% texte (gauche) / 60% visuel (droite)
**Indicateur de progression :** Dots (5px) — actif = accent pill 16px, inactifs = accent 30%. Pas de numéros, pas de barre.
**Transitions :** fade out translateY(-12px) → fade in translateY(12px)

---

## Slide IA — Problème

**Intent :** Rendre visible la douleur quotidienne du dirigeant avant toute solution.

**Visuel CSS :**
Tableau éditorial sur fond `#102740` — liste de tâches avec horodatages.
```
Vérifier les devis en attente           9:05
Relancer le client Martin               9:22
Mettre à jour le CRM                    9:48
Envoyer le rapport hebdomadaire        10:14
```

**Spécifications CSS :**
```css
.ia-task-list {
  background: var(--canvas-1);   /* #102740 */
  border: 1px solid var(--border-dk);
  border-radius: var(--r-card);
  padding: 32px 40px;
  font-family: var(--font-body);
}

.ia-task-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  color: var(--t-dark-2);   /* silver */
  font-size: 15px;
}

.ia-task-row .timestamp {
  color: var(--t-dark-3);   /* tertaire */
  font-variant-numeric: tabular-nums;
}
```

**Motion :** Les lignes apparaissent en fade stagger 120ms. L'ensemble exprime l'accumulation.

---

## Slide IA — Compréhension

**Intent :** Montrer le moment exact où l'utilisateur interagit — avant la réponse.

**Visuel CSS :**
Interface chat minimaliste — une seule bulle utilisateur, typing en cours.

```
"Combien de devis sont en attente de signature ?"
```

Bulle droite (utilisateur) avec fond accent très atténué. Trois points animés à gauche (Loïc qui réfléchit).

**Spécifications CSS :**
```css
.ia-chat-bubble--user {
  align-self: flex-end;
  background: var(--accent-dim);   /* rgba(53,155,217,.15) */
  border: 1px solid var(--accent-border);
  border-radius: 16px 16px 4px 16px;
  padding: 12px 18px;
  color: var(--t-dark-1);
  max-width: 420px;
}

.ia-typing-dots {
  display: flex;
  gap: 5px;
  padding: 14px 18px;
}

.ia-typing-dots span {
  width: 6px; height: 6px;
  background: var(--t-dark-3);
  border-radius: 50%;
  animation: typing-pulse 1.2s ease-in-out infinite;
}

.ia-typing-dots span:nth-child(2) { animation-delay: 160ms; }
.ia-typing-dots span:nth-child(3) { animation-delay: 320ms; }

@keyframes typing-pulse {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.9); }
  40%           { opacity: 1;   transform: scale(1);   }
}
```

**Motion :** Typing animation sur la question (25ms/caractère). Pause 600ms. Trois points s'activent.

---

## Slide IA — Intelligence

**Intent :** Montrer que Loïc interroge des systèmes réels — pas une base de connaissances générique.

**Visuel CSS :**
Panneau de requêtes actives — style terminal épuré.

```
→ CRM.getDevis({ status: "pending" })
→ Calendar.getEvents({ this_week: true })
→ Slack.getMessages({ channel: "commercial" })
```

**Spécifications CSS :**
```css
.ia-terminal {
  background: var(--canvas-1);
  border: 1px solid var(--border-dk);
  border-radius: var(--r-card);
  padding: 24px 32px;
  font-family: 'IBM Plex Mono', 'Courier New', monospace;
  font-size: 14px;
}

.ia-terminal-line {
  display: flex;
  gap: 12px;
  padding: 6px 0;
  color: var(--t-dark-2);
  opacity: 0;
  animation: line-appear 300ms ease-out forwards;
}

.ia-terminal-line .fn-name { color: var(--t-dark-2); }
.ia-terminal-line .fn-params { color: var(--accent); }

.ia-terminal-line:nth-child(1) { animation-delay: 0ms; }
.ia-terminal-line:nth-child(2) { animation-delay: 120ms; }
.ia-terminal-line:nth-child(3) { animation-delay: 240ms; }

@keyframes line-appear {
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
}
```

**Motion :** Lignes apparaissent en stagger 120ms. Les paramètres en accent pulsent légèrement.

---

## Slide IA — Action

**Intent :** La réponse de Loïc — structurée, actionnables, pas verbeux.

**Visuel CSS :**
Bulle de réponse de Loïc avec données réelles et proposition d'action.

```
Vous avez 8 devis en attente — 16 800 € au total.
Les 3 les plus anciens : Dupont SAS, Martin & Fils, TechRenov.

→ Envoyer les rappels ?
```

**Spécifications CSS :**
```css
.ia-chat-bubble--agent {
  align-self: flex-start;
  background: var(--canvas-1);
  border: 1px solid var(--border-dk);
  border-radius: 16px 16px 16px 4px;
  padding: 20px 24px;
  max-width: 480px;
}

.ia-agent-text { color: var(--t-dark-1); font-size: 15px; line-height: 1.6; }

.ia-agent-highlight {
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}

.ia-action-prompt {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-dk);
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--t-dark-2);
  font-size: 14px;
}

.ia-action-cta {
  border: 1px solid var(--accent-border);
  border-radius: 20px;
  padding: 6px 16px;
  color: var(--accent);
  font-size: 13px;
  cursor: pointer;
}
```

**Motion :** Fade in depuis le bas. Les valeurs numériques s'illuminent en accent avec 80ms de délai après le texte.

---

## Slide IA — Résultat

**Intent :** Le contraste final — ce qui prenait 2 heures est maintenant fait.

**Visuel CSS :**
Tableau de résultats — même structure que la slide Problème, mais barré et remplacé par des confirmations.

```
✓ 8 devis identifiés automatiquement        0.4s
✓ 3 relances envoyées par email              0.8s
✓ CRM mis à jour                             1.1s
✓ Rapport Slack envoyé à l'équipe            1.4s
```

Sous le tableau : `2h → 4s` — IBM Plex Sans Condensed, très grand.

**Spécifications CSS :**
```css
.ia-result-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.ia-result-check {
  color: var(--accent);
  margin-right: 10px;
}

.ia-result-label { color: var(--t-dark-1); font-size: 15px; }
.ia-result-time  { color: var(--t-dark-3); font-variant-numeric: tabular-nums; font-size: 13px; }

.ia-result-ratio {
  margin-top: 32px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(32px, 4vw, 48px);
  color: var(--t-dark-1);
  letter-spacing: -0.02em;
  line-height: 1;
}

.ia-result-ratio em {
  color: var(--accent);
  font-style: normal;
}
```

**Motion :** Lignes apparaissent en stagger. Le ratio `2h → 4s` compte à rebours (count-up CSS ou JS).

---

## Prompt Midjourney — Fallback uniquement

À n'utiliser que si la version CSS est jugée insuffisante pour une raison technique.

**Fallback slide Intelligence (logs terminal) :**
```
dark terminal interface screenshot, deep navy #05101E background,
monospace font list of 3 API function calls with parameter values,
function names in light silver, parameter values in tech blue #359BD9,
clean code log aesthetic, no syntax highlighting,
no side panels, no file tree, just the log lines,
premium dark developer tool, Vercel/Linear style --ar 4:3 --style raw --v 6.1
```

**Fallback slide Action (réponse agent) :**
```
dark minimal chat response card, deep navy background,
single AI message bubble left-aligned,
white body text with one tech blue highlighted number,
thin border rgba(255,255,255,0.08), 16px border radius,
action prompt at bottom with ghost pill button,
no avatars, no profile icons, pure text UI --ar 4:3 --style raw --v 6.1
```

---

## Notes de production

- Le fond `#05101E` est constant sur toutes les 5 slides
- La barre de progression (2px, accent) remplace tout numérotage de slide
- Les interfaces CSS sont plus convaincantes que les images pour prouver la capacité technique
- IBM Plex Mono recommandé pour les logs de terminal (si non chargé : `'Courier New', monospace`)
- Jamais d'animation loop infinie sauf le typing indicator — tout le reste est one-shot au scroll
