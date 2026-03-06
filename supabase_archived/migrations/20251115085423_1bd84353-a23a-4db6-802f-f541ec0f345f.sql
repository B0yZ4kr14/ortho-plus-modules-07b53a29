-- FASE 1.3: Correções de Segurança SQL (6 warnings do Supabase Linter)

-- 1. Adicionar search_path seguro às funções (previne SQL injection via search_path manipulation)
ALTER FUNCTION update_crm_leads_updated_at() SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION update_crm_activities_updated_at() SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION update_crypto_payments_updated_at() SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION update_inadimplencia_updated_at() SET search_path TO 'public', 'pg_temp';

-- 2. Criar schema dedicado para extensões (security best practice)
CREATE SCHEMA IF NOT EXISTS extensions;

-- Mover extensões para schema dedicado (se existirem no public)
DO $$
BEGIN
  -- pgcrypto
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto' AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
    ALTER EXTENSION pgcrypto SET SCHEMA extensions;
  END IF;
  
  -- uuid-ossp (se existir)
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp' AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
    ALTER EXTENSION "uuid-ossp" SET SCHEMA extensions;
  END IF;
END
$$;

-- 3. Garantir que funções usem schema correto para extensões
COMMENT ON SCHEMA extensions IS 'Schema dedicado para extensões PostgreSQL (security best practice)';

-- 4. Atualizar grants do schema extensions
GRANT USAGE ON SCHEMA extensions TO postgres, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA extensions TO postgres, authenticated, service_role;

-- Nota: Leaked password protection deve ser habilitado via Dashboard Supabase > Authentication > Policies
-- ou via API call (não pode ser feito via SQL migration)