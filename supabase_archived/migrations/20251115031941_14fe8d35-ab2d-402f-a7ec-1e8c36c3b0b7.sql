-- FASE 0: CORREÇÃO SEGURANÇA (action_type corrigido)
DROP TRIGGER IF EXISTS ensure_modules_on_clinic_create ON public.clinics CASCADE;
DROP FUNCTION IF EXISTS public.ensure_all_modules_active() CASCADE;

CREATE OR REPLACE FUNCTION public.ensure_modules_on_clinic_create()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $$ BEGIN
  INSERT INTO public.clinic_modules (clinic_id, module_catalog_id, is_active)
  SELECT NEW.id, id, true FROM public.module_catalog
  ON CONFLICT (clinic_id, module_catalog_id) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE FUNCTION public.ensure_all_modules_active()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $$ DECLARE clinic_record RECORD;
BEGIN
  FOR clinic_record IN SELECT id FROM public.clinics LOOP
    INSERT INTO public.clinic_modules (clinic_id, module_catalog_id, is_active)
    SELECT clinic_record.id, mc.id, true FROM public.module_catalog mc
    ON CONFLICT (clinic_id, module_catalog_id) DO UPDATE SET is_active = true, updated_at = now();
  END LOOP;
END; $$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public, pg_temp
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER ensure_modules_on_clinic_create AFTER INSERT ON public.clinics
FOR EACH ROW EXECUTE FUNCTION public.ensure_modules_on_clinic_create();

CREATE SCHEMA IF NOT EXISTS extensions;
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;