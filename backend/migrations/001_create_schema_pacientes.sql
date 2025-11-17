-- Migration 001: Create Pacientes Schema
-- Database-per-Module: Schema dedicado para módulo PACIENTES

-- Create schema
CREATE SCHEMA IF NOT EXISTS pacientes;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: patient_status (15 estados canônicos)
CREATE TABLE pacientes.patient_status (
  code VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert canonical statuses
INSERT INTO pacientes.patient_status (code, name, description, color, sort_order) VALUES
  ('ABANDONO', 'Abandono', 'Paciente abandonou o tratamento', '#DC2626', 1),
  ('AFASTAMENTO_TEMPORARIO', 'Afastamento Temporário', 'Paciente temporariamente afastado', '#F59E0B', 2),
  ('A_PROTESTAR', 'A Protestar', 'Paciente com pendências financeiras a protestar', '#EF4444', 3),
  ('CANCELADO', 'Cancelado', 'Tratamento cancelado', '#991B1B', 4),
  ('CONTENCAO', 'Contenção', 'Em fase de contenção pós-tratamento', '#3B82F6', 5),
  ('CONCLUIDO', 'Concluído', 'Tratamento concluído com sucesso', '#10B981', 6),
  ('ERUPCAO', 'Erupção', 'Aguardando erupção dentária', '#8B5CF6', 7),
  ('INATIVO', 'Inativo', 'Paciente inativo no sistema', '#6B7280', 8),
  ('MIGRADO', 'Migrado', 'Paciente migrado de outro sistema', '#14B8A6', 9),
  ('PROSPECT', 'Prospect', 'Lead potencial, ainda não iniciou tratamento', '#F97316', 10),
  ('PROTESTO', 'Protesto', 'Paciente protestado juridicamente', '#7C2D12', 11),
  ('RESPONSAVEL', 'Responsável', 'Cadastrado como responsável de outro paciente', '#0EA5E9', 12),
  ('TRATAMENTO', 'Em Tratamento', 'Tratamento em andamento', '#22C55E', 13),
  ('TRANSFERENCIA', 'Transferência', 'Em processo de transferência', '#A855F7', 14);

-- Table: campanhas (origem comercial)
CREATE TABLE pacientes.campanhas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uk_campanhas_clinic_name UNIQUE (clinic_id, name)
);

-- Table: origens (canal de aquisição)
CREATE TABLE pacientes.origens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL,
  name VARCHAR(200) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'telemarketing_ativo', 'inbound', 'midia_paga', 'organico', 'indicacao'
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uk_origens_clinic_name UNIQUE (clinic_id, name)
);

-- Table: promotores (vendedores/representantes)
CREATE TABLE pacientes.promotores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL,
  user_id UUID, -- Reference to auth.users (if internal employee)
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  commission_rate DECIMAL(5,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: eventos (eventos comerciais)
CREATE TABLE pacientes.eventos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  event_date DATE,
  location VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: patients (entidade principal)
CREATE TABLE pacientes.patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL,
  
  -- Dados pessoais básicos
  full_name VARCHAR(255) NOT NULL,
  cpf VARCHAR(14),
  rg VARCHAR(20),
  birth_date DATE,
  gender VARCHAR(20),
  email VARCHAR(255),
  phone VARCHAR(50),
  mobile VARCHAR(50),
  
  -- Endereço
  address_street VARCHAR(255),
  address_number VARCHAR(20),
  address_complement VARCHAR(100),
  address_neighborhood VARCHAR(100),
  address_city VARCHAR(100),
  address_state VARCHAR(2),
  address_zipcode VARCHAR(10),
  
  -- Status do paciente (FK para patient_status)
  status_code VARCHAR(50) NOT NULL DEFAULT 'PROSPECT',
  
  -- Dados comerciais/CRM
  campanha_origem_id UUID, -- FK para campanhas
  origem_id UUID, -- FK para origens
  promotor_id UUID, -- FK para promotores
  evento_id UUID, -- FK para eventos
  telemarketing_agent VARCHAR(100),
  
  -- Dados complementares CRM
  escolaridade VARCHAR(50), -- 'fundamental', 'medio', 'superior', 'pos_graduacao'
  estado_civil VARCHAR(50), -- 'solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel'
  profissao VARCHAR(100),
  empresa VARCHAR(200),
  renda_mensal DECIMAL(10,2),
  
  -- Observações
  notes TEXT,
  
  -- Metadados
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  
  -- Constraints
  CONSTRAINT fk_patients_status FOREIGN KEY (status_code) REFERENCES pacientes.patient_status(code),
  CONSTRAINT fk_patients_campanha FOREIGN KEY (campanha_origem_id) REFERENCES pacientes.campanhas(id),
  CONSTRAINT fk_patients_origem FOREIGN KEY (origem_id) REFERENCES pacientes.origens(id),
  CONSTRAINT fk_patients_promotor FOREIGN KEY (promotor_id) REFERENCES pacientes.promotores(id),
  CONSTRAINT fk_patients_evento FOREIGN KEY (evento_id) REFERENCES pacientes.eventos(id)
);

-- Table: patient_status_history (histórico de mudanças de status)
CREATE TABLE pacientes.patient_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL,
  from_status VARCHAR(50),
  to_status VARCHAR(50) NOT NULL,
  reason TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  changed_by UUID NOT NULL,
  metadata JSONB,
  
  CONSTRAINT fk_status_history_patient FOREIGN KEY (patient_id) REFERENCES pacientes.patients(id) ON DELETE CASCADE,
  CONSTRAINT fk_status_history_from FOREIGN KEY (from_status) REFERENCES pacientes.patient_status(code),
  CONSTRAINT fk_status_history_to FOREIGN KEY (to_status) REFERENCES pacientes.patient_status(code)
);

-- Indexes for performance
CREATE INDEX idx_patients_clinic_id ON pacientes.patients(clinic_id);
CREATE INDEX idx_patients_status ON pacientes.patients(status_code);
CREATE INDEX idx_patients_cpf ON pacientes.patients(cpf) WHERE cpf IS NOT NULL;
CREATE INDEX idx_patients_email ON pacientes.patients(email) WHERE email IS NOT NULL;
CREATE INDEX idx_patients_full_name ON pacientes.patients(full_name);
CREATE INDEX idx_patients_created_at ON pacientes.patients(created_at);

CREATE INDEX idx_status_history_patient ON pacientes.patient_status_history(patient_id);
CREATE INDEX idx_status_history_changed_at ON pacientes.patient_status_history(changed_at);

CREATE INDEX idx_campanhas_clinic ON pacientes.campanhas(clinic_id);
CREATE INDEX idx_origens_clinic ON pacientes.origens(clinic_id);
CREATE INDEX idx_promotores_clinic ON pacientes.promotores(clinic_id);
CREATE INDEX idx_eventos_clinic ON pacientes.eventos(clinic_id);

-- Trigger: updated_at auto-update
CREATE OR REPLACE FUNCTION pacientes.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_patients_updated_at
  BEFORE UPDATE ON pacientes.patients
  FOR EACH ROW
  EXECUTE FUNCTION pacientes.update_updated_at_column();

CREATE TRIGGER trigger_campanhas_updated_at
  BEFORE UPDATE ON pacientes.campanhas
  FOR EACH ROW
  EXECUTE FUNCTION pacientes.update_updated_at_column();

CREATE TRIGGER trigger_origens_updated_at
  BEFORE UPDATE ON pacientes.origens
  FOR EACH ROW
  EXECUTE FUNCTION pacientes.update_updated_at_column();

CREATE TRIGGER trigger_promotores_updated_at
  BEFORE UPDATE ON pacientes.promotores
  FOR EACH ROW
  EXECUTE FUNCTION pacientes.update_updated_at_column();

CREATE TRIGGER trigger_eventos_updated_at
  BEFORE UPDATE ON pacientes.eventos
  FOR EACH ROW
  EXECUTE FUNCTION pacientes.update_updated_at_column();

-- RLS Policies (Row Level Security)
ALTER TABLE pacientes.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes.patient_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes.campanhas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes.origens ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes.promotores ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes.eventos ENABLE ROW LEVEL SECURITY;

-- Grant usage on schema
GRANT USAGE ON SCHEMA pacientes TO orthoplus;
GRANT ALL ON ALL TABLES IN SCHEMA pacientes TO orthoplus;
GRANT ALL ON ALL SEQUENCES IN SCHEMA pacientes TO orthoplus;

COMMENT ON SCHEMA pacientes IS 'Módulo PACIENTES - Bounded Context isolado com dados de pacientes, CRM e status';
COMMENT ON TABLE pacientes.patients IS 'Entidade principal de pacientes com dados pessoais e comerciais';
COMMENT ON TABLE pacientes.patient_status IS 'Estados canônicos do paciente (15 status)';
COMMENT ON TABLE pacientes.patient_status_history IS 'Histórico temporal de mudanças de status com auditoria completa';
