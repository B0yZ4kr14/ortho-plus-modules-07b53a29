-- Script de inicialização para criar schemas isolados por módulo
-- Este script será executado automaticamente no primeiro deploy do PostgreSQL

-- Schema para Inventário
CREATE SCHEMA IF NOT EXISTS inventario;
GRANT ALL ON SCHEMA inventario TO postgres;

-- Schema para PDV
CREATE SCHEMA IF NOT EXISTS pdv;
GRANT ALL ON SCHEMA pdv TO postgres;

-- Schema para Financeiro
CREATE SCHEMA IF NOT EXISTS financeiro;
GRANT ALL ON SCHEMA financeiro TO postgres;

-- Schema para Pacientes/Clínica
CREATE SCHEMA IF NOT EXISTS pacientes;
GRANT ALL ON SCHEMA pacientes TO postgres;

-- Schema para PEP (Prontuário Eletrônico do Paciente)
CREATE SCHEMA IF NOT EXISTS pep;
GRANT ALL ON SCHEMA pep TO postgres;

-- Schema para Faturamento
CREATE SCHEMA IF NOT EXISTS faturamento;
GRANT ALL ON SCHEMA faturamento TO postgres;

-- Schema para Configurações
CREATE SCHEMA IF NOT EXISTS configuracoes;
GRANT ALL ON SCHEMA configuracoes TO postgres;

-- Schema para Database Admin
CREATE SCHEMA IF NOT EXISTS database_admin;
GRANT ALL ON SCHEMA database_admin TO postgres;

-- Schema para Backups
CREATE SCHEMA IF NOT EXISTS backups;
GRANT ALL ON SCHEMA backups TO postgres;

-- Schema para Crypto Config
CREATE SCHEMA IF NOT EXISTS crypto_config;
GRANT ALL ON SCHEMA crypto_config TO postgres;

-- Schema para GitHub Tools
CREATE SCHEMA IF NOT EXISTS github_tools;
GRANT ALL ON SCHEMA github_tools TO postgres;

-- Schema para Terminal
CREATE SCHEMA IF NOT EXISTS terminal;
GRANT ALL ON SCHEMA terminal TO postgres;

-- Criar usuários dedicados por módulo (opcional, para isolamento adicional)
-- CREATE USER inventario_user WITH PASSWORD 'secure_password_1';
-- GRANT ALL ON SCHEMA inventario TO inventario_user;
-- ... repetir para cada módulo

-- Log de criação de schemas
CREATE TABLE IF NOT EXISTS public.schema_initialization_log (
  id SERIAL PRIMARY KEY,
  schema_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO public.schema_initialization_log (schema_name) VALUES
  ('inventario'),
  ('pdv'),
  ('financeiro'),
  ('pacientes'),
  ('pep'),
  ('faturamento'),
  ('configuracoes'),
  ('database_admin'),
  ('backups'),
  ('crypto_config'),
  ('github_tools'),
  ('terminal');
