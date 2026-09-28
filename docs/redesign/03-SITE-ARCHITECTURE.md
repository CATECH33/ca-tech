# 03 — SITE ARCHITECTURE
## CA-TECH V2 — Architecture Finale
**Date :** 28 septembre 2026 — **Mis à jour :** 28 septembre 2026

---

## Architecture finale validée

```
CA-TECH
│
├── /                               Accueil
│
├── Expertises ▾                    Dropdown (4 entrées)
│   ├── /expertises/ia              Intelligence Artificielle
│   ├── /expertises/automatisation  Automatisation
│   ├── /expertises/web-saas        Web & SaaS
│   └── /expertises/infrastructure  Infrastructure IT
│
├── /realisations                   Réalisations
├── /a-propos                       À propos
└── /contact                        Contact
```

**Navigation principale :** `ACCUEIL | EXPERTISES ▾ | RÉALISATIONS | À PROPOS | CONTACT`  
**CTA nav :** `Démarrer` → `/contact`

### Pages accessibles mais hors navigation principale

| URL | Statut |
|-----|--------|
| `/tarifs` | Accessible — lien depuis expertise pages et footer |
| `/loic` | Accessible — lien depuis réalisations et expertise IA |
| `/politique-des-cookies` | Footer uniquement |

---

## Sections supprimées de l'architecture

Les éléments suivants ont été **délibérément abandonnés** :

| Élément | Décision | Raison |
|---------|---------|--------|
| Section "Solutions" | Abandonné | Complexité inutile, doublon des Expertises |
| `/solutions/*` (4 URLs) | Abandonné | Idem |
| Page `/methode` | Abandonné | Contenu intégré dans la Homepage section 05 |
| Nav "Ressources" | Phase 3 minimum | Pas de contenu prêt |
| Nav "Tarifs" | Hors nav principale | Accessible via expertise + footer |

---

## Analyse — Routes actuelles → décision

### Pages SPA React (routes actuelles)

| Route actuelle | Fichier | Décision | Route cible |
|---------------|---------|---------|-------------|
| `/` | `Home.jsx` | REFONTE COMPLÈTE | `/` |
| `/services` | `Services.jsx` | REMPLACER | → 4 pages `/expertises/*` |
| `/collaborateurs-ia` | `CollaborateursIA.jsx` | ARCHIVER après migration | Contenu → `/expertises/ia` |
| `/automatisations` | `Automatisations.jsx` | ARCHIVER après migration | Contenu → `/expertises/automatisation` |
| `/realisations` | `Realisations.jsx` | REFONTE | `/realisations` |
| `/contact` | `Contact.jsx` | REFONTE | `/contact` |
| `/catalogue` | `Catalogue.jsx` | SUPPRIMER | Pas de remplaçant direct |
| `/tarifs` | `Tarifs.jsx` | REFONTE légère | `/tarifs` |
| `/loic` | `Loic.jsx` | REFINE | `/loic` |
| `/politique-des-cookies` | `PolitiqueCookies.jsx` | KEEP | inchangé |

### Redirections à prévoir (dans `vercel.json`)

| Source | Destination | Code |
|--------|-------------|------|
| `/services` | `/expertises/web-saas` | 301 |
| `/collaborateurs-ia` | `/expertises/ia` | 301 |
| `/automatisations` | `/expertises/automatisation` | 301 |
| `/catalogue` | `/` | 301 |

### Pages statiques HTML — traitement

**KEEP sans modification (capital SEO — ne pas toucher) :**
```
agence-web-dijon.html         agence-web-lyon.html
agence-web-paris.html         agence-web-troyes.html
site-internet-dijon.html      site-internet-lyon.html
site-internet-paris.html      site-internet-troyes.html
site-ecommerce-dijon.html     site-ecommerce-lyon.html
site-ecommerce-paris.html     site-ecommerce-troyes.html
logo-dijon.html               logo-lyon.html
logo-paris.html               logo-troyes.html
creation-site-vitrine.html    creation-site-ecommerce.html
creation-logo.html            creation-landing-page.html
creation-flyer.html           maintenance-site-web.html
refonte-site-internet.html    identite-visuelle.html
agence-ia-dijon.html          agence-ia-lyon.html
automatisation-pme.html       maintenance-informatique-pme.html
auto-*.html (7 fichiers)      glossaire-ia.html
faq.html                      blog.html
mentions-legales.html         politique-de-confidentialite.html
gestion-des-cookies.html      devis.html
commande-confirmation.html    offline.html
```

**REFACTOR / Intégrer dans le SPA (Phase 2–3) :**
```
realisation-ca-tech-manager.html  → intégrer dans /realisations SPA
realisation-cv-magic.html         → idem
realisation-pasmal.html           → idem
realisation-pemous-money.html     → idem
cas-clients.html                  → transformer en données JSON pour /realisations
```

**ARCHIVE (contenu dépassé par la nouvelle architecture) :**
```
solutions.html          → remplacé par les pages /expertises/*
technologies.html       → contenu à migrer vers les pages expertise
methodologie.html       → contenu à intégrer dans homepage section 05
```

---

## Wireframe textuel — Homepage V2

```
┌────────────────────────────────────────────────┐
│ NAV                                             │
│ [Logo]  ACCUEIL  EXPERTISES▾  RÉALISATIONS      │
│         À PROPOS  CONTACT         [Démarrer →] │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ 01 — HERO                                       │
│ Fond Deep Navy #05101E                          │
│                                                 │
│ Eyebrow : "Cabinet technologique français"      │
│                                                 │
│ Headline (IBM Plex Serif 300, 64px) :           │
│ "Nous concevons les systèmes                    │
│  qui font fonctionner votre entreprise."        │
│                                                 │
│ Corps (IBM Plex Sans 400, 17px, Silver) :       │
│ [1–2 phrases précises sur ce que CA-TECH fait]  │
│                                                 │
│ [Démarrer un diagnostic]  [Voir nos réalisations]│
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ 02 — POSITIONNEMENT ÉDITORIAL                  │
│ Fond surface-1 (#102740)                        │
│                                                 │
│ Headline serif : Phrase précise sur le          │
│ positionnement CA-TECH                          │
│                                                 │
│ Texte 1–2 colonnes (IBM Plex Sans 300, 17px)    │
│ Court — 2 paragraphes max                       │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ 03 — EXPERTISES (4 domaines)                    │
│ Fond Deep Navy                                  │
│                                                 │
│ Layout : 2×2 ou ligne de 4                      │
│ Chaque expertise : titre + une phrase + lien    │
│ Pas de cards avec images stock                  │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ 04 — RÉALISATIONS SÉLECTIONNÉES                │
│ Fond surface-1                                  │
│                                                 │
│ 3 projets : 1 large (featured) + 2 en miniature│
│ Capture d'écran réelle + client + contexte     │
│                                                 │
│ [Voir toutes les réalisations →]               │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ 05 — MÉTHODE                                    │
│ Fond Deep Navy                                  │
│                                                 │
│ 01 Comprendre → 02 Concevoir → 03 Construire   │
│ → 04 Déployer → 05 Améliorer                   │
│                                                 │
│ Chaque étape : numéro + titre + 1 phrase        │
│ Layout horizontal desktop / vertical mobile     │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ 06 — À PROPOS / CONFIANCE                       │
│ Fond surface-1                                  │
│                                                 │
│ Qui est CA-TECH, depuis quand, pourquoi         │
│ Équipe si photos disponibles                    │
│ Pas de stats non sourcées                       │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ 07 — CTA CONTACT                               │
│ Fond Deep Navy → léger gradient Technical Blue  │
│                                                 │
│ Headline serif                                  │
│ [Démarrer un diagnostic gratuit]               │
│ 30 minutes · Gratuit · Compte-rendu écrit       │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ FOOTER                                          │
│ Logo · Expertises · Liens légaux · Contact      │
└────────────────────────────────────────────────┘
```

---

## Wireframe textuel — Page Expertise (template commun)

Structure partagée par les 4 pages `/expertises/*` :

```
┌────────────────────────────────────────────────┐
│ PAGE HERO                                       │
│ Breadcrumb : Accueil / Expertises / [Nom]       │
│ Headline (IBM Plex Serif 300)                   │
│ Intro 1–2 paragraphes maximum                  │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ CE QUE NOUS FAISONS                             │
│ Liste structurée des capacités concrètes        │
│ Technologies et outils nommés                  │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ RÉALISATION LIÉE                               │
│ 1–2 projets concrets dans ce domaine           │
│ Lien vers /realisations                        │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ CTA                                             │
│ [Démarrer un diagnostic]                        │
└────────────────────────────────────────────────┘
```

---

## Considérations technique architecture

Le projet reste **React + Vite + React Router** pour la Phase 02.

La décision d'une éventuelle migration Next.js est **séparée** et documentée indépendamment si nécessaire. Elle n'est PAS préalable à la refonte visuelle.
