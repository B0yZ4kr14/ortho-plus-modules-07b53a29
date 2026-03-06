-- Criar tabela para histórico de backups
CREATE TABLE IF NOT EXISTS public.backup_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  backup_type TEXT NOT NULL CHECK (backup_type IN ('manual', 'automatic', 'scheduled')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'in_progress')),
  file_size_bytes BIGINT,
  file_path TEXT,
  format TEXT CHECK (format IN ('json', 'csv')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB,
  CONSTRAINT valid_completed_at CHECK (
    (status = 'success' AND completed_at IS NOT NULL) OR 
    (status IN ('pending', 'in_progress', 'failed'))
  )
);

-- Criar índices para performance
CREATE INDEX idx_backup_history_clinic_id ON public.backup_history(clinic_id);
CREATE INDEX idx_backup_history_created_at ON public.backup_history(created_at DESC);
CREATE INDEX idx_backup_history_status ON public.backup_history(status);

-- Habilitar RLS
ALTER TABLE public.backup_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view backup history from their clinic"
  ON public.backup_history
  FOR SELECT
  USING (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "System can insert backup history"
  ON public.backup_history
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update backup history"
  ON public.backup_history
  FOR UPDATE
  USING (true);

-- Comentários
COMMENT ON TABLE public.backup_history IS 'Histórico de todos os backups executados por clínica';
COMMENT ON COLUMN public.backup_history.backup_type IS 'Tipo do backup: manual, automatic ou scheduled';
COMMENT ON COLUMN public.backup_history.status IS 'Status do backup: pending, in_progress, success ou failed';
COMMENT ON COLUMN public.backup_history.file_size_bytes IS 'Tamanho do arquivo de backup em bytes';
COMMENT ON COLUMN public.backup_history.file_path IS 'Caminho do arquivo no storage';
COMMENT ON COLUMN public.backup_history.metadata IS 'Metadados adicionais do backup (tabelas incluídas, configurações, etc)';
