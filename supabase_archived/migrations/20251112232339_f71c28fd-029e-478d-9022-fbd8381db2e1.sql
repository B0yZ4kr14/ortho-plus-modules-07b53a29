-- Ativar todos os módulos por padrão para cada clínica
-- Insere registros em clinic_modules para módulos que ainda não existem

-- Para cada clínica, inserir TODOS os módulos do catálogo como ativos
INSERT INTO public.clinic_modules (clinic_id, module_catalog_id, is_active)
SELECT 
  c.id as clinic_id,
  mc.id as module_catalog_id,
  true as is_active
FROM 
  public.clinics c
  CROSS JOIN public.module_catalog mc
WHERE 
  NOT EXISTS (
    SELECT 1 
    FROM public.clinic_modules cm 
    WHERE cm.clinic_id = c.id 
    AND cm.module_catalog_id = mc.id
  )
ON CONFLICT (clinic_id, module_catalog_id) DO NOTHING;

-- Ativar todos os módulos que estão inativos (tornar todos ativos por padrão)
UPDATE public.clinic_modules 
SET is_active = true 
WHERE is_active = false;

-- Criar função para auto-ativar módulos quando nova clínica é criada
CREATE OR REPLACE FUNCTION public.activate_all_modules_for_new_clinic()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir todos os módulos como ativos para a nova clínica
  INSERT INTO public.clinic_modules (clinic_id, module_catalog_id, is_active)
  SELECT 
    NEW.id,
    mc.id,
    true
  FROM public.module_catalog mc
  ON CONFLICT (clinic_id, module_catalog_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Criar trigger para ativar módulos automaticamente em novas clínicas
DROP TRIGGER IF EXISTS trigger_activate_modules_on_clinic_creation ON public.clinics;
CREATE TRIGGER trigger_activate_modules_on_clinic_creation
  AFTER INSERT ON public.clinics
  FOR EACH ROW
  EXECUTE FUNCTION public.activate_all_modules_for_new_clinic();