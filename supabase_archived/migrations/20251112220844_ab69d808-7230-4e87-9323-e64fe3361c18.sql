-- =====================================================
-- FASE 3: CRM + FUNIL DE VENDAS
-- =====================================================

-- Leads (potenciais pacientes)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id),
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  whatsapp TEXT,
  origem TEXT NOT NULL CHECK (origem IN ('SITE', 'WHATSAPP', 'INSTAGRAM', 'FACEBOOK', 'GOOGLE_ADS', 'INDICACAO', 'ORGANICO', 'OUTROS')),
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  interesse TEXT, -- Procedimento de interesse
  status_funil TEXT NOT NULL DEFAULT 'NOVO' CHECK (status_funil IN ('NOVO', 'CONTATO_INICIAL', 'AGENDAMENTO', 'AVALIACAO', 'ORCAMENTO_ENVIADO', 'NEGOCIACAO', 'GANHO', 'PERDIDO')),
  score_qualidade INTEGER DEFAULT 0 CHECK (score_qualidade BETWEEN 0 AND 100),
  temperatura TEXT NOT NULL DEFAULT 'FRIO' CHECK (temperatura IN ('FRIO', 'MORNO', 'QUENTE')),
  ultimo_contato TIMESTAMPTZ,
  proximo_followup TIMESTAMPTZ,
  motivo_perda TEXT,
  valor_estimado NUMERIC(10,2),
  observacoes TEXT,
  atribuido_a UUID, -- Dentista/vendedor responsável
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Interações com leads (follow-ups)
CREATE TABLE IF NOT EXISTS public.lead_interacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('EMAIL', 'TELEFONE', 'WHATSAPP', 'PRESENCIAL', 'REUNIAO', 'NOTA')),
  descricao TEXT NOT NULL,
  resultado TEXT, -- POSITIVO, NEGATIVO, NEUTRO
  proximo_passo TEXT,
  agendou_avaliacao BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tags de leads
CREATE TABLE IF NOT EXISTS public.lead_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(lead_id, tag)
);

-- Campanhas de marketing
CREATE TABLE IF NOT EXISTS public.campanhas_marketing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id),
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('EMAIL', 'SMS', 'WHATSAPP', 'PUSH', 'MULTI_CANAL')),
  status TEXT NOT NULL DEFAULT 'RASCUNHO' CHECK (status IN ('RASCUNHO', 'AGENDADA', 'EM_EXECUCAO', 'CONCLUIDA', 'PAUSADA', 'CANCELADA')),
  data_inicio TIMESTAMPTZ,
  data_fim TIMESTAMPTZ,
  segmento_alvo JSONB, -- Filtros de segmentação
  conteudo_template TEXT NOT NULL,
  total_destinatarios INTEGER DEFAULT 0,
  total_enviados INTEGER DEFAULT 0,
  total_aberturas INTEGER DEFAULT 0,
  total_cliques INTEGER DEFAULT 0,
  total_conversoes INTEGER DEFAULT 0,
  taxa_abertura NUMERIC(5,2),
  taxa_clique NUMERIC(5,2),
  taxa_conversao NUMERIC(5,2),
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Envios de campanha
CREATE TABLE IF NOT EXISTS public.campanha_envios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campanha_id UUID NOT NULL REFERENCES public.campanhas_marketing(id) ON DELETE CASCADE,
  destinatario_id UUID NOT NULL, -- Lead ou Patient
  destinatario_tipo TEXT NOT NULL CHECK (destinatario_tipo IN ('LEAD', 'PATIENT')),
  email TEXT,
  telefone TEXT,
  status_envio TEXT NOT NULL DEFAULT 'PENDENTE' CHECK (status_envio IN ('PENDENTE', 'ENVIADO', 'ENTREGUE', 'ABERTO', 'CLICADO', 'CONVERTEU', 'ERRO')),
  enviado_em TIMESTAMPTZ,
  aberto_em TIMESTAMPTZ,
  clicado_em TIMESTAMPTZ,
  convertido_em TIMESTAMPTZ,
  erro_mensagem TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_leads_clinic ON public.leads(clinic_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status_funil);
CREATE INDEX IF NOT EXISTS idx_leads_score ON public.leads(score_qualidade DESC);
CREATE INDEX IF NOT EXISTS idx_leads_proximo_followup ON public.leads(proximo_followup);
CREATE INDEX IF NOT EXISTS idx_lead_interacoes_lead ON public.lead_interacoes(lead_id);
CREATE INDEX IF NOT EXISTS idx_campanhas_clinic ON public.campanhas_marketing(clinic_id);
CREATE INDEX IF NOT EXISTS idx_campanhas_status ON public.campanhas_marketing(status);
CREATE INDEX IF NOT EXISTS idx_campanha_envios_campanha ON public.campanha_envios(campanha_id);
CREATE INDEX IF NOT EXISTS idx_campanha_envios_status ON public.campanha_envios(status_envio);

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campanhas_updated_at BEFORE UPDATE ON public.campanhas_marketing
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view leads from their clinic" ON public.leads FOR SELECT USING (clinic_id = get_user_clinic_id(auth.uid()));
CREATE POLICY "Users can create leads in their clinic" ON public.leads FOR INSERT WITH CHECK (clinic_id = get_user_clinic_id(auth.uid()));
CREATE POLICY "Users can update leads from their clinic" ON public.leads FOR UPDATE USING (clinic_id = get_user_clinic_id(auth.uid()));
CREATE POLICY "Users can delete leads from their clinic" ON public.leads FOR DELETE USING (clinic_id = get_user_clinic_id(auth.uid()));

-- Lead interações
ALTER TABLE public.lead_interacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage lead_interacoes" ON public.lead_interacoes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.leads WHERE leads.id = lead_interacoes.lead_id AND leads.clinic_id = get_user_clinic_id(auth.uid()))
);

-- Lead tags
ALTER TABLE public.lead_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage lead_tags" ON public.lead_tags FOR ALL USING (
  EXISTS (SELECT 1 FROM public.leads WHERE leads.id = lead_tags.lead_id AND leads.clinic_id = get_user_clinic_id(auth.uid()))
);

-- Campanhas
ALTER TABLE public.campanhas_marketing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view campanhas from their clinic" ON public.campanhas_marketing FOR SELECT USING (clinic_id = get_user_clinic_id(auth.uid()));
CREATE POLICY "Admins can manage campanhas" ON public.campanhas_marketing FOR ALL USING (clinic_id = get_user_clinic_id(auth.uid()) AND has_role(auth.uid(), 'ADMIN'::app_role));

-- Campanha envios
ALTER TABLE public.campanha_envios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view envios" ON public.campanha_envios FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.campanhas_marketing WHERE campanhas_marketing.id = campanha_envios.campanha_id AND campanhas_marketing.clinic_id = get_user_clinic_id(auth.uid()))
);

-- =====================================================
-- REALTIME
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.campanhas_marketing;