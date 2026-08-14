# SPRINT 11.2 — NAVIGATION MANAGER V2
## Rapport de migration navigation

**Date :** 2026-08-14  
**Sprint :** 11.2  
**Périmètre :** Navigation sidebar V2, routes, breadcrumbs — aucune logique métier touchée

---

## 1. NAVIGATION V2 — 9 SECTIONS

| # | Libellé sidebar | Route principale | Statut |
|---|---|---|---|
| 1 | Vue d'ensemble | `/` | ✅ Existant |
| 2 | Contacts & demandes | `/contacts` | ✅ Nouvelle page V2 (Sprint 11.3) |
| 3 | Clients | `/clients` | ✅ Existant |
| 4 | Devis | `/devis` | ✅ Existant |
| 5 | Paiements & abonnements | `/paiements` | ✅ Existant |
| 6 | Loïc IA | `/loic` | ✅ Existant |
| 7 | Prospection | `/prospection` | ✅ Existant |
| 8 | Google Workspace | `/google` | ✅ Alias → Integrations |
| 9 | Paramètres | `/parametres` | ✅ Existant (bas de sidebar) |

---

## 2. ROUTES CONSERVÉES (V1 — aucune supprimée)

| Route V1 | Composant | Note |
|---|---|---|
| `/` | Dashboard | Inchangé |
| `/demandes/*` | DemandesDevis | Conservé (entrée directe toujours possible) |
| `/clients/*` | Clients | Inchangé |
| `/leads/*` | Leads | Conservé (regroupé sous Contacts V2) |
| `/devis/*` | Devis | Inchangé |
| `/factures/*` | Factures | Conservé (accessible directement) |
| `/projets/*` | Projets | Conservé |
| `/taches/*` | Taches | Conservé |
| `/services/*` | Services | Conservé |
| `/paiements/*` | Paiements | Inchangé |
| `/portfolio/*` | Portfolio | Conservé |
| `/agenda/*` | Agenda | Conservé |
| `/messages/*` | Messages | Conservé (regroupé sous Contacts V2) |
| `/support/*` | Support | Conservé |
| `/parametres/*` | Parametres | Inchangé |
| `/integrations` | Integrations | Conservé (alias `/google`) |
| `/documents/*` | Documents | Conservé |
| `/loic/*` | Loic | Inchangé |
| `/notifications/*` | Notifications | Conservé |
| `/prospection` | ProspectionCommercialDashboard | Inchangé |
| `/prospection/ia` | ProspectionDashboard | Inchangé |
| `/prospection/prospects` | ProspectionProspects | Inchangé |
| `/prospection/recherche` | ProspectionRecherche | Inchangé |
| `/prospection/qualification` | ProspectionQualification | Inchangé |
| `/prospection/brouillons` | ProspectionBrouillons | Inchangé |
| `/prospection/campagnes` | ProspectionCampagnes | Inchangé |
| `/prospection/relances` | ProspectionRelances | Inchangé |
| `/prospection/statistiques` | ProspectionStatistiques | Inchangé |
| `/prospection/config` | ProspectionParametres | Inchangé |
| `/prospection/pipeline` | ProspectionPipeline | Inchangé |
| `/prospection/prospects/:id` | ProspectionProspectDetail | Inchangé |
| `/prospection/connecteurs` | ProspectionConnecteurs | Inchangé |
| `/catalogue/services` | CatalogueServices | Conservé |
| `/catalogue/services/new` | CatalogueServiceForm | Conservé |
| `/catalogue/services/:id/edit` | CatalogueServiceForm | Conservé |
| `/catalogue/collaborateurs` | CatalogueCollaborateurs | Conservé |
| `/catalogue/collaborateurs/new` | CatalogueCollaborateurForm | Conservé |
| `/catalogue/collaborateurs/:id/edit` | CatalogueCollaborateurForm | Conservé |
| `/auth/google/callback` | GoogleOAuthCallback | Conservé |

**Total routes V1 conservées : 39 — aucune supprimée**

---

## 3. NOUVELLES ROUTES V2

| Route V2 | Composant | Description |
|---|---|---|
| `/contacts/*` | `Contacts` (pages/Contacts.tsx) | Page unifiée Sprint 11.3 — onglets Leads + Messages |
| `/google` | GoogleWorkspaceV2 → Integrations | Alias vers page Integrations (page dédiée = sprint suivant) |

---

## 4. REGROUPEMENTS V2

### Contacts & demandes (`/contacts`)
Regroupe dans une interface unifiée à onglets :
- Leads (kanban drag-drop + vue liste + fiche latérale) ← anciennement `/leads`
- Messages (interface 3-panel : dossiers / liste / détail) ← anciennement `/messages` et `/demandes`

### Clients (`/clients`)
- Fiches clients
- Historique client
- Conversion depuis leads

### Devis (`/devis`)
- Devis (création, édition, PDF)
- Lignes de devis
- Factures accessibles via `/factures/*`

### Paiements & abonnements (`/paiements`)
- Paiements
- Acomptes
- Soldes
- Abonnements (Stripe)

### Loïc IA (`/loic`)
- Conversations IA
- Actions Loïc
- Génération de contenu

### Prospection (`/prospection`)
- Dashboard commercial
- Prospects (liste, détail, pipeline)
- Recherche IA
- Qualification IA
- Brouillons emails
- Campagnes
- Relances
- Statistiques
- Connecteurs (Apify)

### Google Workspace (`/google`)
- Intégrations Gmail / Drive / Calendar (page dédiée = sprint suivant)
- Actuellement alias vers Integrations

### Paramètres (`/parametres`)
- Configuration compte
- Sécurité
- Catalogue services (`/catalogue/services`)
- Collaborateurs IA (`/catalogue/collaborateurs`)

---

## 5. FICHIERS MODIFIÉS

| Fichier | Nature | Modification |
|---|---|---|
| `manager/src/components/layout/Sidebar.tsx` | Modifié | Labels mis à jour : "Contacts & demandes", "Paiements & abonnements" |
| `manager/src/components/layout/Breadcrumbs.tsx` | Modifié | Labels : paiements → "Paiements & abonnements", contacts/google/integrations |
| `manager/src/App.tsx` | Modifié | Routes `/contacts/*` et `/google` ajoutées, import Contacts |

---

## 6. FICHIERS CRÉÉS

| Fichier | Description |
|---|---|
| `manager/src/pages/Contacts.tsx` | Page unifiée Contacts & demandes (Sprint 11.3) — 650+ lignes |
| `SPRINT_11_2_NAVIGATION_REPORT.md` | Ce rapport |

---

## 7. CONTRÔLES D'INTÉGRITÉ

| Contrôle | Résultat |
|---|---|
| Fichiers supprimés | **0** |
| Tables Supabase modifiées | **0** |
| Données supprimées | **0** |
| Hooks métier modifiés | **0** |
| Edge Functions modifiées | **0** |
| Logique Stripe modifiée | **0** |

---

## 8. DONNÉES PRÉSERVÉES

| Table | Lignes | Statut |
|---|---|---|
| clients | 2 | ✅ Intact |
| devis | 33 | ✅ Intact |
| invoices | 4 | ✅ Intact (amount_paid=180, sans payment associé) |
| payments | 4 | ✅ Intact |
| devis_items | 50 | ✅ Intact |
| manager_users | 1 | ✅ Intact |

---

## 9. RESPONSIVE

| Breakpoint | Comportement | Statut |
|---|---|---|
| Desktop (≥768px) | Sidebar fixe 220px (ou 60px réduite), main content décalé via CSS var | ✅ |
| Tablette (≥768px) | Idem desktop, sidebar collapsible | ✅ |
| Mobile (<768px) | Sidebar masquée (`-translate-x-full`), overlay noir sur ouverture, hamburger via Header | ✅ |

---

## 10. RÉSULTATS BUILD

```
TypeScript (tsc -b) : ✅ 0 erreur
Vite build          : ✅ 3573 modules transformés
Chunks générés      : 83
Build time          : 3.53s
Layout chunk        : 17.53 kB (gzip: 5.37 kB)
Contacts chunk      : 47.08 kB (gzip: 11.06 kB)
```

---

## 11. VÉRIFICATION DES SECTIONS

| Section | Route | Composant | Accessible |
|---|---|---|---|
| Dashboard | `/` | Dashboard | ✅ |
| Contacts | `/contacts` | Contacts (Leads + Messages) | ✅ |
| Clients | `/clients` | Clients | ✅ |
| Devis | `/devis` | Devis | ✅ |
| Paiements | `/paiements` | Paiements | ✅ |
| Loïc IA | `/loic` | Loic | ✅ |
| Prospection | `/prospection` | ProspectionCommercialDashboard | ✅ |
| Google Workspace | `/google` | GoogleWorkspaceV2 | ✅ |
| Paramètres | `/parametres` | Parametres | ✅ |

---

**SPRINT 11.2 TERMINÉ — NAVIGATION MANAGER V2 INSTALLÉE — DONNÉES PRÉSERVÉES**
