-- ============================================
-- CORREÇÃO ALTA A1 (Parte 5): Funções Finais
-- ============================================

-- 21. update_teleodonto_updated_at
CREATE OR REPLACE FUNCTION public.update_teleodonto_updated_at()
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

-- 22. log_odontograma_change
CREATE OR REPLACE FUNCTION public.log_odontograma_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.audit_logs (clinic_id, user_id, action, details)
  SELECT p.clinic_id, auth.uid(), 'ODONTOGRAMA_UPDATED',
    jsonb_build_object('prontuario_id', NEW.prontuario_id, 'tooth_number', NEW.tooth_number,
      'old_status', COALESCE(OLD.status, 'higido'), 'new_status', NEW.status, 'timestamp', now())
  FROM public.prontuarios p WHERE p.id = NEW.prontuario_id;
  RETURN NEW;
END;
$$;

-- 23. cleanup_old_backups
CREATE OR REPLACE FUNCTION public.cleanup_old_backups(p_clinic_id uuid)
RETURNS TABLE(deleted_count integer, freed_bytes bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_retention_days INTEGER;
  v_auto_cleanup_enabled BOOLEAN;
  v_deleted_count INTEGER := 0;
  v_freed_bytes BIGINT := 0;
BEGIN
  SELECT backup_retention_days, auto_cleanup_enabled INTO v_retention_days, v_auto_cleanup_enabled
  FROM public.clinics WHERE id = p_clinic_id;

  IF NOT v_auto_cleanup_enabled THEN
    deleted_count := 0; freed_bytes := 0; RETURN NEXT; RETURN;
  END IF;

  SELECT COUNT(*), COALESCE(SUM(file_size_bytes), 0) INTO v_deleted_count, v_freed_bytes
  FROM public.backup_history
  WHERE clinic_id = p_clinic_id AND created_at < NOW() - (v_retention_days || ' days')::INTERVAL AND status = 'success';

  DELETE FROM public.backup_history
  WHERE clinic_id = p_clinic_id AND created_at < NOW() - (v_retention_days || ' days')::INTERVAL AND status = 'success';

  INSERT INTO public.audit_logs (clinic_id, action, details)
  VALUES (p_clinic_id, 'BACKUP_CLEANUP', jsonb_build_object('deleted_count', v_deleted_count,
    'freed_bytes', v_freed_bytes, 'retention_days', v_retention_days, 'cleanup_date', NOW()));

  deleted_count := v_deleted_count; freed_bytes := v_freed_bytes; RETURN NEXT;
END;
$$;

-- 24. calculate_ai_accuracy_by_clinic
CREATE OR REPLACE FUNCTION public.calculate_ai_accuracy_by_clinic(p_clinic_id uuid)
RETURNS TABLE(total_analises bigint, analises_corretas bigint, taxa_acerto numeric, media_confidence numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT COUNT(*)::bigint as total_analises,
    COUNT(*) FILTER (WHERE f.ia_estava_correta = true)::bigint as analises_corretas,
    ROUND((COUNT(*) FILTER (WHERE f.ia_estava_correta = true)::numeric / NULLIF(COUNT(*)::numeric, 0)) * 100, 2) as taxa_acerto,
    ROUND(AVG(a.confidence_score), 2) as media_confidence
  FROM public.analises_radiograficas a
  LEFT JOIN public.radiografia_ai_feedback f ON a.id = f.analise_id
  WHERE a.clinic_id = p_clinic_id AND a.status_analise = 'concluida';
END;
$$;