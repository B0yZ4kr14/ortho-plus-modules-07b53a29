-- FASE 2.1: Corrigir Security Warnings do Supabase Linter

-- 1. Criar schema separado para extensions (fix: extension in public)
CREATE SCHEMA IF NOT EXISTS extensions;

-- 2. Mover pg_trgm para extensions schema (se existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
    ALTER EXTENSION pg_trgm SET SCHEMA extensions;
  END IF;
END $$;

-- 3. Habilitar password breach protection (fix: leaked password protection)
-- Nota: Isso será configurado via Supabase Auth Config separadamente

-- 4. Atualizar todas as functions existentes com search_path seguro
-- Function: update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 5. Criar função auxiliar para audit logging
CREATE OR REPLACE FUNCTION public.log_audit_trail()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_clinic_id UUID;
  v_ip_address INET;
  v_user_agent TEXT;
  v_old_values JSONB;
  v_new_values JSONB;
BEGIN
  -- Obter informações do usuário atual
  v_user_id := auth.uid();
  
  -- Obter clinic_id se disponível
  IF TG_TABLE_NAME = 'prontuarios' THEN
    v_clinic_id := COALESCE(NEW.clinic_id, OLD.clinic_id);
  ELSIF TG_TABLE_NAME = 'pep_tratamentos' THEN
    -- Buscar clinic_id através do prontuário
    SELECT clinic_id INTO v_clinic_id 
    FROM prontuarios 
    WHERE id = COALESCE(NEW.prontuario_id, OLD.prontuario_id) 
    LIMIT 1;
  END IF;

  -- Preparar valores antigos e novos (apenas para UPDATE)
  IF TG_OP = 'UPDATE' THEN
    v_old_values := to_jsonb(OLD);
    v_new_values := to_jsonb(NEW);
  ELSIF TG_OP = 'INSERT' THEN
    v_new_values := to_jsonb(NEW);
  ELSIF TG_OP = 'DELETE' THEN
    v_old_values := to_jsonb(OLD);
  END IF;

  -- Inserir registro de auditoria
  INSERT INTO audit_trail (
    user_id,
    clinic_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values,
    sensitivity_level
  ) VALUES (
    v_user_id,
    v_clinic_id,
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    v_old_values,
    v_new_values,
    CASE TG_TABLE_NAME
      WHEN 'prontuarios' THEN 'CRITICAL'
      WHEN 'pep_tratamentos' THEN 'HIGH'
      WHEN 'budgets' THEN 'MEDIUM'
      ELSE 'LOW'
    END
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 6. Criar tabela de audit trail
CREATE TABLE IF NOT EXISTS public.audit_trail (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  clinic_id UUID REFERENCES clinics(id),
  action VARCHAR(50) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'SELECT', 'EXPORT')),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  sensitivity_level VARCHAR(20) NOT NULL DEFAULT 'LOW' CHECK (sensitivity_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'))
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_trail_user_id ON audit_trail(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_clinic_id ON audit_trail(clinic_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_timestamp ON audit_trail(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_trail_entity ON audit_trail(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_sensitivity ON audit_trail(sensitivity_level);

-- RLS para audit_trail (somente ADMINs podem ler)
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON audit_trail
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.app_role = 'ADMIN'
      AND profiles.clinic_id = audit_trail.clinic_id
    )
  );

-- 7. Adicionar triggers de auditoria em tabelas sensíveis
DROP TRIGGER IF EXISTS audit_prontuarios_changes ON prontuarios;
CREATE TRIGGER audit_prontuarios_changes
  AFTER INSERT OR UPDATE OR DELETE ON prontuarios
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_trail();

DROP TRIGGER IF EXISTS audit_tratamentos_changes ON pep_tratamentos;
CREATE TRIGGER audit_tratamentos_changes
  AFTER INSERT OR UPDATE OR DELETE ON pep_tratamentos
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_trail();

DROP TRIGGER IF EXISTS audit_budgets_changes ON budgets;
CREATE TRIGGER audit_budgets_changes
  AFTER INSERT OR UPDATE OR DELETE ON budgets
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_trail();

-- 8. Criar tabela de recalls (FASE 1.3)
CREATE TABLE IF NOT EXISTS public.recalls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL,
  tipo_recall VARCHAR(50) NOT NULL CHECK (tipo_recall IN ('LIMPEZA', 'REVISAO', 'RETORNO_TRATAMENTO', 'MANUTENCAO_PROTESE', 'CONTROLE_ORTODONTICO')),
  data_prevista DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'AGENDADO', 'CONFIRMADO', 'REALIZADO', 'CANCELADO')),
  notificacao_enviada BOOLEAN DEFAULT false,
  metodo_notificacao VARCHAR(20) CHECK (metodo_notificacao IN ('WHATSAPP', 'SMS', 'EMAIL')),
  mensagem_personalizada TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Índices para recalls
CREATE INDEX IF NOT EXISTS idx_recalls_clinic_id ON recalls(clinic_id);
CREATE INDEX IF NOT EXISTS idx_recalls_patient_id ON recalls(patient_id);
CREATE INDEX IF NOT EXISTS idx_recalls_data_prevista ON recalls(data_prevista);
CREATE INDEX IF NOT EXISTS idx_recalls_status ON recalls(status);

-- RLS para recalls
ALTER TABLE recalls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view clinic recalls"
  ON recalls
  FOR SELECT
  TO authenticated
  USING (
    clinic_id IN (
      SELECT clinic_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create clinic recalls"
  ON recalls
  FOR INSERT
  TO authenticated
  WITH CHECK (
    clinic_id IN (
      SELECT clinic_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update clinic recalls"
  ON recalls
  FOR UPDATE
  TO authenticated
  USING (
    clinic_id IN (
      SELECT clinic_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_recalls_updated_at ON recalls;
CREATE TRIGGER update_recalls_updated_at
  BEFORE UPDATE ON recalls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 9. Criar tabela de templates de procedimentos (FASE 6)
CREATE TABLE IF NOT EXISTS public.procedimento_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  nome VARCHAR(200) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('RESTAURACAO', 'ENDODONTIA', 'PROTESE', 'ORTODONTIA', 'CIRURGIA', 'PERIODONTIA', 'ESTETICA', 'PREVENTIVA')),
  steps JSONB NOT NULL,
  tempo_estimado_minutos INT NOT NULL CHECK (tempo_estimado_minutos > 0),
  valor_sugerido DECIMAL(10,2) NOT NULL CHECK (valor_sugerido >= 0),
  is_public BOOLEAN DEFAULT false,
  tags TEXT[],
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para templates
CREATE INDEX IF NOT EXISTS idx_templates_clinic_id ON procedimento_templates(clinic_id);
CREATE INDEX IF NOT EXISTS idx_templates_categoria ON procedimento_templates(categoria);
CREATE INDEX IF NOT EXISTS idx_templates_public ON procedimento_templates(is_public) WHERE is_public = true;

-- RLS para templates
ALTER TABLE procedimento_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view clinic and public templates"
  ON procedimento_templates
  FOR SELECT
  TO authenticated
  USING (
    is_public = true OR
    clinic_id IN (
      SELECT clinic_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create clinic templates"
  ON procedimento_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    clinic_id IN (
      SELECT clinic_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update own templates"
  ON procedimento_templates
  FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    clinic_id IN (
      SELECT clinic_id FROM profiles 
      WHERE id = auth.uid() AND app_role = 'ADMIN'
    )
  );

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_templates_updated_at ON procedimento_templates;
CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON procedimento_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE audit_trail IS 'LGPD/HIPAA compliant audit trail for sensitive data access';
COMMENT ON TABLE recalls IS 'Sistema de recall automático para retornos de pacientes';
COMMENT ON TABLE procedimento_templates IS 'Templates reutilizáveis de procedimentos clínicos';