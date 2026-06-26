import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { notify, getPriority, type NotificationTrigger } from './notifications/notificationService.ts'

const ANTHROPIC_KEY      = Deno.env.get('ANTHROPIC_API_KEY')
const SUPABASE_URL       = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `Tu es Loïc, l'assistant commercial IA de CA-TECH, une agence web & design française présente à Paris, Lyon, Dijon et Troyes.

## Mission
Accueillir les visiteurs, présenter les services CA-TECH, qualifier les prospects et créer des leads automatiquement.

## Services CA-TECH (tarifs indicatifs)
- Landing page : à partir de 270 €
- Site vitrine : à partir de 590 €
- Site e-commerce : à partir de 1 090 €
- Développement sur mesure : à partir de 2 500 €
- Création de logo : à partir de 180 €
- Identité visuelle complète : à partir de 350 €
- Création de flyers : à partir de 139 €
- Intelligence artificielle : à partir de 1 500 €
- Automatisation : à partir de 800 €

## Qualification — collecte ces 6 informations progressivement
1. Prénom + Nom
2. Entreprise ou activité
3. Email
4. Téléphone
5. Description du projet
6. Budget estimé

## Actions disponibles (une seule par réponse, entre balises <action></action>)

### Estimation de devis
<action>{"type":"show_quote","items":[{"service":"Site vitrine","prix":590}],"total_ht":590,"tva":118,"total_ttc":708}</action>

### Rendez-vous
<action>{"type":"propose_appointment","data":{"motif":"Appel découverte gratuit 30 min"}}</action>

### Créer le lead (dès que tu as nom + email OU nom + téléphone)
<action>{"type":"create_lead","data":{"prenom":"Marie","nom":"Dupont","email":"marie@exemple.fr","telephone":"0612345678","entreprise":"Ma Boutique","projet":"Site e-commerce mode","budget":1200,"ville":"Paris"}}</action>

### Escalade humaine
<action>{"type":"escalate","reason":"Demande hors périmètre"}</action>

## Règles
- Toujours en français, chaleureux et professionnel
- Ne jamais mentionner les balises <action>
- Collecter les informations naturellement dans la conversation
- Déclencher create_lead dès le minimum disponible : nom + (email ou téléphone)
- Ne jamais inventer d'informations sur le prospect`

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
          type: 'qualification', status: 'active', messages: [],
          metadata: { ...metadata, source: metadata.source ?? 'widget' },
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

    // ── Appel Claude Haiku ────────────────────────────────────────────────
    let responseText = ''
    let action: any  = null

    if (!ANTHROPIC_KEY) {
      responseText = "Bonjour ! Je suis Loïc, l'assistant CA-TECH. Notre équipe vous contactera très prochainement. Écrivez-nous à pemoustaskit@gmail.com"
      action = { type: 'escalate', reason: 'API key non configurée' }
    } else {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: messages.slice(-20).map((m: any) => ({ role: m.role, content: m.content })),
        }),
      })
      if (!r.ok) throw new Error(`Anthropic ${r.status}: ${await r.text()}`)
      const d   = await r.json()
      const raw = d.content?.[0]?.text ?? ''

      const match = raw.match(/<action>([\s\S]*?)<\/action>/)
      if (match) {
        try { action = JSON.parse(match[1].trim()) } catch { /* ignore parse error */ }
      }
      responseText = raw.replace(/<action>[\s\S]*?<\/action>/g, '').trim()
    }

    // ── Traiter l'action et mettre à jour la metadata ────────────────────
    let newMeta  = { ...currentMeta }
    let leadId: string | null = null
    const triggers: NotificationTrigger[] = []

    if (action?.type === 'create_lead' && action.data) {
      const d = action.data
      if (d.prenom)    newMeta.prenom    = d.prenom
      if (d.nom)       newMeta.nom       = d.nom
      if (d.email)     newMeta.email     = d.email
      if (d.telephone) newMeta.telephone = d.telephone
      if (d.entreprise) newMeta.entreprise = d.entreprise
      if (d.projet)    newMeta.projet    = d.projet
      if (d.budget !== undefined) newMeta.budget = d.budget
      if (d.ville)     newMeta.ville     = d.ville

      if (!newMeta.lead_created) {
        const { data: lead } = await supabase.from('leads').insert([{
          first_name: d.prenom ?? '',
          last_name:  d.nom ?? '',
          email:      d.email ?? '',
          phone:      d.telephone ?? null,
          company:    d.entreprise ?? null,
          notes:      d.projet ?? null,
          budget_max: d.budget ?? null,
          source:     'loic_widget',
          status:     'qualified',
        }]).select().single()
        if (lead) leadId = lead.id
      }
      newMeta.lead_created = true
      triggers.push('create_lead')

    } else if (action?.type === 'escalate') {
      newMeta.escalated = true
      triggers.push('escalate')
    } else if (action?.type === 'show_quote') {
      triggers.push('show_quote')
    } else if (action?.type === 'propose_appointment') {
      triggers.push('propose_appointment')
    }

    // Détection première capture email / téléphone
    if (action?.data?.email && !prevMeta.email)     triggers.push('email_captured')
    if (action?.data?.telephone && !prevMeta.telephone) triggers.push('phone_captured')

    // Dédupliquer : si create_lead, supprimer email_captured / phone_captured
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

    // ── Envoyer les notifications (async, non bloquant) ───────────────────
    if (finalTriggers.length > 0) {
      const primaryTrigger = finalTriggers[0]
      const summary = messages
        .filter((m: any) => m.role === 'user')
        .slice(-5)
        .map((m: any) => m.content)
        .join(' | ')
        .slice(0, 500)

      const notifyPromise = notify(
        { prospect: newMeta, summary: summary || 'Conversation débutée', conversationId: convId, trigger: primaryTrigger },
        supabase
      ).catch(e => console.error('[loic-chat/notify]', e))

      // @ts-ignore — EdgeRuntime disponible dans Supabase Edge Functions
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
