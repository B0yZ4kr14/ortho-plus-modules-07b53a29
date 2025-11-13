-- Criar tabela para configuração de alertas de preço de criptomoedas
CREATE TABLE IF NOT EXISTS public.crypto_price_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id),
  created_by uuid NOT NULL,
  coin_type text NOT NULL,
  target_rate_brl numeric NOT NULL,
  alert_type text NOT NULL, -- 'ABOVE' ou 'BELOW'
  notification_method text[] NOT NULL DEFAULT ARRAY['EMAIL']::text[], -- ['EMAIL', 'WHATSAPP']
  is_active boolean NOT NULL DEFAULT true,
  last_triggered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.crypto_price_alerts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view alerts from their clinic" 
ON public.crypto_price_alerts 
FOR SELECT 
USING (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Admins can manage alerts in their clinic" 
ON public.crypto_price_alerts 
FOR ALL 
USING (
  clinic_id = get_user_clinic_id(auth.uid()) 
  AND has_role(auth.uid(), 'ADMIN'::app_role)
);

-- Trigger para updated_at
CREATE TRIGGER update_crypto_price_alerts_updated_at
BEFORE UPDATE ON public.crypto_price_alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_crypto_price_alerts_clinic_id ON public.crypto_price_alerts(clinic_id);
CREATE INDEX idx_crypto_price_alerts_is_active ON public.crypto_price_alerts(is_active);
CREATE INDEX idx_crypto_price_alerts_coin_type ON public.crypto_price_alerts(coin_type);