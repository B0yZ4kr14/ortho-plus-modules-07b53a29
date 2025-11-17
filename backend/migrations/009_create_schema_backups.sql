-- Migration: 009 - Create Schema backups
-- Módulo: BACKUPS (Administração)
-- Descrição: Schema para gestão avançada de backups e disaster recovery

-- ============================================================================
-- 1. CREATE SCHEMA
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS backups;

-- ============================================================================
-- 2. ENUMS
-- ============================================================================
CREATE TYPE backups.backup_type AS ENUM (
  'FULL',           -- Backup completo
  'INCREMENTAL',    -- Apenas mudanças desde último backup
  'DIFFERENTIAL',   -- Mudanças desde último FULL
  'LOGICAL',        -- pg_dump (schema + dados)
  'PHYSICAL'        -- Cópia física dos arquivos
);

CREATE TYPE backups.backup_status AS ENUM (
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'FAILED',
  'VERIFYING',
  'VERIFIED',
  'CORRUPTED'
);

CREATE TYPE backups.storage_destination AS ENUM (
  'LOCAL',
  'S3',
  'GOOGLE_DRIVE',
  'DROPBOX',
  'FTP',
  'STORJ',
  'AZURE_BLOB'
);

CREATE TYPE backups.compression_algorithm AS ENUM (
  'NONE',
  'GZIP',
  'ZSTD',
  'LZ4',
  'BZIP2'
);

-- ============================================================================
-- 3. BACKUP HISTORY
-- ============================================================================
CREATE TABLE IF NOT EXISTS backups.backup_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  
  -- Backup info
  backup_type backups.backup_type NOT NULL,
  backup_name TEXT NOT NULL,
  description TEXT,
  
  -- Status
  status backups.backup_status NOT NULL DEFAULT 'PENDING',
  
  -- Storage
  storage_destination backups.storage_destination NOT NULL,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  
  -- Size & compression
  original_size_bytes BIGINT,
  compressed_size_bytes BIGINT,
  compression_algorithm backups.compression_algorithm NOT NULL DEFAULT 'ZSTD',
  compression_ratio DECIMAL(5,2), -- Calculado: compressed/original
  
  -- Integrity
  checksum_md5 TEXT,
  checksum_sha256 TEXT,
  is_encrypted BOOLEAN NOT NULL DEFAULT false,
  encryption_algorithm TEXT, -- ex: 'AES-256-GCM'
  
  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  transfer_speed_mbps DECIMAL(10,2),
  
  -- Parent (para incrementais/diferenciais)
  parent_backup_id UUID REFERENCES backups.backup_history(id) ON DELETE SET NULL,
  
  -- Metadata
  metadata JSONB, -- Informações específicas (tabelas incluídas, versão PG, etc)
  error_message TEXT,
  
  -- Context
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_compression_ratio CHECK (
    compression_ratio IS NULL OR 
    (compression_ratio > 0 AND compression_ratio <= 100)
  ),
  CONSTRAINT valid_duration CHECK (
    (status IN ('PENDING', 'IN_PROGRESS') AND duration_seconds IS NULL) OR
    (status NOT IN ('PENDING', 'IN_PROGRESS') AND duration_seconds IS NOT NULL)
  )
);

CREATE INDEX idx_backups_clinic_created ON backups.backup_history(clinic_id, created_at DESC);
CREATE INDEX idx_backups_status ON backups.backup_history(status, created_at DESC);
CREATE INDEX idx_backups_parent ON backups.backup_history(parent_backup_id);

-- ============================================================================
-- 4. BACKUP SCHEDULES
-- ============================================================================
CREATE TABLE IF NOT EXISTS backups.backup_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  
  -- Schedule info
  schedule_name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Type & destination
  backup_type backups.backup_type NOT NULL,
  storage_destination backups.storage_destination NOT NULL,
  storage_config JSONB NOT NULL, -- Credenciais e configurações do destino
  
  -- Frequency (cron-like)
  frequency_type TEXT NOT NULL, -- 'DAILY', 'WEEKLY', 'MONTHLY', 'CRON'
  frequency_value TEXT NOT NULL, -- '02:00', 'SUNDAY', '1', ou expressão cron
  
  -- Options
  compression_algorithm backups.compression_algorithm NOT NULL DEFAULT 'ZSTD',
  enable_encryption BOOLEAN NOT NULL DEFAULT true,
  
  -- Tables to include/exclude
  included_schemas TEXT[], -- NULL = todos
  excluded_schemas TEXT[],
  included_tables TEXT[],
  excluded_tables TEXT[],
  
  -- Retention
  retention_days INTEGER NOT NULL DEFAULT 90,
  
  -- Execution info
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ NOT NULL,
  last_status backups.backup_status,
  last_error TEXT,
  
  -- Notifications
  notification_emails TEXT[],
  notify_on_success BOOLEAN NOT NULL DEFAULT false,
  notify_on_failure BOOLEAN NOT NULL DEFAULT true,
  
  -- Context
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_retention CHECK (retention_days > 0)
);

CREATE INDEX idx_backup_schedules_clinic ON backups.backup_schedules(clinic_id);
CREATE INDEX idx_backup_schedules_next_run ON backups.backup_schedules(next_run_at) WHERE is_active = true;

-- ============================================================================
-- 5. RETENTION POLICIES (GFS - Grandfather-Father-Son)
-- ============================================================================
CREATE TABLE IF NOT EXISTS backups.retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  
  -- Policy info
  policy_name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  
  -- GFS Configuration
  keep_daily INTEGER NOT NULL DEFAULT 7,    -- Últimos 7 dias
  keep_weekly INTEGER NOT NULL DEFAULT 4,   -- Últimas 4 semanas
  keep_monthly INTEGER NOT NULL DEFAULT 12, -- Últimos 12 meses
  keep_yearly INTEGER NOT NULL DEFAULT 3,   -- Últimos 3 anos
  
  -- Auto-delete
  auto_delete_enabled BOOLEAN NOT NULL DEFAULT true,
  
  -- Context
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_retention_counts CHECK (
    keep_daily >= 0 AND 
    keep_weekly >= 0 AND 
    keep_monthly >= 0 AND 
    keep_yearly >= 0
  ),
  CONSTRAINT unique_default_policy UNIQUE (clinic_id, is_default) WHERE is_default = true
);

CREATE INDEX idx_retention_policies_clinic ON backups.retention_policies(clinic_id);

-- ============================================================================
-- 6. BACKUP VERIFICATION LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS backups.verification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_id UUID NOT NULL REFERENCES backups.backup_history(id) ON DELETE CASCADE,
  
  -- Verification type
  verification_type TEXT NOT NULL, -- 'CHECKSUM', 'RESTORE_TEST', 'INTEGRITY_CHECK'
  
  -- Results
  status TEXT NOT NULL, -- 'PASSED', 'FAILED', 'WARNING'
  details JSONB,
  error_message TEXT,
  
  -- Timing
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  
  -- Context
  verified_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT valid_verification_status CHECK (status IN ('PASSED', 'FAILED', 'WARNING'))
);

CREATE INDEX idx_verification_backup ON backups.verification_log(backup_id, started_at DESC);

-- ============================================================================
-- 7. BACKUP REPLICATIONS (Geo-distribuição)
-- ============================================================================
CREATE TABLE IF NOT EXISTS backups.backup_replications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_id UUID NOT NULL REFERENCES backups.backup_history(id) ON DELETE CASCADE,
  
  -- Replication info
  source_clinic_id UUID NOT NULL REFERENCES public.clinics(id),
  target_clinic_id UUID NOT NULL REFERENCES public.clinics(id),
  
  -- Storage
  storage_provider backups.storage_destination NOT NULL,
  region TEXT NOT NULL, -- ex: 'us-east-1', 'eu-west-1'
  storage_path TEXT NOT NULL,
  
  -- Status
  replication_status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED'
  
  -- Size
  file_size_bytes BIGINT,
  checksum_md5 TEXT,
  
  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB,
  error_message TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_replication_status CHECK (
    replication_status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED')
  )
);

CREATE INDEX idx_replications_backup ON backups.backup_replications(backup_id);
CREATE INDEX idx_replications_clinics ON backups.backup_replications(source_clinic_id, target_clinic_id);

-- ============================================================================
-- 8. IMMUTABILITY LOG (WORM - Write Once Read Many)
-- ============================================================================
CREATE TABLE IF NOT EXISTS backups.immutability_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_id UUID NOT NULL REFERENCES backups.backup_history(id) ON DELETE CASCADE,
  
  -- WORM config
  enabled BOOLEAN NOT NULL DEFAULT false,
  locked_until TIMESTAMPTZ,
  locked_by UUID NOT NULL REFERENCES auth.users(id),
  locked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Reason
  reason TEXT,
  
  -- Deletion attempts (auditoria)
  deletion_attempts INTEGER NOT NULL DEFAULT 0,
  last_deletion_attempt_at TIMESTAMPTZ,
  last_deletion_attempted_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_immutability_backup ON backups.immutability_log(backup_id);

-- ============================================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Backup History RLS
ALTER TABLE backups.backup_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY backup_history_clinic_isolation ON backups.backup_history
  FOR ALL
  USING (clinic_id IN (
    SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Backup Schedules RLS
ALTER TABLE backups.backup_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY backup_schedules_clinic_isolation ON backups.backup_schedules
  FOR ALL
  USING (clinic_id IN (
    SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Retention Policies RLS
ALTER TABLE backups.retention_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY retention_policies_clinic_isolation ON backups.retention_policies
  FOR ALL
  USING (clinic_id IN (
    SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Verification Log RLS (via backup_id)
ALTER TABLE backups.verification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY verification_log_clinic_isolation ON backups.verification_log
  FOR ALL
  USING (
    backup_id IN (
      SELECT id FROM backups.backup_history
      WHERE clinic_id IN (
        SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

-- Replications RLS
ALTER TABLE backups.backup_replications ENABLE ROW LEVEL SECURITY;

CREATE POLICY replications_clinic_isolation ON backups.backup_replications
  FOR ALL
  USING (
    source_clinic_id IN (
      SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
    ) OR
    target_clinic_id IN (
      SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Immutability Log RLS
ALTER TABLE backups.immutability_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY immutability_log_clinic_isolation ON backups.immutability_log
  FOR ALL
  USING (
    backup_id IN (
      SELECT id FROM backups.backup_history
      WHERE clinic_id IN (
        SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

-- ============================================================================
-- 10. TRIGGERS
-- ============================================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION backups.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_backup_schedules_updated_at
  BEFORE UPDATE ON backups.backup_schedules
  FOR EACH ROW
  EXECUTE FUNCTION backups.update_updated_at();

CREATE TRIGGER trg_retention_policies_updated_at
  BEFORE UPDATE ON backups.retention_policies
  FOR EACH ROW
  EXECUTE FUNCTION backups.update_updated_at();

-- Calcular compression_ratio automaticamente
CREATE OR REPLACE FUNCTION backups.calculate_compression_ratio()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.original_size_bytes IS NOT NULL AND NEW.compressed_size_bytes IS NOT NULL AND NEW.original_size_bytes > 0 THEN
    NEW.compression_ratio := (NEW.compressed_size_bytes::DECIMAL / NEW.original_size_bytes::DECIMAL) * 100;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_compression_ratio
  BEFORE INSERT OR UPDATE ON backups.backup_history
  FOR EACH ROW
  WHEN (NEW.original_size_bytes IS NOT NULL AND NEW.compressed_size_bytes IS NOT NULL)
  EXECUTE FUNCTION backups.calculate_compression_ratio();

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================
COMMENT ON SCHEMA backups IS 'Módulo de Backups Avançados - Enterprise-grade backup e disaster recovery';
COMMENT ON TABLE backups.backup_history IS 'Histórico completo de backups com verificação de integridade';
COMMENT ON TABLE backups.backup_schedules IS 'Agendamento automático de backups com múltiplos destinos';
COMMENT ON TABLE backups.retention_policies IS 'Políticas de retenção GFS (Grandfather-Father-Son)';
COMMENT ON TABLE backups.verification_log IS 'Log de verificações de integridade e testes de restore';
COMMENT ON TABLE backups.backup_replications IS 'Replicação geo-distribuída para disaster recovery';
COMMENT ON TABLE backups.immutability_log IS 'Proteção WORM (Write Once Read Many) contra ransomware';
