-- ============================================
-- FASE 2 - TASK 2.4: MÓDULO DE TELEODONTOLOGIA
-- Data: 2025-11-15
-- ============================================

-- 1. TABELA DE SESSÕES DE TELEODONTOLOGIA
CREATE TABLE IF NOT EXISTS public.teleodonto_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL,
  dentist_id uuid NOT NULL,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
  
  -- Agendamento
  scheduled_start timestamptz NOT NULL,
  scheduled_end timestamptz NOT NULL,
  
  -- Status da sessão
  status text NOT NULL DEFAULT 'agendada' CHECK (status IN ('agendada', 'em_andamento', 'concluida', 'cancelada', 'nao_compareceu')),
  
  -- Dados da videoconferência
  room_id text UNIQUE,
  room_url text,
  platform text NOT NULL DEFAULT 'jitsi' CHECK (platform IN ('jitsi', 'zoom', 'meet', 'teams')),
  recording_url text,
  
  -- Metadados
  duracao_minutos int,
  started_at timestamptz,
  ended_at timestamptz,
  patient_joined_at timestamptz,
  dentist_joined_at timestamptz,
  
  -- Consentimento LGPD
  consentimento_gravacao boolean DEFAULT false,
  consentimento_assinado_em timestamptz,
  
  -- Notas clínicas
  notas_pre_consulta text,
  notas_pos_consulta text,
  diagnostico_preliminar text,
  prescricoes jsonb DEFAULT '[]'::jsonb,
  
  -- Qualidade técnica
  qualidade_video text CHECK (qualidade_video IN ('excelente', 'boa', 'regular', 'ruim')),
  qualidade_audio text CHECK (qualidade_audio IN ('excelente', 'boa', 'regular', 'ruim')),
  problemas_tecnicos text,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid NOT NULL
);

-- 2. TABELA DE ARQUIVOS COMPARTILHADOS NA SESSÃO
CREATE TABLE IF NOT EXISTS public.teleodonto_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.teleodonto_sessions(id) ON DELETE CASCADE,
  
  -- Arquivo
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size_bytes bigint NOT NULL,
  storage_path text NOT NULL,
  file_url text,
  
  -- Metadados
  uploaded_by uuid NOT NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  tipo_arquivo text NOT NULL CHECK (tipo_arquivo IN ('radiografia', 'foto_clinica', 'documento', 'prescricao', 'exame', 'outro')),
  descricao text,
  compartilhado_com_paciente boolean DEFAULT false
);

-- 3. TABELA DE CHAT DA SESSÃO
CREATE TABLE IF NOT EXISTS public.teleodonto_chat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.teleodonto_sessions(id) ON DELETE CASCADE,
  
  -- Mensagem
  sender_id uuid NOT NULL,
  sender_role text NOT NULL CHECK (sender_role IN ('dentist', 'patient', 'assistant')),
  message_text text NOT NULL,
  message_type text NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  
  -- Anexos
  attachment_url text,
  attachment_type text,
  
  sent_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz
);

-- 4. RLS POLICIES
ALTER TABLE public.teleodonto_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teleodonto_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teleodonto_chat ENABLE ROW LEVEL SECURITY;

-- Sessions
CREATE POLICY "Usuários podem ver sessões da sua clínica"
  ON public.teleodonto_sessions FOR SELECT
  USING (
    public.is_root_user() OR
    clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Usuários podem criar/atualizar sessões na sua clínica"
  ON public.teleodonto_sessions FOR ALL
  USING (
    public.is_root_user() OR
    clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
  );

-- Files
CREATE POLICY "Usuários podem ver arquivos das sessões da sua clínica"
  ON public.teleodonto_files FOR SELECT
  USING (
    public.is_root_user() OR
    EXISTS (
      SELECT 1 FROM public.teleodonto_sessions s
      WHERE s.id = teleodonto_files.session_id
        AND s.clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Usuários podem fazer upload de arquivos nas sessões da sua clínica"
  ON public.teleodonto_files FOR INSERT
  WITH CHECK (
    public.is_root_user() OR
    EXISTS (
      SELECT 1 FROM public.teleodonto_sessions s
      WHERE s.id = teleodonto_files.session_id
        AND s.clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
    )
  );

-- Chat
CREATE POLICY "Usuários podem ver chat das sessões da sua clínica"
  ON public.teleodonto_chat FOR SELECT
  USING (
    public.is_root_user() OR
    EXISTS (
      SELECT 1 FROM public.teleodonto_sessions s
      WHERE s.id = teleodonto_chat.session_id
        AND s.clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Usuários podem enviar mensagens no chat das sessões da sua clínica"
  ON public.teleodonto_chat FOR INSERT
  WITH CHECK (
    public.is_root_user() OR
    EXISTS (
      SELECT 1 FROM public.teleodonto_sessions s
      WHERE s.id = teleodonto_chat.session_id
        AND s.clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
    )
  );

-- 5. TRIGGERS
CREATE OR REPLACE FUNCTION public.update_teleodonto_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_teleodonto_sessions_updated_at
  BEFORE UPDATE ON public.teleodonto_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_teleodonto_updated_at();

-- Função para calcular duração automaticamente
CREATE OR REPLACE FUNCTION public.calculate_session_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ended_at IS NOT NULL AND NEW.started_at IS NOT NULL THEN
    NEW.duracao_minutos = EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at)) / 60;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER calculate_teleodonto_duration
  BEFORE UPDATE ON public.teleodonto_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_session_duration();

-- 6. ÍNDICES
CREATE INDEX idx_teleodonto_sessions_clinic ON public.teleodonto_sessions(clinic_id);
CREATE INDEX idx_teleodonto_sessions_patient ON public.teleodonto_sessions(patient_id);
CREATE INDEX idx_teleodonto_sessions_dentist ON public.teleodonto_sessions(dentist_id);
CREATE INDEX idx_teleodonto_sessions_scheduled ON public.teleodonto_sessions(scheduled_start, status);
CREATE INDEX idx_teleodonto_files_session ON public.teleodonto_files(session_id);
CREATE INDEX idx_teleodonto_chat_session ON public.teleodonto_chat(session_id, sent_at);

-- 7. COMMENTS
COMMENT ON TABLE public.teleodonto_sessions IS 'Sessões de telemedicina odontológica com videoconferência';
COMMENT ON TABLE public.teleodonto_files IS 'Arquivos compartilhados durante sessões de teleodontologia (radiografias, fotos, documentos)';
COMMENT ON TABLE public.teleodonto_chat IS 'Chat em tempo real das sessões de teleodontologia';
COMMENT ON COLUMN public.teleodonto_sessions.consentimento_gravacao IS 'Consentimento LGPD para gravação da sessão';
COMMENT ON COLUMN public.teleodonto_sessions.prescricoes IS 'Array de prescrições emitidas durante a teleconsulta';

-- 8. AUDITORIA
INSERT INTO public.audit_logs (action, action_type, details)
VALUES (
  'TELEODONTO_MODULE_SCHEMA_CREATED',
  'CREATE',
  jsonb_build_object(
    'timestamp', now(),
    'tables', ARRAY['teleodonto_sessions', 'teleodonto_files', 'teleodonto_chat'],
    'features', ARRAY['video conferencing', 'file sharing', 'real-time chat', 'LGPD compliant', 'recording support']
  )
);