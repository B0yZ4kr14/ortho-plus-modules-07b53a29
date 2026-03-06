-- FASE 1: Adicionar campos faltantes na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS app_role TEXT NOT NULL DEFAULT 'MEMBER',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Adicionar constraint para validar app_role
DO $$ 
BEGIN
  ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_app_role_check CHECK (app_role IN ('ADMIN', 'MEMBER'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;