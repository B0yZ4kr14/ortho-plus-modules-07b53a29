-- =====================================================
-- FASE 5 - T5.7: Módulo BI (Business Intelligence)
-- =====================================================

-- Tabela de Dashboards
CREATE TABLE public.bi_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  layout JSONB, -- Grid layout configuration
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_public BOOLEAN NOT NULL DEFAULT false,
  refresh_interval_minutes INTEGER DEFAULT 5,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  shared_with UUID[], -- Array de user IDs
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Widgets
CREATE TABLE public.bi_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID NOT NULL REFERENCES public.bi_dashboards(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  widget_type TEXT NOT NULL, -- 'chart', 'metric', 'table', 'gauge', 'map'
  chart_type TEXT, -- 'line', 'bar', 'pie', 'area', 'scatter'
  data_source TEXT NOT NULL, -- 'patients', 'appointments', 'financial', 'custom_query'
  query_config JSONB NOT NULL, -- Configuration for data fetching
  display_config JSONB, -- Visual configuration (colors, labels, etc)
  position_x INTEGER NOT NULL DEFAULT 0,
  position_y INTEGER NOT NULL DEFAULT 0,
  width INTEGER NOT NULL DEFAULT 4,
  height INTEGER NOT NULL DEFAULT 4,
  refresh_on_load BOOLEAN NOT NULL DEFAULT true,
  cache_duration_minutes INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Relatórios Salvos
CREATE TABLE public.bi_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  report_type TEXT NOT NULL, -- 'financial', 'clinical', 'operational', 'custom'
  schedule JSONB, -- Configuração de agendamento
  parameters JSONB, -- Parâmetros do relatório
  format TEXT NOT NULL DEFAULT 'pdf', -- 'pdf', 'excel', 'csv'
  recipients TEXT[], -- Emails para envio
  last_generated_at TIMESTAMPTZ,
  next_generation_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Métricas Calculadas
CREATE TABLE public.bi_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  metric_key TEXT NOT NULL, -- Chave única da métrica
  name TEXT NOT NULL,
  description TEXT,
  calculation_type TEXT NOT NULL, -- 'sum', 'avg', 'count', 'percentage', 'custom'
  formula TEXT, -- Fórmula SQL ou expressão
  data_sources TEXT[], -- Tabelas/fontes utilizadas
  aggregation_period TEXT NOT NULL DEFAULT 'day', -- 'hour', 'day', 'week', 'month', 'year'
  value NUMERIC,
  trend NUMERIC, -- Variação percentual
  last_calculated_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(clinic_id, metric_key)
);

-- Tabela de Cache de Dados
CREATE TABLE public.bi_data_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  cache_key TEXT NOT NULL,
  widget_id UUID REFERENCES public.bi_widgets(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(clinic_id, cache_key)
);

-- Índices para performance
CREATE INDEX idx_bi_dashboards_clinic_id ON public.bi_dashboards(clinic_id);
CREATE INDEX idx_bi_dashboards_created_by ON public.bi_dashboards(created_by);
CREATE INDEX idx_bi_widgets_dashboard_id ON public.bi_widgets(dashboard_id);
CREATE INDEX idx_bi_widgets_clinic_id ON public.bi_widgets(clinic_id);
CREATE INDEX idx_bi_reports_clinic_id ON public.bi_reports(clinic_id);
CREATE INDEX idx_bi_reports_next_generation ON public.bi_reports(next_generation_at) WHERE is_active = true;
CREATE INDEX idx_bi_metrics_clinic_id ON public.bi_metrics(clinic_id);
CREATE INDEX idx_bi_metrics_key ON public.bi_metrics(clinic_id, metric_key);
CREATE INDEX idx_bi_data_cache_expires ON public.bi_data_cache(expires_at);
CREATE INDEX idx_bi_data_cache_key ON public.bi_data_cache(clinic_id, cache_key);

-- Triggers para updated_at
CREATE TRIGGER update_bi_dashboards_updated_at
  BEFORE UPDATE ON public.bi_dashboards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bi_widgets_updated_at
  BEFORE UPDATE ON public.bi_widgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bi_reports_updated_at
  BEFORE UPDATE ON public.bi_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bi_metrics_updated_at
  BEFORE UPDATE ON public.bi_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies
ALTER TABLE public.bi_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bi_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bi_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bi_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bi_data_cache ENABLE ROW LEVEL SECURITY;

-- Policies para bi_dashboards
CREATE POLICY "Users can view dashboards from their clinic or shared"
  ON public.bi_dashboards FOR SELECT
  USING (
    clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
    OR auth.uid() = ANY(shared_with)
    OR is_public = true
  );

CREATE POLICY "Users can create dashboards in their clinic"
  ON public.bi_dashboards FOR INSERT
  WITH CHECK (
    clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update their own dashboards"
  ON public.bi_dashboards FOR UPDATE
  USING (
    clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can delete their own dashboards"
  ON public.bi_dashboards FOR DELETE
  USING (
    clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
    AND created_by = auth.uid()
  );

-- Policies para bi_widgets
CREATE POLICY "Users can view widgets from accessible dashboards"
  ON public.bi_widgets FOR SELECT
  USING (
    clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can manage widgets in their dashboards"
  ON public.bi_widgets FOR ALL
  USING (
    clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.bi_dashboards
      WHERE bi_dashboards.id = bi_widgets.dashboard_id
      AND bi_dashboards.created_by = auth.uid()
    )
  );

-- Policies para bi_reports
CREATE POLICY "Users can view reports from their clinic"
  ON public.bi_reports FOR SELECT
  USING (clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage reports"
  ON public.bi_reports FOR ALL
  USING (
    clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
    AND (SELECT app_role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN'
  );

-- Policies para bi_metrics
CREATE POLICY "Users can view metrics from their clinic"
  ON public.bi_metrics FOR SELECT
  USING (clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "System can manage metrics"
  ON public.bi_metrics FOR ALL
  USING (clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

-- Policies para bi_data_cache
CREATE POLICY "Users can view cache from their clinic"
  ON public.bi_data_cache FOR SELECT
  USING (clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "System can manage cache"
  ON public.bi_data_cache FOR ALL
  USING (clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

-- Função para limpar cache expirado
CREATE OR REPLACE FUNCTION public.cleanup_bi_cache()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.bi_data_cache WHERE expires_at < now();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Comentários
COMMENT ON TABLE public.bi_dashboards IS 'Módulo BI - Dashboards customizáveis';
COMMENT ON TABLE public.bi_widgets IS 'Módulo BI - Widgets e visualizações';
COMMENT ON TABLE public.bi_reports IS 'Módulo BI - Relatórios agendados';
COMMENT ON TABLE public.bi_metrics IS 'Módulo BI - Métricas calculadas';
COMMENT ON TABLE public.bi_data_cache IS 'Módulo BI - Cache de dados para performance';