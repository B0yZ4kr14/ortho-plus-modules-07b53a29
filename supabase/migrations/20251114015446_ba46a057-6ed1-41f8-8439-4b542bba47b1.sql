-- ============================================
-- MÓDULO FINANCEIRO - TABELAS E RLS
-- Seguindo o Golden Pattern
-- ============================================

-- Tabela: financial_transactions (transações financeiras gerais)
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Dados da transação
  type TEXT NOT NULL CHECK (type IN ('RECEITA', 'DESPESA')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  transaction_date DATE NOT NULL,
  payment_method TEXT,
  status TEXT NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'PAGO', 'CANCELADO')),
  
  -- Metadados
  notes TEXT,
  tags TEXT[]
);

-- Tabela: contas_receber (contas a receber)
CREATE TABLE IF NOT EXISTS public.contas_receber (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Dados da conta
  patient_id UUID REFERENCES public.prontuarios(id),
  descricao TEXT NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  valor_pago DECIMAL(10, 2) DEFAULT 0,
  data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status TEXT NOT NULL DEFAULT 'ABERTO' CHECK (status IN ('ABERTO', 'PAGO', 'VENCIDO', 'CANCELADO')),
  
  -- Detalhes de pagamento
  forma_pagamento TEXT,
  observacoes TEXT,
  
  -- Campos para parcelamento
  parcela_numero INTEGER,
  parcela_total INTEGER
);

-- Tabela: contas_pagar (contas a pagar)
CREATE TABLE IF NOT EXISTS public.contas_pagar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Dados da conta
  fornecedor TEXT NOT NULL,
  categoria TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  valor_pago DECIMAL(10, 2) DEFAULT 0,
  data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status TEXT NOT NULL DEFAULT 'ABERTO' CHECK (status IN ('ABERTO', 'PAGO', 'VENCIDO', 'CANCELADO')),
  
  -- Detalhes de pagamento
  forma_pagamento TEXT,
  observacoes TEXT,
  
  -- Anexos (NFe, boletos, etc)
  anexo_url TEXT,
  
  -- Campos para parcelamento
  parcela_numero INTEGER,
  parcela_total INTEGER,
  recorrente BOOLEAN DEFAULT false,
  periodicidade TEXT CHECK (periodicidade IN ('MENSAL', 'BIMESTRAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL'))
);

-- Tabela: notas_fiscais (notas fiscais)
CREATE TABLE IF NOT EXISTS public.notas_fiscais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Dados da nota fiscal
  numero TEXT NOT NULL,
  serie TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('ENTRADA', 'SAIDA')),
  data_emissao DATE NOT NULL,
  data_recebimento DATE,
  
  -- Partes envolvidas
  emitente_nome TEXT NOT NULL,
  emitente_cnpj TEXT NOT NULL,
  destinatario_nome TEXT,
  destinatario_cnpj TEXT,
  
  -- Valores
  valor_total DECIMAL(10, 2) NOT NULL,
  valor_icms DECIMAL(10, 2),
  valor_iss DECIMAL(10, 2),
  
  -- Status e anexos
  status TEXT NOT NULL DEFAULT 'EMITIDA' CHECK (status IN ('EMITIDA', 'AUTORIZADA', 'CANCELADA', 'DENEGADA')),
  chave_acesso TEXT,
  xml_url TEXT,
  pdf_url TEXT,
  
  -- Metadados
  observacoes TEXT
);

-- Tabela: payment_methods (métodos de pagamento configurados)
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('DINHEIRO', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'PIX', 'BOLETO', 'CHEQUE', 'TRANSFERENCIA', 'CRYPTO')),
  active BOOLEAN DEFAULT true,
  taxa_percentual DECIMAL(5, 2),
  taxa_fixa DECIMAL(10, 2),
  
  -- Configurações específicas (JSON flexível)
  config JSONB,
  
  UNIQUE(clinic_id, name)
);

-- Tabela: financial_categories (categorias financeiras)
CREATE TABLE IF NOT EXISTS public.financial_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('RECEITA', 'DESPESA')),
  color TEXT DEFAULT '#3b82f6',
  icon TEXT DEFAULT 'dollar-sign',
  active BOOLEAN DEFAULT true,
  
  UNIQUE(clinic_id, name, type)
);

-- ============================================
-- HABILITAR RLS EM TODAS AS TABELAS
-- ============================================

ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contas_receber ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contas_pagar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notas_fiscais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_categories ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES RLS (SELECT, INSERT, UPDATE, DELETE)
-- Padrão: Usuário vê/manipula apenas dados da sua clínica
-- ============================================

-- financial_transactions
CREATE POLICY "Users can view own clinic transactions"
ON public.financial_transactions FOR SELECT
USING (clinic_id = (SELECT public.get_user_clinic_id(auth.uid())));

CREATE POLICY "Users can insert transactions for own clinic"
ON public.financial_transactions FOR INSERT
WITH CHECK (clinic_id = (SELECT public.get_user_clinic_id(auth.uid())));

CREATE POLICY "Users can update own clinic transactions"
ON public.financial_transactions FOR UPDATE
USING (clinic_id = (SELECT public.get_user_clinic_id(auth.uid())))
WITH CHECK (clinic_id = (SELECT public.get_user_clinic_id(auth.uid())));

CREATE POLICY "Users can delete own clinic transactions"
ON public.financial_transactions FOR DELETE
USING (clinic_id = (SELECT public.get_user_clinic_id(auth.uid())));

-- contas_receber
CREATE POLICY "Users can view own clinic contas_receber"
ON public.contas_receber FOR SELECT
USING (clinic_id = (SELECT public.get_user_clinic_id(auth.uid())));

CREATE POLICY "Users can insert contas_receber for own clinic"
ON public.contas_receber FOR INSERT
WITH CHECK (clinic_id = (SELECT public.get_user_clinic_id(auth.uid())));

CREATE POLICY "Users can update own clinic contas_receber"
ON public.contas_receber FOR UPDATE
USING (clinic_id = (SELECT public.get_user_clinic_id(auth.uid())))
WITH CHECK (clinic_id = (SELECT public.get_user_clinic_id(auth.uid())));

CREATE POLICY "Users can delete own clinic contas_receber"
ON public.contas_receber FOR DELETE
USING (clinic_id = (SELECT public.get_user_clinic_id(auth.uid())));

-- contas_pagar
CREATE POLICY "Users can view own clinic contas_pagar"
ON public.contas_pagar FOR SELECT
USING (clinic_id = (SELECT public.get_user_clinic_id(auth.uid())));

CREATE POLICY "Users can insert contas_pagar for own clinic"
ON public.contas_pagar FOR INSERT
WITH CHECK (clinic_id = (SELECT public.get_user_clinic_id(auth.uid())));

CREATE POLICY "Users can update own clinic contas_pagar"
ON public.contas_pagar FOR UPDATE
USING (clinic_id = (SELECT public.get_user_clinic_id(auth.uid())))
WITH CHECK (clinic_id = (SELECT public.get_user_clinic_id(auth.uid())));

CREATE POLICY "Users can delete own clinic contas_pagar"
ON public.contas_pagar FOR DELETE
USING (clinic_id = (SELECT public.get_user_clinic_id(auth.uid())));

-- notas_fiscais
CREATE POLICY "Users can view own clinic notas_fiscais"
ON public.notas_fiscais FOR SELECT
USING (clinic_id = (SELECT public.get_user_clinic_id(auth.uid())));

CREATE POLICY "Users can insert notas_fiscais for own clinic"
ON public.notas_fiscais FOR INSERT
WITH CHECK (clinic_id = (SELECT public.get_user_clinic_id(auth.uid())));

CREATE POLICY "Users can update own clinic notas_fiscais"
ON public.notas_fiscais FOR UPDATE
USING (clinic_id = (SELECT public.get_user_clinic_id(auth.uid())))
WITH CHECK (clinic_id = (SELECT public.get_user_clinic_id(auth.uid())));

CREATE POLICY "Users can delete own clinic notas_fiscais"
ON public.notas_fiscais FOR DELETE
USING (clinic_id = (SELECT public.get_user_clinic_id(auth.uid())));

-- payment_methods
CREATE POLICY "Users can view own clinic payment_methods"
ON public.payment_methods FOR SELECT
USING (clinic_id = (SELECT public.get_user_clinic_id(auth.uid())));

CREATE POLICY "Users can insert payment_methods for own clinic"
ON public.payment_methods FOR INSERT
WITH CHECK (clinic_id = (SELECT public.get_user_clinic_id(auth.uid())));

CREATE POLICY "Users can update own clinic payment_methods"
ON public.payment_methods FOR UPDATE
USING (clinic_id = (SELECT public.get_user_clinic_id(auth.uid())))
WITH CHECK (clinic_id = (SELECT public.get_user_clinic_id(auth.uid())));

CREATE POLICY "Users can delete own clinic payment_methods"
ON public.payment_methods FOR DELETE
USING (clinic_id = (SELECT public.get_user_clinic_id(auth.uid())));

-- financial_categories
CREATE POLICY "Users can view own clinic financial_categories"
ON public.financial_categories FOR SELECT
USING (clinic_id = (SELECT public.get_user_clinic_id(auth.uid())));

CREATE POLICY "Users can insert financial_categories for own clinic"
ON public.financial_categories FOR INSERT
WITH CHECK (clinic_id = (SELECT public.get_user_clinic_id(auth.uid())));

CREATE POLICY "Users can update own clinic financial_categories"
ON public.financial_categories FOR UPDATE
USING (clinic_id = (SELECT public.get_user_clinic_id(auth.uid())))
WITH CHECK (clinic_id = (SELECT public.get_user_clinic_id(auth.uid())));

CREATE POLICY "Users can delete own clinic financial_categories"
ON public.financial_categories FOR DELETE
USING (clinic_id = (SELECT public.get_user_clinic_id(auth.uid())));

-- ============================================
-- TRIGGERS DE UPDATED_AT
-- ============================================

CREATE TRIGGER update_financial_transactions_updated_at
  BEFORE UPDATE ON public.financial_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contas_receber_updated_at
  BEFORE UPDATE ON public.contas_receber
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contas_pagar_updated_at
  BEFORE UPDATE ON public.contas_pagar
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notas_fiscais_updated_at
  BEFORE UPDATE ON public.notas_fiscais
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_categories_updated_at
  BEFORE UPDATE ON public.financial_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- TRIGGERS DE AUDITORIA
-- ============================================

-- Auditar mudanças em transações financeiras
CREATE OR REPLACE FUNCTION public.log_financial_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    clinic_id,
    user_id,
    action,
    details
  )
  VALUES (
    NEW.clinic_id,
    auth.uid(),
    TG_OP || '_FINANCIAL_' || TG_TABLE_NAME,
    jsonb_build_object(
      'record_id', NEW.id,
      'table', TG_TABLE_NAME,
      'timestamp', now(),
      'old_data', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
      'new_data', row_to_json(NEW)
    )
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER audit_financial_transactions
  AFTER INSERT OR UPDATE ON public.financial_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.log_financial_changes();

CREATE TRIGGER audit_contas_receber
  AFTER INSERT OR UPDATE ON public.contas_receber
  FOR EACH ROW
  EXECUTE FUNCTION public.log_financial_changes();

CREATE TRIGGER audit_contas_pagar
  AFTER INSERT OR UPDATE ON public.contas_pagar
  FOR EACH ROW
  EXECUTE FUNCTION public.log_financial_changes();

-- ============================================
-- SEED DATA: Categorias Padrão
-- ============================================

-- Inserir categorias padrão para a clínica demo (se existir)
DO $$
DECLARE
  demo_clinic_id UUID;
BEGIN
  -- Buscar ID da clínica demo
  SELECT id INTO demo_clinic_id FROM public.clinics LIMIT 1;
  
  IF demo_clinic_id IS NOT NULL THEN
    -- Categorias de RECEITA
    INSERT INTO public.financial_categories (clinic_id, name, type, color, icon) VALUES
    (demo_clinic_id, 'Consultas', 'RECEITA', '#10b981', 'stethoscope'),
    (demo_clinic_id, 'Tratamentos', 'RECEITA', '#3b82f6', 'activity'),
    (demo_clinic_id, 'Procedimentos', 'RECEITA', '#8b5cf6', 'scissors'),
    (demo_clinic_id, 'Produtos', 'RECEITA', '#f59e0b', 'package'),
    (demo_clinic_id, 'Outros', 'RECEITA', '#6b7280', 'dollar-sign')
    ON CONFLICT (clinic_id, name, type) DO NOTHING;
    
    -- Categorias de DESPESA
    INSERT INTO public.financial_categories (clinic_id, name, type, color, icon) VALUES
    (demo_clinic_id, 'Salários', 'DESPESA', '#ef4444', 'users'),
    (demo_clinic_id, 'Aluguel', 'DESPESA', '#f97316', 'home'),
    (demo_clinic_id, 'Materiais', 'DESPESA', '#eab308', 'box'),
    (demo_clinic_id, 'Equipamentos', 'DESPESA', '#06b6d4', 'cpu'),
    (demo_clinic_id, 'Impostos', 'DESPESA', '#84cc16', 'file-text'),
    (demo_clinic_id, 'Outros', 'DESPESA', '#6b7280', 'dollar-sign')
    ON CONFLICT (clinic_id, name, type) DO NOTHING;
    
    -- Métodos de pagamento padrão
    INSERT INTO public.payment_methods (clinic_id, name, type) VALUES
    (demo_clinic_id, 'Dinheiro', 'DINHEIRO'),
    (demo_clinic_id, 'PIX', 'PIX'),
    (demo_clinic_id, 'Cartão de Crédito', 'CARTAO_CREDITO'),
    (demo_clinic_id, 'Cartão de Débito', 'CARTAO_DEBITO'),
    (demo_clinic_id, 'Boleto', 'BOLETO')
    ON CONFLICT (clinic_id, name) DO NOTHING;
  END IF;
END $$;