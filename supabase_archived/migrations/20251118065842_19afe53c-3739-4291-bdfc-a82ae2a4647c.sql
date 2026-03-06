-- ============================================
-- V5.3 COHERENCE: Sincronização module_catalog
-- ============================================

-- Adicionar módulos faltantes ao catálogo
INSERT INTO public.module_catalog (module_key, name, description, category, icon) VALUES
  ('PDV', 'PDV (Ponto de Venda)', 'Sistema completo de vendas com emissão de NFCe, TEF e múltiplos métodos de pagamento', 'Gestão Financeira', 'ShoppingCart'),
  ('CONTRATOS', 'Contratos Digitais', 'Gestão de contratos com assinatura digital ICP-Brasil', 'Conformidade & Legal', 'FileSignature'),
  ('FIDELIDADE', 'Programa de Fidelidade', 'Gamificação e pontos de fidelidade para retenção de pacientes', 'Marketing & Relacionamento', 'Gift'),
  ('INVENTARIO', 'Inventário Avançado', 'Contagem cíclica, divergências e dashboard executivo de estoque', 'Operações & Estoque', 'ClipboardCheck'),
  ('PORTAL_PACIENTE', 'Portal do Paciente', 'Acesso self-service para pacientes com agendamento online', 'Atendimento Clínico', 'UserCircle'),
  ('DATABASE_ADMIN', 'Administração de Banco', 'Monitoramento, tuning e otimização do PostgreSQL', 'Administração & DevOps', 'Database'),
  ('BACKUPS', 'Backups Avançados', 'Sistema enterprise de backup com retenção GFS e geo-replicação', 'Administração & DevOps', 'HardDrive'),
  ('CRYPTO_CONFIG', 'Configuração Crypto', 'Gestão de exchanges, carteiras e hardwallets para pagamentos cripto', 'Administração & DevOps', 'Settings'),
  ('GITHUB_TOOLS', 'Ferramentas GitHub', 'Integração com repositórios, PRs e workflows do GitHub', 'Administração & DevOps', 'Github'),
  ('TERMINAL', 'Terminal Web', 'Shell web seguro com whitelist de comandos e auditoria', 'Administração & DevOps', 'Terminal')
ON CONFLICT (module_key) DO NOTHING;

-- Atualizar categorias para consistência (conforme sidebar.config.ts)
UPDATE public.module_catalog SET category = 'Atendimento Clínico' 
WHERE module_key IN ('DASHBOARD', 'AGENDA', 'PACIENTES', 'PEP', 'ODONTOGRAMA', 'ESTOQUE', 'PROCEDIMENTOS', 'ORCAMENTOS', 'PORTAL_PACIENTE');

UPDATE public.module_catalog SET category = 'Gestão Financeira' 
WHERE module_key IN ('FINANCEIRO', 'SPLIT_PAGAMENTO', 'INADIMPLENCIA', 'CRYPTO_PAYMENTS', 'PDV');

UPDATE public.module_catalog SET category = 'Marketing & Relacionamento' 
WHERE module_key IN ('CRM', 'MARKETING_AUTO', 'FIDELIDADE');

UPDATE public.module_catalog SET category = 'Conformidade & Legal' 
WHERE module_key IN ('LGPD', 'ASSINATURA_ICP', 'TISS', 'TELEODONTO', 'CONTRATOS');

UPDATE public.module_catalog SET category = 'Operações & Estoque' 
WHERE module_key IN ('INVENTARIO');

UPDATE public.module_catalog SET category = 'Business Intelligence' 
WHERE module_key IN ('BI');

UPDATE public.module_catalog SET category = 'Inovação & Tecnologia' 
WHERE module_key IN ('FLUXO_DIGITAL', 'IA');

UPDATE public.module_catalog SET category = 'Administração & DevOps' 
WHERE module_key IN ('DATABASE_ADMIN', 'BACKUPS', 'CRYPTO_CONFIG', 'GITHUB_TOOLS', 'TERMINAL');

-- Adicionar dependências dos novos módulos
INSERT INTO public.module_dependencies (module_id, depends_on_module_id)
SELECT 
  (SELECT id FROM public.module_catalog WHERE module_key = 'PDV'),
  (SELECT id FROM public.module_catalog WHERE module_key = 'FINANCEIRO')
WHERE NOT EXISTS (
  SELECT 1 FROM public.module_dependencies 
  WHERE module_id = (SELECT id FROM public.module_catalog WHERE module_key = 'PDV')
);

INSERT INTO public.module_dependencies (module_id, depends_on_module_id)
SELECT 
  (SELECT id FROM public.module_catalog WHERE module_key = 'CONTRATOS'),
  (SELECT id FROM public.module_catalog WHERE module_key = 'ASSINATURA_ICP')
WHERE NOT EXISTS (
  SELECT 1 FROM public.module_dependencies 
  WHERE module_id = (SELECT id FROM public.module_catalog WHERE module_key = 'CONTRATOS')
);

INSERT INTO public.module_dependencies (module_id, depends_on_module_id)
SELECT 
  (SELECT id FROM public.module_catalog WHERE module_key = 'INVENTARIO'),
  (SELECT id FROM public.module_catalog WHERE module_key = 'ESTOQUE')
WHERE NOT EXISTS (
  SELECT 1 FROM public.module_dependencies 
  WHERE module_id = (SELECT id FROM public.module_catalog WHERE module_key = 'INVENTARIO')
);

INSERT INTO public.module_dependencies (module_id, depends_on_module_id)
SELECT 
  (SELECT id FROM public.module_catalog WHERE module_key = 'CRYPTO_CONFIG'),
  (SELECT id FROM public.module_catalog WHERE module_key = 'CRYPTO_PAYMENTS')
WHERE NOT EXISTS (
  SELECT 1 FROM public.module_dependencies 
  WHERE module_id = (SELECT id FROM public.module_catalog WHERE module_key = 'CRYPTO_CONFIG')
);

-- Ativar todos os novos módulos por padrão para clínicas existentes
INSERT INTO public.clinic_modules (clinic_id, module_catalog_id, is_active)
SELECT c.id, mc.id, true
FROM public.clinics c
CROSS JOIN public.module_catalog mc
WHERE mc.module_key IN ('PDV', 'CONTRATOS', 'FIDELIDADE', 'INVENTARIO', 'PORTAL_PACIENTE', 
                         'DATABASE_ADMIN', 'BACKUPS', 'CRYPTO_CONFIG', 'GITHUB_TOOLS', 'TERMINAL')
ON CONFLICT (clinic_id, module_catalog_id) DO NOTHING;