# =============================================================================
# CA-TECH — Bootstrap "Usine à clients"
# Script d'initialisation de l'architecture agence multi-clients
# Auteur : CA-TECH
# Date : 2026-08-22
# =============================================================================
# Usage :
#   1. Ouvrez PowerShell (touche Windows, tapez "powershell", Entrée)
#   2. cd C:\Users\JK
#   3. .\bootstrap-ca-tech-clients.ps1
# =============================================================================

$ErrorActionPreference = "Stop"

# Emplacement racine
$root = "$env:USERPROFILE\ca-tech-clients"

Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  CA-TECH — Initialisation de l'usine à clients" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Dossier racine : $root" -ForegroundColor Yellow
Write-Host ""

if (Test-Path $root) {
    Write-Host "[!] Le dossier existe déjà : $root" -ForegroundColor Yellow
    $confirm = Read-Host "Voulez-vous quand même continuer et compléter les fichiers manquants ? (o/N)"
    if ($confirm -ne "o") {
        Write-Host "Abandon." -ForegroundColor Red
        exit
    }
}

# -----------------------------------------------------------------------------
# 1. Création de l'arborescence
# -----------------------------------------------------------------------------
Write-Host "[1/7] Création de l'arborescence..." -ForegroundColor Green

$dirs = @(
    "$root",
    "$root\_template",
    "$root\_template\frontend",
    "$root\_template\frontend\src",
    "$root\_template\frontend\src\hooks",
    "$root\_template\frontend\src\components",
    "$root\_template\frontend\src\pages",
    "$root\_template\frontend\src\lib",
    "$root\_template\frontend\public",
    "$root\_template\supabase",
    "$root\_template\supabase\migrations",
    "$root\_template\supabase\functions",
    "$root\_template\scripts",
    "$root\_shared",
    "$root\_shared\ai-prompts",
    "$root\_shared\components",
    "$root\_shared\edge-functions-lib",
    "$root\_shared\docs-legaux",
    "$root\_shared\assets-agence"
)

foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  + $dir" -ForegroundColor DarkGray
    }
}

# -----------------------------------------------------------------------------
# 2. .gitignore racine
# -----------------------------------------------------------------------------
Write-Host "[2/7] Fichier .gitignore..." -ForegroundColor Green

@"
# Ne JAMAIS committer les credentials clients
client-*/.env
client-*/.env.local
client-*/node_modules/
client-*/dist/
client-*/.vercel/
client-*/supabase/.branches/
client-*/supabase/.temp/

# Template
_template/node_modules/
_template/dist/
_template/.vercel/

# OS
.DS_Store
Thumbs.db
desktop.ini

# IDE
.vscode/
.idea/
*.swp

# Logs
*.log
npm-debug.log*
"@ | Out-File -FilePath "$root\.gitignore" -Encoding UTF8 -Force

# -----------------------------------------------------------------------------
# 3. clients-registry.json
# -----------------------------------------------------------------------------
Write-Host "[3/7] Registre clients..." -ForegroundColor Green

$today = Get-Date -Format "yyyy-MM-dd"
@"
{
  "agency": "CA-TECH",
  "agencyLegalName": "Jean Kévin PEMOU — Entrepreneur individuel",
  "contact": "contact@ca-tech.fr",
  "domain": "ca-tech.fr",
  "created_at": "$today",
  "clients": []
}
"@ | Out-File -FilePath "$root\clients-registry.json" -Encoding UTF8 -Force

# -----------------------------------------------------------------------------
# 4. README racine
# -----------------------------------------------------------------------------
Write-Host "[4/7] Documentation..." -ForegroundColor Green

@"
# CA-TECH — Usine à clients

Architecture agence multi-clients : un template maître, des instances isolées par client.

## Structure

- `_template/` : code générique white-label, source de vérité
- `_shared/` : librairies partagées (prompts IA, composants, docs légaux)
- `client-XX-nom/` : instance dédiée par client (isolée, brandée client)
- `clients-registry.json` : inventaire global

## Créer un nouveau client

``````powershell
cd _template\scripts
.\new-client.ps1 "Nom du Client" "slug-du-client"
``````

## Propager une mise à jour du template à tous les clients

``````powershell
cd _template\scripts
.\update-all-clients.ps1
``````

## Règles d'or

1. **Jamais de custo directement dans un dossier client.** Toute custo réutilisable → remonter dans ``_template/`` avec un feature flag.
2. **Jamais de mention "CA-TECH" dans le code client-facing.** Utiliser les variables de ``config.json``.
3. **Un projet Supabase séparé par client.** Isolation totale des données (RGPD).
4. **Ne jamais committer les ``.env`` clients.** Le ``.gitignore`` les exclut déjà.
5. **Toujours logger les mises à jour de chaque client** dans son ``README.md``.

## Créé le

$today
"@ | Out-File -FilePath "$root\README.md" -Encoding UTF8 -Force

# -----------------------------------------------------------------------------
# 5. Config template
# -----------------------------------------------------------------------------
Write-Host "[5/7] Modèle de configuration client..." -ForegroundColor Green

@"
{
  "clientId": "",
  "clientName": "",
  "clientLegalName": "",
  "brandName": "",
  "domain": "",
  "logoUrl": "/assets/logo.svg",
  "faviconUrl": "/assets/favicon.ico",
  "colors": {
    "primary": "#0066FF",
    "primaryDark": "#0052CC",
    "dark": "#0A2540",
    "accent": "#00D084"
  },
  "supabase": {
    "url": "",
    "anonKey": ""
  },
  "features": {
    "emailDigest": false,
    "invoiceReminders": false,
    "stripeSubscriptions": false,
    "clientPortal": false,
    "aiAssistant": false,
    "smsAlerts": false,
    "whatsappAlerts": false,
    "crmSync": false,
    "weeklyReport": false
  },
  "integrations": {
    "gmail": false,
    "outlook": false,
    "stripe": false,
    "twilio": false,
    "hubspot": false
  },
  "plan": "starter",
  "monthlyPrice": 149,
  "currency": "EUR",
  "showAgencyCredit": true,
  "supportEmail": "support@ca-tech.fr",
  "startDate": ""
}
"@ | Out-File -FilePath "$root\_template\config.template.json" -Encoding UTF8 -Force

# -----------------------------------------------------------------------------
# 6. Script new-client.ps1
# -----------------------------------------------------------------------------
Write-Host "[6/7] Script new-client.ps1..." -ForegroundColor Green

@'
# Usage : .\new-client.ps1 "Nom du Client" "slug-du-client"
param(
    [Parameter(Mandatory=$true)][string]$ClientName,
    [Parameter(Mandatory=$true)][string]$ClientSlug
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path "$PSScriptRoot\..\.."
$templateDir = Resolve-Path "$PSScriptRoot\.."

# Numéro incrémental
$existing = Get-ChildItem -Path $root -Directory -Filter "client-*" -ErrorAction SilentlyContinue
$nextNum = "{0:D2}" -f ($existing.Count + 1)
$clientDir = "$root\client-$nextNum-$ClientSlug"

if (Test-Path $clientDir) {
    Write-Host "[!] Le client existe déjà : $clientDir" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Création du client : $ClientName" -ForegroundColor Cyan
Write-Host "Dossier : $clientDir" -ForegroundColor Yellow
Write-Host ""

# Structure
$subDirs = @("frontend", "supabase", "docs", "billing", "conversations", "assets")
foreach ($sub in $subDirs) {
    New-Item -ItemType Directory -Path "$clientDir\$sub" -Force | Out-Null
}

# Copie du template frontend
if (Test-Path "$templateDir\frontend") {
    Copy-Item -Path "$templateDir\frontend\*" -Destination "$clientDir\frontend\" -Recurse -Force
}

# Copie du template supabase
if (Test-Path "$templateDir\supabase") {
    Copy-Item -Path "$templateDir\supabase\*" -Destination "$clientDir\supabase\" -Recurse -Force
}

# Génération config.json
$configTemplate = Get-Content "$templateDir\config.template.json" -Raw
$today = Get-Date -Format "yyyy-MM-dd"
$config = $configTemplate `
    -replace '"clientId": ""', "`"clientId`": `"$ClientSlug`"" `
    -replace '"clientName": ""', "`"clientName`": `"$ClientName`"" `
    -replace '"startDate": ""', "`"startDate`": `"$today`""
$config | Out-File -FilePath "$clientDir\config.json" -Encoding UTF8 -Force

# .env vierge
@"
# $ClientName — Variables d'environnement
# NE PAS COMMITTER CE FICHIER

# Supabase (projet dédié à ce client)
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# Anthropic (API Claude — clé CA-TECH)
ANTHROPIC_API_KEY=

# Stripe (compte du client OU Connect account)
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Google OAuth (credentials CA-TECH partagés)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

# Twilio (optionnel — SMS/WhatsApp)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Vercel deployment
VERCEL_PROJECT_ID=
VERCEL_TOKEN=
"@ | Out-File -FilePath "$clientDir\.env" -Encoding UTF8 -Force

# README client
@"
# $ClientName

**Client n° $nextNum**
**Créé le :** $today
**Slug :** ``$ClientSlug``
**Dossier :** ``client-$nextNum-$ClientSlug``

---

## Fiche contact

- Nom du contact principal :
- Email :
- Téléphone :
- Fonction :
- Site web :

## Contrat commercial

- Date de signature :
- Formule : Starter / Pro / Business
- Prix mensuel : XX € HT
- Frais d'installation : XX € HT
- Engagement : X mois

## Modules activés

- [ ] Email Digest IA
- [ ] Relances impayés automatiques
- [ ] Abonnements Stripe
- [ ] Portail client
- [ ] Assistant IA
- [ ] Alertes SMS
- [ ] Alertes WhatsApp
- [ ] Sync CRM
- [ ] Rapport hebdomadaire

## Environnements techniques

| Élément | Valeur |
|---|---|
| Domaine | à définir |
| Projet Supabase | à créer |
| Projet Vercel | à créer |
| Compte Stripe | à connecter |
| Google OAuth | redirect URI à ajouter |

## Roadmap onboarding

- [ ] J0 : Signature contrat + acompte
- [ ] J+1 : Kick-off (1h visio)
- [ ] J+3 : Création projet Supabase + Vercel
- [ ] J+5 : Configuration OAuth + branding
- [ ] J+7 : Livraison v1 + démo
- [ ] J+10 : Formation utilisateur (1h)
- [ ] J+14 : Mise en production
- [ ] J+30 : Bilan mois 1

## Historique des changements

| Date | Version | Modification | Par |
|---|---|---|---|
| $today | v0.1 | Création du dossier client | CA-TECH |

## Notes internes

(Réservé aux notes CA-TECH, jamais partagé au client)
"@ | Out-File -FilePath "$clientDir\README.md" -Encoding UTF8 -Force

# Mise à jour du registre
$registryPath = "$root\clients-registry.json"
if (Test-Path $registryPath) {
    $registry = Get-Content $registryPath -Raw | ConvertFrom-Json
    $newEntry = [PSCustomObject]@{
        id = "client-$nextNum-$ClientSlug"
        name = $ClientName
        startDate = $today
        plan = "starter"
        status = "onboarding"
    }
    $registry.clients += $newEntry
    $registry | ConvertTo-Json -Depth 10 | Out-File -FilePath $registryPath -Encoding UTF8 -Force
}

Write-Host ""
Write-Host "[OK] Client créé avec succès !" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines étapes :" -ForegroundColor Cyan
Write-Host "  1. Remplir $clientDir\.env avec les credentials" -ForegroundColor White
Write-Host "  2. Créer un projet Supabase dédié sur supabase.com" -ForegroundColor White
Write-Host "  3. Éditer $clientDir\config.json (branding, features)" -ForegroundColor White
Write-Host "  4. Créer un projet Vercel connecté à ce dossier" -ForegroundColor White
Write-Host "  5. Documenter le contrat dans $clientDir\README.md" -ForegroundColor White
Write-Host ""
'@ | Out-File -FilePath "$root\_template\scripts\new-client.ps1" -Encoding UTF8 -Force

# -----------------------------------------------------------------------------
# 7. Prompts IA de base + docs légaux
# -----------------------------------------------------------------------------
Write-Host "[7/7] Prompts IA et docs légaux..." -ForegroundColor Green

# Prompt classifieur email
@"
# Prompt : Classification d'email

Tu es un assistant email pour un professionnel français.
Classe l'email suivant en UNE SEULE catégorie parmi :

- **Prospect** : demande d'information commerciale d'un nouveau contact
- **Client** : email d'un client existant (question, réclamation, demande)
- **Fournisseur** : email d'un fournisseur (facture, devis, communication)
- **Administratif** : email institutionnel (banque, URSSAF, comptable, impôts)
- **Urgent** : nécessite une action immédiate (moins de 24h)
- **Spam** : à ignorer (publicité non sollicitée, newsletter)

Réponds UNIQUEMENT au format JSON strict :
{"category": "...", "confidence": 0.0-1.0, "reason": "..."}
"@ | Out-File -FilePath "$root\_shared\ai-prompts\email-classifier.md" -Encoding UTF8 -Force

# Prompt résumé email
@"
# Prompt : Résumé d'email

Tu es un assistant email pour un professionnel français surchargé.
Résume l'email suivant en 2 lignes maximum en français professionnel.

Puis détermine :
1. Si une action est attendue de la part du destinataire (oui/non)
2. Si oui, quelle action précise (verbale claire, max 15 mots)
3. Le degré d'urgence : faible / moyen / élevé

Réponds UNIQUEMENT au format JSON strict :
{
  "summary": "...",
  "action_needed": true/false,
  "action_text": "...",
  "urgency": "faible|moyen|élevé"
}
"@ | Out-File -FilePath "$root\_shared\ai-prompts\email-summarizer.md" -Encoding UTF8 -Force

# Prompt relance facture
@"
# Prompt : Génération de relance facture

Tu es assistant comptable pour une entreprise française.
Génère une relance d'impayé au ton adapté au stade (défini en input).

Stades disponibles :
- **douce** (J+1 à J+7) : rappel courtois, présumer un oubli
- **ferme** (J+8 à J+21) : rappel avec mention des CGV
- **mise_en_demeure** (J+22 à J+45) : formelle, mention art. L441-10 CGI, indemnité 40 €, pénalités BCE+10pts
- **escalade** (J+46+) : avant recours

Variables disponibles :
- {client_name} : nom du client
- {invoice_number} : numéro facture
- {invoice_amount} : montant TTC
- {due_date} : date échéance
- {days_overdue} : jours de retard

Réponds au format JSON strict :
{
  "subject": "...",
  "body_text": "...",
  "body_html": "..."
}

Toujours signer :
{sender_name}
{sender_company}
{sender_email}
"@ | Out-File -FilePath "$root\_shared\ai-prompts\invoice-reminder.md" -Encoding UTF8 -Force

# Doc légal : CGV type SaaS (squelette)
@"
# CGV TYPE — Prestation SaaS agence CA-TECH

**À personnaliser pour chaque client avant signature.**
**À faire relire par un juriste avant première utilisation en production.**

## Article 1 — Objet
Les présentes conditions générales de vente régissent la fourniture par CA-TECH (Jean Kévin PEMOU, entrepreneur individuel, SIRET [xxx]) d'un service logiciel en ligne (SaaS) au client identifié dans le devis associé.

## Article 2 — Prestations
- Accès à la plateforme white-label configurée aux couleurs du client
- Hébergement sécurisé des données (Supabase, région UE)
- Maintenance corrective et évolutive
- Support par email (délai selon formule)

## Article 3 — Prix et modalités
- Abonnement mensuel HT selon formule (Starter/Pro/Business)
- Prélèvement automatique par Stripe le X du mois
- Frais d'installation one-shot facturés à la signature
- Engagement minimum : X mois

## Article 4 — Durée et résiliation
- Reconduction tacite mensuelle
- Résiliation avec préavis de 30 jours par email à contact@ca-tech.fr
- Aucun remboursement du mois en cours

## Article 5 — Propriété intellectuelle
Le code source de la plateforme reste la propriété exclusive de CA-TECH. Le client dispose d'un droit d'usage personnel non transférable.

## Article 6 — Données personnelles (RGPD)
- Le client est responsable de traitement, CA-TECH est sous-traitant
- Données hébergées en UE (Frankfurt)
- Un DPA (Data Processing Agreement) est signé en annexe
- Suppression des données sur demande sous 30 jours après résiliation

## Article 7 — Disponibilité
- SLA de disponibilité : 99% mensuel
- Interruptions programmées annoncées 48h à l'avance

## Article 8 — Responsabilité
La responsabilité de CA-TECH est limitée au montant HT payé sur les 3 derniers mois.

## Article 9 — Pénalités de retard
En cas de retard de paiement : pénalités au taux BCE + 10 points, indemnité forfaitaire de recouvrement de 40 € (art. L441-10 du Code de commerce).

## Article 10 — Droit applicable
Droit français. Tribunal compétent : [Ville du siège CA-TECH].

---

**Fait à ______________, le ______________**

**Le client** _______________________  **CA-TECH** _______________________
(cachet + signature)                    (signature)
"@ | Out-File -FilePath "$root\_shared\docs-legaux\CGV-type-SaaS.md" -Encoding UTF8 -Force

# Docs légal : DPA type
@"
# ACCORD DE TRAITEMENT DES DONNÉES (DPA)

Annexe au contrat de prestation SaaS entre le Client (responsable de traitement) et CA-TECH (sous-traitant).

Conforme à l'article 28 du RGPD (règlement UE 2016/679).

## 1. Objet du traitement
Traitement de données personnelles nécessaires à la fourniture du service SaaS convenu.

## 2. Nature et finalité
- Hébergement et traitement des emails du client
- Analyse par IA (classification, résumé)
- Génération automatique de réponses
- Reporting

## 3. Catégories de données
- Adresses email et noms d'expéditeurs/destinataires
- Contenu des emails
- Métadonnées (dates, sujets)

## 4. Personnes concernées
Correspondants du client (clients, prospects, fournisseurs).

## 5. Sous-traitants ultérieurs autorisés
- Supabase Inc. (hébergement PostgreSQL, région Frankfurt)
- Anthropic PBC (traitement IA via API Claude)
- Vercel Inc. (hébergement frontend)
- Google LLC (accès API Gmail via OAuth)

Le client est informé et accepte ces sous-traitants.

## 6. Durée du traitement
Durée du contrat + 30 jours pour la suppression.

## 7. Mesures de sécurité
- Chiffrement TLS 1.3 en transit
- Chiffrement AES-256 au repos
- Row Level Security (RLS) sur toutes les tables
- Authentification OAuth 2.0
- Logs d'accès conservés 90 jours

## 8. Droits des personnes
Le sous-traitant assiste le responsable de traitement dans la mise en œuvre des droits d'accès, rectification, effacement, portabilité.

## 9. Notification de violation
En cas de faille de sécurité affectant les données personnelles, CA-TECH notifie le client sous 48h.

## 10. Fin du contrat
Sur demande écrite, CA-TECH restitue ou supprime les données du client sous 30 jours et fournit un certificat de destruction.
"@ | Out-File -FilePath "$root\_shared\docs-legaux\DPA-type-RGPD.md" -Encoding UTF8 -Force

# README _template
@"
# Template maître

Ce dossier contient le code source générique white-label qui sera cloné pour chaque nouveau client.

## Contenu

- ``frontend/`` : application React/Vite générique
- ``supabase/`` : migrations SQL et edge functions génériques
- ``scripts/`` : outils d'automatisation (new-client.ps1, update-all-clients.ps1)
- ``config.template.json`` : modèle de configuration client

## Règles

1. **Aucun code spécifique à un client ici.** Toute custo client se fait via ``config.json``.
2. **Aucune mention "CA-TECH" en dur.** Utiliser les variables du config.
3. **Tester le template avant chaque release** (build sans erreur, migrations valides).
4. **Documenter les breaking changes** dans ce README avant de propager.

## Créer un nouveau client depuis ce template

``````powershell
cd scripts
.\new-client.ps1 "Nom du Client" "slug-du-client"
``````
"@ | Out-File -FilePath "$root\_template\README.md" -Encoding UTF8 -Force

# -----------------------------------------------------------------------------
# Récapitulatif
# -----------------------------------------------------------------------------
Write-Host ""
Write-Host "===================================================" -ForegroundColor Green
Write-Host "  ARCHITECTURE CRÉÉE AVEC SUCCÈS" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Emplacement : $root" -ForegroundColor Yellow
Write-Host ""
Write-Host "Structure créée :" -ForegroundColor Cyan
Write-Host "  _template/       (template maître à peupler)"
Write-Host "  _shared/         (bibliothèques communes + prompts IA)"
Write-Host "  clients-registry.json"
Write-Host "  README.md"
Write-Host "  .gitignore"
Write-Host ""
Write-Host "PROCHAINES ETAPES :" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. Peupler le template (cette semaine) :"
Write-Host "     cd $root\_template"
Write-Host "     claude  (Claude Code)"
Write-Host "     Puis coller le prompt fourni par votre consultant"
Write-Host ""
Write-Host "  2. Initialiser Git :"
Write-Host "     cd $root"
Write-Host "     git init"
Write-Host "     git add ."
Write-Host "     git commit -m ""Initial architecture agence"""
Write-Host ""
Write-Host "  3. Creer votre premier client :"
Write-Host "     cd $root\_template\scripts"
Write-Host "     .\new-client.ps1 ""Nom Client"" ""slug-client"""
Write-Host ""
Write-Host "Bon travail !" -ForegroundColor Green
Write-Host ""
