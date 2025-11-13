-- Adicionar TODOS os módulos principais e sub-módulos faltantes ao catálogo

-- ============================================
-- MÓDULOS PRINCIPAIS (Core)
-- ============================================
INSERT INTO module_catalog (module_key, name, description, category, icon) VALUES
('DASHBOARD', 'Dashboard', 'Painel principal com visão geral', 'Core', 'LayoutDashboard'),
('PACIENTES', 'Pacientes', 'Gestão de pacientes', 'Core', 'Users'),
('DENTISTAS', 'Dentistas', 'Gestão de dentistas', 'Core', 'Stethoscope'),
('FUNCIONARIOS', 'Funcionários', 'Gestão de funcionários', 'Core', 'UserCog'),
('AGENDA', 'Agenda', 'Agenda de consultas', 'Core', 'Calendar'),
('PROCEDIMENTOS', 'Procedimentos', 'Cadastro de procedimentos odontológicos', 'Core', 'Activity'),
('PEP', 'Prontuário Eletrônico (PEP)', 'Prontuário Eletrônico do Paciente', 'Core', 'FileText'),
('ODONTOGRAMA', 'Odontograma', 'Odontograma 2D e 3D', 'Core', 'Smile'),
('ORCAMENTOS', 'Orçamentos', 'Gestão de orçamentos', 'Core', 'FileText'),
('CONTRATOS', 'Contratos', 'Gestão de contratos digitais', 'Core', 'FileSignature'),
('ESTOQUE', 'Estoque', 'Gestão de estoque', 'Core', 'Package')
ON CONFLICT (module_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  icon = EXCLUDED.icon;

-- ============================================
-- MÓDULOS FINANCEIROS
-- ============================================
INSERT INTO module_catalog (module_key, name, description, category, icon) VALUES
('FINANCEIRO', 'Financeiro', 'Gestão financeira completa', 'Financeiro', 'DollarSign'),
('SPLIT_PAGAMENTO', 'Split de Pagamento', 'Divisão automática de pagamentos', 'Financeiro', 'GitBranch'),
('COBRANCA', 'Cobrança/Inadimplência', 'Controle de inadimplência e cobranças', 'Financeiro', 'AlertCircle')
ON CONFLICT (module_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  icon = EXCLUDED.icon;

-- ============================================
-- SUB-MÓDULOS DE CRYPTO PAGAMENTOS
-- ============================================
INSERT INTO module_catalog (module_key, name, description, category, icon) VALUES
('CRYPTO_ANALYSIS', 'Análise Técnica Cripto', 'Gráficos candlestick e indicadores técnicos', 'Financeiro', 'TrendingUp'),
('CRYPTO_PORTFOLIO', 'Portfolio Consolidado', 'Visão consolidada de ativos cripto', 'Financeiro', 'PieChart'),
('CRYPTO_DCA', 'DCA Backtesting', 'Backtesting de estratégias DCA', 'Financeiro', 'LineChart'),
('CRYPTO_VOLATILITY', 'Alertas de Volatilidade', 'Monitoramento de volatilidade cripto', 'Financeiro', 'AlertTriangle'),
('CRYPTO_CALCULATOR', 'Calculadora Cripto', 'Calculadora de conversão cripto', 'Financeiro', 'Calculator'),
('CRYPTO_COMPARISON', 'Dashboard Comparativo', 'Comparação cripto vs pagamentos tradicionais', 'Financeiro', 'BarChart3')
ON CONFLICT (module_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  icon = EXCLUDED.icon;

-- ============================================
-- MÓDULOS DE CRESCIMENTO & MARKETING
-- ============================================
INSERT INTO module_catalog (module_key, name, description, category, icon) VALUES
('CRM', 'CRM/Funil de Vendas', 'Gestão de leads e funil de vendas', 'Crescimento & Marketing', 'TrendingUp'),
('MARKETING', 'Automação de Marketing', 'Campanhas e automação de marketing', 'Crescimento & Marketing', 'Mail'),
('BI', 'Business Intelligence', 'Dashboards e análises estratégicas', 'Crescimento & Marketing', 'BarChart3')
ON CONFLICT (module_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  icon = EXCLUDED.icon;

-- ============================================
-- MÓDULOS DE COMPLIANCE & SEGURANÇA
-- ============================================
INSERT INTO module_catalog (module_key, name, description, category, icon) VALUES
('LGPD', 'LGPD Compliance', 'Conformidade com LGPD', 'Compliance', 'Shield'),
('ASSINATURA_ICP', 'Assinatura Digital ICP-Brasil', 'Assinatura digital qualificada', 'Compliance', 'FileSignature')
ON CONFLICT (module_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  icon = EXCLUDED.icon;

-- ============================================
-- MÓDULOS DE INOVAÇÃO
-- ============================================
INSERT INTO module_catalog (module_key, name, description, category, icon) VALUES
('IA_RADIOGRAFIA', 'IA para Análise de Radiografias', 'Análise automática de radiografias com IA', 'Inovação', 'Brain'),
('TELEODONTO', 'Teleodontologia', 'Consultas remotas de teleodontologia', 'Inovação', 'Video')
ON CONFLICT (module_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  icon = EXCLUDED.icon;

-- ============================================
-- PORTAL DO PACIENTE
-- ============================================
INSERT INTO module_catalog (module_key, name, description, category, icon) VALUES
('PORTAL_PACIENTE', 'Portal do Paciente', 'Portal de autoatendimento para pacientes', 'Pacientes', 'UserCircle')
ON CONFLICT (module_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  icon = EXCLUDED.icon;

-- ============================================
-- ADICIONAR DEPENDÊNCIAS DOS NOVOS SUB-MÓDULOS
-- ============================================

-- Limpar dependências antigas dos sub-módulos de crypto
DELETE FROM module_dependencies WHERE 
  module_id IN (SELECT id FROM module_catalog WHERE module_key IN (
    'CRYPTO_ANALYSIS', 'CRYPTO_PORTFOLIO', 'CRYPTO_DCA', 'CRYPTO_VOLATILITY', 
    'CRYPTO_CALCULATOR', 'CRYPTO_COMPARISON'
  ));

-- Sub-módulos de Crypto dependem de FINANCEIRO_CRYPTO
INSERT INTO module_dependencies (module_id, depends_on_module_id)
SELECT m1.id, m2.id
FROM module_catalog m1
CROSS JOIN module_catalog m2
WHERE 
  m1.module_key IN ('CRYPTO_ANALYSIS', 'CRYPTO_PORTFOLIO', 'CRYPTO_DCA', 'CRYPTO_VOLATILITY', 
                    'CRYPTO_CALCULATOR', 'CRYPTO_COMPARISON') 
  AND m2.module_key = 'FINANCEIRO_CRYPTO'
ON CONFLICT DO NOTHING;

-- SPLIT_PAGAMENTO depende de FINANCEIRO
INSERT INTO module_dependencies (module_id, depends_on_module_id)
SELECT m1.id, m2.id
FROM module_catalog m1
CROSS JOIN module_catalog m2
WHERE m1.module_key = 'SPLIT_PAGAMENTO' AND m2.module_key = 'FINANCEIRO'
ON CONFLICT DO NOTHING;

-- COBRANCA depende de FINANCEIRO
INSERT INTO module_dependencies (module_id, depends_on_module_id)
SELECT m1.id, m2.id
FROM module_catalog m1
CROSS JOIN module_catalog m2
WHERE m1.module_key = 'COBRANCA' AND m2.module_key = 'FINANCEIRO'
ON CONFLICT DO NOTHING;

-- ASSINATURA_ICP depende de PEP
INSERT INTO module_dependencies (module_id, depends_on_module_id)
SELECT m1.id, m2.id
FROM module_catalog m1
CROSS JOIN module_catalog m2
WHERE m1.module_key = 'ASSINATURA_ICP' AND m2.module_key = 'PEP'
ON CONFLICT DO NOTHING;