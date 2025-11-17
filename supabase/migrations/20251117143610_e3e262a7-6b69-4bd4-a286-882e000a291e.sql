-- ============================================
-- CORREÇÃO ALTA A1 (Parte 3): Mais Funções
-- ============================================

-- 11. generate_budget_number
CREATE OR REPLACE FUNCTION public.generate_budget_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.numero_orcamento IS NULL OR NEW.numero_orcamento = '' THEN
    NEW.numero_orcamento := 'ORC-' || TO_CHAR(NOW(), 'YYYYMM') || '-' || LPAD(nextval('budget_number_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

-- 12. set_budget_expiration
CREATE OR REPLACE FUNCTION public.set_budget_expiration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.data_expiracao IS NULL THEN
    NEW.data_expiracao := CURRENT_DATE + (NEW.validade_dias || ' days')::INTERVAL;
  END IF;
  RETURN NEW;
END;
$$;

-- 13. log_financial_changes
CREATE OR REPLACE FUNCTION public.log_financial_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.audit_logs (clinic_id, user_id, action, details)
  VALUES (NEW.clinic_id, auth.uid(), TG_OP || '_FINANCIAL_' || TG_TABLE_NAME, jsonb_build_object('record_id', NEW.id, 'table', TG_TABLE_NAME, 'timestamp', now()));
  RETURN NEW;
END;
$$;

-- 14. validate_password_strength
CREATE OR REPLACE FUNCTION public.validate_password_strength(password text)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN password ~ '^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{12,}$';
END;
$$;

-- 15. cleanup_old_rum_metrics
CREATE OR REPLACE FUNCTION public.cleanup_old_rum_metrics()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.rum_metrics WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$;

-- 16. cleanup_old_rate_limit_logs
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limit_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.rate_limit_log WHERE window_start < NOW() - INTERVAL '24 hours';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;