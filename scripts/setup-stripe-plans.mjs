#!/usr/bin/env node
// setup-stripe-plans.mjs — Script one-shot P3
// Crée les 3 plans CA-TECH dans Stripe + les insère dans stripe_plans (Supabase).
//
// Prérequis :
//   npm install stripe @supabase/supabase-js  (dans le dossier scripts ou racine)
//
// Usage :
//   STRIPE_SECRET_KEY=sk_live_xxx \
//   SUPABASE_URL=https://jhcyooksjeivajdjicka.supabase.co \
//   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
//   node scripts/setup-stripe-plans.mjs

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const STRIPE_KEY     = process.env.STRIPE_SECRET_KEY
const SUPABASE_URL   = process.env.SUPABASE_URL
const SUPABASE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!STRIPE_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌  Variables manquantes : STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const stripe  = new Stripe(STRIPE_KEY)
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const PLANS = [
  { slug: 'essentiel', name: 'CA-TECH Essentiel', amount: 14900 },
  { slug: 'confort',   name: 'CA-TECH Confort',   amount: 29900 },
  { slug: 'premium',   name: 'CA-TECH Premium',   amount: 49900 },
]

async function run() {
  console.log('🚀  Création des plans Stripe CA-TECH…\n')

  for (const plan of PLANS) {
    console.log(`📦  ${plan.name} (${(plan.amount / 100).toFixed(0)} €/mois HT)`)

    // Vérifier si déjà en base
    const { data: existing } = await supabase
      .from('stripe_plans')
      .select('id, stripe_price_id')
      .eq('slug', plan.slug)
      .maybeSingle()

    if (existing) {
      console.log(`   ↳ Déjà en base (price: ${existing.stripe_price_id}) — ignoré\n`)
      continue
    }

    // Créer le produit Stripe
    const product = await stripe.products.create({
      name:        plan.name,
      description: `CA-TECH — Abonnement mensuel ${plan.name}`,
      metadata:    { slug: plan.slug, source: 'ca-tech-manager' },
    })
    console.log(`   ✅  Produit Stripe : ${product.id}`)

    // Créer le prix mensuel HT
    const price = await stripe.prices.create({
      product:    product.id,
      unit_amount: plan.amount,
      currency:   'eur',
      recurring:  { interval: 'month' },
      metadata:   { slug: plan.slug },
    })
    console.log(`   ✅  Prix Stripe    : ${price.id}`)

    // Insérer en base
    const { error } = await supabase.from('stripe_plans').insert({
      stripe_product_id: product.id,
      stripe_price_id:   price.id,
      name:              plan.name,
      slug:              plan.slug,
      amount:            plan.amount,
      currency:          'eur',
      interval:          'month',
      active:            true,
    })

    if (error) {
      console.error(`   ❌  Erreur Supabase :`, error.message)
    } else {
      console.log(`   ✅  Inséré en base Supabase\n`)
    }
  }

  console.log('✅  Setup terminé !')
  console.log('   → Vérifiez dans le Manager : /parametres/abonnements-catalogue')
}

run().catch(err => {
  console.error('❌  Erreur fatale :', err)
  process.exit(1)
})
