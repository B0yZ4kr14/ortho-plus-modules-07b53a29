-- Adicionar configuração de retenção de backups na tabela clinics
ALTER TABLE public.clinics 
ADD COLUMN IF NOT EXISTS backup_retention_days INTEGER DEFAULT 90 CHECK (backup_retention_days IN (30, 60, 90, 180, 365));

-- Adicionar flag de auto-limpeza
ALTER TABLE public.clinics
ADD COLUMN IF NOT EXISTS auto_cleanup_enabled BOOLEAN DEFAULT true;

-- Comentários
COMMENT ON COLUMN public.clinics.backup_retention_days IS 'Número de dias para manter backups antes da limpeza automática';
COMMENT ON COLUMN public.clinics.auto_cleanup_enabled IS 'Se a limpeza automática de backups antigos está habilitada';

-- Função para limpar backups antigos de uma clínica
CREATE OR REPLACE FUNCTION public.cleanup_old_backups(p_clinic_id UUID)
RETURNS TABLE (
  deleted_count INTEGER,
  freed_bytes BIGINT
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_retention_days INTEGER;
  v_auto_cleanup_enabled BOOLEAN;
  v_deleted_count INTEGER := 0;
  v_freed_bytes BIGINT := 0;
BEGIN
  -- Buscar configurações da clínica
  SELECT backup_retention_days, auto_cleanup_enabled
  INTO v_retention_days, v_auto_cleanup_enabled
  FROM public.clinics
  WHERE id = p_clinic_id;

  -- Se auto-cleanup não está habilitado, retornar
  IF NOT v_auto_cleanup_enabled THEN
    deleted_count := 0;
    freed_bytes := 0;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Calcular tamanho total dos backups a serem deletados
  SELECT 
    COUNT(*),
    COALESCE(SUM(file_size_bytes), 0)
  INTO 
    v_deleted_count,
    v_freed_bytes
  FROM public.backup_history
  WHERE clinic_id = p_clinic_id
    AND created_at < NOW() - (v_retention_days || ' days')::INTERVAL
    AND status = 'success';

  -- Deletar backups antigos
  DELETE FROM public.backup_history
  WHERE clinic_id = p_clinic_id
    AND created_at < NOW() - (v_retention_days || ' days')::INTERVAL
    AND status = 'success';

  -- Registrar a limpeza no audit log
  INSERT INTO public.audit_logs (
    clinic_id,
    action,
    details
  ) VALUES (
    p_clinic_id,
    'BACKUP_CLEANUP',
    jsonb_build_object(
      'deleted_count', v_deleted_count,
      'freed_bytes', v_freed_bytes,
      'retention_days', v_retention_days,
      'cleanup_date', NOW()
    )
  );

  deleted_count := v_deleted_count;
  freed_bytes := v_freed_bytes;
  RETURN NEXT;
END;
$$;

-- Comentários
COMMENT ON FUNCTION public.cleanup_old_backups IS 'Remove backups antigos baseado na política de retenção da clínica';
