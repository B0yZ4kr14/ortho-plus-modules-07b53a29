-- =====================================================
-- FASE 2: TELEODONTOLOGIA E IA RADIOGRÁFICA
-- =====================================================

-- =====================================================
-- 1. MÓDULO DE TELEODONTOLOGIA
-- =====================================================

-- Sessões de teleconsulta
CREATE TABLE IF NOT EXISTS public.teleconsultas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id),
  patient_id UUID NOT NULL,
  dentist_id UUID NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id),
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('VIDEO', 'AUDIO', 'CHAT')),
  status TEXT NOT NULL DEFAULT 'AGENDADA' CHECK (status IN ('AGENDADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA', 'NAO_COMPARECEU')),
  data_agendada TIMESTAMPTZ NOT NULL,
  data_iniciada TIMESTAMPTZ,
  data_finalizada TIMESTAMPTZ,
  duracao_minutos INTEGER,
  motivo TEXT NOT NULL,
  diagnostico TEXT,
  conduta TEXT,
  observacoes TEXT,
  link_sala TEXT, -- Link da sala de videochamada (Twilio/Agora)
  recording_url TEXT, -- URL da gravação (se permitido)
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prescrições remotas
CREATE TABLE IF NOT EXISTS public.prescricoes_remotas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teleconsulta_id UUID NOT NULL REFERENCES public.teleconsultas(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('MEDICAMENTO', 'PROCEDIMENTO', 'RECOMENDACAO')),
  descricao TEXT NOT NULL,
  medicamento_nome TEXT,
  medicamento_dosagem TEXT,
  medicamento_frequencia TEXT,
  medicamento_duracao TEXT,
  instrucoes TEXT,
  assinatura_digital TEXT, -- Base64 da assinatura do dentista
  enviado_para_paciente BOOLEAN DEFAULT FALSE,
  enviado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Triagem pré-teleconsulta
CREATE TABLE IF NOT EXISTS public.triagem_teleconsulta (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teleconsulta_id UUID NOT NULL REFERENCES public.teleconsultas(id) ON DELETE CASCADE,
  sintomas TEXT[],
  intensidade_dor INTEGER CHECK (intensidade_dor BETWEEN 0 AND 10),
  tempo_sintoma TEXT,
  alergias TEXT,
  medicamentos_uso TEXT,
  fotos_anexas JSONB, -- [{url, descricao}]
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 2. IA PARA RECONHECIMENTO DE IMAGENS RADIOGRÁFICAS
-- =====================================================

-- Análises de raio-X
CREATE TABLE IF NOT EXISTS public.analises_radiograficas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id),
  patient_id UUID NOT NULL,
  prontuario_id UUID REFERENCES public.prontuarios(id),
  tipo_radiografia TEXT NOT NULL CHECK (tipo_radiografia IN ('PANORAMICA', 'PERIAPICAL', 'BITE_WING', 'CEFALOMETRICA', 'TOMOGRAFIA')),
  imagem_url TEXT NOT NULL,
  imagem_storage_path TEXT NOT NULL,
  status_analise TEXT NOT NULL DEFAULT 'PENDENTE' CHECK (status_analise IN ('PENDENTE', 'PROCESSANDO', 'CONCLUIDA', 'ERRO')),
  resultado_ia JSONB, -- {problemas_detectados: [{tipo, localizacao, severidade, confianca}], sugestoes_tratamento: [...]}
  problemas_detectados INTEGER DEFAULT 0,
  confidence_score NUMERIC(5,2), -- 0.00 a 100.00
  revisado_por_dentista BOOLEAN DEFAULT FALSE,
  revisado_por UUID,
  revisado_em TIMESTAMPTZ,
  observacoes_dentista TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Problemas detectados pela IA
CREATE TABLE IF NOT EXISTS public.problemas_radiograficos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analise_id UUID NOT NULL REFERENCES public.analises_radiograficas(id) ON DELETE CASCADE,
  tipo_problema TEXT NOT NULL CHECK (tipo_problema IN ('CARIE', 'FRATURA', 'PERIODONTAL', 'IMPLANTE_NECESSARIO', 'CANAL', 'LESAO_PERIAPICAL', 'OUTROS')),
  dente_codigo TEXT,
  localizacao TEXT,
  severidade TEXT NOT NULL CHECK (severidade IN ('LEVE', 'MODERADA', 'GRAVE')),
  confianca NUMERIC(5,2), -- 0.00 a 100.00
  descricao TEXT,
  sugestao_tratamento TEXT,
  urgente BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_teleconsultas_clinic_patient ON public.teleconsultas(clinic_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_teleconsultas_dentist ON public.teleconsultas(dentist_id);
CREATE INDEX IF NOT EXISTS idx_teleconsultas_status ON public.teleconsultas(status);
CREATE INDEX IF NOT EXISTS idx_teleconsultas_data ON public.teleconsultas(data_agendada);
CREATE INDEX IF NOT EXISTS idx_prescricoes_remotas_teleconsulta ON public.prescricoes_remotas(teleconsulta_id);
CREATE INDEX IF NOT EXISTS idx_analises_radiograficas_clinic ON public.analises_radiograficas(clinic_id);
CREATE INDEX IF NOT EXISTS idx_analises_radiograficas_patient ON public.analises_radiograficas(patient_id);
CREATE INDEX IF NOT EXISTS idx_analises_radiograficas_status ON public.analises_radiograficas(status_analise);
CREATE INDEX IF NOT EXISTS idx_problemas_radiograficos_analise ON public.problemas_radiograficos(analise_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_teleconsultas_updated_at BEFORE UPDATE ON public.teleconsultas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_analises_radiograficas_updated_at BEFORE UPDATE ON public.analises_radiograficas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Teleconsultas
ALTER TABLE public.teleconsultas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view teleconsultas from their clinic" ON public.teleconsultas FOR SELECT USING (clinic_id = get_user_clinic_id(auth.uid()));
CREATE POLICY "Users can create teleconsultas in their clinic" ON public.teleconsultas FOR INSERT WITH CHECK (clinic_id = get_user_clinic_id(auth.uid()));
CREATE POLICY "Users can update teleconsultas from their clinic" ON public.teleconsultas FOR UPDATE USING (clinic_id = get_user_clinic_id(auth.uid()));

-- Prescrições remotas
ALTER TABLE public.prescricoes_remotas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage prescricoes_remotas" ON public.prescricoes_remotas FOR ALL USING (
  EXISTS (SELECT 1 FROM public.teleconsultas WHERE teleconsultas.id = prescricoes_remotas.teleconsulta_id AND teleconsultas.clinic_id = get_user_clinic_id(auth.uid()))
);

-- Triagem teleconsulta
ALTER TABLE public.triagem_teleconsulta ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage triagem" ON public.triagem_teleconsulta FOR ALL USING (
  EXISTS (SELECT 1 FROM public.teleconsultas WHERE teleconsultas.id = triagem_teleconsulta.teleconsulta_id AND teleconsultas.clinic_id = get_user_clinic_id(auth.uid()))
);

-- Análises radiográficas
ALTER TABLE public.analises_radiograficas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view analises from their clinic" ON public.analises_radiograficas FOR SELECT USING (clinic_id = get_user_clinic_id(auth.uid()));
CREATE POLICY "Users can create analises in their clinic" ON public.analises_radiograficas FOR INSERT WITH CHECK (clinic_id = get_user_clinic_id(auth.uid()));
CREATE POLICY "Users can update analises from their clinic" ON public.analises_radiograficas FOR UPDATE USING (clinic_id = get_user_clinic_id(auth.uid()));

-- Problemas radiográficos
ALTER TABLE public.problemas_radiograficos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage problemas" ON public.problemas_radiograficos FOR ALL USING (
  EXISTS (SELECT 1 FROM public.analises_radiograficas WHERE analises_radiograficas.id = problemas_radiograficos.analise_id AND analises_radiograficas.clinic_id = get_user_clinic_id(auth.uid()))
);

-- =====================================================
-- HABILITAR REALTIME
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.teleconsultas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.analises_radiograficas;