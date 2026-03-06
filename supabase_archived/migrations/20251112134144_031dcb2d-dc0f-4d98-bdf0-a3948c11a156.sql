-- =====================================================
-- ORTHO + : INFRAESTRUTURA MODULAR PLUG-AND-PLAY
-- =====================================================

-- 1. CRIAR ENUM PARA ROLES
CREATE TYPE public.app_role AS ENUM ('ADMIN', 'MEMBER');

-- 2. CRIAR TABELAS
-- Tabela de Clínicas (Tenants)
CREATE TABLE public.clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Perfis (complementa auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Roles de Usuário (SEGURANÇA)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Catálogo de Módulos (Módulos disponíveis no SaaS)
CREATE TABLE public.module_catalog (
  id SERIAL PRIMARY KEY,
  module_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Módulos Contratados por Clínica
CREATE TABLE public.clinic_modules (
  id SERIAL PRIMARY KEY,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  module_catalog_id INTEGER REFERENCES public.module_catalog(id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_clinic_module UNIQUE(clinic_id, module_catalog_id)
);

-- Dependências entre Módulos
CREATE TABLE public.module_dependencies (
  id SERIAL PRIMARY KEY,
  module_id INTEGER REFERENCES public.module_catalog(id) ON DELETE CASCADE NOT NULL,
  depends_on_module_id INTEGER REFERENCES public.module_catalog(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_dependency UNIQUE(module_id, depends_on_module_id)
);

-- Logs de Auditoria (LGPD Compliance)
CREATE TABLE public.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_module_id INTEGER REFERENCES public.module_catalog(id),
  details JSONB
);

-- 3. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX idx_profiles_clinic_id ON public.profiles(clinic_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_clinic_modules_clinic_id ON public.clinic_modules(clinic_id);
CREATE INDEX idx_clinic_modules_active ON public.clinic_modules(clinic_id, is_active);
CREATE INDEX idx_audit_logs_clinic_id ON public.audit_logs(clinic_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- 4. HABILITAR ROW LEVEL SECURITY
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 5. CRIAR FUNÇÃO DE SEGURANÇA (Security Definer)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Função para obter clinic_id do usuário
CREATE OR REPLACE FUNCTION public.get_user_clinic_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT clinic_id
  FROM public.profiles
  WHERE id = _user_id
  LIMIT 1
$$;

-- 6. CRIAR POLÍTICAS RLS
-- Políticas para CLINICS
CREATE POLICY "Users can view their own clinic"
  ON public.clinics FOR SELECT
  USING (id = public.get_user_clinic_id(auth.uid()));

CREATE POLICY "Admins can update their clinic"
  ON public.clinics FOR UPDATE
  USING (
    id = public.get_user_clinic_id(auth.uid()) 
    AND public.has_role(auth.uid(), 'ADMIN')
  );

-- Políticas para PROFILES
CREATE POLICY "Users can view profiles from their clinic"
  ON public.profiles FOR SELECT
  USING (clinic_id = public.get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- Políticas para USER_ROLES
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage roles in their clinic"
  ON public.user_roles FOR ALL
  USING (
    public.has_role(auth.uid(), 'ADMIN')
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = user_roles.user_id 
      AND clinic_id = public.get_user_clinic_id(auth.uid())
    )
  );

-- Políticas para MODULE_CATALOG (público para leitura)
CREATE POLICY "Anyone can view module catalog"
  ON public.module_catalog FOR SELECT
  TO authenticated
  USING (true);

-- Políticas para CLINIC_MODULES
CREATE POLICY "Users can view modules from their clinic"
  ON public.clinic_modules FOR SELECT
  USING (clinic_id = public.get_user_clinic_id(auth.uid()));

CREATE POLICY "Admins can manage modules in their clinic"
  ON public.clinic_modules FOR ALL
  USING (
    clinic_id = public.get_user_clinic_id(auth.uid())
    AND public.has_role(auth.uid(), 'ADMIN')
  );

-- Políticas para MODULE_DEPENDENCIES (público para leitura)
CREATE POLICY "Anyone can view module dependencies"
  ON public.module_dependencies FOR SELECT
  TO authenticated
  USING (true);

-- Políticas para AUDIT_LOGS
CREATE POLICY "Users can view audit logs from their clinic"
  ON public.audit_logs FOR SELECT
  USING (clinic_id = public.get_user_clinic_id(auth.uid()));

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- 7. CRIAR TRIGGERS PARA updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clinics_updated_at
  BEFORE UPDATE ON public.clinics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clinic_modules_updated_at
  BEFORE UPDATE ON public.clinic_modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. SEED DATA: POPULAR CATÁLOGO DE MÓDULOS
INSERT INTO public.module_catalog (module_key, name, description, category, icon) VALUES
  ('DASHBOARD', 'Dashboard', 'Visão geral e métricas da clínica', 'Core', 'LayoutDashboard'),
  ('PACIENTES', 'Pacientes', 'Cadastro e gestão de pacientes', 'Gestão e Operação', 'Users'),
  ('DENTISTAS', 'Dentistas', 'Cadastro e gestão de dentistas', 'Gestão e Operação', 'UserCog'),
  ('FUNCIONARIOS', 'Funcionários', 'Cadastro e gestão de funcionários', 'Gestão e Operação', 'Users'),
  ('AGENDA', 'Agenda Inteligente', 'Agendamento com automação via WhatsApp', 'Gestão e Operação', 'Calendar'),
  ('PROCEDIMENTOS', 'Procedimentos', 'Catálogo de procedimentos odontológicos', 'Gestão e Operação', 'Stethoscope'),
  ('PEP', 'Prontuário Eletrônico (PEP)', 'Prontuário Eletrônico do Paciente', 'Gestão e Operação', 'FileText'),
  ('ORCAMENTOS', 'Orçamentos e Contratos', 'Gestão de orçamentos e contratos digitais', 'Gestão e Operação', 'FileCheck'),
  ('ODONTOGRAMA', 'Odontograma', 'Odontograma 2D e 3D', 'Gestão e Operação', 'Activity'),
  ('ESTOQUE', 'Controle de Estoque', 'Gestão avançada de estoque', 'Gestão e Operação', 'Package'),
  ('FINANCEIRO', 'Gestão Financeira', 'Fluxo de caixa e controle financeiro', 'Financeiro', 'DollarSign'),
  ('SPLIT_PAGAMENTO', 'Split de Pagamento', 'Otimização tributária', 'Financeiro', 'Split'),
  ('INADIMPLENCIA', 'Controle de Inadimplência', 'Cobrança automatizada', 'Financeiro', 'AlertCircle'),
  ('CRM', 'CRM', 'Funil de vendas e gestão de relacionamento', 'Crescimento e Marketing', 'TrendingUp'),
  ('MARKETING_AUTO', 'Automação de Marketing', 'Pós-consulta e recall', 'Crescimento e Marketing', 'Mail'),
  ('BI', 'Business Intelligence', 'Dashboards e análises avançadas', 'Crescimento e Marketing', 'BarChart'),
  ('LGPD', 'Segurança e LGPD', 'Conformidade com LGPD', 'Compliance', 'Shield'),
  ('ASSINATURA_ICP', 'Assinatura Digital ICP-Brasil', 'Assinatura digital qualificada', 'Compliance', 'FileSignature'),
  ('TISS', 'Faturamento TISS', 'Faturamento padrão TISS para convênios', 'Compliance', 'FileSpreadsheet'),
  ('TELEODONTO', 'Teleodontologia', 'Atendimento remoto', 'Compliance', 'Video'),
  ('FLUXO_DIGITAL', 'Fluxo Digital', 'Integração com scanners e laboratórios', 'Inovação', 'Workflow'),
  ('IA', 'Inteligência Artificial', 'Recursos de IA para análises', 'Inovação', 'Brain');

-- 9. SEED DATA: POPULAR DEPENDÊNCIAS DE MÓDULOS
INSERT INTO public.module_dependencies (module_id, depends_on_module_id)
SELECT 
  m1.id,
  m2.id
FROM 
  public.module_catalog m1,
  public.module_catalog m2
WHERE 
  (m1.module_key = 'SPLIT_PAGAMENTO' AND m2.module_key = 'FINANCEIRO') OR
  (m1.module_key = 'INADIMPLENCIA' AND m2.module_key = 'FINANCEIRO') OR
  (m1.module_key = 'ORCAMENTOS' AND m2.module_key = 'ODONTOGRAMA') OR
  (m1.module_key = 'ASSINATURA_ICP' AND m2.module_key = 'PEP') OR
  (m1.module_key = 'TISS' AND m2.module_key = 'PEP') OR
  (m1.module_key = 'FLUXO_DIGITAL' AND m2.module_key = 'PEP') OR
  (m1.module_key = 'IA' AND m2.module_key = 'PEP') OR
  (m1.module_key = 'IA' AND m2.module_key = 'FLUXO_DIGITAL');

-- 10. CRIAR FUNÇÃO PARA NOVO USUÁRIO (Auto Profile Creation)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();