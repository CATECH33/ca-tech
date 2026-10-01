# CA-TECH Homepage Conversion — Rapport P2 Safe Optimization

**Date** : 2026-10-01  
**Session** : PROMPT 32  
**Auteur** : Claude Code

---

## 1. Executive Summary

Cinq optimisations P2 à faible risque ont été appliquées sur la Homepage CA-TECH :

1. **P2-01** — H2 PositionnementSection différencié du H1 Hero (doublon sémantique supprimé)
2. **P2-02** — CTA de conversion ajouté dans LLMSection → `/contact`
3. **P2-03** — CTA de conversion ajouté dans ExpertiseSection → `/contact`
4. **P2-07** — Claim chiffrée non sourcée supprimée dans AutomationSection
5. **P2-08** — Colonne Footer "Légal & contact" renommée en "Légal"

Les P2 impliquant des données non vérifiées (témoignages, métriques, dates) ont été délibérément différés.

Build final : **0 erreur · 2377 modules · 1.38s**

---

## 2. Implemented

### P2-01 — H2 PositionnementSection

**Problème :** H2 = "L'intelligence digitale qui transforme votre entreprise." ≈ H1 = "L'intelligence qui transforme votre entreprise." — même structure syntaxique, même concept central.

**Correction :**

| Avant | Après |
|---|---|
| "L'intelligence digitale qui transforme votre entreprise." | "IA, automatisation, développement web — un seul cabinet." |

La nouvelle formulation décrit le périmètre réel (3 domaines correspondant aux sections suivantes) sans répéter la formule Hero. Complémentarité sémantique H1/H2 :
- H1 = proposition de valeur émotionnelle (transformation)
- H2 = description factuelle du périmètre (ce qu'on fait)

**Fichier :** `src/components/sections/PositionnementSection.jsx`

---

### P2-02 — LLMSection CTA

**Problème :** seul lien texte → `/services/ia` (stub). Aucun chemin de conversion depuis la section LLM/Agents/MCP.

**Correction :** ajout d'un bouton ghost "Discuter d'un projet IA" → `/contact`, au-dessus du lien texte existant.

```
[Discuter d'un projet IA →]  ← ghost button, border rgba(53,155,217,0.35)
  Voir notre expertise IA →   ← text link existant, conservé
```

Style secondaire cohérent : ghost border bleu, hover renforcement border uniquement. Visuellement en-dessous du CTA Hero primaire (filled blue).

**Fichier :** `src/components/sections/LLMSection.jsx`

---

### P2-03 — ExpertiseSection CTA

**Problème :** après 5 expertises listées, aucun appel à l'action vers `/contact`.

**Correction :** bouton ghost "Démarrer un projet" → `/contact` après la ligne de clôture de la liste.

Texte distinct du Hero ("Parler de votre projet") pour éviter la redondance tout en maintenant la cohérence du message.

**Fichier :** `src/components/sections/ExpertiseSection.jsx`

---

### P2-07 — AutomationSection métrique

**Problème :** "Résultat mesuré · 10h économisées / semaine en moyenne" — claim quantifiée sans source documentée. "Résultat mesuré" implique un suivi statistique, "en moyenne" implique un échantillon. Ni l'un ni l'autre n'est vérifiable.

**Corrections :**

| Élément | Avant | Après |
|---|---|---|
| Badge label | "Résultat mesuré" | "Exemple de workflow" |
| Badge metric | "10h économisées / semaine en moyenne" | "Tâches répétitives éliminées — zéro intervention humaine" |
| SectionHeading | "...qui remplace 10 heures de travail manuel par semaine." | "...qui élimine les tâches répétitives :" |

Règle appliquée : **crédibilité > effet marketing**. Aucun "selon nos clients" inventé.

**Note** : `AIShowcaseSection` contient `"Vous économiserez en moyenne 8–12h/semaine"` dans une réplique de démonstration de Loïc — contexte explicitement illustratif (chat UI), hors périmètre P2-07.

**Fichier :** `src/components/sections/AutomationSection.jsx`

---

### P2-08 — Footer

**Problème :** colonne "Légal & contact" ne contient que des liens légaux — le terme "contact" est mensonger.

**Audit de la situation avant modification :**
- Col 1 (identité) : email `contact@ca-tech.fr` + téléphone `07 75 66 49 75` → cliquables
- Col 3 (navigation) : liens "Contact" (`/contact`) et "Devis" (`/devis`)
- Col 4 "Légal & contact" : uniquement 3 liens légaux

**Décision :** renommage Col 4 → "Légal". Ajout de contact info à Col 4 non retenu — créerait une redondance avec Col 1 (email + téléphone) et Col 3 (Contact + Devis). Les informations de contact sont déjà accessibles depuis 3 vecteurs distincts.

**Fichier :** `src/components/footer/Footer.jsx`

---

## 3. Deferred

### P2-04 — Métrique "5 pôles"

**Vérification :** `EXPERTISE_CARDS` dans `constants.js` contient exactement 5 entrées. Métrique arithmétiquement exacte. **Non modifié.**

### P2-05 — Métrique "2023"

**Label :** "Fondé à Dijon, actif en France". La date "2023" est présente dans le codebase mais ne peut pas être croisée avec un registre légal depuis le code source. **Non modifié — décision propriétaire requise.**

### P2-06 — Témoignages clients

`DEFERRED — REAL CLIENT CONTENT REQUIRED`

Aucun témoignage réel disponible. Aucune section vide ni témoignage fictif créé.

---

## 4. Data Required

| Donnée | Statut | Priorité |
|---|---|---|
| Vérification date "2023" (fondation légale vs commerciale) | Propriétaire | Crédibilité |
| Témoignages clients réels (nom, entreprise, verbatim) | Propriétaire | Conversion |
| Résultats clients documentés (économies temps, ROI) | Propriétaire | Crédibilité section Automation |
| Forme juridique, capital, TVA IC, dirigeant | **Finalisés PROMPT 33** | ~~RGPD~~ |

---

## 5. CTA Audit

### Cartographie complète post-P2

| Section | CTA | Destination | Type | État |
|---|---|---|---|---|
| Header Nav | "Contact" | `/contact` | Lien nav | ✅ Fonctionnel |
| Hero | "Parler de votre projet" | `/contact` | Bouton primaire filled | ✅ Fonctionnel |
| Hero | "Découvrir CA-TECH" | `/services` | Bouton secondaire ghost | ⚠️ Stub Phase 2 |
| AIShowcaseSection | CTA → contact | `/contact` | Bouton | ✅ Fonctionnel |
| LLMSection (nouveau) | "Discuter d'un projet IA" | `/contact` | Ghost button | ✅ Fonctionnel |
| LLMSection (existant) | "Voir notre expertise IA →" | `/services/ia` | Text link | ⚠️ Stub Phase 2 |
| AutomationSection | "Voir une démo d'automatisation" | `/services/automatisation` | Bouton filled | ⚠️ Stub Phase 2 |
| ExpertiseSection (nouveau) | "Démarrer un projet" | `/contact` | Ghost button | ✅ Fonctionnel |
| ProcessSection | CTA → contact | `/contact` | Bouton | ✅ Fonctionnel |
| SystemsSection | CTA → contact | `/contact` | Bouton | ✅ Fonctionnel |
| CTASection (primaire) | "Parler de votre projet" | `/contact` | Bouton filled (shadcn) | ✅ Fonctionnel |
| CTASection (secondaire) | "Demander un devis" | `/devis` | Bouton ghost | ✅ Fonctionnel |
| Footer Col 1 | `contact@ca-tech.fr` | `mailto:` | Lien cliquable | ✅ Fonctionnel |
| Footer Col 1 | `07 75 66 49 75` | `tel:` | Lien cliquable | ✅ Fonctionnel |
| Footer Col 3 | "Contact" | `/contact` | Lien nav | ✅ Fonctionnel |
| Footer Col 3 | "Devis" | `/devis` | Lien nav | ✅ Fonctionnel |

### Hiérarchie CTA

```
HERO — CTA PRIMAIRE (filled blue)
  "Parler de votre projet" → /contact
  
SECTIONS — CTA SECONDAIRES (ghost border)
  LLMSection : "Discuter d'un projet IA" → /contact
  ExpertiseSection : "Démarrer un projet" → /contact
  
CTA FINAL (shadcn ButtonLink filled)
  CTASection : "Parler à Loïc — Gratuit" → /contact

FOOTER BACKUP
  Email · Téléphone · Contact · Devis
```

**Un seul CTA commercial dominant** (Hero). Les CTAs secondaires utilisent un style ghost (border uniquement) qui ne concurrence pas visuellement le bouton primaire.

**"Parler à Loïc — Gratuit" (CTASection) :** ✅ Remplacé par "Parler de votre projet" — PROMPT 33 BIS.

### Destinations stub (non-bloquants)

Les liens `/services/*` et `/projets/*` sont des stubs "En construction" avec lien retour accueil. Ils ne constituent pas une impasse puisque Header et Footer permettent d'accéder à `/contact`.

---

## 6. Responsive

Layouts P2 ajoutés et vérification statique :

| Élément | Mobile (`<768px`) | Tablet (`768–1024px`) | Desktop (`>1024px`) |
|---|---|---|---|
| LLMSection CTA | `flex-col`, centré, 100% width | idem | idem (section max-width: 900px) |
| ExpertiseSection CTA | bloc après liste, `inline-flex` | idem | idem |
| Footer col "Légal" | grid-cols-1 (sm: 2, md: 4) | sm: 2 colonnes | 4 colonnes |

Les boutons ghost utilisent `inline-flex` avec `padding: '11px 24px'` — cible tactile ≥ 44px de hauteur, conforme aux guidelines WCAG 2.5.5.

**Aucun breakpoint custom ajouté** — héritage du Design System existant.

---

## 7. Regression

### Routes testées (build static)

| Route | Résultat |
|---|---|
| `/` | ✅ Compilé — Home chunk `53.77 kB` |
| `/contact` | ✅ Compilé — Contact chunk `11.76 kB` |
| `/devis` | ✅ Compilé — Devis chunk `9.73 kB` |
| `/mentions-legales` | ✅ Compilé — MentionsLegales `4.88 kB` |
| `/politique-de-confidentialite` | ✅ Compilé — PolitiqueConfidentialite `6.74 kB` |
| `/gestion-des-cookies` | ✅ Compilé — GestionCookies `4.70 kB` |
| `/portfolio-preview` | ✅ Compilé — portfolio-mockups `42.08 kB` |

### Fichiers modifiés (P2 scope uniquement)

| Fichier | Modification | Impact |
|---|---|---|
| `src/components/sections/PositionnementSection.jsx` | H2 réécrit | Homepage uniquement |
| `src/components/sections/LLMSection.jsx` | CTA ajouté + import ArrowRight | Homepage uniquement |
| `src/components/sections/ExpertiseSection.jsx` | CTA ajouté | Homepage uniquement |
| `src/components/sections/AutomationSection.jsx` | Badge + description reformulés | Homepage uniquement |
| `src/components/footer/Footer.jsx` | Colonne renommée | Toutes les pages (Footer) |

### Non modifiés

- `src/lib/constants.js` — PORTFOLIO_PROJECTS, EXPERTISE_CARDS, METRICS, FOOTER_NAV
- `src/App.jsx` — routes inchangées
- `vite.config.js`, `vercel.json` — inchangés
- Pages P0/P1 validées — Contact, Devis, MentionsLegales, PolitiqueConfidentialite, GestionCookies
- Design System — aucun token modifié
- Portfolio — aucun asset, aucun composant modifié
- Aucune nouvelle dépendance (ArrowRight appartient à `lucide-react` déjà installé)

---

## 8. Build

```
npm run build

vite v8.1.5 building client environment for production...
✓ 2377 modules transformed.
✓ built in 1.38s

0 erreur — 2 warnings préexistants (scripts externes non-module : axeptio, loic-widget)
```

Les 2 warnings sont antérieurs aux sessions P0/P1/P2 et ne sont pas solubles sans modifier les scripts tiers.

---

## 9. Final Status

CTA "Parler à Loïc" → "Parler de votre projet" — DONE

`STATUS: P2 CTA CONSISTENCY COMPLETE`
