-- =====================================================
-- FASE 5 - T5.9: Módulo MARKETING_AUTO
-- =====================================================
-- Tabelas: marketing_campaigns, campaign_triggers, campaign_templates, 
--          campaign_sends, campaign_metrics
-- RLS Policies: Acesso restrito por clínica

-- Tabela: marketing_campaigns (Campanhas de marketing)
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL, -- 'POS_CONSULTA', 'RECALL', 'ANIVERSARIO', 'LEMBRETE', 'PROMOCIONAL', 'EDUCACIONAL'
  status TEXT NOT NULL DEFAULT 'RASCUNHO', -- 'RASCUNHO', 'ATIVO', 'PAUSADO', 'CONCLUIDO', 'ARQUIVADO'
  channel TEXT NOT NULL, -- 'EMAIL', 'SMS', 'WHATSAPP', 'PUSH'
  template_id UUID,
  trigger_config JSONB, -- Configuração de gatilhos automáticos
  target_audience JSONB, -- Segmentação: idade, procedimentos, última consulta, etc.
  schedule_config JSONB, -- Agendamento: horário, frequência, timezone
  send_immediately BOOLEAN DEFAULT false,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_sent_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

-- Tabela: campaign_triggers (Gatilhos automáticos)
CREATE TABLE IF NOT EXISTS public.campaign_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.marketing_campaigns(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL, -- 'DIAS_APOS_CONSULTA', 'DIAS_ANTES_RECALL', 'ANIVERSARIO', 'INATIVIDADE', 'PROCEDIMENTO_CONCLUIDO'
  trigger_condition JSONB NOT NULL, -- Condições específicas
  delay_days INTEGER DEFAULT 0, -- Delay em dias após o gatilho
  delay_hours INTEGER DEFAULT 0, -- Delay em horas
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela: campaign_templates (Templates de mensagens)
CREATE TABLE IF NOT EXISTS public.campaign_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL, -- 'EMAIL', 'SMS', 'WHATSAPP'
  subject TEXT, -- Para emails
  content TEXT NOT NULL, -- Conteúdo com variáveis: {{nome_paciente}}, {{data_consulta}}, etc.
  variables JSONB, -- Lista de variáveis disponíveis
  is_default BOOLEAN DEFAULT false,
  category TEXT, -- 'POS_CONSULTA', 'RECALL', 'ANIVERSARIO', etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela: campaign_sends (Envios individuais)
CREATE TABLE IF NOT EXISTS public.campaign_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.marketing_campaigns(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_contact TEXT NOT NULL, -- email, phone, etc.
  status TEXT NOT NULL DEFAULT 'PENDENTE', -- 'PENDENTE', 'ENVIADO', 'ENTREGUE', 'ABERTO', 'CLICADO', 'CONVERTIDO', 'ERRO', 'CANCELADO'
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ, -- Paciente agendou consulta, comprou, etc.
  error_message TEXT,
  error_code TEXT,
  retry_count INTEGER DEFAULT 0,
  message_content TEXT, -- Conteúdo final enviado (com variáveis substituídas)
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela: campaign_metrics (Métricas agregadas)
CREATE TABLE IF NOT EXISTS public.campaign_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.marketing_campaigns(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_converted INTEGER DEFAULT 0,
  total_errors INTEGER DEFAULT 0,
  open_rate NUMERIC(5,2), -- Percentual
  click_rate NUMERIC(5,2),
  conversion_rate NUMERIC(5,2),
  bounce_rate NUMERIC(5,2),
  unsubscribe_count INTEGER DEFAULT 0,
  revenue_generated NUMERIC(12,2), -- Receita gerada pela campanha
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, metric_date)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_clinic ON public.marketing_campaigns(clinic_id);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status ON public.marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_type ON public.marketing_campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_campaign_triggers_campaign ON public.campaign_triggers(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_templates_clinic ON public.campaign_templates(clinic_id);
CREATE INDEX IF NOT EXISTS idx_campaign_templates_category ON public.campaign_templates(category);
CREATE INDEX IF NOT EXISTS idx_campaign_sends_campaign ON public.campaign_sends(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_sends_patient ON public.campaign_sends(patient_id);
CREATE INDEX IF NOT EXISTS idx_campaign_sends_status ON public.campaign_sends(status);
CREATE INDEX IF NOT EXISTS idx_campaign_sends_scheduled ON public.campaign_sends(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_campaign ON public.campaign_metrics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_date ON public.campaign_metrics(metric_date);

-- RLS Policies: marketing_campaigns
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view campaigns from their clinic"
  ON public.marketing_campaigns
  FOR SELECT
  USING (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Admins can manage campaigns"
  ON public.marketing_campaigns
  FOR ALL
  USING (
    clinic_id = get_user_clinic_id(auth.uid()) 
    AND public.has_role(auth.uid(), 'ADMIN'::public.app_role)
  );

-- RLS Policies: campaign_triggers
ALTER TABLE public.campaign_triggers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view triggers from their clinic campaigns"
  ON public.campaign_triggers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.marketing_campaigns
      WHERE marketing_campaigns.id = campaign_triggers.campaign_id
      AND marketing_campaigns.clinic_id = get_user_clinic_id(auth.uid())
    )
  );

CREATE POLICY "Admins can manage triggers"
  ON public.campaign_triggers
  FOR ALL
  USING (
    public.has_role(auth.uid(), 'ADMIN'::public.app_role)
    AND EXISTS (
      SELECT 1 FROM public.marketing_campaigns
      WHERE marketing_campaigns.id = campaign_triggers.campaign_id
      AND marketing_campaigns.clinic_id = get_user_clinic_id(auth.uid())
    )
  );

-- RLS Policies: campaign_templates
ALTER TABLE public.campaign_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view templates from their clinic"
  ON public.campaign_templates
  FOR SELECT
  USING (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Admins can manage templates"
  ON public.campaign_templates
  FOR ALL
  USING (
    clinic_id = get_user_clinic_id(auth.uid())
    AND public.has_role(auth.uid(), 'ADMIN'::public.app_role)
  );

-- RLS Policies: campaign_sends
ALTER TABLE public.campaign_sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sends from their clinic campaigns"
  ON public.campaign_sends
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.marketing_campaigns
      WHERE marketing_campaigns.id = campaign_sends.campaign_id
      AND marketing_campaigns.clinic_id = get_user_clinic_id(auth.uid())
    )
  );

CREATE POLICY "System can manage sends"
  ON public.campaign_sends
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.marketing_campaigns
      WHERE marketing_campaigns.id = campaign_sends.campaign_id
      AND marketing_campaigns.clinic_id = get_user_clinic_id(auth.uid())
    )
  );

-- RLS Policies: campaign_metrics
ALTER TABLE public.campaign_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view metrics from their clinic campaigns"
  ON public.campaign_metrics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.marketing_campaigns
      WHERE marketing_campaigns.id = campaign_metrics.campaign_id
      AND marketing_campaigns.clinic_id = get_user_clinic_id(auth.uid())
    )
  );

CREATE POLICY "System can update metrics"
  ON public.campaign_metrics
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.marketing_campaigns
      WHERE marketing_campaigns.id = campaign_metrics.campaign_id
      AND marketing_campaigns.clinic_id = get_user_clinic_id(auth.uid())
    )
  );

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION public.update_marketing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_marketing_campaigns_updated_at
  BEFORE UPDATE ON public.marketing_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_marketing_updated_at();

CREATE TRIGGER update_campaign_templates_updated_at
  BEFORE UPDATE ON public.campaign_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_marketing_updated_at();

CREATE TRIGGER update_campaign_metrics_updated_at
  BEFORE UPDATE ON public.campaign_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_marketing_updated_at();

-- Função para atualizar métricas automaticamente
CREATE OR REPLACE FUNCTION public.update_campaign_metrics_on_send_change()
RETURNS TRIGGER AS $$
DECLARE
  v_campaign_id UUID;
  v_metric_date DATE;
BEGIN
  v_campaign_id := COALESCE(NEW.campaign_id, OLD.campaign_id);
  v_metric_date := COALESCE(DATE(NEW.sent_at), DATE(OLD.sent_at), CURRENT_DATE);
  
  -- Calcular métricas
  INSERT INTO public.campaign_metrics (campaign_id, metric_date, total_sent, total_delivered, total_opened, total_clicked, total_converted, total_errors)
  SELECT 
    v_campaign_id,
    v_metric_date,
    COUNT(*) FILTER (WHERE status IN ('ENVIADO', 'ENTREGUE', 'ABERTO', 'CLICADO', 'CONVERTIDO')),
    COUNT(*) FILTER (WHERE status IN ('ENTREGUE', 'ABERTO', 'CLICADO', 'CONVERTIDO')),
    COUNT(*) FILTER (WHERE status IN ('ABERTO', 'CLICADO', 'CONVERTIDO')),
    COUNT(*) FILTER (WHERE status IN ('CLICADO', 'CONVERTIDO')),
    COUNT(*) FILTER (WHERE status = 'CONVERTIDO'),
    COUNT(*) FILTER (WHERE status = 'ERRO')
  FROM public.campaign_sends
  WHERE campaign_id = v_campaign_id
  AND DATE(sent_at) = v_metric_date
  ON CONFLICT (campaign_id, metric_date)
  DO UPDATE SET
    total_sent = EXCLUDED.total_sent,
    total_delivered = EXCLUDED.total_delivered,
    total_opened = EXCLUDED.total_opened,
    total_clicked = EXCLUDED.total_clicked,
    total_converted = EXCLUDED.total_converted,
    total_errors = EXCLUDED.total_errors,
    open_rate = CASE WHEN EXCLUDED.total_delivered > 0 THEN (EXCLUDED.total_opened::NUMERIC / EXCLUDED.total_delivered * 100) ELSE 0 END,
    click_rate = CASE WHEN EXCLUDED.total_opened > 0 THEN (EXCLUDED.total_clicked::NUMERIC / EXCLUDED.total_opened * 100) ELSE 0 END,
    conversion_rate = CASE WHEN EXCLUDED.total_clicked > 0 THEN (EXCLUDED.total_converted::NUMERIC / EXCLUDED.total_clicked * 100) ELSE 0 END,
    updated_at = now();
    
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_metrics_on_send_change
  AFTER INSERT OR UPDATE OR DELETE ON public.campaign_sends
  FOR EACH ROW
  EXECUTE FUNCTION public.update_campaign_metrics_on_send_change();

-- Comentários
COMMENT ON TABLE public.marketing_campaigns IS 'Campanhas de marketing automatizado';
COMMENT ON TABLE public.campaign_triggers IS 'Gatilhos automáticos para disparar campanhas';
COMMENT ON TABLE public.campaign_templates IS 'Templates de mensagens para campanhas';
COMMENT ON TABLE public.campaign_sends IS 'Registro de envios individuais de campanhas';
COMMENT ON TABLE public.campaign_metrics IS 'Métricas agregadas por campanha e data';