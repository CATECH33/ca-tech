/**
 * API Contact CA-TECH
 * POST /api/contact — formulaire de contact → lead Supabase + notification admin
 */
const { createClient } = require('@supabase/supabase-js')
const { notify } = require('./notifications')

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.SITE_URL || 'https://www.ca-tech.fr',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function getSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant')
  }
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS)
    return res.end()
  }
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v))

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let body = req.body || {}
  if (typeof body === 'string') {
    try { body = JSON.parse(body) } catch { body = {} }
  }

  const { name, email, phone, message, subject } = body

  if (!email || !message) {
    return res.status(400).json({ error: 'email et message requis' })
  }

  let supabase
  try {
    supabase = getSupabase()
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }

  try {
    // 1. Upsert lead dans Supabase
    const nameParts = (name || '').trim().split(' ')
    const { data: existing } = await supabase
      .from('leads')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (!existing) {
      await supabase.from('leads').insert({
        first_name: nameParts[0] || '',
        last_name:  nameParts.slice(1).join(' ') || '',
        email,
        phone:   phone  || null,
        notes:   [subject ? `Objet : ${subject}` : null, message].filter(Boolean).join('\n'),
        source:  'contact_form',
        status:  'new',
      })
    }

    // 2. Notification admin
    await notify('formulaire_contact', {
      name:    name    || email,
      email,
      phone:   phone   || null,
      message: [subject ? `[${subject}] ` : '', message].join(''),
    }, supabase).catch(err => console.error('[api/contact] notify:', err.message))

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('[api/contact]', err.message)
    return res.status(500).json({ error: 'Une erreur est survenue. Veuillez réessayer.' })
  }
}
