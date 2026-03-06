-- Tabela de inutilização de numeração NFCe
CREATE TABLE IF NOT EXISTS public.nfce_inutilizacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  serie INTEGER NOT NULL,
  numero_inicial INTEGER NOT NULL,
  numero_final INTEGER NOT NULL,
  ano INTEGER NOT NULL,
  justificativa TEXT NOT NULL,
  protocolo TEXT,
  data_inutilizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  xml_inutilizacao TEXT,
  status TEXT NOT NULL DEFAULT 'PROCESSANDO' CHECK (status IN ('PROCESSANDO', 'AUTORIZADO', 'REJEITADO')),
  codigo_status TEXT,
  motivo TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_nfce_inutilizacao_clinic ON public.nfce_inutilizacao(clinic_id);
CREATE INDEX idx_nfce_inutilizacao_serie ON public.nfce_inutilizacao(serie);

-- Tabela de Carta de Correção Eletrônica
CREATE TABLE IF NOT EXISTS public.nfce_carta_correcao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  nfce_id UUID NOT NULL REFERENCES public.nfce_emitidas(id) ON DELETE CASCADE,
  sequencia INTEGER NOT NULL DEFAULT 1,
  correcao TEXT NOT NULL,
  protocolo TEXT,
  data_evento TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  xml_evento TEXT,
  status TEXT NOT NULL DEFAULT 'PROCESSANDO' CHECK (status IN ('PROCESSANDO', 'REGISTRADO', 'REJEITADO')),
  codigo_status TEXT,
  motivo TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_nfce_cce_clinic ON public.nfce_carta_correcao(clinic_id);
CREATE INDEX idx_nfce_cce_nfce ON public.nfce_carta_correcao(nfce_id);

-- Tabela de sangrias e suprimentos do caixa
CREATE TABLE IF NOT EXISTS public.caixa_movimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  caixa_id UUID,
  tipo TEXT NOT NULL CHECK (tipo IN ('ABERTURA', 'FECHAMENTO', 'SANGRIA', 'SUPRIMENTO')),
  valor NUMERIC(10, 2) NOT NULL,
  valor_inicial NUMERIC(10, 2),
  valor_final NUMERIC(10, 2),
  valor_esperado NUMERIC(10, 2),
  diferenca NUMERIC(10, 2),
  observacoes TEXT,
  motivo_sangria TEXT,
  sugerido_por_ia BOOLEAN DEFAULT false,
  risco_calculado NUMERIC(3, 2),
  horario_risco TEXT,
  status TEXT NOT NULL DEFAULT 'ABERTO' CHECK (status IN ('ABERTO', 'FECHADO')),
  aberto_em TIMESTAMP WITH TIME ZONE,
  fechado_em TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_caixa_movimentos_clinic ON public.caixa_movimentos(clinic_id);
CREATE INDEX idx_caixa_movimentos_tipo ON public.caixa_movimentos(tipo);
CREATE INDEX idx_caixa_movimentos_data ON public.caixa_movimentos(created_at);

-- Tabela de histórico de incidentes de segurança (para ML de sangria)
CREATE TABLE IF NOT EXISTS public.caixa_incidentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  tipo_incidente TEXT NOT NULL CHECK (tipo_incidente IN ('ASSALTO', 'FURTO', 'FRAUDE', 'PERDA')),
  data_incidente TIMESTAMP WITH TIME ZONE NOT NULL,
  horario_incidente TIME NOT NULL,
  dia_semana INTEGER NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6),
  valor_perdido NUMERIC(10, 2),
  valor_caixa_momento NUMERIC(10, 2),
  descricao TEXT,
  boletim_ocorrencia TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_caixa_incidentes_clinic ON public.caixa_incidentes(clinic_id);
CREATE INDEX idx_caixa_incidentes_horario ON public.caixa_incidentes(horario_incidente);
CREATE INDEX idx_caixa_incidentes_dia ON public.caixa_incidentes(dia_semana);

-- Tabela de fechamento de caixa consolidado
CREATE TABLE IF NOT EXISTS public.fechamento_caixa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  caixa_movimento_id UUID NOT NULL REFERENCES public.caixa_movimentos(id),
  data_fechamento DATE NOT NULL,
  total_vendas_pdv NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_nfce_emitidas NUMERIC(10, 2) NOT NULL DEFAULT 0,
  divergencia NUMERIC(10, 2) NOT NULL DEFAULT 0,
  percentual_divergencia NUMERIC(5, 2),
  quantidade_vendas_pdv INTEGER NOT NULL DEFAULT 0,
  quantidade_nfce INTEGER NOT NULL DEFAULT 0,
  vendas_sem_nfce INTEGER NOT NULL DEFAULT 0,
  total_sangrias NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_suprimentos NUMERIC(10, 2) NOT NULL DEFAULT 0,
  observacoes TEXT,
  arquivo_sped_path TEXT,
  arquivo_sped_gerado_em TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_fechamento_caixa_clinic ON public.fechamento_caixa(clinic_id);
CREATE INDEX idx_fechamento_caixa_data ON public.fechamento_caixa(data_fechamento);

-- RLS Policies
ALTER TABLE public.nfce_inutilizacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nfce_carta_correcao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caixa_movimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caixa_incidentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fechamento_caixa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view inutilizacao from their clinic"
  ON public.nfce_inutilizacao FOR SELECT
  USING (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Admins can manage inutilizacao"
  ON public.nfce_inutilizacao FOR ALL
  USING (
    clinic_id = get_user_clinic_id(auth.uid()) AND
    has_role(auth.uid(), 'ADMIN'::app_role)
  );

CREATE POLICY "Users can view CCe from their clinic"
  ON public.nfce_carta_correcao FOR SELECT
  USING (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can manage CCe from their clinic"
  ON public.nfce_carta_correcao FOR ALL
  USING (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can manage caixa_movimentos from their clinic"
  ON public.caixa_movimentos FOR ALL
  USING (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Admins can manage incidentes"
  ON public.caixa_incidentes FOR ALL
  USING (
    clinic_id = get_user_clinic_id(auth.uid()) AND
    has_role(auth.uid(), 'ADMIN'::app_role)
  );

CREATE POLICY "Users can view fechamento from their clinic"
  ON public.fechamento_caixa FOR SELECT
  USING (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Admins can manage fechamento"
  ON public.fechamento_caixa FOR ALL
  USING (
    clinic_id = get_user_clinic_id(auth.uid()) AND
    has_role(auth.uid(), 'ADMIN'::app_role)
  );

-- Triggers
CREATE TRIGGER update_nfce_inutilizacao_updated_at
  BEFORE UPDATE ON public.nfce_inutilizacao
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_nfce_carta_correcao_updated_at
  BEFORE UPDATE ON public.nfce_carta_correcao
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();