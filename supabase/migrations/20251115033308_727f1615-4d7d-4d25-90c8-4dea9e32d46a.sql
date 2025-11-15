-- Criar bucket para radiografias
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'radiografias',
  'radiografias',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- RLS Policies para bucket radiografias
CREATE POLICY "Users can view own clinic radiografias"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'radiografias' 
  AND auth.uid() IN (
    SELECT p.id 
    FROM profiles p
    WHERE p.clinic_id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Users can upload own clinic radiografias"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'radiografias'
  AND auth.uid() IN (
    SELECT p.id
    FROM profiles p
    WHERE p.clinic_id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Users can delete own clinic radiografias"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'radiografias'
  AND auth.uid() IN (
    SELECT p.id
    FROM profiles p
    WHERE p.clinic_id::text = (storage.foldername(name))[1]
  )
);

-- Criar tabela para crypto_payments se não existe
CREATE TABLE IF NOT EXISTS public.crypto_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL,
  invoice_id TEXT UNIQUE NOT NULL,
  amount_brl DECIMAL(10,2) NOT NULL,
  crypto_amount DECIMAL(18,8),
  crypto_currency TEXT,
  currency TEXT NOT NULL DEFAULT 'BRL',
  status TEXT NOT NULL DEFAULT 'PENDING',
  checkout_link TEXT,
  qr_code_data TEXT,
  expires_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  confirmations INTEGER DEFAULT 0,
  transaction_id TEXT,
  created_by UUID REFERENCES auth.users(id),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index para crypto_payments
CREATE INDEX IF NOT EXISTS idx_crypto_payments_clinic_id ON public.crypto_payments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_crypto_payments_invoice_id ON public.crypto_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_crypto_payments_status ON public.crypto_payments(status);
CREATE INDEX IF NOT EXISTS idx_crypto_payments_order_id ON public.crypto_payments(order_id);

-- RLS para crypto_payments
ALTER TABLE public.crypto_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clinic crypto payments"
ON public.crypto_payments FOR SELECT
USING (
  clinic_id IN (
    SELECT clinic_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can create own clinic crypto payments"
ON public.crypto_payments FOR INSERT
WITH CHECK (
  clinic_id IN (
    SELECT clinic_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Service role can update all crypto payments"
ON public.crypto_payments FOR UPDATE
USING (true)
WITH CHECK (true);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_crypto_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_crypto_payments_updated_at
BEFORE UPDATE ON public.crypto_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_crypto_payments_updated_at();