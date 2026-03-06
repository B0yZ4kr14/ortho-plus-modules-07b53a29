-- Tabela para Real User Monitoring (RUM) - Web Vitals
CREATE TABLE IF NOT EXISTS public.rum_metrics (
  id BIGSERIAL PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metric_name TEXT NOT NULL, -- FCP, LCP, FID, CLS, TTFB
  metric_value NUMERIC NOT NULL,
  rating TEXT NOT NULL CHECK (rating IN ('good', 'needs-improvement', 'poor')),
  page_url TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_rum_metrics_clinic_id ON public.rum_metrics(clinic_id);
CREATE INDEX IF NOT EXISTS idx_rum_metrics_created_at ON public.rum_metrics(created_at);
CREATE INDEX IF NOT EXISTS idx_rum_metrics_metric_name ON public.rum_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_rum_metrics_rating ON public.rum_metrics(rating);

-- RLS policies
ALTER TABLE public.rum_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own metrics"
  ON public.rum_metrics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their clinic metrics"
  ON public.rum_metrics
  FOR SELECT
  USING (
    clinic_id IN (
      SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Função para limpar métricas antigas (> 30 dias)
CREATE OR REPLACE FUNCTION public.cleanup_old_rum_metrics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.rum_metrics
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$;

-- Comentários
COMMENT ON TABLE public.rum_metrics IS 'Armazena métricas de Web Vitals para Real User Monitoring';
COMMENT ON COLUMN public.rum_metrics.metric_name IS 'Nome da métrica: FCP (First Contentful Paint), LCP (Largest Contentful Paint), FID (First Input Delay), CLS (Cumulative Layout Shift), TTFB (Time to First Byte)';
COMMENT ON COLUMN public.rum_metrics.rating IS 'Classificação da métrica conforme thresholds do Google: good, needs-improvement, poor';