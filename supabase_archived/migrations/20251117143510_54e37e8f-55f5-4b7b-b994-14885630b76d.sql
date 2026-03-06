-- ============================================
-- CORREÇÃO CRÍTICA C1: RLS - login_attempts
-- ============================================

-- 1. Remover políticas vulneráveis existentes
DROP POLICY IF EXISTS "Users can view their own login attempts" ON public.login_attempts;
DROP POLICY IF EXISTS "Users can insert their own login attempts" ON public.login_attempts;

-- 2. Criar função security definer para verificar se usuário é ADMIN
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND app_role = 'ADMIN'
  );
$$;

-- 3. Criar política: Apenas ADMINs podem visualizar login_attempts
CREATE POLICY "Only admins can view login attempts"
ON public.login_attempts
FOR SELECT
USING (public.is_admin());

-- 4. Criar política: Apenas sistema pode inserir (via service_role)
CREATE POLICY "Only system can insert login attempts"
ON public.login_attempts
FOR INSERT
WITH CHECK (false); -- Bloqueia INSERT via client, apenas service_role

-- 5. Nenhuma política de UPDATE/DELETE (bloqueado por padrão com RLS)