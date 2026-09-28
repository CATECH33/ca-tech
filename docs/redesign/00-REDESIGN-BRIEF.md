# 00 — REDESIGN BRIEF
## CA-TECH V2 — Brief de Refonte Complète
**Date :** 28 septembre 2026 — **Mis à jour :** 28 septembre 2026  
**Statut :** Phase 01 finalisée — Prêt pour Phase 02

---

## Contexte stratégique

CA-TECH doit cesser de se positionner comme une agence web et s'affirmer comme un **cabinet technologique français** — terme qui communique rigueur, expertise, profondeur technique et capacité conseil à un niveau supérieur.

Le site actuel délivre un message d'agence web IA-first standard. Il manque de personnalité propre, de différenciation forte et de crédibilité premium. La refonte vise à corriger cela dans l'intégralité de la chaîne — positionnement, contenu, direction artistique, architecture, UX et technique.

---

## Objectifs de la refonte

### Positionnement
Passer de : *"Agence Web & IA — les outils qui font grandir votre entreprise"*  
À : *Un cabinet technologique de référence pour les PME françaises qui prennent l'IA au sérieux*

### Message central
CA-TECH n'est pas un prestataire. C'est un partenaire technologique qui pense avant de coder — qui cadre avant de livrer — et qui reste après la mise en ligne.

### Quatre piliers d'expertise
1. Intelligence Artificielle
2. Automatisation
3. Développement Web & SaaS
4. Infrastructure IT

---

## Architecture validée

### Navigation principale — 5 entrées, rien de plus

```
ACCUEIL  |  EXPERTISES  |  RÉALISATIONS  |  À PROPOS  |  CONTACT
```

**Expertises (dropdown) :**
- Intelligence Artificielle → `/expertises/ia`
- Automatisation → `/expertises/automatisation`
- Web & SaaS → `/expertises/web-saas`
- Infrastructure IT → `/expertises/infrastructure`

**Entrées supprimées de la nav :**
- ~~Solutions~~ — abandonné
- ~~Méthode~~ — devient une section de la homepage
- ~~Ressources~~ — Phase 3 au plus tôt
- ~~Tarifs~~ — accessible depuis les pages expertise et le footer

### URLs finales

```
/                              Accueil
/expertises/ia                 Intelligence Artificielle
/expertises/automatisation     Automatisation
/expertises/web-saas           Web & SaaS
/expertises/infrastructure     Infrastructure IT
/realisations                  Réalisations
/a-propos                      À propos
/contact                       Contact
/tarifs                        Tarifs (accessible, non dans la nav principale)
/loic                          Loïc (page dédiée, non dans la nav principale)
/politique-des-cookies         Légal
```

---

## Rôle de Loïc

Loïc est un **exemple de réalisation** et une **démonstration d'agent IA**, pas le centre de l'identité CA-TECH.

Il apparaît dans :
- La page Réalisations — comme projet livré
- La page Expertise IA — comme démonstration concrète d'agent conversationnel
- Éventuellement une section dédiée dans une page Expertise

Il **n'a pas** de place prioritaire dans la navigation principale.  
CA-TECH reste la marque centrale.

---

## La méthode

La méthode (Comprendre → Concevoir → Construire → Déployer → Améliorer) est **une section de la homepage**.

Une page `/methode` dédiée ne sera créée que si une nécessité UX claire est identifiée — ce n'est pas le cas aujourd'hui.

---

## Statistiques — Règle définitive

**Toute statistique sans source réelle et nommée est supprimée.**

Sont supprimées :
- `200+` projets réalisés
- `98%` clients satisfaits (NPS)
- `+250%` ROI moyen sur missions IA
- `+180%` satisfaction client (cas clients)
- `-73%` tickets traités sans humain
- `×3.4` trafic organique
- `×4 ROI en 3 mois`

Elles sont remplacées par :
- Réalisations réelles avec client nommé et contexte
- Captures d'écran de projets livrés
- Technologies utilisées
- Processus documentés
- Témoignages réels si disponibles

---

## Contraintes absolues

| Contrainte | Règle |
|-----------|-------|
| Logo | Celui existant. Pas de modification. |
| Palette | Deep Navy #05101E / Navy #102740 / Technical Blue #1A4066 / Tech Blue #359BD9 / Silvers |
| Couleurs interdites | Noir pur, purple gradients, neon, orange tech, green AI, glassmorphism excessif |
| Police display | IBM Plex Serif (300 pour les headlines) |
| Police UI | IBM Plex Sans (400/500) |
| Rajdhani + Inter | Supprimés |
| Italic accent | Technique éditoriale, pas règle systématique |
| Statistiques | Zéro chiffre non sourcé |
| Composants | Zéro bento SaaS générique, zéro grilles de cards répétitives |

---

## Architecture technique — Décision

**Le projet reste sur React + Vite + React Router.**

La migration Next.js est une **décision séparée** qui nécessite une évaluation dédiée (voir `docs/redesign/07-NEXTJS-EVALUATION.md` — à créer si nécessaire). Elle ne sera pas mélangée avec la refonte visuelle Phase 02.

---

## Périmètre Phase 02

### Dans le scope
- Design system complet (tokens, composants, layout)
- Header + Navigation refonte
- Footer refonte
- Homepage V2
- Pages Expertises × 4
- Page Réalisations
- Page À propos
- Page Contact

### Hors scope Phase 02
- Manager (application interne)
- Loïc widget
- Pages SEO locales statiques
- Blog / Ressources
- Devis (conservé tel quel)
- Migration Next.js

---

## Critère de succès Phase 02

> Le nouveau site communique en 5 secondes : "Voici un cabinet technologique sérieux, précis, humain — et ils peuvent livrer ce dont j'ai besoin."
