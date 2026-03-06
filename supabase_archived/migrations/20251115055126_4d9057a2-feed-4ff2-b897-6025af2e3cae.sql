-- =====================================================
-- FASE 2 & 5: TABELAS PARA SISTEMA ADMINISTRATIVO
-- =====================================================

-- Wiki Pages (Documentação Interna)
CREATE TABLE IF NOT EXISTS public.wiki_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  version INTEGER NOT NULL DEFAULT 1,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_published BOOLEAN NOT NULL DEFAULT false,
  parent_id UUID REFERENCES public.wiki_pages(id) ON DELETE SET NULL,
  CONSTRAINT unique_clinic_slug UNIQUE(clinic_id, slug)
);

CREATE INDEX idx_wiki_pages_clinic ON public.wiki_pages(clinic_id);
CREATE INDEX idx_wiki_pages_category ON public.wiki_pages(category);
CREATE INDEX idx_wiki_pages_tags ON public.wiki_pages USING GIN(tags);

-- Wiki Page Versions (Histórico)
CREATE TABLE IF NOT EXISTS public.wiki_page_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.wiki_pages(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  change_summary TEXT,
  CONSTRAINT unique_page_version UNIQUE(page_id, version)
);

-- Architecture Decision Records (ADRs)
CREATE TABLE IF NOT EXISTS public.architecture_decision_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  adr_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'accepted', 'deprecated', 'superseded')),
  context TEXT NOT NULL,
  decision TEXT NOT NULL,
  consequences TEXT NOT NULL,
  alternatives_considered TEXT,
  supersedes_adr_id UUID REFERENCES public.architecture_decision_records(id),
  superseded_by_adr_id UUID REFERENCES public.architecture_decision_records(id),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  decided_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_at TIMESTAMPTZ,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  CONSTRAINT unique_clinic_adr_number UNIQUE(clinic_id, adr_number)
);

CREATE INDEX idx_adr_clinic ON public.architecture_decision_records(clinic_id);
CREATE INDEX idx_adr_status ON public.architecture_decision_records(status);

-- Command Execution History (Terminal)
CREATE TABLE IF NOT EXISTS public.terminal_command_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  command TEXT NOT NULL,
  output TEXT,
  exit_code INTEGER,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_ms INTEGER,
  was_successful BOOLEAN DEFAULT false
);

CREATE INDEX idx_terminal_history_clinic ON public.terminal_command_history(clinic_id);
CREATE INDEX idx_terminal_history_user ON public.terminal_command_history(user_id);
CREATE INDEX idx_terminal_history_executed ON public.terminal_command_history(executed_at DESC);

-- System Health Metrics
CREATE TABLE IF NOT EXISTS public.system_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_health_metrics_clinic ON public.system_health_metrics(clinic_id);
CREATE INDEX idx_health_metrics_type ON public.system_health_metrics(metric_type);
CREATE INDEX idx_health_metrics_recorded ON public.system_health_metrics(recorded_at DESC);

-- GitHub Integration Events
CREATE TABLE IF NOT EXISTS public.github_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  triggered_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_github_events_clinic ON public.github_events(clinic_id);
CREATE INDEX idx_github_events_type ON public.github_events(event_type);

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE public.wiki_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_page_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.architecture_decision_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terminal_command_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.github_events ENABLE ROW LEVEL SECURITY;

-- Wiki Pages: Read published by all, CRUD by admins
CREATE POLICY "Wiki pages viewable by clinic members"
  ON public.wiki_pages FOR SELECT
  USING (
    clinic_id IN (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
    AND (is_published = true OR created_by = auth.uid() OR is_admin())
  );

CREATE POLICY "Wiki pages manageable by admins"
  ON public.wiki_pages FOR ALL
  USING (
    clinic_id IN (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
    AND is_admin()
  );

-- Wiki Versions: Read by all clinic members
CREATE POLICY "Wiki versions viewable by clinic"
  ON public.wiki_page_versions FOR SELECT
  USING (
    page_id IN (
      SELECT id FROM public.wiki_pages 
      WHERE clinic_id IN (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
    )
  );

-- ADRs: Read by all, write by admins
CREATE POLICY "ADRs viewable by clinic members"
  ON public.architecture_decision_records FOR SELECT
  USING (clinic_id IN (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "ADRs manageable by admins"
  ON public.architecture_decision_records FOR ALL
  USING (
    clinic_id IN (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
    AND is_admin()
  );

-- Terminal History: Admin only
CREATE POLICY "Terminal history admin only"
  ON public.terminal_command_history FOR ALL
  USING (
    clinic_id IN (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
    AND is_admin()
  );

-- Health Metrics: Admin read
CREATE POLICY "Health metrics admin read"
  ON public.system_health_metrics FOR SELECT
  USING (
    clinic_id IN (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
    AND is_admin()
  );

-- GitHub Events: Admin only
CREATE POLICY "GitHub events admin only"
  ON public.github_events FOR ALL
  USING (
    clinic_id IN (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
    AND is_admin()
  );

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update wiki_pages.updated_at
CREATE OR REPLACE FUNCTION public.update_wiki_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

CREATE TRIGGER wiki_pages_updated_at
  BEFORE UPDATE ON public.wiki_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_wiki_updated_at();

-- Auto-increment wiki version and create version record
CREATE OR REPLACE FUNCTION public.create_wiki_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment version on update
  IF TG_OP = 'UPDATE' AND (OLD.content != NEW.content OR OLD.title != NEW.title) THEN
    NEW.version = OLD.version + 1;
    
    -- Save version history
    INSERT INTO public.wiki_page_versions (
      page_id, version, title, content, changed_by, change_summary
    ) VALUES (
      NEW.id, NEW.version, NEW.title, NEW.content, auth.uid(), 
      'Version ' || NEW.version::text
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

CREATE TRIGGER wiki_version_trigger
  BEFORE UPDATE ON public.wiki_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.create_wiki_version();

-- Auto-update ADRs updated_at
CREATE TRIGGER adr_updated_at
  BEFORE UPDATE ON public.architecture_decision_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_wiki_updated_at();

-- =====================================================
-- SEED DATA
-- =====================================================

-- Exemplo de página wiki inicial
INSERT INTO public.wiki_pages (clinic_id, title, slug, content, category, created_by, is_published)
SELECT 
  c.id,
  'Bem-vindo ao Wiki Ortho+',
  'bem-vindo',
  E'# Bem-vindo ao Wiki Ortho+\n\nEsta é a documentação interna da sua clínica.\n\n## Como usar\n\n- Crie páginas para documentar processos\n- Organize por categorias\n- Use Markdown para formatação\n\n## Categorias disponíveis\n\n- **Processos**: Fluxos de trabalho\n- **APIs**: Documentação técnica\n- **Troubleshooting**: Resolução de problemas',
  'general',
  p.id,
  true
FROM public.clinics c
CROSS JOIN LATERAL (
  SELECT id FROM public.profiles 
  WHERE clinic_id = c.id AND app_role = 'ADMIN' 
  LIMIT 1
) p
ON CONFLICT (clinic_id, slug) DO NOTHING;