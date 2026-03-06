-- FASE 1: Consolidação e Refatoração do Schema
-- Criar tabela de políticas de retenção PRIMEIRO (GFS - Grandfather-Father-Son)
CREATE TABLE IF NOT EXISTS backup_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  backup_type TEXT NOT NULL CHECK (backup_type IN ('full', 'incremental', 'differential', 'all')),
  keep_daily INT NOT NULL DEFAULT 7,
  keep_weekly INT NOT NULL DEFAULT 4,
  keep_monthly INT NOT NULL DEFAULT 12,
  keep_yearly INT NOT NULL DEFAULT 7,
  auto_delete_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Criar tabela de log de verificação
CREATE TABLE IF NOT EXISTS backup_verification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_id UUID NOT NULL REFERENCES backup_history(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL CHECK (verification_type IN ('checksum', 'restore_test', 'integrity_scan', 'schema_validation')),
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'warning')),
  details JSONB DEFAULT '{}',
  verified_at TIMESTAMPTZ DEFAULT now()
);

-- Agora refatorar backup_history (após backup_retention_policies existir)
ALTER TABLE backup_history 
DROP COLUMN IF EXISTS is_incremental,
ADD COLUMN IF NOT EXISTS retention_policy_id UUID REFERENCES backup_retention_policies(id),
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS restore_tested_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS compression_ratio DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS transfer_speed_mbps DECIMAL(10,2);

-- Atualizar metadata para incluir postgres info
COMMENT ON COLUMN backup_history.metadata IS 'JSON com estrutura: {postgres: {included: boolean, dump_size: bigint, tables_count: int}, performance: {duration_seconds: int}}';

-- Refatorar scheduled_backups
ALTER TABLE scheduled_backups 
DROP COLUMN IF EXISTS cloud_upload_enabled,
DROP COLUMN IF EXISTS cloud_providers,
ADD COLUMN IF NOT EXISTS retention_policy_id UUID REFERENCES backup_retention_policies(id),
ADD COLUMN IF NOT EXISTS max_parallel_jobs INT DEFAULT 2;

-- RLS Policies
ALTER TABLE backup_retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_verification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver políticas de retenção de sua clínica"
  ON backup_retention_policies FOR SELECT
  USING (clinic_id IN (SELECT get_user_clinic_id(auth.uid())));

CREATE POLICY "Admins podem gerenciar políticas de retenção"
  ON backup_retention_policies FOR ALL
  USING (clinic_id IN (SELECT get_user_clinic_id(auth.uid())) AND has_role(auth.uid(), 'ADMIN'))
  WITH CHECK (clinic_id IN (SELECT get_user_clinic_id(auth.uid())) AND has_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Usuários podem ver logs de verificação de sua clínica"
  ON backup_verification_log FOR SELECT
  USING (backup_id IN (SELECT id FROM backup_history WHERE clinic_id IN (SELECT get_user_clinic_id(auth.uid()))));

CREATE POLICY "Sistema pode criar logs de verificação"
  ON backup_verification_log FOR INSERT
  WITH CHECK (backup_id IN (SELECT id FROM backup_history WHERE clinic_id IN (SELECT get_user_clinic_id(auth.uid()))));

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_backup_retention_policies_clinic ON backup_retention_policies(clinic_id);
CREATE INDEX IF NOT EXISTS idx_backup_verification_log_backup ON backup_verification_log(backup_id);
CREATE INDEX IF NOT EXISTS idx_backup_verification_log_verified_at ON backup_verification_log(verified_at DESC);
CREATE INDEX IF NOT EXISTS idx_backup_history_verified_at ON backup_history(verified_at DESC);
CREATE INDEX IF NOT EXISTS idx_backup_history_restore_tested_at ON backup_history(restore_tested_at DESC);

-- Trigger para updated_at
CREATE TRIGGER update_backup_retention_policies_updated_at
  BEFORE UPDATE ON backup_retention_policies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Inserir política de retenção padrão para clínicas existentes
INSERT INTO backup_retention_policies (clinic_id, name, backup_type, keep_daily, keep_weekly, keep_monthly, keep_yearly, auto_delete_enabled)
SELECT id, 'Política Padrão GFS', 'all', 7, 4, 12, 7, true
FROM clinics
WHERE id NOT IN (SELECT clinic_id FROM backup_retention_policies WHERE name = 'Política Padrão GFS')
ON CONFLICT DO NOTHING;