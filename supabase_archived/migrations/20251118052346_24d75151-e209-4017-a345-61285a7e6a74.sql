-- V5.1: Correção de Categorização de Módulos
-- Alinhamento do module_catalog com a UX da sidebar

-- Atualizar categorias dos módulos para corresponder à sidebar
UPDATE module_catalog SET category = 'Gestão e Operação' WHERE module_key IN ('ORCAMENTOS', 'ESTOQUE');
UPDATE module_catalog SET category = 'Compliance' WHERE module_key = 'TELEODONTO';

-- Adicionar módulo CRYPTO_PAYMENTS se não existir
INSERT INTO module_catalog (module_key, name, description, category)
VALUES (
  'CRYPTO_PAYMENTS',
  'Pagamentos em Criptomoedas',
  'Sistema completo de pagamentos em Bitcoin, USDT, ETH e outras criptomoedas com integração a exchanges',
  'Financeiro'
)
ON CONFLICT (module_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category;