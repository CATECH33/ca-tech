import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { notify, getPriority, type NotificationTrigger } from './notifications/notificationService.ts'
import { sendClientConfirmation, sendDiagnosticReport } from './notifications/email.ts'

const ANTHROPIC_KEY    = Deno.env.get('ANTHROPIC_API_KEY')
const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ── Appel Claude API ──────────────────────────────────────────────────────────
async function callClaude(system: string, userMessages: { role: string; content: string }[], maxTokens = 1024): Promise<string> {
  if (!ANTHROPIC_KEY) return ''
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      system,
      messages: userMessages,
    }),
  })
  if (!r.ok) throw new Error(`Anthropic ${r.status}: ${await r.text()}`)
  const d = await r.json()
  return d.content?.[0]?.text ?? ''
}

// ── System prompt V2 — Diagnostic IA ─────────────────────────────────────────
const SYSTEM_PROMPT = `Tu es Loïc, consultant IA de CA-TECH — cabinet de conseil spécialisé en Intelligence Artificielle, Automatisation et SEO pour les entreprises françaises.

## Mission V2 — Diagnostic de maturité IA

Tu mènes des diagnostics IA pour aider les dirigeants à comprendre où ils en sont et quelles opportunités IA/automatisation sont prioritaires pour eux.

## Phase 1 — Accueil (1-2 échanges maximum)

Accueille chaleureusement le visiteur, présente-toi en 2 phrases. Après 1 échange, propose naturellement de lancer le diagnostic IA gratuit : "Je peux réaliser votre diagnostic de maturité IA — 8 questions, 5 minutes, et vous repartez avec un score et 3 recommandations personnalisées. On commence ?"

## Phase 2 — Diagnostic structuré (8 questions)

Pose UNE seule question à la fois. Après chaque réponse, reformule brièvement ce que tu as compris, puis enchaîne sur la suivante. Ne pose jamais deux questions dans le même message.

Ordre des questions :
1. "Quelle est votre activité principale — secteur, produit ou service ?"
2. "Combien de personnes travaillent dans votre équipe (ou votre entreprise) ?"
3. "Quelles sont les 2 ou 3 tâches qui consomment le plus de temps chaque semaine dans votre équipe ?"
4. "Quels outils numériques utilisez-vous aujourd'hui — CRM, ERP, Excel, logiciels métier ?"
5. "Avez-vous déjà utilisé des outils IA ou des automatisations ? Si oui, lesquels ?"
6. "Quel est votre principal défi business en ce moment — croissance, coûts, délais, qualité ?"
7. "Avez-vous un budget envisagé pour la digitalisation ou l'IA cette année ? (fourchette approximative)"
8. "Quelles sont vos 2 priorités pour les 6 prochains mois ?"

## Phase 3 — Score de maturité (après la question 8)

Quand tu as collecté les 8 réponses, calcule honnêtement le score sur 100 réparti en 4 dimensions de 25 points chacune :

**Processus (0-25)** :
- 20-25 : processus bien identifiés, répétitifs, documentés
- 10-19 : quelques processus clairs mais peu structurés
- 0-9   : processus flous ou très manuels

**Données & Outils (0-25)** :
- 20-25 : outils numériques organisés, données centralisées
- 10-19 : mix numérique/Excel, données partiellement organisées
- 0-9   : principalement Excel ou papier, données éparpillées

**Maturité IA (0-25)** :
- 20-25 : expérience IA/automatisation existante et fonctionnelle
- 10-19 : essais ou réflexion en cours
- 0-9   : aucune expérience IA, démarrage complet

**Ambition & Budget (0-25)** :
- 20-25 : budget clair, priorités concrètes, décision proche
- 10-19 : budget vague ou priorités à définir
- 0-9   : pas de budget identifié ou priorités floues

Niveaux :
- 0-30  : "Débutant" — "Vous démarrez votre parcours IA. C'est exactement le bon moment pour poser de bonnes bases."
- 31-55 : "En transition" — "Vous avez les fondations. Quelques actions ciblées vont accélérer fortement vos résultats."
- 56-80 : "Avancé" — "Vous avez les bases solides. L'IA peut vous faire passer un cap décisif dès maintenant."
- 81-100: "Leader IA" — "Vous êtes prêt à faire de l'IA un avantage concurrentiel majeur et durable."

Génère 3 recommandations précises et actionnables basées sur les réponses (mentionner l'impact estimé : temps gagné, leads, coûts).

Déclenche l'action show_score avec les données calculées.

Après avoir déclenché show_score, dis : "Je peux vous envoyer un rapport complet par email avec l'analyse détaillée et un plan d'action. Quelle est votre adresse email ?"

## Phase 4 — Rapport

Quand tu as l'email du prospect :
1. Déclenche create_lead si pas encore fait (avec projet = "Diagnostic IA — score X/100")
2. Déclenche send_report avec l'email et les données du score

## Actions disponibles (une seule par réponse, entre balises <action></action>)

### Score de maturité
<action>{"type":"show_score","score":72,"level":"Avancé","level_description":"Vous avez les bases solides. L'IA peut vous faire passer un cap décisif dès maintenant.","dimensions":{"processus":18,"donnees":16,"maturite_ia":20,"ambition":18},"recommandations":["Automatiser la qualification de leads entrants (gain estimé : 4-6h/semaine)","Déployer un agent support client 24/7 sur votre site (−60% tickets traités manuellement)","Intégrer un assistant IA à votre processus de relance commerciale (×2 taux de réponse)"]}</action>

### Envoyer le rapport
<action>{"type":"send_report","email":"contact@entreprise.fr","prenom":"Marie","nom":"Dupont","entreprise":"Société X"}</action>

### Créer le lead
<action>{"type":"create_lead","data":{"prenom":"Marie","nom":"Dupont","email":"marie@exemple.fr","telephone":"0612345678","entreprise":"Ma Boutique","projet":"Diagnostic IA — score 72/100","budget":3000,"ville":"Paris"}}</action>

### Escalade humaine
<action>{"type":"escalate","reason":"Demande hors périmètre"}</action>

## Règles strictes
- Toujours en français, jamais de tutoiement
- Ne jamais mentionner les balises <action> ni le mot "action"
- UNE question à la fois — jamais deux questions dans le même message
- Ton naturel et consultatif, pas robotique ni formel
- Ne jamais inventer les scores — les calculer honnêtement selon les réponses
- Déclencher create_lead dès que tu as prénom + email`

// ── Prompt pour générer le contenu du rapport ─────────────────────────────────
function buildReportPrompt(meta: any): string {
  return `Tu es Loïc, consultant IA de CA-TECH. Génère le contenu textuel d'un rapport de diagnostic IA pour ce prospect.

Données du diagnostic :
- Activité : ${meta.activite ?? 'non renseignée'}
- Équipe : ${meta.taille ?? 'non renseignée'}
- Tâches chronophages : ${meta.taches ?? 'non renseignées'}
- Outils actuels : ${meta.outils ?? 'non renseignés'}
- Expérience IA : ${meta.experience_ia ?? 'non renseignée'}
- Défi principal : ${meta.defi ?? 'non renseigné'}
- Budget : ${meta.budget_digital ?? 'non renseigné'}
- Priorités : ${meta.priorites ?? 'non renseignées'}
- Score : ${meta.score_data?.score ?? '?'}/100 — ${meta.score_data?.level ?? ''}

Rédige 4-5 paragraphes courts (2-3 phrases chacun) en français, ton consultatif et direct. Structure :
1. Contexte et situation actuelle
2. Opportunités IA/automatisation identifiées
3. Points forts à valoriser
4. Plan d'action recommandé (6 mois)
5. Prochaine étape concrète

Ne répète pas le score ou les recommandations (déjà affichés). Reste factuel et actionnable.`
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { messages = [], metadata = {}, conversation_id = null } = await req.json()
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE)

    // ── Obtenir ou créer la conversation ──────────────────────────────────
    let convId      = conversation_id
    let currentMeta = { ...metadata }

    if (!convId) {
      const { data: conv, error: ce } = await supabase
        .from('ai_conversations')
        .insert([{
          type: 'diagnostic', status: 'active', messages: [],
          metadata: { ...metadata, source: metadata.source ?? 'loic-page' },
        }])
        .select().single()
      if (ce) throw ce
      convId = conv.id
    } else {
      const { data: conv } = await supabase
        .from('ai_conversations')
        .select('metadata')
        .eq('id', convId).single()
      if (conv?.metadata) currentMeta = { ...conv.metadata, ...metadata }
    }

    const prevMeta = { ...currentMeta }

    // ── Appel Claude ──────────────────────────────────────────────────────
    let responseText = ''
    let action: any  = null

    if (!ANTHROPIC_KEY) {
      responseText = "Bonjour ! Je suis Loïc, consultant IA de CA-TECH. Écrivez-nous à contact@ca-tech.fr pour démarrer votre diagnostic gratuit."
    } else {
      const raw = await callClaude(
        SYSTEM_PROMPT,
        messages.slice(-20).map((m: any) => ({ role: m.role, content: m.content }))
      )
      const match = raw.match(/<action>([\s\S]*?)<\/action>/)
      if (match) {
        try { action = JSON.parse(match[1].trim()) } catch { /* ignore */ }
      }
      responseText = raw.replace(/<action>[\s\S]*?<\/action>/g, '').trim()
    }

    // ── Traiter les actions ───────────────────────────────────────────────
    let newMeta  = { ...currentMeta }
    let leadId: string | null = null
    const triggers: NotificationTrigger[] = []

    // show_score — stocker le score dans la metadata
    if (action?.type === 'show_score') {
      newMeta.score_data = {
        score:             action.score,
        level:             action.level,
        level_description: action.level_description,
        dimensions:        action.dimensions,
        recommandations:   action.recommandations,
      }
      triggers.push('show_score')
    }

    // send_report — générer et envoyer le rapport par email
    if (action?.type === 'send_report' && action.email && !newMeta.report_sent) {
      const scoreData = newMeta.score_data ?? {}
      triggers.push('send_report')

      // Mettre à jour le prospect dans la metadata
      if (action.prenom)    newMeta.prenom    = action.prenom
      if (action.nom)       newMeta.nom       = action.nom
      if (action.email)     newMeta.email     = action.email
      if (action.entreprise) newMeta.entreprise = action.entreprise

      const reportPromise = (async () => {
        try {
          // Générer le contenu du rapport via Claude
          const reportContent = await callClaude(
            buildReportPrompt({ ...newMeta }),
            [{ role: 'user', content: 'Génère le rapport.' }],
            800
          )

          // Envoyer le rapport par email
          const { ok, error: rErr } = await sendDiagnosticReport({
            clientEmail:      action.email,
            clientName:       `${action.prenom ?? ''} ${action.nom ?? ''}`.trim() || action.email,
            entreprise:       action.entreprise,
            score:            scoreData.score ?? 0,
            level:            scoreData.level ?? '—',
            levelDescription: scoreData.level_description ?? '',
            dimensions:       scoreData.dimensions ?? { processus: 0, donnees: 0, maturite_ia: 0, ambition: 0 },
            recommandations:  scoreData.recommandations ?? [],
            reportContent,
          })

          newMeta.report_sent = ok
          if (rErr) console.warn('[loic-chat/send_report] Email error:', rErr)
        } catch (e) {
          console.error('[loic-chat/send_report]', e)
        }
      })()

      // @ts-ignore — EdgeRuntime dans Supabase Edge Functions
      if (typeof EdgeRuntime !== 'undefined') {
        EdgeRuntime.waitUntil(reportPromise)
      } else {
        await reportPromise
      }
    }

    // create_lead — même logique que V1
    if (action?.type === 'create_lead' && action.data) {
      const d = action.data
      if (d.prenom)     newMeta.prenom     = d.prenom
      if (d.nom)        newMeta.nom        = d.nom
      if (d.email)      newMeta.email      = d.email
      if (d.telephone)  newMeta.telephone  = d.telephone
      if (d.entreprise) newMeta.entreprise = d.entreprise
      if (d.projet)     newMeta.projet     = d.projet
      if (d.budget !== undefined) newMeta.budget = d.budget
      if (d.ville)      newMeta.ville      = d.ville

      if (!newMeta.lead_created) {
        const wfSteps: string[] = []

        console.log('[STEP 1/3] Enregistrement du lead...')
        try {
          const scoreInfo = newMeta.score_data ? ` | Score IA : ${newMeta.score_data.score}/100` : ''
          const { data: lead, error: leadErr } = await supabase.from('leads').insert([{
            first_name: d.prenom ?? '',
            last_name:  d.nom ?? '',
            email:      d.email ?? '',
            phone:      d.telephone ?? null,
            company:    d.entreprise ?? null,
            notes:      `${d.projet ?? ''}${scoreInfo}`.trim() || null,
            budget_max: d.budget ?? null,
            source:     'loic_diagnostic',
            status:     'new',
          }]).select().single()
          if (leadErr) throw leadErr
          leadId = lead.id
          wfSteps.push('✓ Lead enregistré')
          console.log(`[STEP 1/3] ✓ Lead: ${lead.id}`)
        } catch (e) {
          wfSteps.push(`✗ Lead: ${String(e)}`)
          console.error('[STEP 1/3] ✗ Lead:', e)
        }

        console.log('[STEP 2/3] Création du devis automatique...')
        let devisNumber: string | null = null
        let devisId: string | null = null
        try {
          const year = new Date().getFullYear()
          const { count: devisCount } = await supabase
            .from('devis').select('*', { count: 'exact', head: true })
          devisNumber = `DEV-${year}-${String((devisCount ?? 0) + 1).padStart(4, '0')}`
          const validUntil = new Date()
          validUntil.setDate(validUntil.getDate() + 30)
          const { data: devisData, error: devisErr } = await supabase.from('devis').insert([{
            devis_number:    devisNumber,
            status:          'draft',
            contact_name:    `${d.prenom ?? ''} ${d.nom ?? ''}`.trim(),
            contact_email:   d.email ?? '',
            contact_phone:   d.telephone ?? null,
            company_name:    d.entreprise ?? null,
            city:            d.ville ?? null,
            notes:           d.projet ?? null,
            budget_range:    d.budget ? String(d.budget) : null,
            lead_id:         leadId,
            conversation_id: convId,
            subtotal: 0, discount: 0, tax_rate: 20, tax_amount: 0, total: 0,
            valid_until: validUntil.toISOString().split('T')[0],
          }]).select().single()
          if (devisErr) throw devisErr
          devisId = devisData.id
          newMeta.devis_id     = devisId
          newMeta.devis_number = devisNumber
          wfSteps.push(`✓ Devis créé: ${devisNumber}`)
          console.log(`[STEP 2/3] ✓ Devis: ${devisNumber}`)
        } catch (e) {
          wfSteps.push(`✗ Devis: ${String(e)}`)
          console.error('[STEP 2/3] ✗ Devis:', e)
        }

        console.log('[STEP 3/3] Email de confirmation client...')
        if (d.email) {
          try {
            const { ok: cOk, error: cErr } = await sendClientConfirmation({
              clientEmail: d.email,
              clientName:  `${d.prenom ?? ''} ${d.nom ?? ''}`.trim() || 'Vous',
              devisNumber: devisNumber ?? '—',
              projet:      d.projet ?? 'Diagnostic IA',
              budget:      d.budget,
            })
            wfSteps.push(cOk ? '✓ Email client envoyé' : `✗ Email client: ${cErr}`)
          } catch (e) {
            wfSteps.push(`✗ Email client: ${String(e)}`)
          }
        }

        newMeta.lead_created   = true
        newMeta.workflow_steps = wfSteps
        console.log('[Loïc V2 Workflow]', wfSteps.join(' | '))
      }
      triggers.push('create_lead')

    } else if (action?.type === 'escalate') {
      newMeta.escalated = true
      triggers.push('escalate')
    }

    // Détection première capture
    if (action?.data?.email && !prevMeta.email)        triggers.push('email_captured')
    if (action?.data?.telephone && !prevMeta.telephone) triggers.push('phone_captured')

    const finalTriggers = triggers.filter(t => {
      if ((t === 'email_captured' || t === 'phone_captured') && triggers.includes('create_lead')) return false
      return true
    })

    // ── Sauvegarder la conversation ───────────────────────────────────────
    const allMessages = [
      ...messages,
      { role: 'assistant', content: responseText, timestamp: new Date().toISOString(), action: action ?? undefined },
    ]
    const patch: any = { messages: allMessages, metadata: newMeta, updated_at: new Date().toISOString() }
    if (leadId) patch.lead_id = leadId
    await supabase.from('ai_conversations').update(patch).eq('id', convId)

    // ── Notifications (non bloquant) ──────────────────────────────────────
    if (finalTriggers.length > 0) {
      const primaryTrigger = finalTriggers[0]
      const summary = messages
        .filter((m: any) => m.role === 'user')
        .slice(-5)
        .map((m: any) => m.content)
        .join(' | ')
        .slice(0, 500)

      const notifyPromise = notify(
        { prospect: newMeta, summary: summary || 'Diagnostic démarré', conversationId: convId, trigger: primaryTrigger },
        supabase
      ).catch(e => console.error('[loic-chat/notify]', e))

      // @ts-ignore
      if (typeof EdgeRuntime !== 'undefined') {
        EdgeRuntime.waitUntil(notifyPromise)
      } else {
        await notifyPromise
      }
    }

    return new Response(
      JSON.stringify({ message: responseText, action, conversation_id: convId, lead_id: leadId }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('[loic-chat]', err)
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }
})
