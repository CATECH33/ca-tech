# MANAGER V2 — RAPPORT DE BASCULE CODE

**Date** : 2026-08-10  
**Sprint** : 7.1 — Application du mapping Supabase V2  
**Périmètre** : Remplacement `quote_items` → `devis_items` + colonne `total`  
**Règle** : Aucune modification Supabase, aucune suppression de données

---

## FICHIERS MODIFIÉS

### 1. `src/hooks/useDevis.ts`

**Ligne 35 — Suppression du fallback `quote_items`**

```typescript
// AVANT
lignes: (row.devis_items ?? row.quote_items ?? []).map((i: any) => ({

// APRÈS
lignes: (row.devis_items ?? []).map((i: any) => ({
```

**Raison** : `quote_items` est vide (0 ligne en base). Le fallback était du code mort.  
`devis_items` est la source confirmée (49 lignes, 29 devis couverts — décision D4 Sprint 5).

---

### 2. `src/hooks/useServices.ts`

**Lignes 40–41 — `useServiceStats()` : table + colonne**

```typescript
// AVANT
supabase.from('quote_items').select('service_id, total_price').not('service_id', 'is', null),
supabase.from('invoice_items').select('service_id, total_price').not('service_id', 'is', null),
// ...
stats[item.service_id].ca += Number(item.total_price ?? 0)

// APRÈS
supabase.from('devis_items').select('service_id, total').not('service_id', 'is', null),
supabase.from('invoice_items').select('service_id, total').not('service_id', 'is', null),
// ...
stats[item.service_id].ca += Number(item.total ?? 0)
```

**Raison** : `quote_items` était vide — les stats services ne comptabilisaient pas les devis.  
La colonne dans `devis_items` est `total` (pas `total_price`). Idem dans `invoice_items`.

---

### 3. `src/hooks/useClients.ts` *(corrigé Sprint 7 Phase A — rappel)*

**Lignes 164–171 — `useClientDevis()` : table + colonne**

```typescript
// AVANT
.from('quotes')
.select('id, quote_number, total, status, created_at')
// ...
numero: r.quote_number as string,

// APRÈS
.from('devis')
.select('id, devis_number, total, status, created_at')
// ...
numero: r.devis_number as string,
```

---

## ANCIENNES RÉFÉRENCES SUPPRIMÉES

| Référence | Fichier | Type |
|---|---|---|
| `.from('quote_items')` | `useServices.ts:40` | Table obsolète |
| `'service_id, total_price'` (select quote_items) | `useServices.ts:40` | Colonne inexistante |
| `'service_id, total_price'` (select invoice_items) | `useServices.ts:41` | Colonne inexistante |
| `item.total_price` | `useServices.ts:48` | Colonne inexistante |
| `?? row.quote_items ?? []` | `useDevis.ts:35` | Fallback mort |

---

## NOUVELLES RÉFÉRENCES UTILISÉES

| Référence | Fichier | Vérifié |
|---|---|---|
| `.from('devis_items')` | `useServices.ts:40` | ✅ Table : 49 lignes |
| `'service_id, total'` | `useServices.ts:40` | ✅ Colonne : `total` dans `devis_items` |
| `'service_id, total'` | `useServices.ts:41` | ✅ Colonne : `total` dans `invoice_items` |
| `item.total` | `useServices.ts:48` | ✅ Cohérent avec les deux tables |
| `(row.devis_items ?? [])` | `useDevis.ts:35` | ✅ Source unique confirmée |

---

## VÉRIFICATION POST-MODIFICATION

### Grep `quote_items` dans `src/`

```
No matches found
```

✅ Zéro référence active restante dans le code source.

### Grep `devis_items` dans `src/`

```
src/hooks/useDevis.ts    — lignes 35, 88, 107, 145, 155, 193, 195, 206, 244, 253
src/hooks/useServices.ts — ligne 40
```

✅ 11 références cohérentes — toutes correctes.

### Grep `invoice_items` dans `src/`

```
src/hooks/useDevis.ts    — ligne 283
src/hooks/useFactures.ts — lignes 39, 81, 137, 147, 180, 182, 193, 212, 229, 273, 321, 330
src/hooks/useServices.ts — ligne 41
```

✅ 14 références cohérentes — toutes correctes.

---

## TESTS EFFECTUÉS

### TypeScript — `tsc --noEmit`

```
(aucune sortie)
```

✅ **0 erreur TypeScript**

### ESLint — fichiers modifiés

```
0 errors, 11 warnings (no-explicit-any)
```

✅ **0 erreur ESLint** — les 11 warnings `no-explicit-any` sont préexistants  
(pattern `mapRow`/`mapClient` avec `any` présent dans tous les hooks avant modification)

### Build — `npm run build`

```
✓ 3570 modules transformed
✓ built in 3.88s
```

✅ **Build réussi**

Le warning sur les chunks `> 500 kB` (vendor-pdf, vendor-charts) est préexistant et sans lien avec ces modifications.

---

## IMPACT FONCTIONNEL

| Fonctionnalité | Avant | Après |
|---|---|---|
| Onglet "Devis" dans fiches clients | Toujours vide (queries `quotes`, 0 lignes) | Affiche les vrais devis (queries `devis`) |
| Stats CA par service | Basé sur `invoice_items` uniquement | Basé sur `devis_items` + `invoice_items` |
| Lignes devis (mapRow) | Fallback `quote_items` mort | Direct `devis_items` |

---

MANAGER V2 — BASCULE CODE APPLIQUÉE — BUILD VALIDÉ
