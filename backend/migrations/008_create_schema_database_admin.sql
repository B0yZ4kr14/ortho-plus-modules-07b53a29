-- Migration: 008 - Create Schema database_admin
-- Módulo: BANCO DE DADOS (Administração)
-- Descrição: Schema para monitoramento e manutenção do banco de dados

-- ============================================================================
-- 1. CREATE SCHEMA
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS database_admin;

-- ============================================================================
-- 2. HEALTH METRICS
-- ============================================================================
CREATE TABLE IF NOT EXISTS database_admin.health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  
  -- Métricas de conexão
  total_connections INTEGER NOT NULL,
  active_connections INTEGER NOT NULL,
  idle_connections INTEGER NOT NULL,
  max_connections INTEGER NOT NULL,
  
  -- Métricas de performance
  cache_hit_ratio DECIMAL(5,2) NOT NULL, -- 0-100%
  transaction_commit_rate DECIMAL(10,2),
  transaction_rollback_rate DECIMAL(10,2),
  
  -- Métricas de armazenamento
  database_size_bytes BIGINT NOT NULL,
  total_tables INTEGER NOT NULL,
  total_indexes INTEGER NOT NULL,
  
  -- Métricas de bloat
  table_bloat_ratio DECIMAL(5,2), -- 0-100%
  index_bloat_ratio DECIMAL(5,2),
  
  -- Timestamps
  measured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_cache_hit_ratio CHECK (cache_hit_ratio >= 0 AND cache_hit_ratio <= 100),
  CONSTRAINT valid_bloat_ratios CHECK (
    (table_bloat_ratio IS NULL OR (table_bloat_ratio >= 0 AND table_bloat_ratio <= 100)) AND
    (index_bloat_ratio IS NULL OR (index_bloat_ratio >= 0 AND index_bloat_ratio <= 100))
  )
);

CREATE INDEX idx_health_metrics_clinic_measured ON database_admin.health_metrics(clinic_id, measured_at DESC);

-- ============================================================================
-- 3. SLOW QUERIES LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS database_admin.slow_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  
  -- Query info
  query_text TEXT NOT NULL,
  query_hash TEXT NOT NULL, -- MD5 hash para agrupar queries similares
  
  -- Performance
  execution_time_ms DECIMAL(12,2) NOT NULL,
  rows_returned BIGINT,
  rows_scanned BIGINT,
  
  -- Context
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  application_name TEXT,
  client_addr INET,
  
  -- Timestamps
  executed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT positive_execution_time CHECK (execution_time_ms > 0)
);

CREATE INDEX idx_slow_queries_clinic ON database_admin.slow_queries(clinic_id, executed_at DESC);
CREATE INDEX idx_slow_queries_hash ON database_admin.slow_queries(query_hash, executed_at DESC);
CREATE INDEX idx_slow_queries_execution_time ON database_admin.slow_queries(execution_time_ms DESC);

-- ============================================================================
-- 4. MAINTENANCE TASKS
-- ============================================================================
CREATE TYPE database_admin.maintenance_task_type AS ENUM (
  'VACUUM',
  'VACUUM_FULL',
  'ANALYZE',
  'REINDEX',
  'CLUSTER'
);

CREATE TYPE database_admin.task_status AS ENUM (
  'PENDING',
  'RUNNING',
  'COMPLETED',
  'FAILED',
  'CANCELLED'
);

CREATE TABLE IF NOT EXISTS database_admin.maintenance_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  
  -- Task info
  task_type database_admin.maintenance_task_type NOT NULL,
  target_schema TEXT NOT NULL,
  target_table TEXT, -- NULL = todas as tabelas do schema
  
  -- Execution
  status database_admin.task_status NOT NULL DEFAULT 'PENDING',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  
  -- Results
  space_reclaimed_bytes BIGINT,
  rows_processed BIGINT,
  error_message TEXT,
  
  -- Context
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_duration CHECK (
    (status IN ('PENDING', 'RUNNING') AND duration_seconds IS NULL) OR
    (status IN ('COMPLETED', 'FAILED', 'CANCELLED') AND duration_seconds IS NOT NULL)
  )
);

CREATE INDEX idx_maintenance_tasks_clinic ON database_admin.maintenance_tasks(clinic_id, created_at DESC);
CREATE INDEX idx_maintenance_tasks_status ON database_admin.maintenance_tasks(status, created_at DESC);

-- ============================================================================
-- 5. TABLE STATISTICS
-- ============================================================================
CREATE TABLE IF NOT EXISTS database_admin.table_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  
  -- Table info
  schema_name TEXT NOT NULL,
  table_name TEXT NOT NULL,
  
  -- Size metrics
  table_size_bytes BIGINT NOT NULL,
  indexes_size_bytes BIGINT NOT NULL,
  total_size_bytes BIGINT NOT NULL,
  
  -- Row metrics
  row_count BIGINT NOT NULL,
  dead_row_count BIGINT,
  
  -- Activity metrics
  sequential_scans BIGINT,
  index_scans BIGINT,
  inserts BIGINT,
  updates BIGINT,
  deletes BIGINT,
  
  -- Maintenance info
  last_vacuum TIMESTAMPTZ,
  last_autovacuum TIMESTAMPTZ,
  last_analyze TIMESTAMPTZ,
  last_autoanalyze TIMESTAMPTZ,
  
  -- Timestamps
  measured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_sizes CHECK (
    table_size_bytes >= 0 AND 
    indexes_size_bytes >= 0 AND 
    total_size_bytes >= (table_size_bytes + indexes_size_bytes)
  )
);

CREATE INDEX idx_table_stats_clinic ON database_admin.table_statistics(clinic_id, measured_at DESC);
CREATE INDEX idx_table_stats_schema_table ON database_admin.table_statistics(schema_name, table_name, measured_at DESC);

-- ============================================================================
-- 6. CONNECTION POOL MONITORING
-- ============================================================================
CREATE TABLE IF NOT EXISTS database_admin.connection_pool_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  
  -- Pool info
  pool_name TEXT NOT NULL,
  
  -- Connection metrics
  total_connections INTEGER NOT NULL,
  active_connections INTEGER NOT NULL,
  idle_connections INTEGER NOT NULL,
  waiting_connections INTEGER NOT NULL,
  
  -- Performance
  avg_wait_time_ms DECIMAL(10,2),
  max_wait_time_ms DECIMAL(10,2),
  
  -- Timestamps
  measured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_connections CHECK (
    total_connections >= 0 AND
    active_connections >= 0 AND
    idle_connections >= 0 AND
    waiting_connections >= 0 AND
    total_connections >= active_connections
  )
);

CREATE INDEX idx_connection_pool_measured ON database_admin.connection_pool_stats(measured_at DESC);

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Health Metrics RLS
ALTER TABLE database_admin.health_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY health_metrics_clinic_isolation ON database_admin.health_metrics
  FOR ALL
  USING (clinic_id IN (
    SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Slow Queries RLS
ALTER TABLE database_admin.slow_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY slow_queries_clinic_isolation ON database_admin.slow_queries
  FOR ALL
  USING (
    clinic_id IS NULL OR -- Queries globais (admin do sistema)
    clinic_id IN (
      SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Maintenance Tasks RLS
ALTER TABLE database_admin.maintenance_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY maintenance_tasks_clinic_isolation ON database_admin.maintenance_tasks
  FOR ALL
  USING (clinic_id IN (
    SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Table Statistics RLS
ALTER TABLE database_admin.table_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY table_stats_clinic_isolation ON database_admin.table_statistics
  FOR ALL
  USING (clinic_id IN (
    SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Connection Pool Stats RLS (somente admins do sistema)
ALTER TABLE database_admin.connection_pool_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY connection_pool_admin_only ON database_admin.connection_pool_stats
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND app_role = 'ROOT'
    )
  );

-- ============================================================================
-- 8. TRIGGERS
-- ============================================================================

-- Trigger para calcular duration_seconds automaticamente
CREATE OR REPLACE FUNCTION database_admin.calculate_task_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('COMPLETED', 'FAILED', 'CANCELLED') AND NEW.started_at IS NOT NULL THEN
    NEW.duration_seconds := EXTRACT(EPOCH FROM (COALESCE(NEW.completed_at, now()) - NEW.started_at))::INTEGER;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_task_duration
  BEFORE UPDATE ON database_admin.maintenance_tasks
  FOR EACH ROW
  WHEN (NEW.status IN ('COMPLETED', 'FAILED', 'CANCELLED'))
  EXECUTE FUNCTION database_admin.calculate_task_duration();

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================
COMMENT ON SCHEMA database_admin IS 'Módulo de Administração de Banco de Dados - Monitoramento e Manutenção';
COMMENT ON TABLE database_admin.health_metrics IS 'Métricas de saúde do banco de dados por clínica';
COMMENT ON TABLE database_admin.slow_queries IS 'Log de queries lentas para otimização de performance';
COMMENT ON TABLE database_admin.maintenance_tasks IS 'Histórico de tarefas de manutenção (VACUUM, ANALYZE, REINDEX)';
COMMENT ON TABLE database_admin.table_statistics IS 'Estatísticas detalhadas por tabela';
COMMENT ON TABLE database_admin.connection_pool_stats IS 'Monitoramento de connection pooling';
