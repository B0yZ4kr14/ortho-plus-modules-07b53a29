-- =====================================================
-- FASE 5 - T5.8: Módulo LGPD
-- =====================================================
-- Tabelas: lgpd_consents, lgpd_data_requests, lgpd_data_exports
-- RLS Policies: Acesso restrito por clínica

-- Tabela: lgpd_consents (Consentimentos LGPD)
CREATE TABLE IF NOT EXISTS public.lgpd_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL,
  consent_type TEXT NOT NULL, -- 'DADOS_PESSOAIS', 'TRATAMENTO', 'IMAGENS', 'MARKETING', 'COMPARTILHAMENTO'
  consent_text TEXT NOT NULL,
  accepted BOOLEAN NOT NULL DEFAULT false,
  accepted_at TIMESTAMPTZ,
  accepted_by UUID, -- user_id que registrou (pode ser o próprio paciente ou recepcionista)
  ip_address TEXT,
  user_agent TEXT,
  revoked BOOLEAN DEFAULT false,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID,
  version INTEGER NOT NULL DEFAULT 1, -- versão do termo
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela: lgpd_data_requests (Solicitações de dados - direito de acesso, portabilidade, esquecimento)
CREATE TABLE IF NOT EXISTS public.lgpd_data_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL,
  request_type TEXT NOT NULL, -- 'ACESSO', 'PORTABILIDADE', 'RETIFICACAO', 'EXCLUSAO', 'OPOSICAO'
  status TEXT NOT NULL DEFAULT 'PENDENTE', -- 'PENDENTE', 'EM_ANALISE', 'APROVADO', 'CONCLUIDO', 'REJEITADO'
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  requested_by UUID NOT NULL, -- user_id
  description TEXT,
  response TEXT,
  responded_at TIMESTAMPTZ,
  responded_by UUID,
  completed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  data_export_id UUID, -- referência para lgpd_data_exports se aplicável
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela: lgpd_data_exports (Exportações de dados)
CREATE TABLE IF NOT EXISTS public.lgpd_data_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL,
  request_id UUID REFERENCES public.lgpd_data_requests(id) ON DELETE SET NULL,
  export_type TEXT NOT NULL, -- 'COMPLETO', 'PARCIAL', 'ANONIMIZADO'
  file_path TEXT, -- caminho no storage
  file_size_bytes BIGINT,
  file_format TEXT DEFAULT 'JSON', -- 'JSON', 'PDF', 'XML'
  status TEXT NOT NULL DEFAULT 'PROCESSANDO', -- 'PROCESSANDO', 'CONCLUIDO', 'ERRO', 'EXPIRADO'
  generated_at TIMESTAMPTZ,
  generated_by UUID NOT NULL,
  expires_at TIMESTAMPTZ, -- link expira após X dias
  downloaded_at TIMESTAMPTZ,
  download_count INTEGER DEFAULT 0,
  error_message TEXT,
  tables_included TEXT[], -- lista de tabelas incluídas na exportação
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_lgpd_consents_clinic_patient ON public.lgpd_consents(clinic_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_lgpd_consents_type ON public.lgpd_consents(consent_type);
CREATE INDEX IF NOT EXISTS idx_lgpd_consents_accepted ON public.lgpd_consents(accepted);
CREATE INDEX IF NOT EXISTS idx_lgpd_data_requests_clinic ON public.lgpd_data_requests(clinic_id);
CREATE INDEX IF NOT EXISTS idx_lgpd_data_requests_patient ON public.lgpd_data_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_lgpd_data_requests_status ON public.lgpd_data_requests(status);
CREATE INDEX IF NOT EXISTS idx_lgpd_data_exports_clinic ON public.lgpd_data_exports(clinic_id);
CREATE INDEX IF NOT EXISTS idx_lgpd_data_exports_patient ON public.lgpd_data_exports(patient_id);
CREATE INDEX IF NOT EXISTS idx_lgpd_data_exports_status ON public.lgpd_data_exports(status);

-- RLS Policies: lgpd_consents
ALTER TABLE public.lgpd_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view consents from their clinic"
  ON public.lgpd_consents
  FOR SELECT
  USING (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can create consents in their clinic"
  ON public.lgpd_consents
  FOR INSERT
  WITH CHECK (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can update consents from their clinic"
  ON public.lgpd_consents
  FOR UPDATE
  USING (clinic_id = get_user_clinic_id(auth.uid()));

-- RLS Policies: lgpd_data_requests
ALTER TABLE public.lgpd_data_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view data requests from their clinic"
  ON public.lgpd_data_requests
  FOR SELECT
  USING (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can create data requests in their clinic"
  ON public.lgpd_data_requests
  FOR INSERT
  WITH CHECK (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can update data requests from their clinic"
  ON public.lgpd_data_requests
  FOR UPDATE
  USING (clinic_id = get_user_clinic_id(auth.uid()));

-- RLS Policies: lgpd_data_exports
ALTER TABLE public.lgpd_data_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view data exports from their clinic"
  ON public.lgpd_data_exports
  FOR SELECT
  USING (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can create data exports in their clinic"
  ON public.lgpd_data_exports
  FOR INSERT
  WITH CHECK (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can update data exports from their clinic"
  ON public.lgpd_data_exports
  FOR UPDATE
  USING (clinic_id = get_user_clinic_id(auth.uid()));

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_lgpd_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lgpd_consents_updated_at
  BEFORE UPDATE ON public.lgpd_consents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lgpd_updated_at();

CREATE TRIGGER update_lgpd_data_requests_updated_at
  BEFORE UPDATE ON public.lgpd_data_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lgpd_updated_at();

CREATE TRIGGER update_lgpd_data_exports_updated_at
  BEFORE UPDATE ON public.lgpd_data_exports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lgpd_updated_at();

-- Comentários
COMMENT ON TABLE public.lgpd_consents IS 'Registros de consentimentos LGPD dos pacientes';
COMMENT ON TABLE public.lgpd_data_requests IS 'Solicitações de acesso, portabilidade ou exclusão de dados';
COMMENT ON TABLE public.lgpd_data_exports IS 'Exportações de dados pessoais dos pacientes';

-- Audit log para ações LGPD críticas
CREATE OR REPLACE FUNCTION public.log_lgpd_data_request_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status != NEW.status) THEN
    INSERT INTO public.audit_logs (action, clinic_id, user_id, details)
    VALUES (
      'LGPD_REQUEST_STATUS_CHANGED',
      NEW.clinic_id,
      auth.uid(),
      jsonb_build_object(
        'request_id', NEW.id,
        'request_type', NEW.request_type,
        'old_status', OLD.status,
        'new_status', NEW.status,
        'patient_id', NEW.patient_id
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_lgpd_data_request_changes
  AFTER UPDATE ON public.lgpd_data_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.log_lgpd_data_request_changes();