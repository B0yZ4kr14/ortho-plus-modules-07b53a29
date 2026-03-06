-- ============================================
-- FASE 2 - ATIVAÇÃO TOTAL DE MÓDULOS (CORRIGIDO)
-- Data: 2025-11-15
-- ============================================

-- 1. ATIVAR TODOS OS MÓDULOS PARA TODAS AS CLÍNICAS
INSERT INTO public.clinic_modules (clinic_id, module_catalog_id, is_active)
SELECT c.id, mc.id, true
FROM public.clinics c
CROSS JOIN public.module_catalog mc
ON CONFLICT (clinic_id, module_catalog_id) 
DO UPDATE SET 
  is_active = true,
  updated_at = now();

-- 2. CRIAR FUNÇÃO PARA GARANTIR MÓDULOS SEMPRE ATIVOS
CREATE OR REPLACE FUNCTION public.ensure_all_modules_active()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando uma nova clínica é criada, ativar todos os módulos
  INSERT INTO public.clinic_modules (clinic_id, module_catalog_id, is_active)
  SELECT NEW.id, mc.id, true
  FROM public.module_catalog mc
  ON CONFLICT (clinic_id, module_catalog_id) 
  DO UPDATE SET is_active = true;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. CRIAR TRIGGER PARA NOVAS CLÍNICAS
DROP TRIGGER IF EXISTS ensure_modules_on_clinic_create ON public.clinics;
CREATE TRIGGER ensure_modules_on_clinic_create
  AFTER INSERT ON public.clinics
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_all_modules_active();

-- 4. AUDITORIA (usando action_type válido)
INSERT INTO public.audit_logs (
  action, 
  action_type,
  clinic_id, 
  details
)
SELECT 
  'ALL_MODULES_ACTIVATED',
  'MODULE_ACTIVATED',
  id,
  jsonb_build_object(
    'timestamp', now(),
    'total_modules', (SELECT COUNT(*) FROM module_catalog),
    'reason', 'Sistema opensource - todos os módulos disponíveis por padrão'
  )
FROM public.clinics;

COMMENT ON FUNCTION public.ensure_all_modules_active IS 
  'Garante que todas as clínicas sempre tenham todos os módulos ativos (sistema opensource)';

COMMENT ON TRIGGER ensure_modules_on_clinic_create ON public.clinics IS 
  'Ativa automaticamente todos os módulos para novas clínicas';