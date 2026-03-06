-- ============================================================
-- MIGRATION V5.0: Adicionar Módulo FISCAL
-- ============================================================

-- Adicionar módulo FISCAL ao catálogo
INSERT INTO public.module_catalog (module_key, name, description, category)
VALUES (
  'FISCAL',
  'Módulo Fiscal',
  'Gestão de Notas Fiscais (NFe/NFCe), SAT/MFe e Conciliação Bancária',
  'Gestão Financeira'
)
ON CONFLICT (module_key) DO NOTHING;

-- Ativar o módulo FISCAL para todas as clínicas existentes
INSERT INTO public.clinic_modules (clinic_id, module_catalog_id, is_active)
SELECT 
  c.id,
  mc.id,
  true
FROM public.clinics c
CROSS JOIN (
  SELECT id FROM public.module_catalog WHERE module_key = 'FISCAL'
) mc
ON CONFLICT (clinic_id, module_catalog_id) DO NOTHING;

-- Adicionar dependência: FISCAL não depende de nenhum outro módulo
-- (já está implícito que é parte do core de Gestão Financeira)

COMMENT ON TABLE public.module_catalog IS 'Catálogo mestre de módulos do sistema V5.0';
