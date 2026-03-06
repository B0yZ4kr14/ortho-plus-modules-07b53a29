-- Garantir que TODOS os módulos sejam ativados por padrão para TODAS as clínicas
-- Ativar todos os módulos para todas as clínicas existentes
INSERT INTO public.clinic_modules (clinic_id, module_catalog_id, is_active)
SELECT 
  c.id as clinic_id,
  mc.id as module_catalog_id,
  true as is_active
FROM 
  public.clinics c
CROSS JOIN 
  public.module_catalog mc
ON CONFLICT (clinic_id, module_catalog_id) 
DO UPDATE SET is_active = true;

-- Atualizar trigger para ativar TODOS os módulos automaticamente para novas clínicas
CREATE OR REPLACE FUNCTION public.activate_all_modules_for_new_clinic()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Inserir todos os módulos como ativos para a nova clínica
  INSERT INTO public.clinic_modules (clinic_id, module_catalog_id, is_active)
  SELECT 
    NEW.id,
    mc.id,
    true  -- TODOS os módulos ativados por padrão
  FROM public.module_catalog mc
  ON CONFLICT (clinic_id, module_catalog_id) DO NOTHING;
  
  RETURN NEW;
END;
$function$;

-- Garantir que o trigger esteja ativo
DROP TRIGGER IF EXISTS trigger_activate_modules_on_clinic_create ON public.clinics;
CREATE TRIGGER trigger_activate_modules_on_clinic_create
  AFTER INSERT ON public.clinics
  FOR EACH ROW
  EXECUTE FUNCTION public.activate_all_modules_for_new_clinic();