-- ============================================================
-- FASE 1: SEGURANÇA ENTERPRISE - Tabelas de Segurança
-- ============================================================

-- 1. Tabela de tentativas de login
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT false,
  ip_address TEXT,
  ip_geolocation JSONB,
  device_fingerprint TEXT,
  user_agent TEXT,
  session_duration_seconds INTEGER,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tabela de sessões de pacientes (referencia patient_id de patient_accounts)
CREATE TABLE IF NOT EXISTS public.patient_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS simplificadas
DROP POLICY IF EXISTS "allow_all_login_attempts" ON public.login_attempts;
CREATE POLICY "allow_all_login_attempts"
  ON public.login_attempts
  FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "allow_all_patient_sessions" ON public.patient_sessions;
CREATE POLICY "allow_all_patient_sessions"
  ON public.patient_sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Trigger para detectar logins suspeitos
CREATE OR REPLACE FUNCTION detect_suspicious_login_attempts()
RETURNS TRIGGER AS $$
DECLARE
  failed_attempts INTEGER;
BEGIN
  SELECT COUNT(*) INTO failed_attempts
  FROM public.login_attempts
  WHERE email = NEW.email
    AND success = false
    AND attempted_at > NOW() - INTERVAL '15 minutes';

  IF failed_attempts >= 5 AND NEW.success = false THEN
    INSERT INTO public.audit_logs (action, details) 
    VALUES (
      'SUSPICIOUS_LOGIN_ACTIVITY',
      jsonb_build_object(
        'email', NEW.email,
        'failed_attempts', failed_attempts,
        'ip_address', NEW.ip_address
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_detect_suspicious_logins ON public.login_attempts;
CREATE TRIGGER trigger_detect_suspicious_logins
  AFTER INSERT ON public.login_attempts
  FOR EACH ROW
  EXECUTE FUNCTION detect_suspicious_login_attempts();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON public.login_attempts(email, attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON public.login_attempts(ip_address) WHERE success = false;
CREATE INDEX IF NOT EXISTS idx_patient_sessions_expires ON public.patient_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_patient_sessions_patient ON public.patient_sessions(patient_id);

-- Função de cleanup
CREATE OR REPLACE FUNCTION cleanup_expired_patient_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.patient_sessions WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários
COMMENT ON TABLE public.login_attempts IS 'FASE 1: Audit log de tentativas de login (staff e pacientes)';
COMMENT ON TABLE public.patient_sessions IS 'FASE 1: Sessões JWT ativas de pacientes';
COMMENT ON FUNCTION cleanup_expired_patient_sessions IS 'FASE 1: Remove sessões de pacientes expiradas';
COMMENT ON FUNCTION detect_suspicious_login_attempts IS 'FASE 1: Detecta tentativas de brute-force';
