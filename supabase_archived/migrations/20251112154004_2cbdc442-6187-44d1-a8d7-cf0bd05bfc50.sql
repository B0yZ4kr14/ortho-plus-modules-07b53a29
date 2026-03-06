-- =====================================================
-- MÓDULO PEP (PRONTUÁRIO ELETRÔNICO DO PACIENTE)
-- =====================================================

-- Tabela principal de prontuários
CREATE TABLE IF NOT EXISTS public.prontuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  patient_name TEXT NOT NULL,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_patient_prontuario UNIQUE (patient_id, clinic_id)
);

-- Histórico clínico
CREATE TABLE IF NOT EXISTS public.historico_clinico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prontuario_id UUID NOT NULL REFERENCES public.prontuarios(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('ANAMNESE', 'EXAME_CLINICO', 'DIAGNOSTICO', 'PRESCRICAO', 'EVOLUCAO', 'OBSERVACAO')),
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  dados_estruturados JSONB,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Anexos de exames
CREATE TABLE IF NOT EXISTS public.pep_anexos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prontuario_id UUID NOT NULL REFERENCES public.prontuarios(id) ON DELETE CASCADE,
  historico_id UUID REFERENCES public.historico_clinico(id) ON DELETE SET NULL,
  tipo_arquivo TEXT NOT NULL CHECK (tipo_arquivo IN ('IMAGEM', 'PDF', 'DOCUMENTO')),
  nome_arquivo TEXT NOT NULL,
  caminho_storage TEXT NOT NULL,
  tamanho_bytes BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  descricao TEXT,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tratamentos e evolução
CREATE TABLE IF NOT EXISTS public.pep_tratamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prontuario_id UUID NOT NULL REFERENCES public.prontuarios(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  dente_codigo TEXT,
  procedimento_id UUID,
  status TEXT NOT NULL DEFAULT 'EM_ANDAMENTO' CHECK (status IN ('PLANEJADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO')),
  data_inicio DATE NOT NULL,
  data_conclusao DATE,
  valor_estimado DECIMAL(10,2),
  observacoes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Timeline de evolução
CREATE TABLE IF NOT EXISTS public.pep_evolucoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tratamento_id UUID NOT NULL REFERENCES public.pep_tratamentos(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('CONSULTA', 'PROCEDIMENTO', 'OBSERVACAO', 'INTERCORRENCIA')),
  data_evolucao TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Odontograma (estado dos dentes)
CREATE TABLE IF NOT EXISTS public.pep_odontograma (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prontuario_id UUID NOT NULL REFERENCES public.prontuarios(id) ON DELETE CASCADE,
  dente_codigo TEXT NOT NULL CHECK (dente_codigo ~ '^[1-8][1-8]$'),
  status TEXT NOT NULL DEFAULT 'NORMAL' CHECK (status IN ('NORMAL', 'CARIADO', 'RESTAURADO', 'AUSENTE', 'IMPLANTE', 'PROTESE', 'TRATAMENTO_CANAL', 'FRATURADO', 'EM_TRATAMENTO')),
  faces_afetadas TEXT[],
  observacoes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_dente_prontuario UNIQUE (prontuario_id, dente_codigo)
);

-- Assinaturas digitais
CREATE TABLE IF NOT EXISTS public.pep_assinaturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prontuario_id UUID NOT NULL REFERENCES public.prontuarios(id) ON DELETE CASCADE,
  historico_id UUID REFERENCES public.historico_clinico(id) ON DELETE SET NULL,
  tipo_documento TEXT NOT NULL CHECK (tipo_documento IN ('ANAMNESE', 'TERMO_CONSENTIMENTO', 'PLANO_TRATAMENTO', 'ATESTADO', 'RECEITA', 'OUTROS')),
  assinatura_base64 TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  signed_by UUID NOT NULL REFERENCES auth.users(id),
  signed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_prontuarios_patient ON public.prontuarios(patient_id);
CREATE INDEX IF NOT EXISTS idx_prontuarios_clinic ON public.prontuarios(clinic_id);
CREATE INDEX IF NOT EXISTS idx_historico_prontuario ON public.historico_clinico(prontuario_id);
CREATE INDEX IF NOT EXISTS idx_historico_created ON public.historico_clinico(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_anexos_prontuario ON public.pep_anexos(prontuario_id);
CREATE INDEX IF NOT EXISTS idx_tratamentos_prontuario ON public.pep_tratamentos(prontuario_id);
CREATE INDEX IF NOT EXISTS idx_tratamentos_status ON public.pep_tratamentos(status);
CREATE INDEX IF NOT EXISTS idx_evolucoes_tratamento ON public.pep_evolucoes(tratamento_id);
CREATE INDEX IF NOT EXISTS idx_odontograma_prontuario ON public.pep_odontograma(prontuario_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_prontuario ON public.pep_assinaturas(prontuario_id);

-- Enable RLS
ALTER TABLE public.prontuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_clinico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pep_anexos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pep_tratamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pep_evolucoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pep_odontograma ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pep_assinaturas ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Prontuários
CREATE POLICY "Users can view prontuarios from their clinic"
  ON public.prontuarios FOR SELECT
  USING (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can create prontuarios in their clinic"
  ON public.prontuarios FOR INSERT
  WITH CHECK (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can update prontuarios from their clinic"
  ON public.prontuarios FOR UPDATE
  USING (clinic_id = get_user_clinic_id(auth.uid()));

-- RLS Policies - Histórico Clínico
CREATE POLICY "Users can view historico from their clinic"
  ON public.historico_clinico FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.prontuarios
    WHERE prontuarios.id = historico_clinico.prontuario_id
    AND prontuarios.clinic_id = get_user_clinic_id(auth.uid())
  ));

CREATE POLICY "Users can create historico in their clinic"
  ON public.historico_clinico FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.prontuarios
    WHERE prontuarios.id = historico_clinico.prontuario_id
    AND prontuarios.clinic_id = get_user_clinic_id(auth.uid())
  ));

CREATE POLICY "Users can update historico from their clinic"
  ON public.historico_clinico FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.prontuarios
    WHERE prontuarios.id = historico_clinico.prontuario_id
    AND prontuarios.clinic_id = get_user_clinic_id(auth.uid())
  ));

-- RLS Policies - Anexos
CREATE POLICY "Users can view anexos from their clinic"
  ON public.pep_anexos FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.prontuarios
    WHERE prontuarios.id = pep_anexos.prontuario_id
    AND prontuarios.clinic_id = get_user_clinic_id(auth.uid())
  ));

CREATE POLICY "Users can create anexos in their clinic"
  ON public.pep_anexos FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.prontuarios
    WHERE prontuarios.id = pep_anexos.prontuario_id
    AND prontuarios.clinic_id = get_user_clinic_id(auth.uid())
  ));

CREATE POLICY "Users can delete anexos from their clinic"
  ON public.pep_anexos FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.prontuarios
    WHERE prontuarios.id = pep_anexos.prontuario_id
    AND prontuarios.clinic_id = get_user_clinic_id(auth.uid())
  ));

-- RLS Policies - Tratamentos
CREATE POLICY "Users can view tratamentos from their clinic"
  ON public.pep_tratamentos FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.prontuarios
    WHERE prontuarios.id = pep_tratamentos.prontuario_id
    AND prontuarios.clinic_id = get_user_clinic_id(auth.uid())
  ));

CREATE POLICY "Users can create tratamentos in their clinic"
  ON public.pep_tratamentos FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.prontuarios
    WHERE prontuarios.id = pep_tratamentos.prontuario_id
    AND prontuarios.clinic_id = get_user_clinic_id(auth.uid())
  ));

CREATE POLICY "Users can update tratamentos from their clinic"
  ON public.pep_tratamentos FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.prontuarios
    WHERE prontuarios.id = pep_tratamentos.prontuario_id
    AND prontuarios.clinic_id = get_user_clinic_id(auth.uid())
  ));

-- RLS Policies - Evoluções
CREATE POLICY "Users can view evolucoes from their clinic"
  ON public.pep_evolucoes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.pep_tratamentos t
    JOIN public.prontuarios p ON p.id = t.prontuario_id
    WHERE t.id = pep_evolucoes.tratamento_id
    AND p.clinic_id = get_user_clinic_id(auth.uid())
  ));

CREATE POLICY "Users can create evolucoes in their clinic"
  ON public.pep_evolucoes FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.pep_tratamentos t
    JOIN public.prontuarios p ON p.id = t.prontuario_id
    WHERE t.id = pep_evolucoes.tratamento_id
    AND p.clinic_id = get_user_clinic_id(auth.uid())
  ));

-- RLS Policies - Odontograma
CREATE POLICY "Users can view odontograma from their clinic"
  ON public.pep_odontograma FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.prontuarios
    WHERE prontuarios.id = pep_odontograma.prontuario_id
    AND prontuarios.clinic_id = get_user_clinic_id(auth.uid())
  ));

CREATE POLICY "Users can manage odontograma in their clinic"
  ON public.pep_odontograma FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.prontuarios
    WHERE prontuarios.id = pep_odontograma.prontuario_id
    AND prontuarios.clinic_id = get_user_clinic_id(auth.uid())
  ));

-- RLS Policies - Assinaturas
CREATE POLICY "Users can view assinaturas from their clinic"
  ON public.pep_assinaturas FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.prontuarios
    WHERE prontuarios.id = pep_assinaturas.prontuario_id
    AND prontuarios.clinic_id = get_user_clinic_id(auth.uid())
  ));

CREATE POLICY "Users can create assinaturas in their clinic"
  ON public.pep_assinaturas FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.prontuarios
    WHERE prontuarios.id = pep_assinaturas.prontuario_id
    AND prontuarios.clinic_id = get_user_clinic_id(auth.uid())
  ));

-- Triggers para updated_at
CREATE TRIGGER update_prontuarios_updated_at
  BEFORE UPDATE ON public.prontuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_historico_updated_at
  BEFORE UPDATE ON public.historico_clinico
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tratamentos_updated_at
  BEFORE UPDATE ON public.pep_tratamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_odontograma_updated_at
  BEFORE UPDATE ON public.pep_odontograma
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket para anexos do PEP
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pep-anexos',
  'pep-anexos',
  false,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies para anexos
CREATE POLICY "Users can view anexos from their clinic"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'pep-anexos' AND
    EXISTS (
      SELECT 1 FROM public.pep_anexos a
      JOIN public.prontuarios p ON p.id = a.prontuario_id
      WHERE a.caminho_storage = storage.objects.name
      AND p.clinic_id = get_user_clinic_id(auth.uid())
    )
  );

CREATE POLICY "Users can upload anexos to their clinic"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'pep-anexos' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can delete anexos from their clinic"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'pep-anexos' AND
    EXISTS (
      SELECT 1 FROM public.pep_anexos a
      JOIN public.prontuarios p ON p.id = a.prontuario_id
      WHERE a.caminho_storage = storage.objects.name
      AND p.clinic_id = get_user_clinic_id(auth.uid())
    )
  );