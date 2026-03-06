-- ============================================
-- CORREÇÃO ALTA A1 (Parte 2): Mais Funções com search_path
-- ============================================

-- 5. log_patient_changes
CREATE OR REPLACE FUNCTION public.log_patient_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (clinic_id, user_id, action, details)
    VALUES (NEW.clinic_id, auth.uid(), 'PATIENT_CREATED', jsonb_build_object('patient_id', NEW.id, 'patient_name', NEW.full_name, 'risk_level', NEW.risk_level));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (clinic_id, user_id, action, details)
    VALUES (NEW.clinic_id, auth.uid(), 'PATIENT_UPDATED', jsonb_build_object('patient_id', NEW.id, 'patient_name', NEW.full_name, 'old_risk_level', OLD.risk_level, 'new_risk_level', NEW.risk_level));
  END IF;
  RETURN NEW;
END;
$$;

-- 6. update_profiles_updated_at
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 7. cleanup_bi_cache
CREATE OR REPLACE FUNCTION public.cleanup_bi_cache()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.bi_data_cache WHERE expires_at < now();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- 8. detect_suspicious_login_attempts
CREATE OR REPLACE FUNCTION public.detect_suspicious_login_attempts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  failed_attempts INTEGER;
BEGIN
  SELECT COUNT(*) INTO failed_attempts
  FROM public.login_attempts
  WHERE email = NEW.email AND success = false AND attempted_at > NOW() - INTERVAL '15 minutes';

  IF failed_attempts >= 5 AND NEW.success = false THEN
    INSERT INTO public.audit_logs (action, details) 
    VALUES ('SUSPICIOUS_LOGIN_ACTIVITY', jsonb_build_object('email', NEW.email, 'failed_attempts', failed_attempts, 'ip_address', NEW.ip_address));
  END IF;
  RETURN NEW;
END;
$$;

-- 9. update_lgpd_updated_at
CREATE OR REPLACE FUNCTION public.update_lgpd_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 10. update_marketing_updated_at
CREATE OR REPLACE FUNCTION public.update_marketing_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;