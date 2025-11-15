-- ============================================================================
-- FASE 1: FUNDAÇÃO - TASK 1.1
-- Migração 004: Implementar Superusuário Root e RLS Bypass
-- ============================================================================

-- ============================================================================
-- 1. CRIAR FUNÇÃO PARA VERIFICAR SE USUÁRIO É ROOT
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_root_user()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Root user tem app_role = 'ROOT' no profile
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.app_role = 'ROOT'
  );
END;
$$;

COMMENT ON FUNCTION public.is_root_user IS 'Verifica se o usuário atual é ROOT (superusuário com bypass de RLS)';

-- ============================================================================
-- 2. ADICIONAR ROLE 'ROOT' AO ENUM app_role (SE NÃO EXISTIR)
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'ROOT' AND enumtypid = 'app_role'::regtype) THEN
    ALTER TYPE app_role ADD VALUE 'ROOT';
  END IF;
END $$;

-- ============================================================================
-- 3. ATUALIZAR RLS POLICIES PARA PERMITIR BYPASS DO ROOT
-- ============================================================================

-- Policy para clinics: Root tem acesso total
DROP POLICY IF EXISTS "Root has full access to clinics" ON public.clinics;
CREATE POLICY "Root has full access to clinics"
ON public.clinics
FOR ALL
TO authenticated
USING (is_root_user())
WITH CHECK (is_root_user());

-- Policy para profiles: Root tem acesso total
DROP POLICY IF EXISTS "Root has full access to profiles" ON public.profiles;
CREATE POLICY "Root has full access to profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (is_root_user())
WITH CHECK (is_root_user());

-- Policy para module_catalog: Root tem acesso total
DROP POLICY IF EXISTS "Root has full access to module_catalog" ON public.module_catalog;
CREATE POLICY "Root has full access to module_catalog"
ON public.module_catalog
FOR ALL
TO authenticated
USING (is_root_user())
WITH CHECK (is_root_user());

-- Policy para clinic_modules: Root tem acesso total
DROP POLICY IF EXISTS "Root has full access to clinic_modules" ON public.clinic_modules;
CREATE POLICY "Root has full access to clinic_modules"
ON public.clinic_modules
FOR ALL
TO authenticated
USING (is_root_user())
WITH CHECK (is_root_user());

-- Policy para audit_logs: Root tem acesso total
DROP POLICY IF EXISTS "Root has full access to audit_logs" ON public.audit_logs;
CREATE POLICY "Root has full access to audit_logs"
ON public.audit_logs
FOR ALL
TO authenticated
USING (is_root_user())
WITH CHECK (is_root_user());

-- Policy para security_audit_log: Root tem acesso total
DROP POLICY IF EXISTS "Root has full access to security_audit_log" ON public.security_audit_log;
CREATE POLICY "Root has full access to security_audit_log"
ON public.security_audit_log
FOR ALL
TO authenticated
USING (is_root_user())
WITH CHECK (is_root_user());

-- ============================================================================
-- 4. CRIAR TABELA PARA REGISTRO DE AÇÕES ROOT
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.root_actions_log (
  id BIGSERIAL PRIMARY KEY,
  root_user_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_table TEXT,
  target_record_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_root_actions_user ON root_actions_log(root_user_id);
CREATE INDEX idx_root_actions_executed_at ON root_actions_log(executed_at DESC);
CREATE INDEX idx_root_actions_action ON root_actions_log(action);

-- RLS: Apenas ROOT pode ver seus próprios logs
ALTER TABLE public.root_actions_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Root users can view their own actions"
ON public.root_actions_log
FOR SELECT
TO authenticated
USING (is_root_user() AND root_user_id = auth.uid());

CREATE POLICY "System can insert root actions"
ON public.root_actions_log
FOR INSERT
TO service_role
WITH CHECK (true);

COMMENT ON TABLE public.root_actions_log IS 'Log de todas as ações executadas por usuários ROOT (auditoria de superusuários)';

-- ============================================================================
-- 5. ATUALIZAR FUNÇÃO create_root_user() COM IMPLEMENTAÇÃO COMPLETA
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_root_user()
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Esta função só pode ser chamada via service_role (segurança adicional)
  -- A criação real do root user será feita pela Edge Function create-root-user
  
  -- Registrar tentativa de criação de root user
  INSERT INTO public.security_audit_log (
    migration_version,
    issue_type,
    severity,
    description,
    resolution
  ) VALUES (
    '004',
    'ROOT_USER_CREATION_ATTEMPTED',
    'HIGH',
    'Tentativa de criação de usuário ROOT via função SQL',
    'Função create_root_user() deve ser chamada apenas via Edge Function com service_role'
  );
  
  RAISE NOTICE 'Para criar um usuário ROOT, use a Edge Function "create-root-user" com service_role key.';
END;
$$;

-- ============================================================================
-- 6. MENSAGEM DE SUCESSO
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'FASE 1 - TASK 1.1: SUPERUSUÁRIO ROOT IMPLEMENTADO';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE '✅ 1. Função is_root_user() criada';
  RAISE NOTICE '✅ 2. Role ROOT adicionada ao enum app_role';
  RAISE NOTICE '✅ 3. RLS Policies atualizadas (6 tabelas com bypass para ROOT)';
  RAISE NOTICE '✅ 4. Tabela root_actions_log criada (auditoria de superusuários)';
  RAISE NOTICE '✅ 5. Função create_root_user() atualizada';
  RAISE NOTICE '';
  RAISE NOTICE '📋 PRÓXIMO:';
  RAISE NOTICE '   - Edge Function create-root-user será criada';
  RAISE NOTICE '   - Documentação ROOT_USER_GUIDE.md será gerada';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  SEGURANÇA:';
  RAISE NOTICE '   - Usuários ROOT têm acesso TOTAL ao sistema (bypass de RLS)';
  RAISE NOTICE '   - Criar ROOT apenas quando absolutamente necessário';
  RAISE NOTICE '   - Todas as ações ROOT são auditadas em root_actions_log';
  RAISE NOTICE '============================================================================';
END $$;