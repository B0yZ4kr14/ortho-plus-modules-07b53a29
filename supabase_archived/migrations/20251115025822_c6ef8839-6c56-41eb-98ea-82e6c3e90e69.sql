-- ============================================
-- FASE 2 - CORREÇÃO DE SEGURANÇA: SEARCH PATH (CORRIGIDO)
-- Data: 2025-11-15
-- ============================================

-- Corrigir search_path apenas na função que existe
ALTER FUNCTION public.ensure_all_modules_active() SET search_path = public;

COMMENT ON FUNCTION public.ensure_all_modules_active IS 
  'Garante que todas as clínicas sempre tenham todos os módulos ativos (sistema opensource) - SECURITY: search_path fixado';