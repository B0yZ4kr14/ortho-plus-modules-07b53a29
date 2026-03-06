-- ============================================
-- FASE 2 - TASK 2.5: IA PARA ANÁLISE DE RADIOGRAFIAS (ENHANCEMENT)
-- Data: 2025-11-15
-- Nota: Tabela analises_radiograficas já existe, apenas melhorando
-- ============================================

-- 1. ADICIONAR CAMPOS PARA IA AVANÇADA
ALTER TABLE public.analises_radiograficas
  ADD COLUMN IF NOT EXISTS ai_model_version text DEFAULT 'gemini-2.5-flash',
  ADD COLUMN IF NOT EXISTS ai_processing_time_ms int,
  ADD COLUMN IF NOT EXISTS auto_approved boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS feedback_rating int CHECK (feedback_rating BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS feedback_comments text;

-- 2. TABELA DE HISTÓRICO DE ANÁLISES (VERSIONAMENTO)
CREATE TABLE IF NOT EXISTS public.analises_radiograficas_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analise_id uuid NOT NULL REFERENCES public.analises_radiograficas(id) ON DELETE CASCADE,
  versao int NOT NULL DEFAULT 1,
  resultado_ia jsonb NOT NULL,
  confidence_score numeric(5,2),
  problemas_detectados int,
  ai_model_version text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid NOT NULL,
  CONSTRAINT unique_versao_por_analise UNIQUE (analise_id, versao)
);

-- 3. TABELA DE TEMPLATES DE LAUDO
CREATE TABLE IF NOT EXISTS public.radiografia_laudo_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  nome_template text NOT NULL,
  tipo_radiografia text NOT NULL,
  template_markdown text NOT NULL,
  variaveis_disponiveis jsonb DEFAULT '[]'::jsonb,
  is_default boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid NOT NULL
);

-- 4. TABELA DE TREINAMENTO/FEEDBACK DA IA
CREATE TABLE IF NOT EXISTS public.radiografia_ai_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analise_id uuid NOT NULL REFERENCES public.analises_radiograficas(id) ON DELETE CASCADE,
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  
  -- Feedback do dentista
  ia_estava_correta boolean NOT NULL,
  diagnostico_correto text,
  falsos_positivos jsonb DEFAULT '[]'::jsonb,
  falsos_negativos jsonb DEFAULT '[]'::jsonb,
  
  -- Metadados para re-treinamento
  imagem_marcada_url text,
  anotacoes_dentista jsonb DEFAULT '{}'::jsonb,
  usado_para_treino boolean DEFAULT false,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid NOT NULL
);

-- 5. RLS POLICIES
ALTER TABLE public.analises_radiograficas_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radiografia_laudo_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radiografia_ai_feedback ENABLE ROW LEVEL SECURITY;

-- History
CREATE POLICY "Usuários podem ver histórico de análises da sua clínica"
  ON public.analises_radiograficas_history FOR SELECT
  USING (
    public.is_root_user() OR
    EXISTS (
      SELECT 1 FROM public.analises_radiograficas a
      WHERE a.id = analises_radiograficas_history.analise_id
        AND a.clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Usuários podem criar histórico de análises na sua clínica"
  ON public.analises_radiograficas_history FOR INSERT
  WITH CHECK (
    public.is_root_user() OR
    EXISTS (
      SELECT 1 FROM public.analises_radiograficas a
      WHERE a.id = analises_radiograficas_history.analise_id
        AND a.clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
    )
  );

-- Templates
CREATE POLICY "Usuários podem ver templates da sua clínica"
  ON public.radiografia_laudo_templates FOR SELECT
  USING (
    public.is_root_user() OR
    clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Usuários podem criar/atualizar templates na sua clínica"
  ON public.radiografia_laudo_templates FOR ALL
  USING (
    public.is_root_user() OR
    clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
  );

-- Feedback
CREATE POLICY "Usuários podem ver/criar feedback de IA da sua clínica"
  ON public.radiografia_ai_feedback FOR ALL
  USING (
    public.is_root_user() OR
    clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
  );

-- 6. FUNÇÕES DE ANÁLISE
CREATE OR REPLACE FUNCTION public.calculate_ai_accuracy_by_clinic(p_clinic_id uuid)
RETURNS TABLE (
  total_analises bigint,
  analises_corretas bigint,
  taxa_acerto numeric,
  media_confidence numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::bigint as total_analises,
    COUNT(*) FILTER (WHERE f.ia_estava_correta = true)::bigint as analises_corretas,
    ROUND(
      (COUNT(*) FILTER (WHERE f.ia_estava_correta = true)::numeric / 
       NULLIF(COUNT(*)::numeric, 0)) * 100, 
      2
    ) as taxa_acerto,
    ROUND(AVG(a.confidence_score), 2) as media_confidence
  FROM public.analises_radiograficas a
  LEFT JOIN public.radiografia_ai_feedback f ON a.id = f.analise_id
  WHERE a.clinic_id = p_clinic_id
    AND a.status_analise = 'concluida';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. ÍNDICES
CREATE INDEX idx_analises_history_analise ON public.analises_radiograficas_history(analise_id);
CREATE INDEX idx_laudo_templates_clinic ON public.radiografia_laudo_templates(clinic_id, tipo_radiografia);
CREATE INDEX idx_ai_feedback_analise ON public.radiografia_ai_feedback(analise_id);
CREATE INDEX idx_ai_feedback_clinic ON public.radiografia_ai_feedback(clinic_id);
CREATE INDEX idx_ai_feedback_training ON public.radiografia_ai_feedback(usado_para_treino) WHERE usado_para_treino = true;

-- 8. COMMENTS
COMMENT ON TABLE public.analises_radiograficas_history IS 'Histórico de versões de análises radiográficas por IA';
COMMENT ON TABLE public.radiografia_laudo_templates IS 'Templates customizáveis para geração de laudos radiográficos';
COMMENT ON TABLE public.radiografia_ai_feedback IS 'Feedback dos dentistas sobre análises da IA (para melhoria contínua)';
COMMENT ON FUNCTION public.calculate_ai_accuracy_by_clinic IS 'Calcula a taxa de acerto da IA para uma clínica específica';
COMMENT ON COLUMN public.analises_radiograficas.ai_model_version IS 'Versão do modelo de IA usado (ex: gemini-2.5-flash, gemini-2.5-pro)';
COMMENT ON COLUMN public.radiografia_ai_feedback.usado_para_treino IS 'Indica se este feedback foi usado para retreinar/melhorar o modelo';

-- 9. AUDITORIA
INSERT INTO public.audit_logs (action, action_type, details)
VALUES (
  'AI_RADIOGRAFIA_MODULE_ENHANCED',
  'UPDATE',
  jsonb_build_object(
    'timestamp', now(),
    'tables', ARRAY['analises_radiograficas_history', 'radiografia_laudo_templates', 'radiografia_ai_feedback'],
    'features', ARRAY['versioning', 'custom templates', 'AI feedback loop', 'accuracy metrics', 'continuous learning']
  )
);