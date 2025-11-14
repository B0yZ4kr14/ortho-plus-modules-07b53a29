-- Drop tabelas antigas do CRM se existirem
DROP TABLE IF EXISTS public.crm_activities CASCADE;
DROP TABLE IF EXISTS public.crm_leads CASCADE;

-- Recriar tabela crm_leads com estrutura correta
CREATE TABLE public.crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  source TEXT NOT NULL CHECK (source IN ('SITE', 'TELEFONE', 'INDICACAO', 'REDES_SOCIAIS', 'EVENTO', 'OUTRO')),
  status TEXT NOT NULL DEFAULT 'NOVO' CHECK (status IN ('NOVO', 'CONTATO_INICIAL', 'QUALIFICADO', 'PROPOSTA', 'NEGOCIACAO', 'GANHO', 'PERDIDO')),
  interest_description TEXT,
  estimated_value DECIMAL(10, 2),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tags TEXT[],
  next_contact_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  CONSTRAINT email_or_phone_required CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- Recriar tabela crm_activities
CREATE TABLE public.crm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('LIGACAO', 'EMAIL', 'REUNIAO', 'WHATSAPP', 'VISITA', 'OUTRO')),
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'AGENDADA' CHECK (status IN ('AGENDADA', 'CONCLUIDA', 'CANCELADA')),
  assigned_to UUID NOT NULL REFERENCES auth.users(id),
  outcome TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Criar índices
CREATE INDEX idx_crm_leads_clinic_id ON public.crm_leads(clinic_id);
CREATE INDEX idx_crm_leads_status ON public.crm_leads(status);
CREATE INDEX idx_crm_leads_assigned_to ON public.crm_leads(assigned_to);
CREATE INDEX idx_crm_leads_next_contact_date ON public.crm_leads(next_contact_date);

CREATE INDEX idx_crm_activities_lead_id ON public.crm_activities(lead_id);
CREATE INDEX idx_crm_activities_clinic_id ON public.crm_activities(clinic_id);
CREATE INDEX idx_crm_activities_assigned_to ON public.crm_activities(assigned_to);
CREATE INDEX idx_crm_activities_scheduled_date ON public.crm_activities(scheduled_date);
CREATE INDEX idx_crm_activities_status ON public.crm_activities(status);

-- Habilitar RLS
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para crm_leads
CREATE POLICY "Users can view leads from their clinic"
  ON public.crm_leads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.clinic_id = crm_leads.clinic_id
    )
  );

CREATE POLICY "Users can create leads in their clinic"
  ON public.crm_leads FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.clinic_id = crm_leads.clinic_id
    )
  );

CREATE POLICY "Users can update leads from their clinic"
  ON public.crm_leads FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.clinic_id = crm_leads.clinic_id
    )
  );

CREATE POLICY "Users can delete leads from their clinic"
  ON public.crm_leads FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.clinic_id = crm_leads.clinic_id
    )
  );

-- Políticas RLS para crm_activities
CREATE POLICY "Users can view activities from their clinic"
  ON public.crm_activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.clinic_id = crm_activities.clinic_id
    )
  );

CREATE POLICY "Users can create activities in their clinic"
  ON public.crm_activities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.clinic_id = crm_activities.clinic_id
    )
  );

CREATE POLICY "Users can update activities from their clinic"
  ON public.crm_activities FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.clinic_id = crm_activities.clinic_id
    )
  );

CREATE POLICY "Users can delete activities from their clinic"
  ON public.crm_activities FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.clinic_id = crm_activities.clinic_id
    )
  );

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_crm_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_crm_leads_updated_at
  BEFORE UPDATE ON public.crm_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_crm_leads_updated_at();

CREATE OR REPLACE FUNCTION update_crm_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_crm_activities_updated_at
  BEFORE UPDATE ON public.crm_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_crm_activities_updated_at();