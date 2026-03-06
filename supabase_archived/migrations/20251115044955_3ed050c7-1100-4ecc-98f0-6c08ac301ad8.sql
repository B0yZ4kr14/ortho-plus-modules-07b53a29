-- FASE 4: Criação de tabelas para novos módulos

-- 1. Split Payment Config
CREATE TABLE IF NOT EXISTS public.split_payment_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL,
  percentage NUMERIC(5,2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  procedure_type TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.split_payment_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clinic split config"
  ON public.split_payment_config FOR SELECT
  USING (clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create split config for own clinic"
  ON public.split_payment_config FOR INSERT
  WITH CHECK (clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update own clinic split config"
  ON public.split_payment_config FOR UPDATE
  USING (clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

-- 2. Split Transactions
CREATE TABLE IF NOT EXISTS public.split_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  transaction_id TEXT NOT NULL,
  professional_id UUID NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL,
  professional_amount NUMERIC(12,2) NOT NULL,
  clinic_amount NUMERIC(12,2) NOT NULL,
  percentage NUMERIC(5,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.split_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clinic split transactions"
  ON public.split_transactions FOR SELECT
  USING (clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

-- 3. TISS Guides
CREATE TABLE IF NOT EXISTS public.tiss_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  batch_id UUID,
  guide_number TEXT NOT NULL,
  patient_id TEXT NOT NULL,
  insurance_company TEXT NOT NULL,
  procedure_code TEXT NOT NULL,
  procedure_name TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviada', 'aprovada', 'glosada')),
  service_date DATE NOT NULL,
  submission_date TIMESTAMPTZ,
  response_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tiss_guides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clinic tiss guides"
  ON public.tiss_guides FOR SELECT
  USING (clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create tiss guides for own clinic"
  ON public.tiss_guides FOR INSERT
  WITH CHECK (clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update own clinic tiss guides"
  ON public.tiss_guides FOR UPDATE
  USING (clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

-- 4. TISS Batches
CREATE TABLE IF NOT EXISTS public.tiss_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  batch_number TEXT NOT NULL,
  insurance_company TEXT NOT NULL,
  total_guides INTEGER NOT NULL DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviado', 'processando', 'concluido')),
  sent_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tiss_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clinic tiss batches"
  ON public.tiss_batches FOR SELECT
  USING (clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create tiss batches for own clinic"
  ON public.tiss_batches FOR INSERT
  WITH CHECK (clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

-- 5. LGPD Data Consents
CREATE TABLE IF NOT EXISTS public.lgpd_data_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id TEXT NOT NULL,
  consent_type TEXT NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT false,
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lgpd_data_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clinic lgpd consents"
  ON public.lgpd_data_consents FOR SELECT
  USING (clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

-- Add foreign key to tiss_guides
ALTER TABLE public.tiss_guides
  ADD CONSTRAINT tiss_guides_batch_id_fkey 
  FOREIGN KEY (batch_id) REFERENCES public.tiss_batches(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_split_config_clinic ON public.split_payment_config(clinic_id);
CREATE INDEX IF NOT EXISTS idx_split_transactions_clinic ON public.split_transactions(clinic_id);
CREATE INDEX IF NOT EXISTS idx_tiss_guides_clinic ON public.tiss_guides(clinic_id);
CREATE INDEX IF NOT EXISTS idx_tiss_batches_clinic ON public.tiss_batches(clinic_id);
CREATE INDEX IF NOT EXISTS idx_lgpd_consents_clinic ON public.lgpd_data_consents(clinic_id);