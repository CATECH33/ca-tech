# CA-TECH Homepage Conversion Audit

**Date** : 2026-10-01  
**Session** : PROMPT 30  
**Auteur** : Claude Code  
**Périmètre** : Homepage `/` — angle conversion commerciale B2B

---

## Executive Summary

La Homepage CA-TECH est visuellement premium et structurellement solide. Le parcours narratif (Hero → IA → Automatisation → Processus → CTA) est bien construit et crédible. **Mais l'ensemble du funnel de conversion se brise au dernier mètre** : toutes les destinations de conversion (`/contact`, `/devis`, `/services`, `/projets`) sont des pages stub "En construction" sans aucun moyen de contacter CA-TECH.

**Résultat** : un visiteur convaincu qui clique sur "Parler à Loïc — Gratuit" atterrit sur une page vide sans email, sans formulaire, sans numéro — et repart avec le lien "← Retour à l'accueil".

Ce P0 unique annule l'intégralité du travail de conviction réalisé en amont.

---

## Positioning Audit

### Positionnement déclaré

"Pas une agence. Un cabinet qui exécute." — cité dans PositionnementSection.

### Positionnement observé dans le code

| Signal | Contenu |
|---|---|
| Eyebrow Hero | "CA-TECH" |
| H1 | "L'intelligence qui transforme votre entreprise." |
| H2 Positionnement | "L'intelligence digitale qui transforme votre entreprise." |
| Footer | "Cabinet d'intelligence digitale — IA, Automatisation, Développement Web, SEO." |
| JSON-LD | "Cabinet de conseil et agence IA-first" |
| Meta description | "Cabinet technologique français spécialisé en intelligence artificielle, automatisation, développement web et infrastructure IT pour les PME françaises." |

### Diagnostic positionnement

**Ce qui fonctionne :**
- La formule "Pas une agence. Un cabinet qui exécute." est la meilleure phrase du site — différenciante, affirmée, mémorable.
- "PME françaises" dans la meta description ancre la cible.
- L'axe IA-first est cohérent de bout en bout.

**Ce qui freine :**
- H1 et H2 sont quasi-identiques ("L'intelligence qui transforme" / "L'intelligence digitale qui transforme") — le scrolling ne fait pas progresser la compréhension, il la répète.
- Le sous-titre Hero liste des technologies (`LLM · MCP`) sans jamais formuler un bénéfice business. Un dirigeant de PME ne sait pas ce que "MCP" apporte concrètement à son entreprise.
- L'angle "cabinet" (conseil, expertise, accompagnement) est affirmé en titre mais l'UX de la page pousse plutôt vers "agence digitale qui produit des livrables".

---

## Hero Audit

### Contenu actuel

```
Eyebrow   : CA-TECH
H1        : L'intelligence qui transforme votre entreprise.
Sous-titre : IA générative · Automatisation · LLM · MCP · Systèmes digitaux
CTA 1     : Découvrir CA-TECH  → /services   [bouton bleu rempli — PRIMARY]
CTA 2     : Parler à CA-TECH   → /contact    [bouton ghost — SECONDARY]
Stats     : 50+ Projets livrés · <24h Délai de réponse · 100% Équipe basée en France
```

### Test 5 secondes — résultat

> "Il y a une société tech qui fait de l'IA et de l'automatisation pour des entreprises. Je peux les découvrir ou leur parler."

Ce qui **n'est pas capté** en 5 secondes :
- Quel type d'entreprise peut en bénéficier ?
- Quel problème concret est résolu ?
- Pourquoi CA-TECH plutôt qu'une autre agence IA ?
- Qu'est-ce que LLM / MCP apporte à mon quotidien de dirigeant ?

**Score : 5/10** — catégorie comprise, valeur non comprise.

### Problèmes Hero

**P1 — Hiérarchie CTA inversée**

Le CTA primaire (bleu rempli, visuellement dominant) envoie vers `/services` — une page de découverte. Le CTA de conversion ("Parler à CA-TECH") est relégué en position secondaire avec un style ghost moins visible. Résultat : le bouton qui capte le plus l'attention emmène le visiteur hors du funnel de conversion.

**P1 — Sous-titre = liste technologique sans bénéfice**

`IA générative · Automatisation · LLM · MCP · Systèmes digitaux`

"LLM" et "MCP" sont des acronymes techniques que les dirigeants de PME ne comprennent pas. Le sous-titre ne répond à aucune des questions décisionnelles : Qu'est-ce que ça fait ? Pourquoi moi ? Quel résultat ?

**Exemple de formulation orientée bénéfice (suggestion, non prescriptive) :**
> "Nous automatisons vos processus, déployons des agents IA métier et construisons vos systèmes digitaux — pour que vous alliez plus vite que vos concurrents."

---

## CTA Audit

### Cartographie complète

| Section | CTA | Destination | État | Rôle |
|---|---|---|---|---|
| Hero | "Découvrir CA-TECH" ★ primary | /services | **STUB** | Découverte |
| Hero | "Parler à CA-TECH" | /contact | **STUB** | Conversion |
| AIShowcase | "Parler à CA-TECH" | /contact | **STUB** | Conversion |
| AIShowcase | "Voir tous nos agents IA →" | /services/ia | **STUB** | Découverte |
| Automation | "Voir une démo d'automatisation" | /services/automatisation | **STUB** | Découverte |
| LLM | "Voir notre expertise IA →" | /services/ia | **STUB** | Découverte |
| Carousel | "Voir tous les projets" | /projets | **STUB** | Découverte |
| Carousel (cards) | "Voir" ×4 | /projets/[slug] ×4 | **STUB** | Preuve |
| Systems | "Infrastructure & Conseil →" | /contact | **STUB** | Conversion |
| Portfolio (showcase) | "Voir le projet" ×4 | /projets/[slug] ×4 | **STUB** | Preuve |
| Process | "Démarrer un diagnostic gratuit" | /contact | **STUB** | Conversion |
| ExpertiseSection | "En savoir plus →" ×5 | /services/[slug] ×5 | **STUB** | Découverte |
| CTASection | "Parler à Loïc — Gratuit" ★ primary | /contact | **STUB** | Conversion |
| CTASection | "Demander un devis" | /devis | **STUB** | Conversion |
| Header nav | "Contact" | /contact | **STUB** | Conversion |
| Footer nav | "Contact" | /contact | **STUB** | Conversion |
| Footer nav | "Devis" | /devis | **STUB** | Conversion |

★ = CTA principal de la section

### Diagnostic

- **Destinations de conversion** (`/contact`, `/devis`) : **0 opérationnelles sur 2**
- **CTAs de conversion** : 8 présents, 8 mènent à des stubs
- **CTAs de découverte** : 11 présents, 11 mènent à des stubs
- **CTA concurrent** : Le CTA principal du Hero (découverte) concurrence visuellement le CTA de conversion (contact)
- **CTA manquant** : ExpertiseSection (avant-dernière section) n'a pas de CTA de conversion
- **Liens morts** : Aucun 404 — les stubs existent — mais le contenu est absent

---

## Conversion Funnel

```
Visiteur              ✅  Hero visible, section premium
   ↓
Compréhension         ⚠️  Partielle — bénéfice absent du sous-titre Hero
   ↓
Intérêt               ✅  AIShowcase + Automation convaincants (use cases concrets)
   ↓
Crédibilité           ✅  LLM + Systems signalent expertise technique réelle
   ↓
Preuve                ⚠️  Images portfolio visibles mais "Voir le projet" → stub
   ↓
Réassurance           ✅  ProcessSection excellente (6 étapes, durées, diagnostic gratuit)
   ↓
CTA                   ✅  CTASection forte ("15 minutes, sans engagement", SIRET visible)
   ↓
Contact               ❌  /contact → "En construction" — funnel brisé
```

**Le funnel est fonctionnel jusqu'à l'avant-dernière étape. L'étape finale est cassée.**

### Trou n°1 — La preuve cliquable est cassée

Les visiteurs qui cherchent à vérifier le travail de CA-TECH cliquent sur "Voir le projet". Ils atterrissent sur une page "En construction". La crédibilité construite par les images mockup est immédiatement détruite.

### Trou n°2 — Le contact est introuvable

Un visiteur convaincu qui clique sur n'importe quel CTA de conversion atterrit sur une page stub qui dit : *"Cette page est en cours de construction. En attendant, contactez-nous directement."* — sans fournir ni email, ni téléphone, ni formulaire. L'email `contact@ca-tech.fr` et le numéro `+33775664975` existent dans le JSON-LD structuré mais ne sont jamais affichés à l'écran.

### Trou n°3 — Sous-titre Hero non-bénéficiaire

Entre Compréhension et Intérêt, le sous-titre "LLM · MCP" bloque les visiteurs non-techniques. Certains quittent avant d'atteindre les sections IA/Automation qui auraient converti leur compréhension en intérêt.

---

## Services Audit

| Service présenté | Section | Langage | Bénéfice exprimé |
|---|---|---|---|
| IA générative / Agents | AIShowcaseSection | B2B accessible | ✅ "80% des échanges automatisés" |
| Automatisation | AutomationSection | B2B accessible | ✅ "10h économisées/semaine" |
| LLM & MCP | LLMSection | Très technique | ⚠️ "architectures sur-mesure, RAG, agents" |
| Portfolio / Web | DigitalExperiencesSection | B2B accessible | ✅ images mockup parlantes |
| Systèmes / Infra | SystemsSection | Technique modéré | ⚠️ "pipeline data, cybersécurité" |
| Expertises (liste) | ExpertiseSection | Mixte | ⚠️ descriptions courtes, pas de cas concret |

**Points forts :**
- AIShowcase et Automation sont les deux meilleures sections — use cases concrets, chiffres lisibles, interface animée démonstrative.
- "10h économisées / semaine en moyenne" est percutant si la source est fiable.

**Points faibles :**
- LLMSection est la section la plus technique et la moins accessible. Elle n'a pas de CTA de conversion. Un dirigeant qui ne comprend pas "RAG, chaînes d'agents, protocoles MCP" passe sans s'arrêter.
- ExpertiseSection liste 5 domaines avec des descriptions courtes — utile comme inventaire mais sans storytelling ni résultat business associé.
- "Résultat mesuré" dans AutomationSection n'est pas sourcé. Pour un B2B français, cette formulation sans référence peut sembler publicitaire.

---

## Proof & Credibility

### Preuves présentes

| Type | Présence | Qualité |
|---|---|---|
| Portfolio (images mockup) | ✅ 4 projets | Visuellement convaincant, non cliquable |
| Stats Hero | ✅ 50+ projets · <24h · 100% France | Plausibles, non vérifiables depuis le site |
| Métriques animées | ✅ 48h / 5 / 2023 / <1 sem. | Mixte (voir ci-dessous) |
| Témoignages clients | ❌ Absents | — |
| Logos clients | ❌ Absents | — |
| Certifications / partenariats | ❌ Absents | — |
| Étude de cas | ❌ Absents | — |
| SIRET | ✅ CTASection + Footer | Rassurant pour B2B France |
| Adresse physique | ✅ Footer | "1 Avenue du Mail, 21240 Talant" |

### Problème métriques (constants.js)

| Métrique | Valeur | Problème |
|---|---|---|
| "48h" — Premier livrable IA opérationnel | Spécifique, percutant | ✅ |
| "5" — Pôles d'expertise couverts | 5 est un petit nombre, peu valorisant | ⚠️ P2 |
| "2023" — Fondé à Dijon, actif en France | "Fondé en 2023" = jeune entreprise → signal de risque | ⚠️ P2 |
| "< 1 sem." — Prototype livré en sprint | Bon signal de rapidité | ✅ |

**IMPORTANT** : Aucune statistique inventée dans cet audit. Ces métriques sont celles existantes dans le code, évaluées sur leur impact commercial perçu.

---

## Trust Audit

### Ce qui existe

| Élément | Présence | Localisation |
|---|---|---|
| SIRET | ✅ `93344494500012` | CTASection + Footer |
| Adresse | ✅ `1 Avenue du Mail, 21240 Talant` | Footer + JSON-LD |
| Email | ❌ Non affiché | JSON-LD uniquement |
| Téléphone | ❌ Non affiché | JSON-LD uniquement |
| LinkedIn | ✅ lien Footer | `linkedin.com/company/ca-tech-france/` |
| Mentions légales | ✅ lien Footer | Route stub |
| Politique confidentialité | ✅ lien Footer | Route stub |
| Horaires | ❌ Non affichés | JSON-LD uniquement |
| Localisation France | ✅ "100% Équipe basée en France" | Hero stats |
| Processus de travail | ✅ ProcessSection | 6 étapes + durées |
| "Sans engagement" | ✅ | CTASection |

### Ce qui manque

- **Email `contact@ca-tech.fr` affiché à l'écran** : présent dans JSON-LD, absent visuellement. Un prospect qui ne clique pas sur le CTA n'a aucun moyen de contacter CA-TECH.
- **Téléphone `+33775664975`** : idem.
- Aucun témoignage client.
- Les mentions légales et politique de confidentialité pointent vers des stubs — réglementairement problématique (RGPD).

---

## Contact Journey

### Parcours actuel

```
Visiteur convaincu
   → clique "Parler à Loïc — Gratuit"
   → /contact
   → Page "En construction"
   → Message : "contactez-nous directement"
   → Aucun moyen de contact fourni
   → Lien "← Retour à l'accueil"
   → Abandon
```

### Test réel de contact

Il n'existe **aucun moyen de contacter CA-TECH depuis le site** en dehors du JSON-LD structuré (non visible). Ni formulaire, ni email affiché, ni téléphone affiché. Le seul lien de contact dans la navigation va sur une page stub vide.

---

## Mobile Conversion

### Points positifs

- Hero : image mobile dédiée (`/hero/catech-hero-mobile.webp`), viewport correct.
- CTAs bien dimensionnés (`padding: 13px 28px`).
- ProcessSection : version mobile verticale avec timeline latérale.
- Carousel : drag fonctionne sur mobile.

### Points négatifs

- Le problème P0 (/contact stub) est identique sur mobile.
- Sur mobile, les deux CTAs Hero s'affichent en colonne (`flexWrap: 'wrap'`) — le CTA ghost "Parler à CA-TECH" peut passer sous la ligne et être moins visible.
- LLMSection sur mobile : le titre word-by-word animé peut être confus à petite taille.

---

## Performance

| Élément | État | Note |
|---|---|---|
| Hero image : `fetchpriority="high"` + `loading="eager"` | ✅ | LCP optimisé |
| Hero image : `width`/`height` attrs | ✅ 1920×1075 | CLS nul |
| Preload hero WebP | ✅ `<link rel="preload">` | Excellent |
| Fonts : preconnect + preload async | ✅ | Chargement non-bloquant |
| Portfolio images : `loading="lazy"` | ✅ | |
| Portfolio images : `width`/`height` HTML | ⚠️ Absents | CLS géré par CSS, risque faible |
| Framer Motion animations | ✅ `useReducedMotion` respecté | Accessible |
| Build : 0 erreurs | ✅ | |
| `loic-widget.js` / `axeptio-consent.js` | ⚠️ Scripts externes | Ajoutent du poids et des dépendances tierces |

---

## SEO / Conversion

| Élément SEO | Contenu | Note |
|---|---|---|
| `<title>` | "CA-TECH — Intelligence Artificielle, Automatisation & Technologie" | ✅ Complet, 72 chars |
| `<meta description>` | "Cabinet technologique français spécialisé en IA, automatisation, développement web et infrastructure IT pour les PME françaises." | ✅ Cible PME France |
| H1 | "L'intelligence qui transforme votre entreprise." | ⚠️ Aspirationnel, peu keywordé |
| H2s | Multiples — progressifs et complémentaires | ✅ |
| JSON-LD Organization | Complet (SIRET, adresse, téléphone, services + pricing) | ✅ Excellent |
| Canonical | `https://www.ca-tech.fr/` | ✅ |
| OG / Twitter Card | Présents | ✅ |
| GSC verification | Présente | ✅ |

**Point de friction SEO :**
Les pages `/contact`, `/services`, `/services/ia`, `/projets` sont indexables (pas de `noindex`) mais affichent "En construction". Si Googlebot les crawle, il indexe du contenu creux qui peut pénaliser la réputation du domaine sur ces URLs stratégiques.

**Cohérence SEO/Conversion :**
La meta description cible "PME françaises" — cohérent avec le positionnement B2B. La H1 n'est pas keywordée mais c'est un choix de marque acceptable pour une stratégie premium.

---

## 5-Second Test

**Scénario :** Nouveau visiteur, arrive sur la homepage, 5 secondes.

**Ce qu'il voit :**
- Image de fond sombre, ambiance technologique premium
- "CA-TECH"
- "L'intelligence qui transforme votre entreprise."
- "IA générative · Automatisation · LLM · MCP · Systèmes digitaux"
- Deux boutons bleu : "Découvrir CA-TECH" et "Parler à CA-TECH"
- Band bas : "50+ Projets livrés · <24h · 100% France"

**Réponse à "CA-TECH fait quoi et pourquoi devrais-je les contacter ?"**

> "C'est une société française qui fait de l'IA et de l'automatisation pour les entreprises. Je pense que ça pourrait aider à gagner du temps ou à moderniser nos outils. Je ne suis pas sûr de ce que 'LLM' et 'MCP' signifient. Si je devais les contacter, je cliquerais probablement sur 'Parler à CA-TECH' — mais il faudrait que je comprenne mieux ce qu'ils proposent d'abord."

**Score : 5/10**
- ✅ Catégorie comprise (tech/IA)
- ✅ Localisation France rassurante
- ❌ Valeur concrète non articulée
- ❌ Différenciation non perçue
- ❌ "LLM · MCP" opaque pour non-technique
- ❌ CTA principal envoie vers découverte, pas contact

---

## SME Decision-Maker Test

**Persona :** Dirigeant d'une PME de 15 salariés (secteur services), non-technique, cherche à "faire quelque chose avec l'IA".

| Question | Réponse honnête | Score |
|---|---|---|
| 1. Comprend-il l'offre ? | Partiellement — "IA et automatisation" oui, "LLM/MCP" non | 6/10 |
| 2. Comprend-il le bénéfice ? | Oui après AIShowcase/Automation ("10h/semaine") — pas dès le Hero | 6/10 |
| 3. Comprend-il pourquoi CA-TECH est crédible ? | Oui — processus clair, SIRET, "basé en France", 50+ projets | 8/10 |
| 4. Voit-il des réalisations ? | Oui visuellement — mais ne peut pas en voir plus (stubs) | 5/10 |
| 5. Comprend-il comment démarrer ? | Oui — ProcessSection + "Diagnostic gratuit" sont excellents | 9/10 |
| 6. Trouve-t-il facilement le CTA ? | Oui — présent à plusieurs reprises, CTASection finale forte | 8/10 |
| 7. Sait-il ce qui se passe après le clic ? | Non — il tombe sur "En construction" | 0/10 |

**Moyenne : 6/10** — Bonne première impression, funnel cassé à l'étape décisive.

---

## Issues

### P0 — BLOQUANT (conversion impossible)

| ID | Problème | Impact |
|---|---|---|
| **P0-01** | `/contact` est un stub "En construction" sans aucun moyen de contact visible | 100% des conversions bloquées |
| **P0-02** | `/devis` est un stub "En construction" sans information | Parcours devis impossible |
| **P0-03** | Les mentions légales et politique de confidentialité sont des stubs | Non-conformité RGPD / impression de site abandonné |

### P1 — CRITIQUE (obstacle commercial important)

| ID | Problème | Impact |
|---|---|---|
| **P1-01** | CTA Hero inversé : primaire = découverte, secondaire = conversion | Réduit les clics vers la conversion depuis la section la plus vue |
| **P1-02** | Sous-titre Hero = liste tech sans bénéfice ("LLM · MCP") | Fuite des dirigeants non-techniques dès les 5 premières secondes |
| **P1-03** | Toutes les pages `/services/*` sont des stubs | Les CTA "Voir nos services / En savoir plus" rompent la confiance |
| **P1-04** | Tous les liens portfolio `/projets/*` sont des stubs | La section preuve clique sur du vide — détruit la crédibilité |
| **P1-05** | Email et téléphone jamais affichés à l'écran | Un prospect qui ne clique pas le CTA n'a aucun recours |

### P2 — IMPORTANT (optimisation recommandée)

| ID | Problème | Impact |
|---|---|---|
| **P2-01** | H1 et H2 quasi-identiques — narrative qui stagne entre Hero et Positionnement | Scroll perçu comme répétitif, faible valeur ajoutée de la 2e section |
| **P2-02** | LLMSection trop technique, sans CTA de conversion | Section qui n'avance pas le funnel |
| **P2-03** | ExpertiseSection (avant-dernière) sans CTA de conversion | Opportunité manquée juste avant le CTASection |
| **P2-04** | Métrique "5 pôles d'expertise" peu valorisante | Faible signal de scale |
| **P2-05** | Métrique "2023" affiché = signal d'expérience limitée | Peut rassurer sur la modernité mais fragilise la crédibilité |
| **P2-06** | Aucun témoignage client | Preuve sociale absente — friction B2B France |
| **P2-07** | "Résultat mesuré : 10h/semaine" sans source ni contexte | Peut sembler publicitaire aux prospects sceptiques |
| **P2-08** | Footer colonne "Légal & contact" ne contient aucun contact | Confusion sur l'usage de cette colonne |
| **P2-09** | `img` portfolio sans `width`/`height` HTML attrs | CLS théorique, géré par CSS |

### P3 — COSMÉTIQUE

| ID | Problème | Impact |
|---|---|---|
| **P3-01** | "50+ Projets livrés" dans Hero band — non sourcé | Mineur — acceptable comme indicateur de volume |
| **P3-02** | Loïc widget + Axeptio = 2 scripts tiers sur toutes les pages | Poids léger mais dépendances externes |

---

## Recommendations

### Priorité absolue — P0 à traiter immédiatement

**R1 — Page /contact minimale fonctionnelle**

La page `/contact` n'a pas besoin d'être exhaustive. Elle a besoin d'exister avec au minimum :
- Email `contact@ca-tech.fr` cliquable (`mailto:`)
- Téléphone `+33775664975` si Loïc est disponible par téléphone
- Optionnel : Lien Calendly / formulaire léger (prénom, email, message, objet)
- Message de confirmation après envoi

Sans cette page, tous les budgets media, tout le SEO, et tout le travail de conversion de la Homepage sont nuls.

**R2 — Page /devis ou redirection vers /contact**

Si `/devis` ne peut pas être construite immédiatement, ajouter une redirection React Router de `/devis` vers `/contact`.

**R3 — Afficher email + téléphone sur le stub actuel en attendant**

Solution minimale immédiate : ajouter dans `StubPage.jsx` (pour les routes `/contact` et `/devis`) l'email et le téléphone affichés directement — même sans formulaire. "Contactez-nous : contact@ca-tech.fr · 07 75 66 49 75" suffit à débloquer la conversion.

**R4 — Mentions légales et politique de confidentialité**

Ces pages doivent exister pour conformité RGPD. Solution minimale : contenu basique généré avec les infos légales déjà disponibles (SIRET, adresse, DPO, politique cookies).

---

### P1 — Corrections importantes

**R5 — Inverser la hiérarchie des CTAs Hero**

Le CTA de conversion ("Parler à CA-TECH" ou "Demander un diagnostic") doit être le bouton primaire rempli. "Découvrir CA-TECH" peut rester comme secondaire ghost. Changement minimal dans `HeroSection.jsx`.

**R6 — Reformuler le sous-titre Hero**

Remplacer la liste de technologies par une phrase de bénéfice accessible. Conserver les tags techniques en position secondaire (ils existent déjà dans PositionnementSection). Exemple de logique :
> "Nous automatisons vos processus répétitifs, déployons des agents IA sur-mesure et construisons vos outils digitaux."

Ou plus court si le H1 + sous-titre doivent former un tout :
> "Agents IA · Automatisation · Applications web · Pour votre croissance."

**R7 — Rendre les pages projet minimalement visitables**

Si les pages `/projets/:slug` ne peuvent pas être construites, remplacer le CTA "Voir" / "Voir le projet" par une ancre vers `#contact` (in-page scroll) ou supprimer les liens. Un lien qui mène vers "En construction" est pire qu'un lien absent.

---

## Priority Matrix

```
┌─────────────────────────────────────────────────────────────────┐
│                        IMPACT COMMERCIAL                         │
│              Faible ←─────────────────────→ Élevé               │
│                                                                   │
│  Difficile │ P3-02 Loïc widget    │                             │
│     à      │                      │                             │
│  corriger  │                      │  P1-01 CTA Hero inversé      │
│            │                      │  P1-02 Sous-titre Hero       │
│            ├──────────────────────┼──────────────────────────── │
│  Facile    │ P3-01 Stats band     │  P0-01 /contact stub  ← 1er │
│     à      │ P2-04 Métriques      │  P0-02 /devis stub    ← 2e  │
│  corriger  │ P2-08 Footer contact │  P0-03 Légal stubs    ← 3e  │
│            │                      │  P1-05 Email invisible       │
└─────────────────────────────────────────────────────────────────┘
```

**Ordre d'intervention recommandé :**
1. P0-01 : Page /contact minimale (email + téléphone minimum)
2. P0-02 : Route /devis → redirect /contact ou page minimale
3. P0-03 : Mentions légales + politique confidentialité (conformité RGPD)
4. P1-05 : Email affiché dans Footer et/ou Header
5. P1-01 : Inverser hiérarchie CTA Hero (swap primary/secondary)
6. P1-02 : Reformuler sous-titre Hero
7. P1-03/04 : Décider du sort des stubs services/projets (construire ou masquer les liens)

---

## Conclusion

**La Homepage CA-TECH est l'une des meilleures pages de présentation de cabinet IA en France** sur le plan visuel et narratif. Le parcours Hero → IA → Automation → Process → CTA est convaincant, professionnel, et bien rythmé.

**Mais elle ne convertit pas.**

Non pas parce que la conversion est mal pensée — elle est excellente (CTASection, ProcessSection, SIRET, "sans engagement") — mais parce que l'infrastructure de conversion n'existe pas encore. Chaque issue P0 se corrige en moins d'une journée de développement.

Le retour sur investissement de corriger P0-01 seul (page /contact fonctionnelle) est **immédiat et total** : sans elle, tous les autres efforts sont nuls. Avec elle, la Homepage entre immédiatement dans un funnel opérationnel.

---

## Summary

| Priorité | Nombre | Problèmes critiques |
|---|---|---|
| **P0** | 3 | /contact stub, /devis stub, légal stubs |
| **P1** | 5 | CTA Hero inversé, sous-titre tech, services stubs, projets stubs, email invisible |
| **P2** | 9 | H1≈H2, LLM sans CTA, Expertise sans CTA, métriques, témoignages, footer |
| **P3** | 2 | Stats non sourcées, scripts tiers |

**Fichiers créés :**
- `docs/design/CA-TECH-HOMEPAGE-CONVERSION-AUDIT.md`

**Modifications effectuées :**
- Aucune — conformément aux instructions (audit seul, corrections sur confirmation)

---

## STATUS: AUDIT COMPLETE — AWAITING IMPLEMENTATION
