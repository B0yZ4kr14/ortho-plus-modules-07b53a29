-- Criar tabelas para analytics de onboarding e templates de configuração

-- ============================================
-- TABELA DE ANALYTICS DE ONBOARDING
-- ============================================
CREATE TABLE IF NOT EXISTS onboarding_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  clinic_id uuid REFERENCES clinics(id) NOT NULL,
  event_type text NOT NULL, -- 'started', 'step_completed', 'completed', 'abandoned'
  step_number integer,
  step_name text,
  time_spent_seconds integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb
);

-- Index para queries de analytics
CREATE INDEX idx_onboarding_analytics_clinic ON onboarding_analytics(clinic_id);
CREATE INDEX idx_onboarding_analytics_user ON onboarding_analytics(user_id);
CREATE INDEX idx_onboarding_analytics_event ON onboarding_analytics(event_type);
CREATE INDEX idx_onboarding_analytics_created ON onboarding_analytics(created_at);

-- RLS policies
ALTER TABLE onboarding_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own analytics"
  ON onboarding_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view analytics from their clinic"
  ON onboarding_analytics FOR SELECT
  USING (
    clinic_id IN (
      SELECT clinic_id FROM profiles WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'ADMIN'
    )
  );

-- ============================================
-- TABELA DE TEMPLATES DE CONFIGURAÇÃO
-- ============================================
CREATE TABLE IF NOT EXISTS module_configuration_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  specialty text NOT NULL, -- 'CLINICA_GERAL', 'ORTODONTIA', 'IMPLANTODONTIA', etc
  description text,
  icon text,
  modules jsonb NOT NULL, -- Array de module_keys
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true
);

-- Trigger para updated_at
CREATE TRIGGER update_module_configuration_templates_updated_at
  BEFORE UPDATE ON module_configuration_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS policies
ALTER TABLE module_configuration_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view templates"
  ON module_configuration_templates FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);

-- ============================================
-- INSERIR TEMPLATES PRÉ-DEFINIDOS
-- ============================================
INSERT INTO module_configuration_templates (name, specialty, description, icon, modules) VALUES
(
  'Clínica Geral Completa',
  'CLINICA_GERAL',
  'Setup completo para clínicas odontológicas de atendimento geral',
  'Stethoscope',
  '["DASHBOARD", "PACIENTES", "DENTISTAS", "FUNCIONARIOS", "AGENDA", "PROCEDIMENTOS", "PEP", "ODONTOGRAMA", "ORCAMENTOS", "CONTRATOS", "FINANCEIRO", "FINANCEIRO_DASHBOARD", "FINANCEIRO_TRANSACOES", "FINANCEIRO_RECEBER", "FINANCEIRO_PAGAR", "ESTOQUE", "ESTOQUE_DASHBOARD", "ESTOQUE_CADASTROS", "ESTOQUE_MOVIMENTACOES", "CRM", "MARKETING", "RELATORIOS", "CONFIGURACOES"]'::jsonb
),
(
  'Ortodontia Especializada',
  'ORTODONTIA',
  'Configuração otimizada para clínicas de ortodontia com foco em tratamentos longos',
  'Activity',
  '["DASHBOARD", "PACIENTES", "DENTISTAS", "AGENDA", "PROCEDIMENTOS", "PEP", "ODONTOGRAMA", "ORCAMENTOS", "CONTRATOS", "FINANCEIRO", "FINANCEIRO_DASHBOARD", "FINANCEIRO_TRANSACOES", "FINANCEIRO_RECEBER", "SPLIT_PAGAMENTO", "CRM", "MARKETING", "FIDELIDADE", "IA_RADIOGRAFIA", "RELATORIOS", "BI", "CONFIGURACOES"]'::jsonb
),
(
  'Implantodontia Avançada',
  'IMPLANTODONTIA',
  'Setup para clínicas especializadas em implantes com ferramentas avançadas',
  'Zap',
  '["DASHBOARD", "PACIENTES", "DENTISTAS", "FUNCIONARIOS", "AGENDA", "PROCEDIMENTOS", "PEP", "ODONTOGRAMA", "ORCAMENTOS", "CONTRATOS", "FINANCEIRO", "FINANCEIRO_DASHBOARD", "FINANCEIRO_TRANSACOES", "FINANCEIRO_RECEBER", "FINANCEIRO_PAGAR", "FINANCEIRO_CRYPTO", "ESTOQUE", "ESTOQUE_DASHBOARD", "ESTOQUE_CADASTROS", "ESTOQUE_INVENTARIO", "IA_RADIOGRAFIA", "ASSINATURA_ICP", "RELATORIOS", "BI", "CONFIGURACOES"]'::jsonb
),
(
  'Odontopediatria',
  'ODONTOPEDIATRIA',
  'Configuração ideal para atendimento infantil com foco em fidelização',
  'Baby',
  '["DASHBOARD", "PACIENTES", "DENTISTAS", "AGENDA", "PROCEDIMENTOS", "PEP", "ODONTOGRAMA", "ORCAMENTOS", "FINANCEIRO", "FINANCEIRO_DASHBOARD", "FINANCEIRO_RECEBER", "FIDELIDADE", "MARKETING", "PORTAL_PACIENTE", "RELATORIOS", "CONFIGURACOES"]'::jsonb
),
(
  'Estética Dental',
  'ESTETICA',
  'Setup para clínicas focadas em procedimentos estéticos e cosméticos',
  'Sparkles',
  '["DASHBOARD", "PACIENTES", "DENTISTAS", "AGENDA", "PROCEDIMENTOS", "PEP", "ORCAMENTOS", "CONTRATOS", "FINANCEIRO", "FINANCEIRO_DASHBOARD", "FINANCEIRO_RECEBER", "FINANCEIRO_CRYPTO", "CRM", "MARKETING", "IA_RADIOGRAFIA", "PORTAL_PACIENTE", "RELATORIOS", "BI", "CONFIGURACOES"]'::jsonb
),
(
  'Clínica Multidisciplinar',
  'MULTIDISCIPLINAR',
  'Configuração completa para clínicas com múltiplas especialidades',
  'Building',
  '["DASHBOARD", "PACIENTES", "DENTISTAS", "FUNCIONARIOS", "AGENDA", "PROCEDIMENTOS", "PEP", "ODONTOGRAMA", "ORCAMENTOS", "CONTRATOS", "ESTOQUE", "ESTOQUE_DASHBOARD", "ESTOQUE_CADASTROS", "ESTOQUE_MOVIMENTACOES", "ESTOQUE_REQUISICOES", "ESTOQUE_INVENTARIO", "FINANCEIRO", "FINANCEIRO_DASHBOARD", "FINANCEIRO_TRANSACOES", "FINANCEIRO_RECEBER", "FINANCEIRO_PAGAR", "SPLIT_PAGAMENTO", "CRM", "MARKETING", "FIDELIDADE", "IA_RADIOGRAFIA", "TELEODONTO", "LGPD", "ASSINATURA_ICP", "RELATORIOS", "BI", "CONFIGURACOES"]'::jsonb
),
(
  'Startup Enxuta',
  'STARTUP',
  'Setup mínimo viável para clínicas iniciantes com módulos essenciais',
  'Rocket',
  '["DASHBOARD", "PACIENTES", "DENTISTAS", "AGENDA", "PROCEDIMENTOS", "PEP", "ORCAMENTOS", "FINANCEIRO", "FINANCEIRO_DASHBOARD", "FINANCEIRO_RECEBER", "RELATORIOS", "CONFIGURACOES"]'::jsonb
);

-- ============================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ============================================
COMMENT ON TABLE onboarding_analytics IS 'Rastreia eventos de onboarding para analytics de conclusão e drop-off';
COMMENT ON TABLE module_configuration_templates IS 'Templates pré-definidos de configuração de módulos por especialidade odontológica';