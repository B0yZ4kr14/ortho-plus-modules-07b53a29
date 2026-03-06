-- =====================================================
-- FASE 5 - Módulos Financeiros Dependentes
-- T5.7: SPLIT_PAGAMENTO + T5.8: INADIMPLENCIA
-- =====================================================

-- =====================================================
-- SPLIT DE PAGAMENTO (Otimização Tributária)
-- =====================================================

-- Table: split_payment_rules (Regras de Split)
CREATE TABLE IF NOT EXISTS public.split_payment_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL, -- 'PERCENTAGE', 'FIXED_AMOUNT', 'TIERED'
  status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'INACTIVE'
  priority INTEGER NOT NULL DEFAULT 0,
  conditions JSONB NOT NULL DEFAULT '{}'::jsonb, -- Condições de aplicação da regra
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: split_payment_recipients (Destinatários do Split)
CREATE TABLE IF NOT EXISTS public.split_payment_recipients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  rule_id UUID NOT NULL REFERENCES public.split_payment_rules(id) ON DELETE CASCADE,
  recipient_type TEXT NOT NULL, -- 'DENTIST', 'CLINIC', 'PARTNER', 'TAX'
  recipient_id UUID, -- ID do dentista/parceiro se aplicável
  recipient_name TEXT NOT NULL,
  split_percentage NUMERIC(5,2),
  split_fixed_amount NUMERIC(10,2),
  tax_regime TEXT, -- 'SIMPLES_NACIONAL', 'LUCRO_PRESUMIDO', 'LUCRO_REAL'
  tax_rate NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: split_payment_transactions (Transações com Split)
CREATE TABLE IF NOT EXISTS public.split_payment_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES public.financial_transactions(id) ON DELETE CASCADE,
  conta_receber_id UUID REFERENCES public.contas_receber(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES public.split_payment_rules(id),
  total_amount NUMERIC(10,2) NOT NULL,
  split_calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'PROCESSED', 'FAILED'
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: split_payment_details (Detalhes do Split por Destinatário)
CREATE TABLE IF NOT EXISTS public.split_payment_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  split_transaction_id UUID NOT NULL REFERENCES public.split_payment_transactions(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.split_payment_recipients(id),
  recipient_type TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  split_amount NUMERIC(10,2) NOT NULL,
  tax_withheld NUMERIC(10,2) DEFAULT 0,
  net_amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'PAID', 'FAILED'
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- CONTROLE DE INADIMPLÊNCIA
-- =====================================================

-- Table: overdue_accounts (Contas em Atraso)
CREATE TABLE IF NOT EXISTS public.overdue_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  conta_receber_id UUID NOT NULL REFERENCES public.contas_receber(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL,
  days_overdue INTEGER NOT NULL,
  original_amount NUMERIC(10,2) NOT NULL,
  remaining_amount NUMERIC(10,2) NOT NULL,
  interest_amount NUMERIC(10,2) DEFAULT 0,
  penalty_amount NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'IN_NEGOTIATION', 'LEGAL', 'WRITTEN_OFF', 'RECOVERED'
  risk_level TEXT NOT NULL DEFAULT 'LOW', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: collection_actions (Ações de Cobrança)
CREATE TABLE IF NOT EXISTS public.collection_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  overdue_account_id UUID NOT NULL REFERENCES public.overdue_accounts(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'EMAIL', 'SMS', 'WHATSAPP', 'PHONE_CALL', 'LETTER', 'LEGAL'
  action_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  scheduled_for TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'SENT', 'DELIVERED', 'FAILED', 'RESPONDED'
  message_content TEXT,
  response_received TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: payment_negotiations (Negociações de Pagamento)
CREATE TABLE IF NOT EXISTS public.payment_negotiations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  overdue_account_id UUID NOT NULL REFERENCES public.overdue_accounts(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL,
  original_amount NUMERIC(10,2) NOT NULL,
  negotiated_amount NUMERIC(10,2) NOT NULL,
  discount_percentage NUMERIC(5,2),
  discount_amount NUMERIC(10,2),
  installments INTEGER DEFAULT 1,
  first_payment_date DATE,
  status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'BROKEN'
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: collection_automation_config (Configuração de Automação)
CREATE TABLE IF NOT EXISTS public.collection_automation_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  days_trigger INTEGER NOT NULL, -- Dias de atraso para acionar
  action_type TEXT NOT NULL,
  message_template TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_split_rules_clinic ON public.split_payment_rules(clinic_id);
CREATE INDEX idx_split_recipients_rule ON public.split_payment_recipients(rule_id);
CREATE INDEX idx_split_transactions_clinic ON public.split_payment_transactions(clinic_id);
CREATE INDEX idx_split_details_transaction ON public.split_payment_details(split_transaction_id);
CREATE INDEX idx_overdue_accounts_clinic ON public.overdue_accounts(clinic_id);
CREATE INDEX idx_overdue_accounts_patient ON public.overdue_accounts(patient_id);
CREATE INDEX idx_overdue_accounts_status ON public.overdue_accounts(status);
CREATE INDEX idx_collection_actions_overdue ON public.collection_actions(overdue_account_id);
CREATE INDEX idx_negotiations_overdue ON public.payment_negotiations(overdue_account_id);
CREATE INDEX idx_collection_config_clinic ON public.collection_automation_config(clinic_id);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Split Payment Rules
ALTER TABLE public.split_payment_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view split rules from their clinic"
  ON public.split_payment_rules FOR SELECT
  USING (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Admins can manage split rules"
  ON public.split_payment_rules FOR ALL
  USING (clinic_id = get_user_clinic_id(auth.uid()) AND has_role(auth.uid(), 'ADMIN'::app_role));

-- Split Payment Recipients
ALTER TABLE public.split_payment_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view recipients from their clinic"
  ON public.split_payment_recipients FOR SELECT
  USING (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Admins can manage recipients"
  ON public.split_payment_recipients FOR ALL
  USING (clinic_id = get_user_clinic_id(auth.uid()) AND has_role(auth.uid(), 'ADMIN'::app_role));

-- Split Payment Transactions
ALTER TABLE public.split_payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view split transactions from their clinic"
  ON public.split_payment_transactions FOR SELECT
  USING (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can create split transactions"
  ON public.split_payment_transactions FOR INSERT
  WITH CHECK (clinic_id = get_user_clinic_id(auth.uid()));

-- Split Payment Details
ALTER TABLE public.split_payment_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view split details from their clinic"
  ON public.split_payment_details FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.split_payment_transactions
      WHERE split_payment_transactions.id = split_payment_details.split_transaction_id
        AND split_payment_transactions.clinic_id = get_user_clinic_id(auth.uid())
    )
  );

-- Overdue Accounts
ALTER TABLE public.overdue_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view overdue accounts from their clinic"
  ON public.overdue_accounts FOR SELECT
  USING (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can manage overdue accounts"
  ON public.overdue_accounts FOR ALL
  USING (clinic_id = get_user_clinic_id(auth.uid()));

-- Collection Actions
ALTER TABLE public.collection_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view collection actions from their clinic"
  ON public.collection_actions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.overdue_accounts
      WHERE overdue_accounts.id = collection_actions.overdue_account_id
        AND overdue_accounts.clinic_id = get_user_clinic_id(auth.uid())
    )
  );

CREATE POLICY "Users can create collection actions"
  ON public.collection_actions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.overdue_accounts
      WHERE overdue_accounts.id = collection_actions.overdue_account_id
        AND overdue_accounts.clinic_id = get_user_clinic_id(auth.uid())
    )
  );

-- Payment Negotiations
ALTER TABLE public.payment_negotiations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view negotiations from their clinic"
  ON public.payment_negotiations FOR SELECT
  USING (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can manage negotiations"
  ON public.payment_negotiations FOR ALL
  USING (clinic_id = get_user_clinic_id(auth.uid()));

-- Collection Automation Config
ALTER TABLE public.collection_automation_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view automation config from their clinic"
  ON public.collection_automation_config FOR SELECT
  USING (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Admins can manage automation config"
  ON public.collection_automation_config FOR ALL
  USING (clinic_id = get_user_clinic_id(auth.uid()) AND has_role(auth.uid(), 'ADMIN'::app_role));

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_split_rules_updated_at
  BEFORE UPDATE ON public.split_payment_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_overdue_accounts_updated_at
  BEFORE UPDATE ON public.overdue_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_negotiations_updated_at
  BEFORE UPDATE ON public.payment_negotiations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_collection_config_updated_at
  BEFORE UPDATE ON public.collection_automation_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.split_payment_rules IS 'Regras de divisão de pagamentos para otimização tributária';
COMMENT ON TABLE public.split_payment_recipients IS 'Destinatários das divisões de pagamento';
COMMENT ON TABLE public.split_payment_transactions IS 'Transações financeiras com split aplicado';
COMMENT ON TABLE public.split_payment_details IS 'Detalhamento do split por destinatário';
COMMENT ON TABLE public.overdue_accounts IS 'Contas em atraso para controle de inadimplência';
COMMENT ON TABLE public.collection_actions IS 'Ações de cobrança automatizadas ou manuais';
COMMENT ON TABLE public.payment_negotiations IS 'Negociações de pagamento para contas em atraso';
COMMENT ON TABLE public.collection_automation_config IS 'Configurações de automação de cobrança';