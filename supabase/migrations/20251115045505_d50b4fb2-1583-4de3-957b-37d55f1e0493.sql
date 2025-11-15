-- Tabela de Inadimplentes
CREATE TABLE IF NOT EXISTS public.inadimplentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL,
  nome_paciente TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  valor_total_devido DECIMAL(10,2) NOT NULL DEFAULT 0,
  dias_atraso INTEGER NOT NULL DEFAULT 0,
  ultima_cobranca TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'ATIVO',
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Campanhas de Inadimplência
CREATE TABLE IF NOT EXISTS public.campanhas_inadimplencia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  inadimplente_id UUID REFERENCES public.inadimplentes(id) ON DELETE CASCADE,
  tipo_campanha TEXT NOT NULL CHECK (tipo_campanha IN ('EMAIL', 'SMS', 'WHATSAPP', 'LIGACAO')),
  status TEXT NOT NULL DEFAULT 'ATIVA' CHECK (status IN ('ATIVA', 'PAUSADA', 'CONCLUIDA', 'CANCELADA')),
  mensagem_enviada TEXT,
  data_envio TIMESTAMPTZ,
  resposta_recebida BOOLEAN DEFAULT false,
  valor_recuperado DECIMAL(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Adicionar campo guide_ids na tabela tiss_batches
ALTER TABLE public.tiss_batches 
ADD COLUMN IF NOT EXISTS guide_ids UUID[] DEFAULT ARRAY[]::UUID[];

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_inadimplentes_clinic ON public.inadimplentes(clinic_id);
CREATE INDEX IF NOT EXISTS idx_inadimplentes_status ON public.inadimplentes(status);
CREATE INDEX IF NOT EXISTS idx_campanhas_inadimplencia_clinic ON public.campanhas_inadimplencia(clinic_id);
CREATE INDEX IF NOT EXISTS idx_campanhas_inadimplencia_status ON public.campanhas_inadimplencia(status);

-- RLS Policies
ALTER TABLE public.inadimplentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campanhas_inadimplencia ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários só veem inadimplentes de sua clínica
CREATE POLICY "Users can view their clinic inadimplentes"
  ON public.inadimplentes FOR SELECT
  USING (clinic_id IN (
    SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert inadimplentes in their clinic"
  ON public.inadimplentes FOR INSERT
  WITH CHECK (clinic_id IN (
    SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update inadimplentes in their clinic"
  ON public.inadimplentes FOR UPDATE
  USING (clinic_id IN (
    SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can view their clinic campaigns"
  ON public.campanhas_inadimplencia FOR SELECT
  USING (clinic_id IN (
    SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert campaigns in their clinic"
  ON public.campanhas_inadimplencia FOR INSERT
  WITH CHECK (clinic_id IN (
    SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update campaigns in their clinic"
  ON public.campanhas_inadimplencia FOR UPDATE
  USING (clinic_id IN (
    SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_inadimplencia_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER inadimplentes_updated_at
  BEFORE UPDATE ON public.inadimplentes
  FOR EACH ROW
  EXECUTE FUNCTION update_inadimplencia_updated_at();

CREATE TRIGGER campanhas_inadimplencia_updated_at
  BEFORE UPDATE ON public.campanhas_inadimplencia
  FOR EACH ROW
  EXECUTE FUNCTION update_inadimplencia_updated_at();