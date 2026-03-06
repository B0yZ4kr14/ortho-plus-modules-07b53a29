-- FASE 2: Unificação de Categorias - Padronizar nomes e adicionar categoria ADMIN

-- Renomear categorias para MAIÚSCULAS e padronizar nomes
UPDATE module_catalog SET category = 'ATENDIMENTO CLÍNICO' WHERE category = 'Atendimento Clínico';
UPDATE module_catalog SET category = 'GESTÃO FINANCEIRA' WHERE category = 'Gestão Financeira' OR category = 'Financeiro';
UPDATE module_catalog SET category = 'OPERAÇÕES' WHERE category = 'Operações & Estoque' OR category = 'Operações';
UPDATE module_catalog SET category = 'ANÁLISES & RELATÓRIOS' WHERE category = 'Business Intelligence' OR category = 'BI';
UPDATE module_catalog SET category = 'MARKETING & RELACIONAMENTO' WHERE category = 'Marketing & Relacionamento' OR category = 'Crescimento';
UPDATE module_catalog SET category = 'CONFORMIDADE & LEGAL' WHERE category = 'Conformidade & Legal' OR category = 'Compliance';
UPDATE module_catalog SET category = 'INOVAÇÃO & TECNOLOGIA' WHERE category = 'Inovação & Tecnologia' OR category = 'Inovação';

-- Criar categoria para módulos administrativos (se não existe)
UPDATE module_catalog 
SET category = 'ADMINISTRAÇÃO & DEVOPS' 
WHERE module_key IN ('DATABASE_ADMIN', 'BACKUPS', 'CRYPTO_CONFIG', 'GITHUB_TOOLS', 'TERMINAL');

-- Adicionar categoria DASHBOARD para o módulo de visão geral
UPDATE module_catalog 
SET category = 'DASHBOARD' 
WHERE module_key = 'DASHBOARD' OR name LIKE '%Dashboard%' OR name LIKE '%Visão Geral%';

-- Validar que todas as categorias estão padronizadas
-- Criar índice para melhorar performance de queries por categoria
CREATE INDEX IF NOT EXISTS idx_module_catalog_category ON module_catalog(category);

-- Comentário final para documentação
COMMENT ON COLUMN module_catalog.category IS 'Categoria do módulo (SEMPRE em MAIÚSCULAS). Categorias válidas: DASHBOARD, ATENDIMENTO CLÍNICO, GESTÃO FINANCEIRA, OPERAÇÕES, MARKETING & RELACIONAMENTO, ANÁLISES & RELATÓRIOS, CONFORMIDADE & LEGAL, INOVAÇÃO & TECNOLOGIA, ADMINISTRAÇÃO & DEVOPS';