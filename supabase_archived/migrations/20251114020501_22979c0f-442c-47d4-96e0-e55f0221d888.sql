-- =====================================================
-- FASE 5 - T5.3: Módulo ORÇAMENTOS
-- Criação de tabelas para orçamentos e aprovações
-- =====================================================

-- Table: budgets (Orçamentos)
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL,
  numero_orcamento TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo_plano TEXT NOT NULL DEFAULT 'PARTICULAR', -- 'PARTICULAR', 'CONVENIO'
  status TEXT NOT NULL DEFAULT 'RASCUNHO', -- 'RASCUNHO', 'AGUARDANDO_APROVACAO', 'APROVADO', 'REJEITADO', 'EXPIRADO'
  validade_dias INTEGER NOT NULL DEFAULT 30,
  data_expiracao DATE,
  valor_subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  desconto_percentual NUMERIC(5,2) DEFAULT 0,
  desconto_valor NUMERIC(10,2) DEFAULT 0,
  valor_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  observacoes TEXT,
  aprovado_por UUID,
  aprovado_em TIMESTAMPTZ,
  rejeitado_por UUID,
  rejeitado_em TIMESTAMPTZ,
  motivo_rejeicao TEXT,
  convertido_contrato BOOLEAN DEFAULT false,
  contrato_id UUID,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: budget_items (Itens do Orçamento)
CREATE TABLE IF NOT EXISTS public.budget_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
  procedimento_id UUID,
  descricao TEXT NOT NULL,
  quantidade NUMERIC(10,2) NOT NULL DEFAULT 1,
  valor_unitario NUMERIC(10,2) NOT NULL,
  desconto_percentual NUMERIC(5,2) DEFAULT 0,
  desconto_valor NUMERIC(10,2) DEFAULT 0,
  valor_total NUMERIC(10,2) NOT NULL,
  dente_regiao TEXT,
  observacoes TEXT,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: budget_approvals (Histórico de Aprovações)
CREATE TABLE IF NOT EXISTS public.budget_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
  versao INTEGER NOT NULL DEFAULT 1,
  acao TEXT NOT NULL, -- 'APROVADO', 'REJEITADO', 'REVISAO_SOLICITADA'
  usuario_id UUID NOT NULL,
  motivo TEXT,
  valor_orcamento NUMERIC(10,2) NOT NULL,
  alteracoes_realizadas JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: budget_versions (Controle de Versões)
CREATE TABLE IF NOT EXISTS public.budget_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
  versao INTEGER NOT NULL,
  snapshot_data JSONB NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_budgets_clinic_id ON public.budgets(clinic_id);
CREATE INDEX idx_budgets_patient_id ON public.budgets(patient_id);
CREATE INDEX idx_budgets_status ON public.budgets(status);
CREATE INDEX idx_budgets_numero ON public.budgets(numero_orcamento);
CREATE INDEX idx_budget_items_budget_id ON public.budget_items(budget_id);
CREATE INDEX idx_budget_approvals_budget_id ON public.budget_approvals(budget_id);
CREATE INDEX idx_budget_versions_budget_id ON public.budget_versions(budget_id);

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_versions ENABLE ROW LEVEL SECURITY;

-- budgets policies
CREATE POLICY "Users can view budgets from their clinic"
  ON public.budgets FOR SELECT
  USING (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can create budgets in their clinic"
  ON public.budgets FOR INSERT
  WITH CHECK (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can update budgets from their clinic"
  ON public.budgets FOR UPDATE
  USING (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can delete budgets from their clinic"
  ON public.budgets FOR DELETE
  USING (clinic_id = get_user_clinic_id(auth.uid()));

-- budget_items policies
CREATE POLICY "Users can view budget items from their clinic"
  ON public.budget_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.budgets
      WHERE budgets.id = budget_items.budget_id
        AND budgets.clinic_id = get_user_clinic_id(auth.uid())
    )
  );

CREATE POLICY "Users can create budget items in their clinic"
  ON public.budget_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.budgets
      WHERE budgets.id = budget_items.budget_id
        AND budgets.clinic_id = get_user_clinic_id(auth.uid())
    )
  );

CREATE POLICY "Users can update budget items from their clinic"
  ON public.budget_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.budgets
      WHERE budgets.id = budget_items.budget_id
        AND budgets.clinic_id = get_user_clinic_id(auth.uid())
    )
  );

CREATE POLICY "Users can delete budget items from their clinic"
  ON public.budget_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.budgets
      WHERE budgets.id = budget_items.budget_id
        AND budgets.clinic_id = get_user_clinic_id(auth.uid())
    )
  );

-- budget_approvals policies
CREATE POLICY "Users can view approvals from their clinic"
  ON public.budget_approvals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.budgets
      WHERE budgets.id = budget_approvals.budget_id
        AND budgets.clinic_id = get_user_clinic_id(auth.uid())
    )
  );

CREATE POLICY "Users can create approvals in their clinic"
  ON public.budget_approvals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.budgets
      WHERE budgets.id = budget_approvals.budget_id
        AND budgets.clinic_id = get_user_clinic_id(auth.uid())
    )
  );

-- budget_versions policies
CREATE POLICY "Users can view versions from their clinic"
  ON public.budget_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.budgets
      WHERE budgets.id = budget_versions.budget_id
        AND budgets.clinic_id = get_user_clinic_id(auth.uid())
    )
  );

CREATE POLICY "Users can create versions in their clinic"
  ON public.budget_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.budgets
      WHERE budgets.id = budget_versions.budget_id
        AND budgets.clinic_id = get_user_clinic_id(auth.uid())
    )
  );

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para gerar número do orçamento automaticamente
CREATE OR REPLACE FUNCTION generate_budget_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.numero_orcamento IS NULL OR NEW.numero_orcamento = '' THEN
    NEW.numero_orcamento := 'ORC-' || TO_CHAR(NOW(), 'YYYYMM') || '-' || LPAD(nextval('budget_number_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS budget_number_seq START 1;

CREATE TRIGGER set_budget_number
  BEFORE INSERT ON public.budgets
  FOR EACH ROW
  EXECUTE FUNCTION generate_budget_number();

-- Trigger para calcular data de expiração
CREATE OR REPLACE FUNCTION set_budget_expiration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.data_expiracao IS NULL THEN
    NEW.data_expiracao := CURRENT_DATE + (NEW.validade_dias || ' days')::INTERVAL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_expiration
  BEFORE INSERT ON public.budgets
  FOR EACH ROW
  EXECUTE FUNCTION set_budget_expiration();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.budgets IS 'Orçamentos de tratamentos odontológicos';
COMMENT ON TABLE public.budget_items IS 'Itens individuais de cada orçamento';
COMMENT ON TABLE public.budget_approvals IS 'Histórico de aprovações e rejeições';
COMMENT ON TABLE public.budget_versions IS 'Controle de versões dos orçamentos';