-- =====================================================
-- FASE 1: CORE MISSING FUNCTIONALITIES - PARTE 1
-- Módulo de Orçamentos, Contratos e Portal do Paciente
-- =====================================================

-- =====================================================
-- 1. MÓDULO DE ORÇAMENTOS E PLANOS DE TRATAMENTO
-- =====================================================

-- Tabela principal de orçamentos
CREATE TABLE IF NOT EXISTS public.orcamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id),
  patient_id UUID NOT NULL,
  prontuario_id UUID REFERENCES public.prontuarios(id),
  numero_orcamento TEXT NOT NULL UNIQUE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo_plano TEXT NOT NULL CHECK (tipo_plano IN ('BASICO', 'INTERMEDIARIO', 'PREMIUM')),
  valor_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  desconto_percentual NUMERIC(5,2) DEFAULT 0,
  desconto_valor NUMERIC(10,2) DEFAULT 0,
  valor_final NUMERIC(10,2) NOT NULL DEFAULT 0,
  validade_dias INTEGER NOT NULL DEFAULT 30,
  data_validade DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'RASCUNHO' CHECK (status IN ('RASCUNHO', 'ENVIADO', 'VISUALIZADO', 'APROVADO', 'REJEITADO', 'EXPIRADO', 'CONVERTIDO')),
  aprovado_em TIMESTAMPTZ,
  aprovado_por UUID,
  rejeitado_em TIMESTAMPTZ,
  motivo_rejeicao TEXT,
  convertido_em TIMESTAMPTZ,
  observacoes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Itens do orçamento (procedimentos)
CREATE TABLE IF NOT EXISTS public.orcamento_itens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  orcamento_id UUID NOT NULL REFERENCES public.orcamentos(id) ON DELETE CASCADE,
  procedimento_id UUID,
  dente_codigo TEXT,
  descricao TEXT NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  valor_unitario NUMERIC(10,2) NOT NULL,
  valor_total NUMERIC(10,2) NOT NULL,
  observacoes TEXT,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Condições de pagamento do orçamento
CREATE TABLE IF NOT EXISTS public.orcamento_pagamento (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  orcamento_id UUID NOT NULL REFERENCES public.orcamentos(id) ON DELETE CASCADE,
  tipo_pagamento TEXT NOT NULL CHECK (tipo_pagamento IN ('A_VISTA', 'PARCELADO', 'ENTRADA_PARCELADO')),
  numero_parcelas INTEGER,
  valor_entrada NUMERIC(10,2),
  valor_parcela NUMERIC(10,2),
  forma_pagamento TEXT[], -- ['PIX', 'CARTAO_CREDITO', 'BOLETO']
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Histórico de visualizações do orçamento
CREATE TABLE IF NOT EXISTS public.orcamento_visualizacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  orcamento_id UUID NOT NULL REFERENCES public.orcamentos(id) ON DELETE CASCADE,
  visualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  duracao_segundos INTEGER
);

-- =====================================================
-- 2. MÓDULO DE CONTRATOS DIGITAIS
-- =====================================================

-- Templates de contratos
CREATE TABLE IF NOT EXISTS public.contrato_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id),
  nome TEXT NOT NULL,
  tipo_tratamento TEXT NOT NULL,
  conteudo_html TEXT NOT NULL,
  variaveis_disponiveis JSONB, -- {paciente_nome, valor_total, etc}
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Contratos gerados
CREATE TABLE IF NOT EXISTS public.contratos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id),
  patient_id UUID NOT NULL,
  orcamento_id UUID REFERENCES public.orcamentos(id),
  template_id UUID REFERENCES public.contrato_templates(id),
  numero_contrato TEXT NOT NULL UNIQUE,
  titulo TEXT NOT NULL,
  conteudo_html TEXT NOT NULL,
  valor_contrato NUMERIC(10,2) NOT NULL,
  data_inicio DATE NOT NULL,
  data_termino DATE,
  renovacao_automatica BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'AGUARDANDO_ASSINATURA' CHECK (status IN ('AGUARDANDO_ASSINATURA', 'ASSINADO', 'CANCELADO', 'EXPIRADO', 'CONCLUIDO')),
  hash_blockchain TEXT, -- Para imutabilidade
  assinado_em TIMESTAMPTZ,
  assinatura_paciente_base64 TEXT,
  assinatura_dentista_base64 TEXT,
  ip_assinatura TEXT,
  cancelado_em TIMESTAMPTZ,
  motivo_cancelamento TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Anexos do contrato
CREATE TABLE IF NOT EXISTS public.contrato_anexos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contrato_id UUID NOT NULL REFERENCES public.contratos(id) ON DELETE CASCADE,
  nome_arquivo TEXT NOT NULL,
  caminho_storage TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  tamanho_bytes BIGINT NOT NULL,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 3. PORTAL DO PACIENTE (SELF-SERVICE)
-- =====================================================

-- Contas de acesso dos pacientes
CREATE TABLE IF NOT EXISTS public.patient_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  email_verificado BOOLEAN NOT NULL DEFAULT FALSE,
  token_verificacao TEXT,
  ultimo_acesso TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notificações do portal
CREATE TABLE IF NOT EXISTS public.patient_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('CONSULTA_AGENDADA', 'LEMBRETE_CONSULTA', 'ORCAMENTO_DISPONIVEL', 'PAGAMENTO_PENDENTE', 'RESULTADO_EXAME', 'MENSAGEM_CLINICA')),
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  lida BOOLEAN NOT NULL DEFAULT FALSE,
  lida_em TIMESTAMPTZ,
  link_acao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Mensagens do chat clínica-paciente
CREATE TABLE IF NOT EXISTS public.patient_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id),
  patient_id UUID NOT NULL,
  remetente_tipo TEXT NOT NULL CHECK (remetente_tipo IN ('PACIENTE', 'CLINICA')),
  remetente_id UUID NOT NULL,
  mensagem TEXT NOT NULL,
  anexos JSONB, -- [{nome, url, tipo}]
  lida BOOLEAN NOT NULL DEFAULT FALSE,
  lida_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Preferências do paciente
CREATE TABLE IF NOT EXISTS public.patient_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL UNIQUE,
  notificacoes_email BOOLEAN DEFAULT TRUE,
  notificacoes_sms BOOLEAN DEFAULT TRUE,
  notificacoes_whatsapp BOOLEAN DEFAULT TRUE,
  notificacoes_push BOOLEAN DEFAULT TRUE,
  lembrete_consulta_horas INTEGER DEFAULT 24,
  idioma TEXT DEFAULT 'pt-BR',
  tema TEXT DEFAULT 'light',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_orcamentos_clinic_patient ON public.orcamentos(clinic_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_status ON public.orcamentos(status);
CREATE INDEX IF NOT EXISTS idx_orcamentos_data_validade ON public.orcamentos(data_validade);
CREATE INDEX IF NOT EXISTS idx_orcamento_itens_orcamento ON public.orcamento_itens(orcamento_id);
CREATE INDEX IF NOT EXISTS idx_contratos_clinic_patient ON public.contratos(clinic_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_contratos_status ON public.contratos(status);
CREATE INDEX IF NOT EXISTS idx_contratos_orcamento ON public.contratos(orcamento_id);
CREATE INDEX IF NOT EXISTS idx_patient_accounts_email ON public.patient_accounts(email);
CREATE INDEX IF NOT EXISTS idx_patient_notifications_patient ON public.patient_notifications(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_notifications_lida ON public.patient_notifications(patient_id, lida);
CREATE INDEX IF NOT EXISTS idx_patient_messages_patient ON public.patient_messages(patient_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger para updated_at
CREATE TRIGGER update_orcamentos_updated_at BEFORE UPDATE ON public.orcamentos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contrato_templates_updated_at BEFORE UPDATE ON public.contrato_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contratos_updated_at BEFORE UPDATE ON public.contratos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patient_accounts_updated_at BEFORE UPDATE ON public.patient_accounts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Orçamentos
ALTER TABLE public.orcamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view orcamentos from their clinic" ON public.orcamentos FOR SELECT USING (clinic_id = get_user_clinic_id(auth.uid()));
CREATE POLICY "Users can create orcamentos in their clinic" ON public.orcamentos FOR INSERT WITH CHECK (clinic_id = get_user_clinic_id(auth.uid()));
CREATE POLICY "Users can update orcamentos from their clinic" ON public.orcamentos FOR UPDATE USING (clinic_id = get_user_clinic_id(auth.uid()));
CREATE POLICY "Users can delete orcamentos from their clinic" ON public.orcamentos FOR DELETE USING (clinic_id = get_user_clinic_id(auth.uid()));

-- Orçamento itens
ALTER TABLE public.orcamento_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage orcamento_itens" ON public.orcamento_itens FOR ALL USING (
  EXISTS (SELECT 1 FROM public.orcamentos WHERE orcamentos.id = orcamento_itens.orcamento_id AND orcamentos.clinic_id = get_user_clinic_id(auth.uid()))
);

-- Orçamento pagamento
ALTER TABLE public.orcamento_pagamento ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage orcamento_pagamento" ON public.orcamento_pagamento FOR ALL USING (
  EXISTS (SELECT 1 FROM public.orcamentos WHERE orcamentos.id = orcamento_pagamento.orcamento_id AND orcamentos.clinic_id = get_user_clinic_id(auth.uid()))
);

-- Orçamento visualizações
ALTER TABLE public.orcamento_visualizacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view orcamento_visualizacoes" ON public.orcamento_visualizacoes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orcamentos WHERE orcamentos.id = orcamento_visualizacoes.orcamento_id AND orcamentos.clinic_id = get_user_clinic_id(auth.uid()))
);
CREATE POLICY "Anyone can insert visualizations" ON public.orcamento_visualizacoes FOR INSERT WITH CHECK (true);

-- Contrato templates
ALTER TABLE public.contrato_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view templates from their clinic" ON public.contrato_templates FOR SELECT USING (clinic_id = get_user_clinic_id(auth.uid()));
CREATE POLICY "Admins can manage templates" ON public.contrato_templates FOR ALL USING (clinic_id = get_user_clinic_id(auth.uid()) AND has_role(auth.uid(), 'ADMIN'::app_role));

-- Contratos
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view contratos from their clinic" ON public.contratos FOR SELECT USING (clinic_id = get_user_clinic_id(auth.uid()));
CREATE POLICY "Users can create contratos in their clinic" ON public.contratos FOR INSERT WITH CHECK (clinic_id = get_user_clinic_id(auth.uid()));
CREATE POLICY "Users can update contratos from their clinic" ON public.contratos FOR UPDATE USING (clinic_id = get_user_clinic_id(auth.uid()));

-- Contrato anexos
ALTER TABLE public.contrato_anexos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage contrato_anexos" ON public.contrato_anexos FOR ALL USING (
  EXISTS (SELECT 1 FROM public.contratos WHERE contratos.id = contrato_anexos.contrato_id AND contratos.clinic_id = get_user_clinic_id(auth.uid()))
);

-- Patient accounts (público para login)
ALTER TABLE public.patient_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients can view own account" ON public.patient_accounts FOR SELECT USING (id = auth.uid() OR patient_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Clinics can manage patient accounts" ON public.patient_accounts FOR ALL USING (
  patient_id IN (SELECT patient_id FROM prontuarios WHERE clinic_id = get_user_clinic_id(auth.uid()))
);

-- Patient notifications
ALTER TABLE public.patient_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients can view own notifications" ON public.patient_notifications FOR SELECT USING (patient_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Clinics can create notifications" ON public.patient_notifications FOR INSERT WITH CHECK (
  patient_id IN (SELECT patient_id FROM prontuarios WHERE clinic_id = get_user_clinic_id(auth.uid()))
);

-- Patient messages
ALTER TABLE public.patient_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients can view own messages" ON public.patient_messages FOR SELECT USING (patient_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Clinics can manage messages" ON public.patient_messages FOR ALL USING (clinic_id = get_user_clinic_id(auth.uid()));

-- Patient preferences
ALTER TABLE public.patient_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients can manage own preferences" ON public.patient_preferences FOR ALL USING (patient_id IN (SELECT id FROM profiles WHERE id = auth.uid()));