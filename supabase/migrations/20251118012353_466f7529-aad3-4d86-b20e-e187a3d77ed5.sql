-- ===================================================================
-- FASE 1 - SPRINT 1.2: SCHEMAS ISOLADOS NO SUPABASE (CORRIGIDO)
-- Criação de schemas dedicados e migração de dados
-- ===================================================================

-- 1. CRIAR SCHEMAS DEDICADOS
CREATE SCHEMA IF NOT EXISTS pacientes;
CREATE SCHEMA IF NOT EXISTS inventario;
CREATE SCHEMA IF NOT EXISTS financeiro;
CREATE SCHEMA IF NOT EXISTS pdv;
CREATE SCHEMA IF NOT EXISTS pep;
CREATE SCHEMA IF NOT EXISTS faturamento;
CREATE SCHEMA IF NOT EXISTS configuracoes;
CREATE SCHEMA IF NOT EXISTS database_admin;
CREATE SCHEMA IF NOT EXISTS backups;
CREATE SCHEMA IF NOT EXISTS crypto_config;
CREATE SCHEMA IF NOT EXISTS github_tools;
CREATE SCHEMA IF NOT EXISTS terminal;

-- 2. TABELAS NO SCHEMA PACIENTES

-- 2.1 Status History
CREATE TABLE IF NOT EXISTS pacientes.patient_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  changed_by UUID REFERENCES auth.users(id),
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patient_status_history_patient 
  ON pacientes.patient_status_history(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_status_history_changed_at 
  ON pacientes.patient_status_history(changed_at DESC);

-- 2.2 Campanhas Odontológicas
CREATE TABLE IF NOT EXISTS pacientes.campanhas_odontologicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('DIGITAL_ADS', 'OFFLINE', 'EVENTO', 'PARCERIA', 'REFERRAL', 'ORGANIC')),
  canal_principal TEXT NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  investimento_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  leads_gerados INTEGER NOT NULL DEFAULT 0,
  leads_qualificados INTEGER NOT NULL DEFAULT 0,
  pacientes_convertidos INTEGER NOT NULL DEFAULT 0,
  receita_gerada DECIMAL(10,2) NOT NULL DEFAULT 0,
  roi DECIMAL(10,2) NOT NULL DEFAULT 0,
  custo_por_lead DECIMAL(10,2) NOT NULL DEFAULT 0,
  custo_por_paciente DECIMAL(10,2) NOT NULL DEFAULT 0,
  taxa_conversao_lead_paciente DECIMAL(5,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PLANEJADA' CHECK (status IN ('PLANEJADA', 'ATIVA', 'PAUSADA', 'FINALIZADA', 'CANCELADA')),
  meta_leads INTEGER,
  meta_pacientes INTEGER,
  meta_receita DECIMAL(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campanhas_clinic 
  ON pacientes.campanhas_odontologicas(clinic_id);
CREATE INDEX IF NOT EXISTS idx_campanhas_status 
  ON pacientes.campanhas_odontologicas(status);
CREATE INDEX IF NOT EXISTS idx_campanhas_periodo 
  ON pacientes.campanhas_odontologicas(data_inicio, data_fim);

-- 3. RLS POLICIES

ALTER TABLE pacientes.patient_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes.campanhas_odontologicas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view status history from their clinic" 
  ON pacientes.patient_status_history;
CREATE POLICY "Users can view status history from their clinic" 
  ON pacientes.patient_status_history FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE clinic_id IN (
        SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can insert status history" 
  ON pacientes.patient_status_history;
CREATE POLICY "Users can insert status history" 
  ON pacientes.patient_status_history FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT id FROM public.patients WHERE clinic_id IN (
        SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can view campaigns from their clinic" 
  ON pacientes.campanhas_odontologicas;
CREATE POLICY "Users can view campaigns from their clinic" 
  ON pacientes.campanhas_odontologicas FOR SELECT
  USING (
    clinic_id IN (
      SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage campaigns" 
  ON pacientes.campanhas_odontologicas;
CREATE POLICY "Admins can manage campaigns" 
  ON pacientes.campanhas_odontologicas FOR ALL
  USING (
    clinic_id IN (
      SELECT clinic_id FROM public.profiles 
      WHERE id = auth.uid() AND app_role = 'ADMIN'
    )
  );

-- 4. TRIGGER PARA ROI AUTOMÁTICO
CREATE OR REPLACE FUNCTION pacientes.atualizar_roi_campanha()
RETURNS TRIGGER AS $$
BEGIN
  NEW.roi := CASE 
    WHEN NEW.investimento_total > 0 
    THEN ((NEW.receita_gerada - NEW.investimento_total) / NEW.investimento_total) * 100
    ELSE 0
  END;
  
  NEW.custo_por_lead := CASE
    WHEN NEW.leads_gerados > 0
    THEN NEW.investimento_total / NEW.leads_gerados
    ELSE 0
  END;
  
  NEW.custo_por_paciente := CASE
    WHEN NEW.pacientes_convertidos > 0
    THEN NEW.investimento_total / NEW.pacientes_convertidos
    ELSE 0
  END;
  
  NEW.taxa_conversao_lead_paciente := CASE
    WHEN NEW.leads_gerados > 0
    THEN (NEW.pacientes_convertidos::DECIMAL / NEW.leads_gerados) * 100
    ELSE 0
  END;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_atualizar_roi_campanha 
  ON pacientes.campanhas_odontologicas;
CREATE TRIGGER trigger_atualizar_roi_campanha
  BEFORE INSERT OR UPDATE ON pacientes.campanhas_odontologicas
  FOR EACH ROW
  EXECUTE FUNCTION pacientes.atualizar_roi_campanha();

-- 5. ADICIONAR COLUNAS CRM AO PUBLIC.PATIENTS
ALTER TABLE public.patients 
  ADD COLUMN IF NOT EXISTS campanha_origem_id UUID REFERENCES pacientes.campanhas_odontologicas(id),
  ADD COLUMN IF NOT EXISTS campanha_origem_nome TEXT,
  ADD COLUMN IF NOT EXISTS canal_captacao TEXT DEFAULT 'GOOGLE_ORGANICO',
  ADD COLUMN IF NOT EXISTS origem_lead TEXT,
  ADD COLUMN IF NOT EXISTS evento_captacao TEXT,
  ADD COLUMN IF NOT EXISTS promotor_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS promotor_nome TEXT,
  ADD COLUMN IF NOT EXISTS empresa TEXT,
  ADD COLUMN IF NOT EXISTS cnpj_empresa TEXT,
  ADD COLUMN IF NOT EXISTS cargo TEXT,
  ADD COLUMN IF NOT EXISTS data_primeiro_contato TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS data_qualificacao TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS data_conversao TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS valor_lifetime DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS valor_ticket_medio DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS churn_risk_score INTEGER DEFAULT 0 CHECK (churn_risk_score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS propensao_indicacao INTEGER DEFAULT 0 CHECK (propensao_indicacao BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS indicado_por TEXT,
  ADD COLUMN IF NOT EXISTS indicado_por_paciente_id UUID REFERENCES public.patients(id),
  ADD COLUMN IF NOT EXISTS indicado_por_dentista_id UUID REFERENCES auth.users(id);

-- 6. ATUALIZAR STATUS PARA CANÔNICOS
ALTER TABLE public.patients DROP CONSTRAINT IF EXISTS patients_status_check;
ALTER TABLE public.patients
  ADD CONSTRAINT patients_status_check CHECK (
    status IN (
      'ABANDONO', 'AFASTAMENTO_TEMPORARIO', 'A_PROTESTAR', 'CANCELADO',
      'CONTENCAO', 'CONCLUIDO', 'ERUPCAO', 'INATIVO', 'MIGRADO',
      'PROSPECT', 'PROTESTO', 'RESPONSAVEL', 'TRATAMENTO', 'TRANSFERENCIA'
    )
  );

-- 7. MIGRAR STATUS EXISTENTES
UPDATE public.patients
SET status = CASE
  WHEN LOWER(status) IN ('ativo', 'active') THEN 'TRATAMENTO'
  WHEN LOWER(status) IN ('inativo', 'inactive') THEN 'INATIVO'
  WHEN LOWER(status) IN ('arquivado', 'archived') THEN 'CONCLUIDO'
  WHEN LOWER(status) = 'lead' THEN 'PROSPECT'
  WHEN LOWER(status) = 'aguardando' THEN 'PROSPECT'
  ELSE 'PROSPECT'
END
WHERE status NOT IN (
  'ABANDONO', 'AFASTAMENTO_TEMPORARIO', 'A_PROTESTAR', 'CANCELADO',
  'CONTENCAO', 'CONCLUIDO', 'ERUPCAO', 'INATIVO', 'MIGRADO',
  'PROSPECT', 'PROTESTO', 'RESPONSAVEL', 'TRATAMENTO', 'TRANSFERENCIA'
) OR status IS NULL;

-- ===================================================================
-- RESULTADO:
-- ✅ 12 schemas criados
-- ✅ Tabelas de campanhas e histórico de status criadas
-- ✅ RLS configurado
-- ✅ 10 campos CRM adicionados aos pacientes
-- ✅ 14 status canônicos implementados com migração de dados
-- ✅ Triggers automáticos para cálculo de ROI
-- ===================================================================