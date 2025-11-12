-- Tabela de auditoria de permissões
CREATE TABLE IF NOT EXISTS public.permission_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- PERMISSION_GRANTED, PERMISSION_REVOKED, TEMPLATE_APPLIED
  module_catalog_id INTEGER REFERENCES public.module_catalog(id),
  template_name TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS policies para permission_audit_logs
ALTER TABLE public.permission_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs from their clinic"
  ON public.permission_audit_logs
  FOR SELECT
  USING (clinic_id = get_user_clinic_id(auth.uid()) AND has_role(auth.uid(), 'ADMIN'));

CREATE POLICY "System can insert audit logs"
  ON public.permission_audit_logs
  FOR INSERT
  WITH CHECK (true);

-- Índices para performance
CREATE INDEX idx_permission_audit_logs_clinic_id ON public.permission_audit_logs(clinic_id);
CREATE INDEX idx_permission_audit_logs_target_user_id ON public.permission_audit_logs(target_user_id);
CREATE INDEX idx_permission_audit_logs_created_at ON public.permission_audit_logs(created_at DESC);

-- Tabela de templates de permissões
CREATE TABLE IF NOT EXISTS public.permission_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  module_keys TEXT[] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS policies para permission_templates
ALTER TABLE public.permission_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view templates"
  ON public.permission_templates
  FOR SELECT
  USING (true);

-- Inserir templates padrão
INSERT INTO public.permission_templates (name, description, icon, module_keys) VALUES
  ('Dentista', 'Acesso completo aos módulos clínicos e operacionais', 'Stethoscope', ARRAY['PEP', 'ODONTOGRAMA', 'AGENDA', 'PACIENTES', 'PROCEDIMENTOS', 'TRATAMENTOS']),
  ('Recepcionista', 'Acesso aos módulos de atendimento e agendamento', 'UserPlus', ARRAY['AGENDA', 'PACIENTES', 'PROCEDIMENTOS', 'ORCAMENTOS']),
  ('Financeiro', 'Acesso completo aos módulos financeiros', 'DollarSign', ARRAY['FINANCEIRO', 'SPLIT_PAGAMENTO', 'INADIMPLENCIA', 'COBRANCA']),
  ('Gerente Operacional', 'Acesso aos módulos de gestão operacional', 'Briefcase', ARRAY['DASHBOARD', 'PACIENTES', 'DENTISTAS', 'FUNCIONARIOS', 'AGENDA', 'ESTOQUE', 'BI']),
  ('Auxiliar Odontológico', 'Acesso limitado aos módulos de apoio clínico', 'HeartPulse', ARRAY['AGENDA', 'PACIENTES', 'ESTOQUE'])
ON CONFLICT (name) DO NOTHING;