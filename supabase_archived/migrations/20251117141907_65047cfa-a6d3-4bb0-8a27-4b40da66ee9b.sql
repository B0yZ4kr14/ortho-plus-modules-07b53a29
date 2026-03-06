-- Tabela de configurações de administração do sistema
CREATE TABLE IF NOT EXISTS public.admin_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  config_type TEXT NOT NULL, -- 'github', 'auth', 'ai_models'
  config_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT unique_clinic_config_type UNIQUE(clinic_id, config_type)
);

-- Índices para performance
CREATE INDEX idx_admin_configurations_clinic ON public.admin_configurations(clinic_id);
CREATE INDEX idx_admin_configurations_type ON public.admin_configurations(config_type);

-- RLS Policies
ALTER TABLE public.admin_configurations ENABLE ROW LEVEL SECURITY;

-- Apenas ADMINs da clínica podem ver/editar configurações
CREATE POLICY "Admins can view admin configurations"
ON public.admin_configurations
FOR SELECT
USING (
  clinic_id = get_user_clinic_id(auth.uid())
  AND is_admin()
);

CREATE POLICY "Admins can insert admin configurations"
ON public.admin_configurations
FOR INSERT
WITH CHECK (
  clinic_id = get_user_clinic_id(auth.uid())
  AND is_admin()
);

CREATE POLICY "Admins can update admin configurations"
ON public.admin_configurations
FOR UPDATE
USING (
  clinic_id = get_user_clinic_id(auth.uid())
  AND is_admin()
);

CREATE POLICY "Admins can delete admin configurations"
ON public.admin_configurations
FOR DELETE
USING (
  clinic_id = get_user_clinic_id(auth.uid())
  AND is_admin()
);

-- Trigger para updated_at
CREATE TRIGGER update_admin_configurations_updated_at
BEFORE UPDATE ON public.admin_configurations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE public.admin_configurations IS 'Configurações administrativas do sistema (GitHub, Auth, AI Models)';
COMMENT ON COLUMN public.admin_configurations.config_type IS 'Tipo de configuração: github, auth, ai_models';
COMMENT ON COLUMN public.admin_configurations.config_data IS 'Dados da configuração em formato JSON';
