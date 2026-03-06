-- 1. Adicionar os 4 módulos faltantes na module_catalog
INSERT INTO module_catalog (module_key, name, description, category, icon) VALUES
  ('DASHBOARD', 'Dashboard', 'Visão geral do sistema com KPIs e métricas principais', 'Gestão e Operação', 'LayoutDashboard'),
  ('PACIENTES', 'Cadastro de Pacientes', 'Gestão completa de cadastro e histórico de pacientes', 'Gestão e Operação', 'Users'),
  ('PROCEDIMENTOS', 'Catálogo de Procedimentos', 'Catálogo de procedimentos odontológicos com preços', 'Gestão e Operação', 'Clipboard'),
  ('CRYPTO_PAYMENTS', 'Pagamentos em Criptomoedas', 'Aceite pagamentos via Bitcoin, USDT, Ethereum e outras criptomoedas', 'Financeiro', 'Bitcoin');

-- 2. Adicionar dependência: CRYPTO_PAYMENTS depende de FINANCEIRO
INSERT INTO module_dependencies (module_id, depends_on_module_id)
SELECT 
  (SELECT id FROM module_catalog WHERE module_key = 'CRYPTO_PAYMENTS'),
  (SELECT id FROM module_catalog WHERE module_key = 'FINANCEIRO')
WHERE NOT EXISTS (
  SELECT 1 FROM module_dependencies 
  WHERE module_id = (SELECT id FROM module_catalog WHERE module_key = 'CRYPTO_PAYMENTS')
  AND depends_on_module_id = (SELECT id FROM module_catalog WHERE module_key = 'FINANCEIRO')
);

-- 3. Inserir os 4 novos módulos como contratados e ativos para a clínica de teste
INSERT INTO clinic_modules (clinic_id, module_catalog_id, is_active)
SELECT 
  '00000000-0000-0000-0000-000000000001'::uuid,
  id,
  true
FROM module_catalog
WHERE module_key IN ('DASHBOARD', 'PACIENTES', 'PROCEDIMENTOS', 'CRYPTO_PAYMENTS')
ON CONFLICT (clinic_id, module_catalog_id) DO NOTHING;

-- 4. Verificar e corrigir a constraint da tabela rate_limit_tracking
-- Primeiro, remover a constraint antiga se existir
ALTER TABLE IF EXISTS rate_limit_tracking 
DROP CONSTRAINT IF EXISTS rate_limit_tracking_unique;

-- Recriar a constraint UNIQUE correta
ALTER TABLE IF EXISTS rate_limit_tracking 
ADD CONSTRAINT rate_limit_tracking_unique 
UNIQUE (user_id, endpoint, window_start);