-- FASE 2B: Atualizar categorias profissionais no ModuleCatalog
-- Alinhar nomenclaturas com padrões de mercado odontológico

UPDATE module_catalog
SET category = 'Atendimento Clínico'
WHERE category = 'Gestão e Operação';

UPDATE module_catalog
SET category = 'Gestão Financeira'
WHERE category = 'Financeiro';

UPDATE module_catalog
SET category = 'Relacionamento & Vendas'
WHERE category = 'Crescimento e Marketing';

UPDATE module_catalog
SET category = 'Conformidade & Legal'
WHERE category = 'Compliance';

UPDATE module_catalog
SET category = 'Tecnologias Avançadas'
WHERE category = 'Inovação';

-- Mover TELEODONTO para Conformidade & Legal (melhor categorização)
UPDATE module_catalog
SET category = 'Conformidade & Legal'
WHERE module_key = 'TELEODONTO';