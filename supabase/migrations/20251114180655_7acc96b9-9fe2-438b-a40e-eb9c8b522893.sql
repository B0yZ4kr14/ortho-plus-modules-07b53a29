-- =====================================================
-- FASE 5 - T5.6: Módulo CRM (Golden Pattern)
-- =====================================================

-- Tabela de Leads (prospects)
CREATE TABLE public.crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  cpf TEXT,
  source TEXT NOT NULL, -- 'website', 'indicacao', 'redes_sociais', 'google', 'outro'
  status TEXT NOT NULL DEFAULT 'novo', -- 'novo', 'contatado', 'qualificado', 'convertido', 'perdido'
  stage_id UUID, -- referência ao estágio do funil
  interest_procedure TEXT,
  estimated_value NUMERIC(10,2),
  last_contact_date TIMESTAMPTZ,
  next_follow_up_date TIMESTAMPTZ,
  conversion_probability INTEGER CHECK (conversion_probability >= 0 AND conversion_probability <= 100),
  assigned_to UUID REFERENCES auth.users(id),
  converted_to_patient_id UUID, -- referência ao prontuários quando convertido
  lost_reason TEXT,
  notes TEXT,
  tags TEXT[],
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Estágios do Funil
CREATE TABLE public.crm_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  color TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  conversion_rate NUMERIC(5,2),
  average_time_days INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(clinic_id, order_index)
);

-- Tabela de Interações com Leads
CREATE TABLE public.crm_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL, -- 'ligacao', 'email', 'whatsapp', 'reuniao', 'nota'
  subject TEXT,
  description TEXT NOT NULL,
  duration_minutes INTEGER,
  outcome TEXT, -- 'positivo', 'neutro', 'negativo'
  next_action TEXT,
  next_action_date TIMESTAMPTZ,
  attachments JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Tabela de Conversões (métricas)
CREATE TABLE public.crm_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  converted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  conversion_value NUMERIC(10,2),
  conversion_type TEXT NOT NULL, -- 'primeira_consulta', 'tratamento_iniciado', 'contrato_assinado'
  time_to_convert_days INTEGER,
  total_interactions INTEGER,
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_crm_leads_clinic_id ON public.crm_leads(clinic_id);
CREATE INDEX idx_crm_leads_status ON public.crm_leads(status);
CREATE INDEX idx_crm_leads_stage_id ON public.crm_leads(stage_id);
CREATE INDEX idx_crm_leads_assigned_to ON public.crm_leads(assigned_to);
CREATE INDEX idx_crm_leads_next_follow_up ON public.crm_leads(next_follow_up_date) WHERE next_follow_up_date IS NOT NULL;
CREATE INDEX idx_crm_stages_clinic_id ON public.crm_stages(clinic_id);
CREATE INDEX idx_crm_interactions_lead_id ON public.crm_interactions(lead_id);
CREATE INDEX idx_crm_conversions_clinic_id ON public.crm_conversions(clinic_id);

-- Trigger para updated_at
CREATE TRIGGER update_crm_leads_updated_at
  BEFORE UPDATE ON public.crm_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crm_stages_updated_at
  BEFORE UPDATE ON public.crm_stages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_conversions ENABLE ROW LEVEL SECURITY;

-- Policies para crm_leads
CREATE POLICY "Users can view leads from their clinic"
  ON public.crm_leads FOR SELECT
  USING (clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create leads in their clinic"
  ON public.crm_leads FOR INSERT
  WITH CHECK (
    clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update leads in their clinic"
  ON public.crm_leads FOR UPDATE
  USING (clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete leads in their clinic"
  ON public.crm_leads FOR DELETE
  USING (clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

-- Policies para crm_stages
CREATE POLICY "Users can view stages from their clinic"
  ON public.crm_stages FOR SELECT
  USING (clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage stages"
  ON public.crm_stages FOR ALL
  USING (
    clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
    AND (SELECT app_role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN'
  );

-- Policies para crm_interactions
CREATE POLICY "Users can view interactions from their clinic"
  ON public.crm_interactions FOR SELECT
  USING (clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create interactions in their clinic"
  ON public.crm_interactions FOR INSERT
  WITH CHECK (
    clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
    AND created_by = auth.uid()
  );

-- Policies para crm_conversions
CREATE POLICY "Users can view conversions from their clinic"
  ON public.crm_conversions FOR SELECT
  USING (clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create conversions in their clinic"
  ON public.crm_conversions FOR INSERT
  WITH CHECK (clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

-- Comentários
COMMENT ON TABLE public.crm_leads IS 'Módulo CRM - Leads e prospects da clínica';
COMMENT ON TABLE public.crm_stages IS 'Módulo CRM - Estágios do funil de vendas';
COMMENT ON TABLE public.crm_interactions IS 'Módulo CRM - Histórico de interações com leads';
COMMENT ON TABLE public.crm_conversions IS 'Módulo CRM - Registro de conversões de leads';

-- =====================================================
-- CRIAR USUÁRIO ADMIN PADRÃO
-- =====================================================

-- Inserir clínica padrão se não existir
INSERT INTO public.clinics (id, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'Clínica Demo')
ON CONFLICT (id) DO NOTHING;

-- Criar função para criar usuário admin
CREATE OR REPLACE FUNCTION public.create_default_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Verificar se já existe um usuário admin
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@orthoplus.com';
  
  IF admin_user_id IS NULL THEN
    -- Criar usuário no auth.users via admin API
    -- Nota: A senha será 'Admin123!' (deve ser trocada após primeiro login)
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@orthoplus.com',
      crypt('Admin123!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Administrador"}',
      now(),
      now(),
      '',
      ''
    )
    RETURNING id INTO admin_user_id;
    
    -- Criar perfil admin
    INSERT INTO public.profiles (id, clinic_id, full_name, app_role, is_active)
    VALUES (
      admin_user_id,
      '00000000-0000-0000-0000-000000000001',
      'Administrador',
      'ADMIN',
      true
    );
  END IF;
END;
$$;

-- Executar função para criar admin
SELECT public.create_default_admin_user();