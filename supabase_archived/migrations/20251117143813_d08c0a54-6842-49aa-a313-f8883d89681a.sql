-- ============================================
-- CORREÇÃO ALTA A1 (Parte 4): Funções Restantes
-- ============================================

-- 17. update_campaign_metrics_on_send_change
CREATE OR REPLACE FUNCTION public.update_campaign_metrics_on_send_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_campaign_id UUID;
  v_metric_date DATE;
BEGIN
  v_campaign_id := COALESCE(NEW.campaign_id, OLD.campaign_id);
  v_metric_date := COALESCE(DATE(NEW.sent_at), DATE(OLD.sent_at), CURRENT_DATE);
  
  INSERT INTO public.campaign_metrics (campaign_id, metric_date, total_sent, total_delivered, total_opened, total_clicked, total_converted, total_errors)
  SELECT v_campaign_id, v_metric_date, COUNT(*) FILTER (WHERE status IN ('ENVIADO', 'ENTREGUE', 'ABERTO', 'CLICADO', 'CONVERTIDO')),
    COUNT(*) FILTER (WHERE status IN ('ENTREGUE', 'ABERTO', 'CLICADO', 'CONVERTIDO')),
    COUNT(*) FILTER (WHERE status IN ('ABERTO', 'CLICADO', 'CONVERTIDO')),
    COUNT(*) FILTER (WHERE status IN ('CLICADO', 'CONVERTIDO')),
    COUNT(*) FILTER (WHERE status = 'CONVERTIDO'),
    COUNT(*) FILTER (WHERE status = 'ERRO')
  FROM public.campaign_sends WHERE campaign_id = v_campaign_id AND DATE(sent_at) = v_metric_date
  ON CONFLICT (campaign_id, metric_date) DO UPDATE SET
    total_sent = EXCLUDED.total_sent, total_delivered = EXCLUDED.total_delivered,
    total_opened = EXCLUDED.total_opened, total_clicked = EXCLUDED.total_clicked,
    total_converted = EXCLUDED.total_converted, total_errors = EXCLUDED.total_errors,
    updated_at = now();
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 18. log_lgpd_data_request_changes
CREATE OR REPLACE FUNCTION public.log_lgpd_data_request_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status != NEW.status) THEN
    INSERT INTO public.audit_logs (action, clinic_id, user_id, details)
    VALUES ('LGPD_REQUEST_STATUS_CHANGED', NEW.clinic_id, auth.uid(),
      jsonb_build_object('request_id', NEW.id, 'request_type', NEW.request_type,
        'old_status', OLD.status, 'new_status', NEW.status, 'patient_id', NEW.patient_id));
  END IF;
  RETURN NEW;
END;
$$;

-- 19. detect_suspicious_patterns
CREATE OR REPLACE FUNCTION public.detect_suspicious_patterns()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  suspicious_ips RECORD;
  suspicious_users RECORD;
BEGIN
  FOR suspicious_ips IN
    SELECT ip_address, COUNT(DISTINCT endpoint) as endpoint_count, SUM(request_count) as total_requests
    FROM public.rate_limit_log WHERE window_start > NOW() - INTERVAL '1 hour'
    GROUP BY ip_address HAVING COUNT(DISTINCT endpoint) > 20 OR SUM(request_count) > 1000
  LOOP
    INSERT INTO public.abuse_reports (ip_address, endpoint, abuse_type, severity, details, auto_blocked)
    VALUES (suspicious_ips.ip_address, 'MULTIPLE_ENDPOINTS', 'SUSPICIOUS_PATTERN',
      CASE WHEN suspicious_ips.total_requests > 5000 THEN 'CRITICAL'
           WHEN suspicious_ips.total_requests > 2000 THEN 'HIGH' ELSE 'MEDIUM' END,
      jsonb_build_object('endpoint_count', suspicious_ips.endpoint_count,
        'total_requests', suspicious_ips.total_requests, 'detected_at', NOW()),
      suspicious_ips.total_requests > 5000);
  END LOOP;
END;
$$;

-- 20. calculate_session_duration
CREATE OR REPLACE FUNCTION public.calculate_session_duration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.ended_at IS NOT NULL AND NEW.started_at IS NOT NULL THEN
    NEW.duracao_minutos = EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at)) / 60;
  END IF;
  RETURN NEW;
END;
$$;