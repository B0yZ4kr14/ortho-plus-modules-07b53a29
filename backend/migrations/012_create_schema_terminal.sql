-- Migration: 012 - Create Schema terminal
-- Módulo: TERMINAL WEB SHELL (Administração)
-- Descrição: Schema para terminal shell web com controles de segurança

-- ============================================================================
-- 1. CREATE SCHEMA
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS terminal;

-- ============================================================================
-- 2. COMMAND WHITELIST
-- ============================================================================
CREATE TABLE IF NOT EXISTS terminal.command_whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Command info
  command TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL, -- 'SYSTEM', 'FILES', 'GIT', 'NPM', 'DOCKER', 'DATABASE'
  
  -- Security
  is_dangerous BOOLEAN NOT NULL DEFAULT false,
  requires_confirmation BOOLEAN NOT NULL DEFAULT false,
  allowed_args TEXT[], -- NULL = qualquer argumento; [] = nenhum argumento; ['arg1', 'arg2'] = args específicos
  
  -- Rate limiting
  max_executions_per_hour INTEGER,
  
  -- Status
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  
  -- Context
  added_by UUID REFERENCES auth.users(id),
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_command_whitelist_enabled ON terminal.command_whitelist(is_enabled);
CREATE INDEX idx_command_whitelist_category ON terminal.command_whitelist(category);

-- ============================================================================
-- 3. USER PERMISSIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS terminal.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  
  -- Permissions
  can_execute_commands BOOLEAN NOT NULL DEFAULT false,
  can_execute_dangerous_commands BOOLEAN NOT NULL DEFAULT false,
  allowed_categories TEXT[] NOT NULL DEFAULT ARRAY['SYSTEM', 'FILES'],
  
  -- Rate limiting
  max_commands_per_hour INTEGER NOT NULL DEFAULT 60,
  
  -- Context
  granted_by UUID NOT NULL REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_user_clinic_terminal UNIQUE (user_id, clinic_id)
);

CREATE INDEX idx_user_permissions_user ON terminal.user_permissions(user_id);
CREATE INDEX idx_user_permissions_clinic ON terminal.user_permissions(clinic_id);

-- ============================================================================
-- 4. COMMAND HISTORY
-- ============================================================================
CREATE TABLE IF NOT EXISTS terminal.command_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Command executed
  command TEXT NOT NULL,
  arguments TEXT[],
  full_command TEXT NOT NULL, -- comando completo concatenado
  
  -- Execution
  exit_code INTEGER,
  was_successful BOOLEAN NOT NULL DEFAULT false,
  was_dangerous BOOLEAN NOT NULL DEFAULT false,
  was_blocked BOOLEAN NOT NULL DEFAULT false,
  block_reason TEXT,
  
  -- Output
  stdout TEXT,
  stderr TEXT,
  
  -- Timing
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  session_id TEXT
);

CREATE INDEX idx_command_history_user ON terminal.command_history(user_id, started_at DESC);
CREATE INDEX idx_command_history_clinic ON terminal.command_history(clinic_id, started_at DESC);
CREATE INDEX idx_command_history_blocked ON terminal.command_history(was_blocked);
CREATE INDEX idx_command_history_dangerous ON terminal.command_history(was_dangerous);

-- ============================================================================
-- 5. RATE LIMITING
-- ============================================================================
CREATE TABLE IF NOT EXISTS terminal.rate_limiting (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Window
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  
  -- Counts
  command_count INTEGER NOT NULL DEFAULT 0,
  dangerous_command_count INTEGER NOT NULL DEFAULT 0,
  blocked_count INTEGER NOT NULL DEFAULT 0,
  
  CONSTRAINT unique_user_window UNIQUE (user_id, window_start)
);

CREATE INDEX idx_rate_limiting_user_window ON terminal.rate_limiting(user_id, window_start DESC);

-- ============================================================================
-- 6. SESSION MANAGEMENT
-- ============================================================================
CREATE TABLE IF NOT EXISTS terminal.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  
  -- Session info
  session_token TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Environment
  working_directory TEXT NOT NULL DEFAULT '/',
  environment_variables JSONB,
  
  -- Stats
  commands_executed INTEGER NOT NULL DEFAULT 0,
  last_command_at TIMESTAMPTZ,
  
  -- Security
  ip_address INET,
  user_agent TEXT,
  
  -- Timing
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ
);

CREATE INDEX idx_sessions_user ON terminal.sessions(user_id);
CREATE INDEX idx_sessions_active ON terminal.sessions(is_active, expires_at);
CREATE INDEX idx_sessions_token ON terminal.sessions(session_token);

-- ============================================================================
-- 7. SECURITY ALERTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS terminal.security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Alert info
  alert_type TEXT NOT NULL, -- 'DANGEROUS_COMMAND', 'RATE_LIMIT_EXCEEDED', 'UNAUTHORIZED_ACCESS', 'SUSPICIOUS_PATTERN'
  severity TEXT NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  
  -- Details
  command_attempted TEXT,
  description TEXT NOT NULL,
  metadata JSONB,
  
  -- Status
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  
  -- Notifications
  notification_sent BOOLEAN NOT NULL DEFAULT false,
  notified_users UUID[],
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_alert_type CHECK (
    alert_type IN ('DANGEROUS_COMMAND', 'RATE_LIMIT_EXCEEDED', 'UNAUTHORIZED_ACCESS', 'SUSPICIOUS_PATTERN', 'BLOCKED_COMMAND')
  ),
  CONSTRAINT valid_severity CHECK (
    severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
  )
);

CREATE INDEX idx_security_alerts_clinic ON terminal.security_alerts(clinic_id, created_at DESC);
CREATE INDEX idx_security_alerts_unresolved ON terminal.security_alerts(is_resolved) WHERE is_resolved = false;
CREATE INDEX idx_security_alerts_severity ON terminal.security_alerts(severity);

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Command Whitelist (apenas ROOT pode modificar)
ALTER TABLE terminal.command_whitelist ENABLE ROW LEVEL SECURITY;

CREATE POLICY command_whitelist_read_all ON terminal.command_whitelist
  FOR SELECT
  USING (true); -- Todos podem ler a whitelist

CREATE POLICY command_whitelist_admin_only ON terminal.command_whitelist
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND app_role = 'ROOT'
    )
  );

-- User Permissions
ALTER TABLE terminal.user_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_permissions_own_and_admin ON terminal.user_permissions
  FOR ALL
  USING (
    user_id = auth.uid() OR -- Pode ver suas próprias permissões
    EXISTS ( -- Ou é ADMIN da mesma clínica
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
        AND clinic_id = terminal.user_permissions.clinic_id
        AND app_role = 'ADMIN'
    )
  );

-- Command History
ALTER TABLE terminal.command_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY command_history_own_and_admin ON terminal.command_history
  FOR ALL
  USING (
    user_id = auth.uid() OR -- Próprio histórico
    clinic_id IN ( -- Ou ADMIN da clínica
      SELECT clinic_id FROM public.profiles
      WHERE id = auth.uid() AND app_role IN ('ADMIN', 'ROOT')
    )
  );

-- Sessions
ALTER TABLE terminal.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY sessions_own_only ON terminal.sessions
  FOR ALL
  USING (user_id = auth.uid());

-- Security Alerts
ALTER TABLE terminal.security_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY security_alerts_clinic_admins ON terminal.security_alerts
  FOR ALL
  USING (
    user_id = auth.uid() OR -- Alertas sobre o próprio usuário
    clinic_id IN ( -- Ou ADMIN da clínica
      SELECT clinic_id FROM public.profiles
      WHERE id = auth.uid() AND app_role IN ('ADMIN', 'ROOT')
    )
  );

-- ============================================================================
-- 9. TRIGGERS
-- ============================================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION terminal.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_command_whitelist_updated
  BEFORE UPDATE ON terminal.command_whitelist
  FOR EACH ROW EXECUTE FUNCTION terminal.update_updated_at();

CREATE TRIGGER trg_user_permissions_updated
  BEFORE UPDATE ON terminal.user_permissions
  FOR EACH ROW EXECUTE FUNCTION terminal.update_updated_at();

-- Calcular duration_ms automaticamente
CREATE OR REPLACE FUNCTION terminal.calculate_command_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed_at IS NOT NULL AND NEW.started_at IS NOT NULL THEN
    NEW.duration_ms := EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at)) * 1000;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_command_duration
  BEFORE INSERT OR UPDATE ON terminal.command_history
  FOR EACH ROW
  WHEN (NEW.completed_at IS NOT NULL)
  EXECUTE FUNCTION terminal.calculate_command_duration();

-- Atualizar last_activity_at em sessions
CREATE OR REPLACE FUNCTION terminal.update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE terminal.sessions
    SET last_activity_at = now(),
        commands_executed = commands_executed + 1,
        last_command_at = NEW.started_at
    WHERE user_id = NEW.user_id
      AND is_active = true
      AND expires_at > now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_session_activity
  AFTER INSERT ON terminal.command_history
  FOR EACH ROW
  EXECUTE FUNCTION terminal.update_session_activity();

-- ============================================================================
-- 10. SEED DATA - Comandos seguros básicos
-- ============================================================================

INSERT INTO terminal.command_whitelist (command, description, category, is_dangerous, requires_confirmation, max_executions_per_hour)
VALUES
  ('ls', 'List directory contents', 'FILES', false, false, 300),
  ('pwd', 'Print working directory', 'SYSTEM', false, false, 300),
  ('whoami', 'Print current user', 'SYSTEM', false, false, 300),
  ('date', 'Display current date/time', 'SYSTEM', false, false, 300),
  ('uptime', 'Show system uptime', 'SYSTEM', false, false, 60),
  ('df', 'Display disk space usage', 'SYSTEM', false, false, 60),
  ('free', 'Display memory usage', 'SYSTEM', false, false, 60),
  ('top', 'Display running processes (readonly)', 'SYSTEM', false, false, 30),
  ('ps', 'List processes', 'SYSTEM', false, false, 60),
  ('echo', 'Print text', 'SYSTEM', false, false, 300),
  ('cat', 'Display file contents', 'FILES', false, false, 120),
  ('head', 'Display first lines of file', 'FILES', false, false, 120),
  ('tail', 'Display last lines of file', 'FILES', false, false, 120),
  ('grep', 'Search text in files', 'FILES', false, false, 120),
  ('wc', 'Word/line/character count', 'FILES', false, false, 120),
  ('hostname', 'Display system hostname', 'SYSTEM', false, false, 60),
  ('git status', 'Check git repository status', 'GIT', false, false, 60),
  ('git log', 'View git commit history', 'GIT', false, false, 60),
  ('git branch', 'List git branches', 'GIT', false, false, 60),
  ('npm --version', 'Check npm version', 'NPM', false, false, 60),
  ('node --version', 'Check Node.js version', 'NPM', false, false, 60)
ON CONFLICT (command) DO NOTHING;

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================
COMMENT ON SCHEMA terminal IS 'Módulo Terminal Web Shell - Execução segura de comandos com whitelist e auditoria';
COMMENT ON TABLE terminal.command_whitelist IS 'Whitelist de comandos permitidos com controles de segurança';
COMMENT ON TABLE terminal.user_permissions IS 'Permissões de usuários para executar comandos';
COMMENT ON TABLE terminal.command_history IS 'Histórico completo de comandos executados com auditoria';
COMMENT ON TABLE terminal.sessions IS 'Sessões ativas de terminal por usuário';
COMMENT ON TABLE terminal.security_alerts IS 'Alertas de segurança para atividades suspeitas';
COMMENT ON TABLE terminal.rate_limiting IS 'Controle de taxa de execução de comandos por usuário';
