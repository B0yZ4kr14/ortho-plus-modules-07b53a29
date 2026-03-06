-- Migração: Sistema de Odontograma no Supabase
-- Cria tabelas para persistência de dados do odontograma com histórico completo

-- Tabela principal de dados do odontograma (estado atual de cada dente)
CREATE TABLE IF NOT EXISTS public.pep_odontograma_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prontuario_id UUID NOT NULL REFERENCES public.prontuarios(id) ON DELETE CASCADE,
  tooth_number INTEGER NOT NULL CHECK (tooth_number >= 11 AND tooth_number <= 48),
  status TEXT NOT NULL DEFAULT 'higido' CHECK (status IN ('higido', 'cariado', 'obturado', 'extraido', 'ausente', 'implante')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE (prontuario_id, tooth_number)
);

-- Tabela de superfícies dos dentes (faces específicas)
CREATE TABLE IF NOT EXISTS public.pep_tooth_surfaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  odontograma_data_id UUID NOT NULL REFERENCES public.pep_odontograma_data(id) ON DELETE CASCADE,
  surface TEXT NOT NULL CHECK (surface IN ('mesial', 'distal', 'oclusal', 'vestibular', 'lingual')),
  status TEXT NOT NULL DEFAULT 'higido' CHECK (status IN ('higido', 'cariado', 'obturado', 'extraido', 'ausente', 'implante')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (odontograma_data_id, surface)
);

-- Tabela de histórico do odontograma (snapshots completos)
CREATE TABLE IF NOT EXISTS public.pep_odontograma_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prontuario_id UUID NOT NULL REFERENCES public.prontuarios(id) ON DELETE CASCADE,
  snapshot_data JSONB NOT NULL, -- Armazena snapshot completo do estado dos dentes
  changed_teeth INTEGER[] NOT NULL DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_odontograma_data_prontuario ON public.pep_odontograma_data(prontuario_id);
CREATE INDEX IF NOT EXISTS idx_tooth_surfaces_odontograma ON public.pep_tooth_surfaces(odontograma_data_id);
CREATE INDEX IF NOT EXISTS idx_odontograma_history_prontuario ON public.pep_odontograma_history(prontuario_id);
CREATE INDEX IF NOT EXISTS idx_odontograma_history_created_at ON public.pep_odontograma_history(created_at DESC);

-- Trigger para updated_at automático
CREATE TRIGGER update_odontograma_data_updated_at
  BEFORE UPDATE ON public.pep_odontograma_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tooth_surfaces_updated_at
  BEFORE UPDATE ON public.pep_tooth_surfaces
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies para pep_odontograma_data
ALTER TABLE public.pep_odontograma_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view odontograma from their clinic"
  ON public.pep_odontograma_data
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.prontuarios
      WHERE prontuarios.id = pep_odontograma_data.prontuario_id
        AND prontuarios.clinic_id = get_user_clinic_id(auth.uid())
    )
  );

CREATE POLICY "Users can create odontograma in their clinic"
  ON public.pep_odontograma_data
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.prontuarios
      WHERE prontuarios.id = pep_odontograma_data.prontuario_id
        AND prontuarios.clinic_id = get_user_clinic_id(auth.uid())
    )
  );

CREATE POLICY "Users can update odontograma from their clinic"
  ON public.pep_odontograma_data
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.prontuarios
      WHERE prontuarios.id = pep_odontograma_data.prontuario_id
        AND prontuarios.clinic_id = get_user_clinic_id(auth.uid())
    )
  );

-- RLS Policies para pep_tooth_surfaces
ALTER TABLE public.pep_tooth_surfaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view surfaces from their clinic"
  ON public.pep_tooth_surfaces
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pep_odontograma_data od
      JOIN public.prontuarios p ON p.id = od.prontuario_id
      WHERE od.id = pep_tooth_surfaces.odontograma_data_id
        AND p.clinic_id = get_user_clinic_id(auth.uid())
    )
  );

CREATE POLICY "Users can create surfaces in their clinic"
  ON public.pep_tooth_surfaces
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pep_odontograma_data od
      JOIN public.prontuarios p ON p.id = od.prontuario_id
      WHERE od.id = pep_tooth_surfaces.odontograma_data_id
        AND p.clinic_id = get_user_clinic_id(auth.uid())
    )
  );

CREATE POLICY "Users can update surfaces from their clinic"
  ON public.pep_tooth_surfaces
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.pep_odontograma_data od
      JOIN public.prontuarios p ON p.id = od.prontuario_id
      WHERE od.id = pep_tooth_surfaces.odontograma_data_id
        AND p.clinic_id = get_user_clinic_id(auth.uid())
    )
  );

-- RLS Policies para pep_odontograma_history
ALTER TABLE public.pep_odontograma_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view history from their clinic"
  ON public.pep_odontograma_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.prontuarios
      WHERE prontuarios.id = pep_odontograma_history.prontuario_id
        AND prontuarios.clinic_id = get_user_clinic_id(auth.uid())
    )
  );

CREATE POLICY "Users can create history in their clinic"
  ON public.pep_odontograma_history
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.prontuarios
      WHERE prontuarios.id = pep_odontograma_history.prontuario_id
        AND prontuarios.clinic_id = get_user_clinic_id(auth.uid())
    )
  );

-- Registrar no audit_logs quando houver mudanças
CREATE OR REPLACE FUNCTION log_odontograma_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (
    clinic_id,
    user_id,
    action,
    details
  )
  SELECT 
    p.clinic_id,
    auth.uid(),
    'ODONTOGRAMA_UPDATED',
    jsonb_build_object(
      'prontuario_id', NEW.prontuario_id,
      'tooth_number', NEW.tooth_number,
      'old_status', COALESCE(OLD.status, 'higido'),
      'new_status', NEW.status,
      'timestamp', now()
    )
  FROM public.prontuarios p
  WHERE p.id = NEW.prontuario_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER audit_odontograma_changes
  AFTER INSERT OR UPDATE ON public.pep_odontograma_data
  FOR EACH ROW
  EXECUTE FUNCTION log_odontograma_change();