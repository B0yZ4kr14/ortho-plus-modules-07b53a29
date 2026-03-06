-- ============================================
-- CORREÇÃO BAIXA L1: Rate Limiting Table (Corrigido)
-- ============================================

-- Criar tabela para rate limiting (se não existe)
CREATE TABLE IF NOT EXISTS public.rate_limit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID,
  ip_address INET NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para performance (sem predicado WHERE)
CREATE INDEX IF NOT EXISTS idx_rate_limit_user_endpoint_window 
ON public.rate_limit_log(user_id, endpoint, window_start);

CREATE INDEX IF NOT EXISTS idx_rate_limit_ip_endpoint_window 
ON public.rate_limit_log(ip_address, endpoint, window_start);

CREATE INDEX IF NOT EXISTS idx_rate_limit_window_cleanup 
ON public.rate_limit_log(window_start);

-- Habilitar RLS
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;

-- Política: Apenas ADMINs podem visualizar logs de rate limit
CREATE POLICY "Only admins can view rate limit logs"
ON public.rate_limit_log FOR SELECT
USING (public.is_admin());

-- Política: Sistema pode inserir (via Edge Functions com service_role)
CREATE POLICY "System can insert rate limit logs"
ON public.rate_limit_log FOR INSERT
WITH CHECK (true);