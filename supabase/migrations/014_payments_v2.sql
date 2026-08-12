-- Sprint 9.5 — Paiements V2 : acompte / solde / abonnements

-- ─── 1. invoices : payment_type + devis_id ───────────────────────────────────
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS payment_type TEXT NOT NULL DEFAULT 'unique'
    CHECK (payment_type IN ('acompte', 'solde', 'unique')),
  ADD COLUMN IF NOT EXISTS devis_id UUID REFERENCES devis(id);

-- ─── 2. clients : stripe_customer_id ─────────────────────────────────────────
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- ─── 3. payments : idempotence (partiel — NULL autorisé) ─────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS payments_stripe_payment_id_key
  ON payments (stripe_payment_id)
  WHERE stripe_payment_id IS NOT NULL;

-- ─── 4. subscriptions ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id                         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id                  UUID         NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  devis_id                   UUID         REFERENCES devis(id),
  name                       TEXT         NOT NULL,
  amount                     NUMERIC(10,2) NOT NULL,
  currency                   TEXT         NOT NULL DEFAULT 'eur',
  frequency                  TEXT         NOT NULL DEFAULT 'monthly'
                               CHECK (frequency IN ('monthly','annual')),
  status                     TEXT         NOT NULL DEFAULT 'trialing'
                               CHECK (status IN ('active','paused','cancelled','past_due','trialing')),
  stripe_customer_id         TEXT,
  stripe_subscription_id     TEXT         UNIQUE,
  stripe_checkout_session_id TEXT,
  stripe_price_id            TEXT,
  current_period_start       TIMESTAMPTZ,
  current_period_end         TIMESTAMPTZ,
  cancelled_at               TIMESTAMPTZ,
  created_at                 TIMESTAMPTZ  DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ  DEFAULT NOW()
);

-- ─── 5. RLS ───────────────────────────────────────────────────────────────────
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'subscriptions' AND policyname = 'auth users manage subscriptions'
  ) THEN
    CREATE POLICY "auth users manage subscriptions"
      ON subscriptions FOR ALL TO authenticated
      USING (true) WITH CHECK (true);
  END IF;
END$$;

-- ─── 6. updated_at trigger ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION _set_subscriptions_updated_at()
  RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END$$;

DROP TRIGGER IF EXISTS subscriptions_updated_at ON subscriptions;
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION _set_subscriptions_updated_at();
