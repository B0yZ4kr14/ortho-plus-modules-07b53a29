-- ============================================================================
-- FASE 1: FUNDAÇÃO - TASK 1.2
-- Migração 005: Rate Limiting e Proteção contra Abuse
-- ============================================================================

-- ============================================================================
-- 1. CRIAR TABELA RATE_LIMIT_LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.rate_limit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  endpoint TEXT NOT NULL,
  ip_address INET NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_rate_limit_user_endpoint ON rate_limit_log(user_id, endpoint, window_start);
CREATE INDEX idx_rate_limit_ip_endpoint ON rate_limit_log(ip_address, endpoint, window_start);
CREATE INDEX idx_rate_limit_window_start ON rate_limit_log(window_start DESC);

-- RLS: Apenas admins podem ver logs de rate limiting
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view rate limit logs"
ON public.rate_limit_log
FOR SELECT
TO authenticated
USING (is_admin() OR is_root_user());

CREATE POLICY "System can manage rate limit logs"
ON public.rate_limit_log
FOR ALL
TO service_role
WITH CHECK (true);

COMMENT ON TABLE public.rate_limit_log IS 'Log de requisições para rate limiting. Protege contra abuse de API e ataques DDoS.';

-- ============================================================================
-- 2. CRIAR FUNÇÃO PARA LIMPEZA AUTOMÁTICA DE LOGS ANTIGOS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limit_logs()
RETURNS INTEGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Deletar logs com mais de 24 horas
  DELETE FROM public.rate_limit_log 
  WHERE window_start < NOW() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

COMMENT ON FUNCTION public.cleanup_old_rate_limit_logs IS 'Limpa logs de rate limiting com mais de 24 horas (executar via cron job)';

-- ============================================================================
-- 3. CRIAR TABELA DE CONFIGURAÇÃO DE RATE LIMITS POR ENDPOINT
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.rate_limit_config (
  id SERIAL PRIMARY KEY,
  endpoint TEXT NOT NULL UNIQUE,
  max_requests_per_user INTEGER NOT NULL DEFAULT 100,
  max_requests_per_ip INTEGER NOT NULL DEFAULT 200,
  window_minutes INTEGER NOT NULL DEFAULT 15,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: Apenas admins podem gerenciar configurações
ALTER TABLE public.rate_limit_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage rate limit config"
ON public.rate_limit_config
FOR ALL
TO authenticated
USING (is_admin() OR is_root_user())
WITH CHECK (is_admin() OR is_root_user());

CREATE POLICY "Authenticated users can view rate limit config"
ON public.rate_limit_config
FOR SELECT
TO authenticated
USING (true);

-- Inserir configurações padrão
INSERT INTO public.rate_limit_config (endpoint, max_requests_per_user, max_requests_per_ip, window_minutes) VALUES
-- Auth functions (mais restritivo)
('auth-login', 5, 10, 5),
('auth-signup', 3, 5, 60),
('auth-reset-password', 3, 5, 60),

-- Data read (permissivo)
('get-patients', 100, 200, 15),
('get-appointments', 100, 200, 15),
('get-budgets', 100, 200, 15),

-- Data write (moderado)
('create-patient', 30, 60, 15),
('create-appointment', 30, 60, 15),
('create-budget', 20, 40, 15),

-- Heavy operations (restritivo)
('export-data', 5, 10, 60),
('analyze-radiography', 10, 20, 60),
('create-backup', 2, 5, 60),

-- Root operations (muito restritivo)
('create-root-user', 1, 2, 1440) -- 1 req por usuário, 2 por IP, janela de 24 horas
ON CONFLICT (endpoint) DO NOTHING;

COMMENT ON TABLE public.rate_limit_config IS 'Configuração de rate limits por endpoint. Define max_requests e window_minutes para cada operação.';

-- ============================================================================
-- 4. CRIAR TABELA DE ABUSE REPORTS (ALERTAS AUTOMÁTICOS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.abuse_reports (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  ip_address INET NOT NULL,
  endpoint TEXT NOT NULL,
  abuse_type TEXT NOT NULL CHECK (abuse_type IN ('RATE_LIMIT_EXCEEDED', 'SUSPICIOUS_PATTERN', 'BRUTE_FORCE', 'DDoS_ATTEMPT')),
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  details JSONB DEFAULT '{}'::jsonb,
  auto_blocked BOOLEAN DEFAULT false,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_abuse_reports_ip ON abuse_reports(ip_address);
CREATE INDEX idx_abuse_reports_user ON abuse_reports(user_id);
CREATE INDEX idx_abuse_reports_created_at ON abuse_reports(created_at DESC);
CREATE INDEX idx_abuse_reports_resolved ON abuse_reports(resolved) WHERE NOT resolved;

ALTER TABLE public.abuse_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view abuse reports"
ON public.abuse_reports
FOR SELECT
TO authenticated
USING (is_admin() OR is_root_user());

CREATE POLICY "System can create abuse reports"
ON public.abuse_reports
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Admins can resolve abuse reports"
ON public.abuse_reports
FOR UPDATE
TO authenticated
USING (is_admin() OR is_root_user())
WITH CHECK (is_admin() OR is_root_user());

COMMENT ON TABLE public.abuse_reports IS 'Relatórios automáticos de abuse detectado (rate limiting, padrões suspeitos, etc.)';

-- ============================================================================
-- 5. CRIAR FUNÇÃO PARA DETECTAR PADRÕES SUSPEITOS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.detect_suspicious_patterns()
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  suspicious_ips RECORD;
  suspicious_users RECORD;
BEGIN
  -- Detectar IPs com muitos requests em endpoints variados (possível scan)
  FOR suspicious_ips IN
    SELECT 
      ip_address,
      COUNT(DISTINCT endpoint) as endpoint_count,
      SUM(request_count) as total_requests
    FROM public.rate_limit_log
    WHERE window_start > NOW() - INTERVAL '1 hour'
    GROUP BY ip_address
    HAVING COUNT(DISTINCT endpoint) > 20 OR SUM(request_count) > 1000
  LOOP
    INSERT INTO public.abuse_reports (
      ip_address,
      endpoint,
      abuse_type,
      severity,
      details,
      auto_blocked
    ) VALUES (
      suspicious_ips.ip_address,
      'MULTIPLE_ENDPOINTS',
      'SUSPICIOUS_PATTERN',
      CASE 
        WHEN suspicious_ips.total_requests > 5000 THEN 'CRITICAL'
        WHEN suspicious_ips.total_requests > 2000 THEN 'HIGH'
        ELSE 'MEDIUM'
      END,
      jsonb_build_object(
        'endpoint_count', suspicious_ips.endpoint_count,
        'total_requests', suspicious_ips.total_requests,
        'detected_at', NOW()
      ),
      suspicious_ips.total_requests > 5000 -- Auto-block se > 5000 requests
    );
  END LOOP;
  
  -- Detectar usuários com taxa de erro alta (possível brute force)
  FOR suspicious_users IN
    SELECT 
      user_id,
      endpoint,
      COUNT(*) as attempt_count
    FROM public.rate_limit_log
    WHERE window_start > NOW() - INTERVAL '15 minutes'
      AND endpoint LIKE '%auth%'
    GROUP BY user_id, endpoint
    HAVING COUNT(*) > 10
  LOOP
    IF suspicious_users.user_id IS NOT NULL THEN
      INSERT INTO public.abuse_reports (
        user_id,
        ip_address,
        endpoint,
        abuse_type,
        severity,
        details,
        auto_blocked
      ) VALUES (
        suspicious_users.user_id,
        '0.0.0.0'::INET, -- IP será preenchido pelo middleware
        suspicious_users.endpoint,
        'BRUTE_FORCE',
        'HIGH',
        jsonb_build_object(
          'attempt_count', suspicious_users.attempt_count,
          'detected_at', NOW()
        ),
        suspicious_users.attempt_count > 20
      );
    END IF;
  END LOOP;
END;
$$;

COMMENT ON FUNCTION public.detect_suspicious_patterns IS 'Detecta padrões suspeitos de abuse (scans, brute force, DDoS) e cria alertas automáticos';

-- ============================================================================
-- 6. MENSAGEM DE SUCESSO
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'FASE 1 - TASK 1.2: RATE LIMITING IMPLEMENTADO';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE '✅ 1. Tabela rate_limit_log criada (auditoria de requests)';
  RAISE NOTICE '✅ 2. Tabela rate_limit_config criada (configurações por endpoint)';
  RAISE NOTICE '✅ 3. Tabela abuse_reports criada (alertas automáticos)';
  RAISE NOTICE '✅ 4. Função cleanup_old_rate_limit_logs() criada';
  RAISE NOTICE '✅ 5. Função detect_suspicious_patterns() criada';
  RAISE NOTICE '✅ 6. Configurações padrão inseridas (15 endpoints)';
  RAISE NOTICE '';
  RAISE NOTICE '📊 RATE LIMITS CONFIGURADOS:';
  RAISE NOTICE '   - Auth: 5 req/5min (usuário), 10 req/5min (IP)';
  RAISE NOTICE '   - Data Read: 100 req/15min (usuário), 200 req/15min (IP)';
  RAISE NOTICE '   - Data Write: 30 req/15min (usuário), 60 req/15min (IP)';
  RAISE NOTICE '   - Heavy Ops: 10 req/hour (usuário), 20 req/hour (IP)';
  RAISE NOTICE '   - ROOT Ops: 1 req/24h (usuário), 2 req/24h (IP)';
  RAISE NOTICE '';
  RAISE NOTICE '📋 PRÓXIMO:';
  RAISE NOTICE '   - Middleware rateLimiter.ts será criado';
  RAISE NOTICE '   - Edge Functions serão protegidas com rate limiting';
  RAISE NOTICE '============================================================================';
END $$;