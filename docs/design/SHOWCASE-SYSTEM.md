# CA-TECH — Showcase & Slide System
> Système propriétaire de présentation visuelle — spécification complète

**Version :** 1.0  
**Dépendances :** DESIGN.md v1.0 · INFORMATION-ARCHITECTURE.md v1.0  
**Statut :** Source de vérité pour l'implémentation des composants showcase

---

## Table des matières

1. [Philosophie du système](#1-philosophie-du-système)
2. [Architecture commune](#2-architecture-commune)
3. [Navigation & Pagination](#3-navigation--pagination)
4. [AI Showcase](#4-ai-showcase)
5. [Automation Showcase](#5-automation-showcase)
6. [LLM Showcase](#6-llm-showcase)
7. [MCP Showcase](#7-mcp-showcase)
8. [Workflow Showcase](#8-workflow-showcase)
9. [SaaS Showcase](#9-saas-showcase)
10. [Infrastructure Showcase](#10-infrastructure-showcase)
11. [Case Study Showcase](#11-case-study-showcase)
12. [Accessibilité](#12-accessibilité)
13. [Responsive](#13-responsive)
14. [Fallbacks & Dégradation gracieuse](#14-fallbacks--dégradation-gracieuse)
15. [Architecture de réutilisation](#15-architecture-de-réutilisation)

---

## 1. Philosophie du système

Le Showcase System de CA-TECH repose sur un principe unique :

> **Chaque showcase est une démonstration, pas une présentation.**

Le visiteur ne lit pas des arguments — il observe des systèmes fonctionner. Chaque showcase doit donner l'impression de regarder par une fenêtre sur un vrai système numérique en activité.

**Trois registres visuels :**

| Registre | Description | Usage |
|----------|-------------|-------|
| **Opérationnel** | Interface en fonctionnement réel (Loïc, Manager, workflow) | AI, Automation, MCP |
| **Architectural** | Schéma de système, diagramme de connexions | LLM, Infrastructure, MCP |
| **Résultat** | Avant/après, métriques, livrables | Case Study, SaaS, Workflow |

**Règles de composition invariantes :**

- Chaque slide a **une idée principale** — pas deux
- Le visuel occupe **minimum 60%** de l'espace dans chaque slide
- Le texte est **court et accrocheur** — headline + description max 2 lignes
- La progression entre slides suit une **logique narrative** (problème → solution → résultat)
- Jamais de pagination qui interrompt la lecture

---

## 2. Architecture commune

### Structure HTML de référence

```
<section class="showcase" data-showcase="[type]" aria-label="[nom descriptif]" aria-roledescription="carousel">
  <div class="showcase__track" role="group">
    <div class="showcase__slide" role="group" aria-roledescription="slide" aria-label="Slide N sur M">
      <div class="showcase__visual">     <!-- Zone visuelle principale -->
      </div>
      <div class="showcase__content">   <!-- Texte, CTA -->
        <span class="showcase__label">  <!-- Overline / catégorie -->
        <h3 class="showcase__title">
        <p class="showcase__desc">
        <a class="showcase__cta">
      </div>
    </div>
  </div>
  <div class="showcase__nav" aria-label="Navigation carousel">
    <button class="showcase__arrow --prev" aria-label="Slide précédent">
    <div class="showcase__dots" role="tablist">
    <button class="showcase__arrow --next" aria-label="Slide suivant">
  </div>
</section>
```

### Tokens de dimension

```css
/* Showcase pleine largeur */
--showcase-full-width: 100%;
--showcase-full-max: 1440px;
--showcase-full-height-desktop: 560px;
--showcase-full-height-tablet: 400px;
--showcase-full-height-mobile: auto;

/* Showcase intégré (dans section) */
--showcase-inline-width: 100%;
--showcase-inline-max: 960px;
--showcase-inline-height-desktop: 480px;
--showcase-inline-height-tablet: 360px;
--showcase-inline-height-mobile: auto;

/* Showcase mini (carousel) */
--showcase-mini-width: 380px;
--showcase-mini-height: 260px;
```

### Tokens de surface

```css
/* Fond du showcase */
--showcase-bg: var(--color-navy);             /* #102740 */
--showcase-bg-alt: var(--color-tech-blue);    /* #1A4066 */
--showcase-bg-dark: var(--color-deep-navy);   /* #05101E */

/* Frame / fenêtre */
--showcase-frame-radius: var(--radius-xl);    /* 24px */
--showcase-frame-border: var(--border-subtle);
--showcase-frame-shadow: 0 32px 80px rgba(0,0,0,0.45), 0 0 60px rgba(53,155,217,0.10);

/* Glow accent optionnel */
--showcase-glow: radial-gradient(ellipse at 50% 100%, rgba(53,155,217,0.15), transparent 65%);
```

---

## 3. Navigation & Pagination

### Dots de pagination — Spécification complète

```css
.showcase__dots {
  display: flex;
  align-items: center;
  gap: 6px;
}

.showcase__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(165, 172, 181, 0.25);
  border: none;
  cursor: pointer;
  transition: width 0.35s cubic-bezier(0.32, 0, 0.16, 1),
              border-radius 0.35s ease,
              background 0.35s ease;
  /* Zone de clic élargie */
  padding: 0;
  position: relative;
}
.showcase__dot::after {
  content: '';
  position: absolute;
  inset: -8px;
}

.showcase__dot[aria-selected="true"],
.showcase__dot--active {
  width: 28px;
  border-radius: 3px;
  background: var(--color-accent);  /* #359BD9 */
}

.showcase__dot:hover:not([aria-selected="true"]) {
  background: rgba(165, 172, 181, 0.50);
}
```

### Flèches de navigation

```css
.showcase__arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(16, 39, 64, 0.80);
  border: 1px solid rgba(165, 172, 181, 0.18);
  color: var(--color-cool-white);
  cursor: pointer;
  transition: background 0.2s ease,
              border-color 0.2s ease,
              transform 0.15s ease;
  flex-shrink: 0;
}

.showcase__arrow:hover {
  background: rgba(53, 155, 217, 0.20);
  border-color: rgba(53, 155, 217, 0.40);
}

.showcase__arrow:active {
  transform: scale(0.92);
}

.showcase__arrow:disabled {
  opacity: 0.30;
  cursor: not-allowed;
  pointer-events: none;
}
```

### Patterns de navigation

| Pattern | Usage | Description |
|---------|-------|-------------|
| **Dots centré** | Showcases inline | Dots + flèches sous le carousel |
| **Flèches overlay** | Showcases pleine largeur | Flèches positionnées sur les côtés du visuel |
| **Fraction** | Case Study | "02 / 06" en mono — plus editorial |
| **Progress bar** | Storytelling linéaire | Barre horizontale en haut du showcase |
| **Keyboard only** | Pas de nav visible | Clavier uniquement (section non-interactive) |

### Navigation clavier

```
ArrowRight / ArrowLeft   → slide suivant / précédent
Home / End               → premier / dernier slide
Tab                      → focus sur les dots/flèches
Enter / Space sur dot    → aller à ce slide
Escape                   → sortir du focus carousel
```

### Autoplay

- **Désactivé par défaut** sur tous les showcases
- Si activé : `interval: 5000ms`, pause obligatoire au hover et au focus
- Bouton pause/play visible si autoplay actif
- Toujours arrêté si `prefers-reduced-motion` est actif

---

## 4. AI Showcase

**Contexte d'utilisation :** Section 04 de la homepage — démontre les capacités IA de CA-TECH via Loïc et les agents

**Concept :** Une fenêtre sur un agent IA en fonctionnement réel. Le visiteur regarde Loïc travailler.

---

### Composition générale

- **Layout :** Sticky panel (texte gauche, showcase droit)
- **Dimensions :** height `560px` desktop, full-width visual
- **Frame :** Browser chrome simulé + conversation en cours
- **Nombre de slides :** 5
- **Fond showcase :** `--color-deep-navy` avec glow accent subtil en haut

---

### Slide 01 — "Le premier consultant IA"

**Concept :** Présentation de Loïc — qui il est, ce qu'il fait.

**Visuel :**
- Interface chat de Loïc en plein écran
- Une conversation courte et convaincante pré-définie :
  ```
  Loïc : Bonjour ! Je suis Loïc, consultant IA CA-TECH.
          Dites-moi : quel est votre principal défi
          opérationnel en ce moment ?
  ```
- Curseur clignotant dans le champ de saisie
- Avatar Loïc visible dans l'interface
- Fond sombre de l'interface `#05101E`, bulles de chat `#102740`

**Texte overlay (badge flottant sur le visuel) :**
```
[BADGE]
"Disponible 24h/24"
```

**Label slide :** `01 — AGENT CONVERSATIONNEL`  
**Titre :** "Loïc. Votre premier consultant IA."  
**Description :** "Il qualifie, diagnostique, et prépare votre proposition en moins de 15 minutes."

**Animation :**
- Entrée : interface chat fade-in + scale `0.97 → 1.00`
- Texte de Loïc : typing animation (lettre par lettre, `30ms` par caractère)
- Curseur : `opacity: 1 → 0` blink `1s` infini

**Interaction :**
- CTA : "Parler à Loïc maintenant" → ouvre widget
- Badge hover : légère élévation

---

### Slide 02 — "Diagnostic IA automatique"

**Concept :** Montrer le questionnaire de diagnostic IA que Loïc administre.

**Visuel :**
- Interface de diagnostic : barre de progression (40%), question en cours
- Formulaire d'analyse : secteur d'activité · taille d'équipe · défis prioritaires
- Panneau latéral : "Opportunités détectées : 3" (compteur partiel)
- Style dashboard sombre avec données structurées

**Label :** `02 — DIAGNOSTIC IA`  
**Titre :** "10 questions. Un rapport actionnable."  
**Description :** "Loïc cartographie vos opportunités IA et automatisation. Gratuit. En 10 minutes."

**Animation :**
- Barre de progression avance de 0% à 40% en `1.5s` au slide enter
- Les "opportunités détectées" comptent de 0 à 3 (`count-up`)
- Scroll léger dans les questions (suggestion de profondeur)

---

### Slide 03 — "Rapport personnalisé"

**Concept :** Le livrable que le visiteur reçoit après le diagnostic.

**Visuel :**
- Mock-up d'un rapport PDF CA-TECH (style doc premium)
- Titre : "Rapport Diagnostic IA — [Nom Entreprise]"
- 3 sections visibles : Opportunités prioritaires · ROI estimé · Plan d'action
- Métriques fictives mais réalistes : "8h économisées/semaine estimées"
- Badge de livraison : "Envoyé par email en 30 secondes"

**Label :** `03 — RAPPORT AUTOMATIQUE`  
**Titre :** "Votre rapport IA. Généré, personnalisé, livré."  
**Description :** "À l'issue du diagnostic, un rapport complet est généré et envoyé par email — sans attente."

**Animation :**
- Rapport glisse depuis le haut (`y: -20 → 0`) avec légère rotation `(-2deg → 0deg)`
- Sections du rapport apparaissent staggerées
- Badge "envoyé" pulse une fois à l'entrée

---

### Slide 04 — "Agents métier sur-mesure"

**Concept :** Au-delà de Loïc — les autres agents possibles.

**Visuel :**
- Grille de 4 cartes agents (style app launcher) :
  ```
  [🤝 Agent Commercial]   [👥 Agent RH]
  [📊 Agent Comptable]    [🔧 Agent SAV]
  ```
- Chaque carte : icône + nom + état `ACTIF` / `BIENTÔT`
- Style sombre, icônes en accent color

**Label :** `04 — AGENTS MÉTIER`  
**Titre :** "Un agent pour chaque département."  
**Description :** "Commercial, RH, comptable, SAV — chaque agent est entraîné sur votre métier."

**Animation :**
- Cartes entrent en stagger `2×2` (ligne 1 puis ligne 2)
- Cards `ACTIF` ont un indicateur vert pulsant (dot)
- Cards `BIENTÔT` sont légèrement désaturées

---

### Slide 05 — "Résultats mesurables"

**Concept :** Conclure avec l'impact business.

**Visuel :**
- Dashboard de métriques business :
  ```
  [+240%]  Leads qualifiés     [−68%]  Temps de qualification
  [24/7]   Disponibilité       [< 30s] Génération devis
  ```
- Graphe de progression (ligne montante simple, accent color)
- Style analytique premium

**Label :** `05 — IMPACT BUSINESS`  
**Titre :** "Des résultats. Pas des promesses."  
**Description :** "Chaque agent IA est livré avec un dashboard de suivi et des KPI mesurables dès la semaine 1."

**Animation :**
- Compteurs animés au slide enter
- Ligne du graphe se trace progressivement (`stroke-dashoffset`)
- Chiffres : count-up `1.2s`

---

### Navigation AI Showcase

- **Pattern :** Flèches overlay (gauche/droite du panel visuel) + dots en bas
- **Position flèches :** Centrées verticalement sur le panel, `left: 16px` / `right: 16px`
- **Autoplay :** Désactivé
- **Swipe :** Actif sur mobile/tablet

---

## 5. Automation Showcase

**Contexte :** Section 05 homepage — démonstration de workflows d'automatisation

**Concept :** Visualiser un workflow réel en mouvement. Chaque nœud s'illumine quand il s'exécute.

---

### Composition générale

- **Layout :** Full-width visual (pleine largeur section)
- **Dimensions :** height `520px` desktop, `400px` tablet
- **Frame :** Pas de frame navigateur — le diagramme pose directement sur le fond
- **Nombre de slides :** 4 (un workflow par slide)
- **Fond showcase :** `--surface-panel` (#102740) + texture grid technique

---

### Structure d'un nœud workflow

```
Nœud = {
  icon: string (image webp OU icône Lucide),
  label: string,
  type: 'trigger' | 'action' | 'condition' | 'output',
  state: 'idle' | 'active' | 'complete' | 'error'
}

Connexion = {
  from: nodeId,
  to: nodeId,
  animated: boolean,
  label?: string
}
```

**Styles de nœuds :**

```css
/* Nœud standard */
.wf-node {
  padding: 10px 16px;
  border-radius: var(--radius-md);    /* 10px */
  background: rgba(5, 16, 30, 0.80);
  border: 1px solid rgba(165, 172, 181, 0.20);
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
}

/* Nœud trigger (déclencheur) */
.wf-node--trigger {
  border-color: rgba(53, 155, 217, 0.50);
  background: rgba(53, 155, 217, 0.10);
}

/* Nœud actif (en cours d'exécution) */
.wf-node--active {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(53, 155, 217, 0.20);
}

/* Nœud complété */
.wf-node--complete {
  border-color: rgba(34, 197, 94, 0.50);  /* --color-success */
  background: rgba(34, 197, 94, 0.08);
}
```

**Connexions animées :**
```css
/* Particule de flux sur la connexion */
.wf-connection__particle {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-accent);
  position: absolute;
  /* Position animée via JS le long du path SVG */
  animation: flow-particle 1.5s linear infinite;
}

@keyframes flow-particle {
  0%   { offset-distance: 0%; opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { offset-distance: 100%; opacity: 0; }
}
```

---

### Slide 01 — "Lead → CRM automatique"

**Workflow :**
```
[Formulaire web]  →  [Qualification Loïc]  →  [CRM HubSpot]
                                          ↘  [Email confirmation]
                                          ↘  [Slack notification]
```

**Icônes :** formulaire (Lucide FileText), Loïc (avatar), HubSpot logo, Gmail, Slack  
**Résultat affiché :** "Temps de traitement : 0 secondes"

**Label :** `01 — CAPTURE & QUALIFICATION`  
**Titre :** "Un lead entre. Il est qualifié, enregistré, notifié."  
**Description :** "Le prospect remplit un formulaire → Loïc le qualifie → CRM mis à jour → équipe notifiée. Zéro intervention manuelle."

---

### Slide 02 — "Devis → Facturation automatique"

**Workflow :**
```
[Devis accepté]  →  [Acompte Stripe]  →  [Projet créé]
                →  [Contrat généré]   →  [Signature e]
                →  [Email client]     →  [Manager notifié]
```

**Résultat :** "Cycle devis → acompte : < 4 minutes"

**Label :** `02 — LEAD-TO-CASH`  
**Titre :** "Du devis à l'acompte. Automatiquement."  
**Description :** "Acceptation → contrat → signature → paiement → création projet. Votre pipeline se pilote seul."

---

### Slide 03 — "Reporting automatique"

**Workflow :**
```
[Sources données]  →  [Collecte nocturne]  →  [Rapport généré]
  Google Analytics      n8n cron                Email dirigeant
  Search Console        Supabase                Slack digest
  CRM                   Processing              Dashboard update
```

**Résultat :** "Rapport hebdomadaire livré chaque lundi 7h"

**Label :** `03 — REPORTING & MONITORING`  
**Titre :** "Vos KPIs vous arrivent. Vous ne les cherchez plus."  
**Description :** "Automatisation de collecte, traitement et livraison de vos rapports business — chaque semaine, sans intervention."

---

### Slide 04 — "Relance client intelligente"

**Workflow :**
```
[Devis envoyé]  →  [J+3 : pas de réponse]  →  [Relance email auto]
               →  [J+7 : pas de réponse]  →  [Relance SMS]
               →  [J+14 : deal perdu]     →  [Nurturing sequence]
               →  [Réponse reçue]         →  [Notification commerciale]
```

**Résultat :** "+40% de taux de conversion sur devis"

**Label :** `04 — NURTURING INTELLIGENT`  
**Titre :** "Vos prospects relancés au bon moment. Automatiquement."  
**Description :** "Séquences de relance intelligentes basées sur le comportement — jamais intrusif, toujours pertinent."

---

### Navigation Automation Showcase

- **Pattern :** Progress bar en haut + flèches basses + dots
- **La progress bar** se remplit pendant l'animation du workflow
- Position : `top: 0`, pleine largeur, height `2px`, couleur `--color-accent`

---

## 6. LLM Showcase

**Contexte :** Section 06 homepage — architecture LLM, compétence technique avancée

**Concept :** Visualiser comment un LLM est architecturé, entraîné et orchestré pour un usage spécifique. Registre **architectural**.

---

### Composition générale

- **Layout :** Centré, grande typographie, diagramme architectural
- **Dimensions :** height `600px` desktop
- **Frame :** Pas de frame navigateur — composition flottante
- **Nombre de slides :** 3 (progressif : du modèle → à l'agent → au résultat)
- **Fond :** Canvas (#05101E) + glow radial accent (unique à cette section)

---

### Slide 01 — "Le modèle de langage"

**Concept :** Qu'est-ce qu'un LLM — sans jargon, avec du visuel.

**Visuel :**
- Schéma architectural minimaliste :
  ```
  [ENTRÉE — Contexte utilisateur]
           ↓
  [LLM CORE — GPT-4 / Claude / Llama]
           ↓
  [SORTIE — Réponse structurée]
  ```
- Côté droit : "window context" visualisé comme une barre de progression
- Style : connexions en `--color-accent`, blocs en `--surface-panel`

**Grande typographie en overlay :**
```
"128 000"
tokens de contexte
```

**Label :** `01 — MODÈLE DE LANGAGE`  
**Titre :** "Comprendre, raisonner, générer."  
**Description :** "Un LLM traite votre contexte entier — documents, historique, instructions — et répond de façon précise et structurée."

---

### Slide 02 — "RAG — Mémoire longue terme"

**Concept :** Comment CA-TECH connecte un LLM à une base de connaissance propriétaire.

**Visuel :**
- Diagramme RAG :
  ```
  [Base de données vectorielle]
           ↓ (recherche sémantique)
  [Documents pertinents récupérés]
           ↓
  [LLM + contexte enrichi]
           ↓
  [Réponse basée sur VOS données]
  ```
- Barre de recherche animée en haut ("Quelle est notre politique de remboursement ?")
- Résultats vectoriels qui "tombent" dans le contexte

**Label :** `02 — RAG & MÉMOIRE`  
**Titre :** "Un LLM qui connaît votre entreprise par cœur."  
**Description :** "Retrieval-Augmented Generation : vos documents, procédures, et données alimentent le modèle — il répond comme votre meilleur expert."

---

### Slide 03 — "Fine-tuning & Évaluation"

**Concept :** L'étape de personnalisation et de mesure de qualité.

**Visuel :**
- Tableau de bord d'évaluation :
  ```
  Précision réponses :  94.2%  ████████████████░░  
  Hallucinations :       1.3%  █░░░░░░░░░░░░░░░░░  
  Latence moyenne :     380ms                      
  Tests passés :        847/900                    
  ```
- Badge "Production Ready" en vert

**Label :** `03 — FINE-TUNING & EVAL`  
**Titre :** "Mesuré. Certifié. En production."  
**Description :** "Nous ne livrons pas un modèle — nous livrons un système évalué, testé, et monitoré en production."

---

## 7. MCP Showcase

**Contexte :** Démonstration des protocoles MCP (Model Context Protocol) — public cible technique

**Concept :** Montrer comment un agent utilise des outils via MCP pour interagir avec des systèmes externes.

---

### Composition générale

- **Layout :** Split visuel (schéma gauche + log d'exécution droite)
- **Dimensions :** height `540px` desktop
- **Nombre de slides :** 4
- **Style :** Plus technique, terminal-like, mono dominant

---

### Slide 01 — "L'agent et ses outils"

**Concept :** Architecture MCP — l'agent peut utiliser des outils externes.

**Visuel gauche :** Schéma de connexions
```
[Agent IA (LLM)]
     ↓ MCP Protocol
  ├── [Tool: search_web]
  ├── [Tool: query_database]
  ├── [Tool: send_email]
  ├── [Tool: create_document]
  └── [Tool: call_api]
```

**Visuel droite :** Log d'exécution
```
> agent.think("Analyser les ventes du mois")
→ tool_call: query_database({table: "sales", month: "Sept"})
← result: {rows: 1247, total: 84500€}
→ tool_call: create_document({type: "report"})
← result: {doc_id: "rep_2024_09", url: "..."}
> agent.respond("Voici votre rapport de septembre...")
```

**Label :** `01 — ARCHITECTURE MCP`  
**Titre :** "Des agents qui agissent. Pas seulement qui répondent."  
**Description :** "Via le protocole MCP, nos agents accèdent à vos outils, bases de données, APIs — et les pilotent de façon autonome."

---

### Slide 02 — "Intégration système"

**Concept :** Connexion à l'écosystème existant de l'entreprise.

**Visuel :**
- Hub central "Agent CA-TECH" avec connexions MCP vers :
  ```
  CRM HubSpot · Notion · Google Workspace
  Slack · Stripe · PostgreSQL · REST API customs
  ```
- Chaque connexion : ligne animée + logo de l'outil
- Badge "Nouvelle connexion" apparaît sur une des lignes

**Label :** `02 — INTÉGRATIONS`  
**Titre :** "Branché sur vos outils. Opérationnel en heures."  
**Description :** "MCP permet à nos agents de se connecter à votre stack existant sans refonte — HubSpot, Notion, Google, Slack, et bien d'autres."

---

### Slide 03 — "Context Server"

**Concept :** Le serveur MCP qui expose les capacités de l'entreprise à l'agent.

**Visuel :**
- Architecture technique en deux colonnes :
  - Gauche : "Context Server CA-TECH" — liste des ressources exposées
  - Droite : "Agent" — liste des outils disponibles
- Effet de "handshake" entre les deux

**Label :** `03 — CONTEXT SERVER`  
**Titre :** "Votre entreprise, exposée intelligemment à l'IA."  
**Description :** "Le Context Server MCP définit ce que l'agent peut faire, voir, et modifier — avec des permissions granulaires par rôle."

---

### Slide 04 — "Multi-agents orchestrés"

**Concept :** Plusieurs agents qui collaborent.

**Visuel :**
- Diagramme d'orchestration :
  ```
  [Orchestrateur principal]
       ↓ délègue
  [Agent commercial]  [Agent support]  [Agent data]
       ↓ retour résultat
  [Rapport consolidé]
  ```

**Label :** `04 — MULTI-AGENTS`  
**Titre :** "Des équipes d'agents qui travaillent en parallèle."  
**Description :** "Un orchestrateur coordonne plusieurs agents spécialisés — pour des tâches complexes qui dépassent la capacité d'un agent seul."

---

## 8. Workflow Showcase

**Contexte :** Présentation standalone des capacités d'automatisation — version condensée pour pages service

**Concept :** Une bibliothèque de workflows types. Le visiteur navigue entre des exemples réels.

---

### Composition générale

- **Layout :** Horizontal carousel avec peek
- **Dimensions :** height `360px`, width `100%`
- **Nombre de slides :** 6 (un workflow par cas d'usage)
- **Fond :** `--surface-panel` (#102740)

---

### Les 6 workflows

**Slide 01 — Qualification automatique**
```
[Formulaire] → [Score IA] → [CRM] → [Slack alert]
```
Métrique : "Qualification en 30 secondes vs 15 min manuelles"

**Slide 02 — Devis → Paiement**
```
[Demande] → [Loïc] → [Devis PDF] → [Stripe] → [Contrat]
```
Métrique : "Cycle de vente raccourci de 3 jours"

**Slide 03 — Onboarding client**
```
[Signature] → [Drive folder] → [Email sequence] → [Slack channel] → [CRM update]
```
Métrique : "0 minute d'intervention manuelle"

**Slide 04 — Reporting hebdo**
```
[Cron lundi 7h] → [Pull données] → [IA analyse] → [Email rapport] → [Slack digest]
```
Métrique : "2h de reporting récupérées chaque semaine"

**Slide 05 — SAV automatisé**
```
[Email client] → [IA catégorise] → [FAQ match] → [Réponse auto] → [Escalade si besoin]
```
Métrique : "80% des demandes résolues sans humain"

**Slide 06 — Veille concurrentielle**
```
[Scraping nocturne] → [IA synthèse] → [Alerte changements] → [Dashboard update]
```
Métrique : "Veille quotidienne sur 20 sources en 0 effort"

---

### Navigation Workflow

- **Pattern :** Flèches latérales + dots + drag horizontal
- **Peek :** 15% du slide suivant visible
- **Mobile :** swipe full, 1 slide à la fois

---

## 9. SaaS Showcase

**Contexte :** Présentation des interfaces produit livrées par CA-TECH — pages Réalisations et /services/developpement

**Concept :** Mettre en valeur les interfaces produit avec profondeur et qualité. Registre **résultat**.

---

### Composition générale

- **Layout :** Showcase large avec frame navigateur + annotations
- **Dimensions :** height `520px` desktop
- **Nombre de slides :** 4 (un projet par slide)
- **Frame :** Browser chrome complet (barre d'adresse factice, dots)

---

### Structure d'une slide SaaS

```
╔══════════════════════════════════════════╗
║ ● ● ●  app.ca-tech.fr/manager            ║   ← Browser bar
╠══════════════════════════════════════════╣
║                                          ║
║         [SCREENSHOT INTERFACE]           ║
║                                          ║
╚══════════════════════════════════════════╝
   ↑                   ↑
[annotation]        [annotation]
```

**Annotations :** Petits labels flottants qui pointent vers des features dans le screenshot (`border-radius: --radius-sm`, fond accent, texte blanc, flèche).

### Les 4 slides SaaS

**Slide 01 — CA-TECH Manager**
- Screenshot : `portfolio/ca-tech-manager/dashboard.webp`
- Annotations : "Suivi devis en temps réel" · "Kanban leads" · "Facturation auto"
- Stack : `[React 19]  [Supabase]  [Stripe]  [Vercel]`
- Métrique : "100% des missions CA-TECH pilotées ici"

**Slide 02 — CV Magic**
- Screenshot : `portfolio/cv-magic/home.webp`
- Annotations : "Génération IA" · "Templates premium" · "Export PDF"
- Stack : `[Next.js]  [OpenAI]  [Stripe]`
- Métrique : "CV généré en 3 minutes"

**Slide 03 — Pasmal**
- Screenshot : `portfolio/pasmal/dashboard.webp`
- Annotations : selon le contexte du projet
- Stack : labels techniques

**Slide 04 — Pemous Money**
- Screenshot : `portfolio/pemous-money/home.webp`
- Annotations : selon le contexte
- Stack : labels techniques

---

### Navigation SaaS

- **Pattern :** Dots + numérotation fraction (`01 / 04`)
- **Transition :** Crossfade (pas de glissement) — les screenshots semblent être des "fenêtres" différentes

---

## 10. Infrastructure Showcase

**Contexte :** Section 08 homepage — légitimité infrastructure, cloud, data, sécurité

**Concept :** Architecture système visualisée — comme un vrai schéma d'infrastructure.

---

### Composition générale

- **Layout :** Schéma SVG pleine largeur + légende
- **Dimensions :** height `480px` desktop
- **Nombre de slides :** 3
- **Fond :** Canvas (#05101E) avec texture grid technique

---

### Slide 01 — "Stack application"

**Visuel :** Schéma horizontal en couches

```
COUCHE FRONTEND
├── React / Next.js  ──  Vercel Edge Network
│
COUCHE BACKEND
├── Node.js APIs  ──  Supabase
│                 ──  PostgreSQL
│
COUCHE DATA
├── Supabase Storage  ──  CDN
│
COUCHE IA
└── OpenAI API  ──  Anthropic  ──  Embeddings
```

**Label :** `01 — STACK APPLICATIF`  
**Titre :** "Du frontend à la base de données. Une architecture cohérente."

---

### Slide 02 — "Cloud & Monitoring"

**Visuel :** Dashboard monitoring stylisé
```
UPTIME        LATENCE       ERREURS       DÉPLOIEMENTS
99.9%         < 80ms        0.02%         3/jour
[████████░]   [██████░░░]   [█░░░░░░░░]   [██████████]
```

**Label :** `02 — PERFORMANCE & MONITORING`  
**Titre :** "Systèmes monitorés. Performances garanties."

---

### Slide 03 — "Sécurité & Conformité"

**Visuel :** Checklist sécurité animée

```
✅ HTTPS / TLS 1.3
✅ Auth JWT + RLS Supabase
✅ Rate limiting APIs
✅ RGPD — données en France (Supabase EU)
✅ Headers sécurité (CSP, HSTS)
✅ Logs et audit trail
```

**Label :** `03 — SÉCURITÉ`  
**Titre :** "Sécurisé par conception. Conforme par défaut."

---

## 11. Case Study Showcase

**Contexte :** Pages `/projets/[slug]` — présentation approfondie d'un cas client

**Concept :** Raconter une histoire business complète. Problème → Solution → Résultats.

---

### Composition générale

- **Layout :** Fullscreen narrative (chaque slide = un chapitre)
- **Dimensions :** height `100vh` ou `min-height: 600px` desktop
- **Nombre de slides :** 5-6 selon le cas
- **Navigation :** Verticale (scroll-driven) OU horizontale (choix par projet)
- **Fond :** Alternance Canvas / Panel selon slide

---

### Structure type d'un Case Study (6 slides)

**Slide 00 — Cover**
- Image hero du projet (pleine largeur, `object-fit: cover`)
- Overlay gradient bas
- Titre, client, type de mission
- Durée et date

**Slide 01 — Le défi**
- Headline : "Le problème"
- Description du contexte en 3 bullet points
- Citation du client (si disponible)
- Fond : Panel

**Slide 02 — Notre approche**
- Timeline de la mission (3-4 étapes)
- Stack technique utilisé (tags mono)
- Fond : Canvas

**Slide 03 — La solution**
- Screenshots de la solution livrée (carousel interne ou grille)
- Descriptions des fonctionnalités clés
- Fond : Panel

**Slide 04 — Les résultats**
- Métriques business en grand (4-6 chiffres)
- Graphiques si disponibles
- Citation client nominative
- Fond : Canvas avec glow accent

**Slide 05 — La suite**
- Ce qui a été livré ensuite
- Lien vers autres projets similaires
- CTA "Un projet similaire ?"

---

### Navigation Case Study

- **Pattern :** Numérotation fraction `01 / 06` + flèches + indicateur texte du chapitre
- **Progress bar :** En haut, pleine largeur

---

## 12. Accessibilité

### Gestion du focus dans les carousels

```typescript
// À chaque changement de slide :
// 1. Mettre à jour aria-label des dots
// 2. Déplacer le focus vers le slide actif si l'utilisateur navigue au clavier
// 3. Annoncer le changement via aria-live

const announceSlide = (current: number, total: number, title: string) => {
  const liveRegion = document.getElementById('carousel-live')
  if (liveRegion) {
    liveRegion.textContent = `Slide ${current} sur ${total} : ${title}`
  }
}

// Région aria-live cachée dans le DOM
// <div id="carousel-live" aria-live="polite" aria-atomic="true" class="sr-only"></div>
```

### Navigation clavier — implémentation

```typescript
const handleKeyDown = (e: KeyboardEvent) => {
  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      e.preventDefault()
      goToNext()
      break
    case 'ArrowLeft':
    case 'ArrowUp':
      e.preventDefault()
      goToPrev()
      break
    case 'Home':
      e.preventDefault()
      goToSlide(0)
      break
    case 'End':
      e.preventDefault()
      goToSlide(slides.length - 1)
      break
  }
}
```

### Focus visible

```css
.showcase__dot:focus-visible,
.showcase__arrow:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}

/* Masquer le focus pour les utilisateurs souris */
.showcase__dot:focus:not(:focus-visible) {
  outline: none;
}
```

### Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  .wf-connection__particle,
  .showcase__slide,
  .wf-node--active,
  [data-animated="true"] {
    animation: none !important;
    transition: opacity 0.1ms !important;
  }
  
  /* Les transitions deviennent instantanées */
  .showcase__track {
    transition: none !important;
  }
}
```

```typescript
// En Framer Motion
const prefersReducedMotion = useReducedMotion()

const slideTransition = prefersReducedMotion
  ? { duration: 0 }
  : { duration: 0.5, ease: [0.32, 0, 0.16, 1] }
```

### Bouton pause/play (si autoplay actif)

```html
<button
  class="showcase__pause"
  aria-label="Mettre en pause le carousel"
  aria-pressed="false"
>
  <svg aria-hidden="true"><!-- icône pause --></svg>
</button>
```

---

## 13. Responsive

### Breakpoints comportementaux

| Showcase | Mobile (< 768px) | Tablet (768-1023px) | Desktop (1024px+) |
|---------|-----------------|---------------------|-------------------|
| AI | 1 colonne, no sticky | Side-by-side, no sticky | Split sticky |
| Automation | Diagramme scroll-x | Diagramme compact | Full-width diagram |
| LLM | Centré, H réduit | Centré, H normal | Centré, grande typo |
| MCP | Log masqué, schéma seul | Split réduit | Split complet |
| Workflow | 1 slide full, swipe | 1.5 slides peek | 2+ slides peek |
| SaaS | Screenshot full, no annotation | Annotations visibles | Frame + annotations |
| Infrastructure | Schéma SVG simplifié | Schéma normal | Schéma pleine largeur |
| Case Study | Scroll vertical | Vertical ou Horizontal | Horizontal |

### Règles mobile universelles

```css
@media (max-width: 767px) {
  /* Tout showcase devient scroll-x ou colonne */
  .showcase {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x mandatory;
  }
  
  .showcase__slide {
    scroll-snap-align: start;
    min-width: 100%;
    flex-shrink: 0;
  }
  
  /* Cacher les flèches sur mobile (swipe suffit) */
  .showcase__arrow {
    display: none;
  }
  
  /* Réduire les radii sur mobile */
  .showcase-frame {
    border-radius: var(--radius-lg);  /* 16px au lieu de 24px */
  }
}
```

### Touch events — swipe

```typescript
type SwipeState = {
  startX: number
  startY: number
  isDragging: boolean
}

const SWIPE_THRESHOLD = 50  // px minimum pour déclencher le changement
const SWIPE_VELOCITY_THRESHOLD = 0.3  // px/ms

const handleTouchEnd = (state: SwipeState, endX: number, endY: number) => {
  const deltaX = endX - state.startX
  const deltaY = Math.abs(endY - state.startY)
  
  // Ne pas déclencher si le mouvement est plus vertical qu'horizontal
  if (deltaY > Math.abs(deltaX) * 0.8) return
  
  if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
    deltaX > 0 ? goToPrev() : goToNext()
  }
}
```

---

## 14. Fallbacks & Dégradation gracieuse

### Fallback vidéo → image statique

```typescript
const VideoWithFallback = ({ src, fallbackSrc, alt }) => {
  const [videoFailed, setVideoFailed] = useState(false)
  
  if (videoFailed) {
    return <img src={fallbackSrc} alt={alt} loading="lazy" />
  }
  
  return (
    <video
      src={src}
      autoPlay
      muted
      loop
      playsInline
      onError={() => setVideoFailed(true)}
    />
  )
}
```

### Fallback SVG animé → SVG statique

```css
/* Si les animations CSS sont désactivées, les états idle sont visibles */
.wf-node--active {
  /* Fallback: juste la bordure accent, sans animation */
  border-color: var(--color-accent);
}

/* L'animation ne vient s'ajouter qu'en media query positive */
@media (prefers-reduced-motion: no-preference) {
  .wf-node--active {
    animation: node-pulse 2s ease-in-out infinite;
  }
}
```

### Fallback sans JavaScript

```html
<!-- Showcase dégradé sans JS : carousel devient grille statique -->
<noscript>
  <style>
    .showcase__track { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); }
    .showcase__nav { display: none; }
  </style>
</noscript>
```

### Fallback image manquante

```typescript
const ProjectImage = ({ src, alt, projectName }) => (
  <div className="project-image-wrapper">
    <img
      src={src}
      alt={alt}
      onError={(e) => {
        // Remplacer par un placeholder avec les initiales du projet
        const target = e.currentTarget
        target.style.display = 'none'
        target.nextElementSibling?.removeAttribute('hidden')
      }}
    />
    <div hidden className="project-image-placeholder" aria-label={`Image ${projectName} non disponible`}>
      <span>{projectName.slice(0, 2).toUpperCase()}</span>
    </div>
  </div>
)
```

---

## 15. Architecture de réutilisation

### Composant `<Showcase>` — Interface props

```typescript
interface ShowcaseProps {
  // Identité
  type: 'ai' | 'automation' | 'llm' | 'mcp' | 'workflow' | 'saas' | 'infrastructure' | 'casestudy'
  id: string
  ariaLabel: string
  
  // Slides
  slides: SlideData[]
  
  // Layout
  layout: 'sticky' | 'full-width' | 'inline' | 'carousel' | 'narrative'
  height?: string | number
  
  // Navigation
  navigation?: 'dots' | 'arrows' | 'fraction' | 'progress' | 'none'
  autoplay?: boolean
  autoplayInterval?: number
  
  // Interaction
  draggable?: boolean
  keyboard?: boolean
  
  // Animation
  transition?: 'slide' | 'fade' | 'scale'
  
  // Callbacks
  onSlideChange?: (index: number) => void
}

interface SlideData {
  id: string
  label?: string      // Overline
  title: string
  description?: string
  visual: VisualData
  cta?: CTAData
  metrics?: MetricData[]
}
```

### Composant `<ShowcaseSlide>` — sous-composant

```typescript
interface ShowcaseSlideProps {
  data: SlideData
  isActive: boolean
  index: number
  total: number
}
```

### Hook `useShowcase`

```typescript
interface UseShowcaseReturn {
  currentIndex: number
  goToSlide: (index: number) => void
  goToNext: () => void
  goToPrev: () => void
  isFirst: boolean
  isLast: boolean
  isPaused: boolean
  togglePause: () => void
}

const useShowcase = (
  total: number,
  options?: { autoplay?: boolean; interval?: number; loop?: boolean }
): UseShowcaseReturn
```

### Provider `<ShowcaseProvider>`

Pour les showcases complexes multi-niveaux (comme le Case Study), un Context Provider qui partage l'état :

```typescript
const ShowcaseContext = createContext<UseShowcaseReturn | null>(null)

const ShowcaseProvider = ({ children, total, options }) => {
  const showcase = useShowcase(total, options)
  return (
    <ShowcaseContext.Provider value={showcase}>
      {children}
    </ShowcaseContext.Provider>
  )
}

const useShowcaseContext = () => {
  const ctx = useContext(ShowcaseContext)
  if (!ctx) throw new Error('useShowcaseContext must be used within ShowcaseProvider')
  return ctx
}
```
