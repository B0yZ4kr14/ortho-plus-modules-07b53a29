-- REFATORAÇÃO COMPLETA: Adicionar todos os sub-módulos faltantes ao catálogo

-- Inserir sub-módulos de Estoque que estavam faltando
INSERT INTO module_catalog (module_key, name, description, category, icon) VALUES
('ESTOQUE_DASHBOARD', 'Dashboard Estoque', 'Visão geral do estoque', 'Estoque', 'BarChart3'),
('ESTOQUE_CADASTROS', 'Cadastros Estoque', 'Cadastro de produtos, categorias e fornecedores', 'Estoque', 'FolderOpen'),
('ESTOQUE_REQUISICOES', 'Requisições', 'Requisições de materiais', 'Estoque', 'ClipboardList'),
('ESTOQUE_MOVIMENTACOES', 'Movimentações', 'Movimentações de entrada e saída', 'Estoque', 'Package'),
('ESTOQUE_PEDIDOS', 'Pedidos', 'Pedidos de compra e reposição', 'Estoque', 'ShoppingCart'),
('ESTOQUE_INTEGRACOES', 'Integrações API', 'Integrações com fornecedores via API', 'Estoque', 'Webhook'),
('ESTOQUE_ANALISE_PEDIDOS', 'Análise de Pedidos', 'Análise e previsão de pedidos', 'Estoque', 'LineChart'),
('ESTOQUE_ANALISE_CONSUMO', 'Análise de Consumo', 'Análise de consumo de materiais', 'Estoque', 'BarChart3'),
('ESTOQUE_INVENTARIO', 'Inventário', 'Inventário físico de estoque', 'Estoque', 'ClipboardCheck'),
('ESTOQUE_INVENTARIO_HISTORICO', 'Histórico de Inventários', 'Histórico e comparação de inventários', 'Estoque', 'TrendingUp'),
('ESTOQUE_SCANNER', 'Scanner Mobile', 'App mobile para scanner de código de barras', 'Estoque', 'Smartphone')
ON CONFLICT (module_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  icon = EXCLUDED.icon;

-- Inserir sub-módulos de Financeiro que estavam faltando
INSERT INTO module_catalog (module_key, name, description, category, icon) VALUES
('FINANCEIRO_DASHBOARD', 'Dashboard Financeiro', 'Visão geral financeira', 'Financeiro', 'BarChart3'),
('FINANCEIRO_TRANSACOES', 'Transações', 'Transações financeiras', 'Financeiro', 'Activity'),
('FINANCEIRO_RECEBER', 'Contas a Receber', 'Gestão de contas a receber', 'Financeiro', 'TrendingUp'),
('FINANCEIRO_PAGAR', 'Contas a Pagar', 'Gestão de contas a pagar', 'Financeiro', 'CreditCard'),
('FINANCEIRO_NOTAS', 'Notas Fiscais', 'Emissão e gestão de notas fiscais', 'Financeiro', 'FileText'),
('FINANCEIRO_CRYPTO', 'Crypto Pagamentos', 'Pagamentos em criptomoedas', 'Financeiro', 'Bitcoin')
ON CONFLICT (module_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  icon = EXCLUDED.icon;

-- Inserir sub-módulos de Teleodontologia que estavam faltando
INSERT INTO module_catalog (module_key, name, description, category, icon) VALUES
('TELEODONTO_CONSULTAS', 'Teleconsultas', 'Consultas de teleodontologia', 'Clínica', 'Video'),
('TELEODONTO_HISTORICO', 'Histórico Teleconsultas', 'Histórico de atendimentos remotos', 'Clínica', 'FileText')
ON CONFLICT (module_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  icon = EXCLUDED.icon;

-- Inserir sub-módulos de Relatórios & BI que estavam faltando
INSERT INTO module_catalog (module_key, name, description, category, icon) VALUES
('RELATORIOS', 'Relatórios', 'Relatórios gerenciais', 'Relatórios & BI', 'FileBarChart'),
('BI_COMPORTAMENTAL', 'Análise Comportamental', 'Análise de comportamento de usuários', 'Relatórios & BI', 'Activity'),
('RELATORIOS_TEMPLATES', 'Templates', 'Templates de relatórios', 'Relatórios & BI', 'ClipboardList')
ON CONFLICT (module_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  icon = EXCLUDED.icon;

-- Inserir sub-módulos de Pacientes que estavam faltando
INSERT INTO module_catalog (module_key, name, description, category, icon) VALUES
('FIDELIDADE', 'Programa Fidelidade', 'Programa de fidelidade e recompensas', 'Pacientes', 'Award')
ON CONFLICT (module_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  icon = EXCLUDED.icon;

-- Inserir módulos de Compliance que estavam faltando
INSERT INTO module_catalog (module_key, name, description, category, icon) VALUES
('AUDITORIA', 'Auditoria', 'Logs de auditoria do sistema', 'Compliance', 'Shield')
ON CONFLICT (module_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  icon = EXCLUDED.icon;

-- Inserir módulo de Administração (sempre disponível para ADMINs)
INSERT INTO module_catalog (module_key, name, description, category, icon) VALUES
('CONFIGURACOES', 'Configurações', 'Configurações do sistema', 'Administração', 'Settings')
ON CONFLICT (module_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  icon = EXCLUDED.icon;

-- Atualizar dependências completas
DELETE FROM module_dependencies WHERE 
  module_id IN (SELECT id FROM module_catalog WHERE module_key IN (
    'ESTOQUE_DASHBOARD', 'ESTOQUE_CADASTROS', 'ESTOQUE_REQUISICOES', 'ESTOQUE_MOVIMENTACOES',
    'ESTOQUE_PEDIDOS', 'ESTOQUE_INTEGRACOES', 'ESTOQUE_ANALISE_PEDIDOS', 'ESTOQUE_ANALISE_CONSUMO',
    'ESTOQUE_INVENTARIO', 'ESTOQUE_INVENTARIO_HISTORICO', 'ESTOQUE_SCANNER',
    'FINANCEIRO_DASHBOARD', 'FINANCEIRO_TRANSACOES', 'FINANCEIRO_RECEBER', 'FINANCEIRO_PAGAR',
    'FINANCEIRO_NOTAS', 'FINANCEIRO_CRYPTO', 'TELEODONTO_CONSULTAS', 'TELEODONTO_HISTORICO',
    'BI_COMPORTAMENTAL', 'RELATORIOS_TEMPLATES'
  ));

-- Inserir dependências dos sub-módulos
INSERT INTO module_dependencies (module_id, depends_on_module_id)
SELECT m1.id, m2.id
FROM module_catalog m1
CROSS JOIN module_catalog m2
WHERE 
  -- Sub-módulos de Estoque dependem de ESTOQUE principal
  (m1.module_key IN ('ESTOQUE_DASHBOARD', 'ESTOQUE_CADASTROS', 'ESTOQUE_REQUISICOES', 'ESTOQUE_MOVIMENTACOES', 
                     'ESTOQUE_PEDIDOS', 'ESTOQUE_INTEGRACOES', 'ESTOQUE_ANALISE_PEDIDOS', 'ESTOQUE_ANALISE_CONSUMO',
                     'ESTOQUE_INVENTARIO', 'ESTOQUE_SCANNER') AND m2.module_key = 'ESTOQUE') OR
  -- Histórico de Inventário depende de Inventário
  (m1.module_key = 'ESTOQUE_INVENTARIO_HISTORICO' AND m2.module_key = 'ESTOQUE_INVENTARIO') OR
  -- Sub-módulos de Financeiro dependem de FINANCEIRO principal
  (m1.module_key IN ('FINANCEIRO_DASHBOARD', 'FINANCEIRO_TRANSACOES', 'FINANCEIRO_RECEBER', 'FINANCEIRO_PAGAR',
                     'FINANCEIRO_NOTAS', 'FINANCEIRO_CRYPTO') AND m2.module_key = 'FINANCEIRO') OR
  -- Sub-módulos de Teleodontologia dependem de TELEODONTO principal
  (m1.module_key IN ('TELEODONTO_CONSULTAS', 'TELEODONTO_HISTORICO') AND m2.module_key = 'TELEODONTO') OR
  -- Sub-módulos de BI dependem de BI principal
  (m1.module_key = 'BI_COMPORTAMENTAL' AND m2.module_key = 'BI') OR
  -- Sub-módulos de Relatórios dependem de RELATORIOS principal
  (m1.module_key = 'RELATORIOS_TEMPLATES' AND m2.module_key = 'RELATORIOS')
ON CONFLICT DO NOTHING;