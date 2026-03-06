-- FASE 0 - T0.1: CORREÇÃO DE SECURITY WARNINGS
-- Fix 1-6: Adicionar SET search_path a funções sem proteção

-- Função: update_lgpd_updated_at
DROP FUNCTION IF EXISTS public.update_lgpd_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION public.update_lgpd_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Função: update_marketing_updated_at
DROP FUNCTION IF EXISTS public.update_marketing_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION public.update_marketing_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Função: update_campaign_metrics_on_send_change
DROP FUNCTION IF EXISTS public.update_campaign_metrics_on_send_change() CASCADE;
CREATE OR REPLACE FUNCTION public.update_campaign_metrics_on_send_change()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_campaign_id UUID;
  v_metric_date DATE;
BEGIN
  v_campaign_id := COALESCE(NEW.campaign_id, OLD.campaign_id);
  v_metric_date := COALESCE(DATE(NEW.sent_at), DATE(OLD.sent_at), CURRENT_DATE);
  
  INSERT INTO public.campaign_metrics (campaign_id, metric_date, total_sent, total_delivered, total_opened, total_clicked, total_converted, total_errors)
  SELECT 
    v_campaign_id,
    v_metric_date,
    COUNT(*) FILTER (WHERE status IN ('ENVIADO', 'ENTREGUE', 'ABERTO', 'CLICADO', 'CONVERTIDO')),
    COUNT(*) FILTER (WHERE status IN ('ENTREGUE', 'ABERTO', 'CLICADO', 'CONVERTIDO')),
    COUNT(*) FILTER (WHERE status IN ('ABERTO', 'CLICADO', 'CONVERTIDO')),
    COUNT(*) FILTER (WHERE status IN ('CLICADO', 'CONVERTIDO')),
    COUNT(*) FILTER (WHERE status = 'CONVERTIDO'),
    COUNT(*) FILTER (WHERE status = 'ERRO')
  FROM public.campaign_sends
  WHERE campaign_id = v_campaign_id
  AND DATE(sent_at) = v_metric_date
  ON CONFLICT (campaign_id, metric_date)
  DO UPDATE SET
    total_sent = EXCLUDED.total_sent,
    total_delivered = EXCLUDED.total_delivered,
    total_opened = EXCLUDED.total_opened,
    total_clicked = EXCLUDED.total_clicked,
    total_converted = EXCLUDED.total_converted,
    total_errors = EXCLUDED.total_errors,
    open_rate = CASE WHEN EXCLUDED.total_delivered > 0 THEN (EXCLUDED.total_opened::NUMERIC / EXCLUDED.total_delivered * 100) ELSE 0 END,
    click_rate = CASE WHEN EXCLUDED.total_opened > 0 THEN (EXCLUDED.total_clicked::NUMERIC / EXCLUDED.total_opened * 100) ELSE 0 END,
    conversion_rate = CASE WHEN EXCLUDED.total_clicked > 0 THEN (EXCLUDED.total_converted::NUMERIC / EXCLUDED.total_clicked * 100) ELSE 0 END,
    updated_at = now();
    
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Função: generate_budget_number
DROP FUNCTION IF EXISTS public.generate_budget_number() CASCADE;
CREATE OR REPLACE FUNCTION public.generate_budget_number()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.numero_orcamento IS NULL OR NEW.numero_orcamento = '' THEN
    NEW.numero_orcamento := 'ORC-' || TO_CHAR(NOW(), 'YYYYMM') || '-' || LPAD(nextval('budget_number_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

-- Função: set_budget_expiration
DROP FUNCTION IF EXISTS public.set_budget_expiration() CASCADE;
CREATE OR REPLACE FUNCTION public.set_budget_expiration()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.data_expiracao IS NULL THEN
    NEW.data_expiracao := CURRENT_DATE + (NEW.validade_dias || ' days')::INTERVAL;
  END IF;
  RETURN NEW;
END;
$$;

-- Função: log_financial_changes (corrigir search_path)
DROP FUNCTION IF EXISTS public.log_financial_changes() CASCADE;
CREATE OR REPLACE FUNCTION public.log_financial_changes()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    clinic_id,
    user_id,
    action,
    details
  )
  VALUES (
    NEW.clinic_id,
    auth.uid(),
    TG_OP || '_FINANCIAL_' || TG_TABLE_NAME,
    jsonb_build_object(
      'record_id', NEW.id,
      'table', TG_TABLE_NAME,
      'timestamp', now(),
      'old_data', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
      'new_data', row_to_json(NEW)
    )
  );
  
  RETURN NEW;
END;
$$;

-- Recriar triggers após DROP CASCADE
CREATE TRIGGER update_lgpd_updated_at_trigger
  BEFORE UPDATE ON lgpd_consents
  FOR EACH ROW
  EXECUTE FUNCTION update_lgpd_updated_at();

CREATE TRIGGER update_marketing_updated_at_trigger
  BEFORE UPDATE ON marketing_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_marketing_updated_at();

CREATE TRIGGER update_campaign_metrics_trigger
  AFTER INSERT OR UPDATE OR DELETE ON campaign_sends
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_metrics_on_send_change();

CREATE TRIGGER generate_budget_number_trigger
  BEFORE INSERT ON budgets
  FOR EACH ROW
  EXECUTE FUNCTION generate_budget_number();

CREATE TRIGGER set_budget_expiration_trigger
  BEFORE INSERT ON budgets
  FOR EACH ROW
  EXECUTE FUNCTION set_budget_expiration();

CREATE TRIGGER log_financial_changes_trigger
  AFTER INSERT OR UPDATE ON contas_receber
  FOR EACH ROW
  EXECUTE FUNCTION log_financial_changes();

CREATE TRIGGER log_financial_changes_pagar_trigger
  AFTER INSERT OR UPDATE ON contas_pagar
  FOR EACH ROW
  EXECUTE FUNCTION log_financial_changes();

-- Fix 7: Mover extensões para schema correto (extensions)
-- Nota: pgcrypto e outras extensões devem estar em 'extensions' schema, não 'public'
-- Isso requer permissões de superuser, então vamos documentar para execução manual

COMMENT ON SCHEMA public IS 'SECURITY NOTE: Extensões devem ser movidas para schema "extensions" manualmente via superuser';

-- Fix 8: Habilitar proteção de senha vazada (Auth config)
-- Isso é feito via Supabase Dashboard -> Authentication -> Password Requirements
-- Vamos criar uma função auxiliar para verificar senhas

CREATE OR REPLACE FUNCTION public.validate_password_strength(password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Mínimo 8 caracteres
  IF LENGTH(password) < 8 THEN
    RETURN FALSE;
  END IF;
  
  -- Ao menos 1 letra maiúscula
  IF password !~ '[A-Z]' THEN
    RETURN FALSE;
  END IF;
  
  -- Ao menos 1 letra minúscula
  IF password !~ '[a-z]' THEN
    RETURN FALSE;
  END IF;
  
  -- Ao menos 1 número
  IF password !~ '[0-9]' THEN
    RETURN FALSE;
  END IF;
  
  -- Ao menos 1 caractere especial
  IF password !~ '[!@#$%^&*(),.?":{}|<>]' THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Adicionar índices para performance (boas práticas)
CREATE INDEX IF NOT EXISTS idx_audit_logs_clinic_action ON audit_logs(clinic_id, action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_sends_status ON campaign_sends(status);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_date ON campaign_metrics(metric_date DESC);

-- Log da correção
DO $$
BEGIN
  RAISE NOTICE 'FASE 0 - T0.1 CONCLUÍDA: 6 funções corrigidas com search_path, validação de senha criada, índices otimizados';
END $$;