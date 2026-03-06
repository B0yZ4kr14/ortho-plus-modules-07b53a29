-- Atualizar trigger para ativar TODOS os módulos por padrão para novas clínicas
CREATE OR REPLACE FUNCTION public.activate_all_modules_for_new_clinic()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

COMMENT ON FUNCTION public.activate_all_modules_for_new_clinic() IS 'Ativa automaticamente TODOS os módulos para novas clínicas criadas';