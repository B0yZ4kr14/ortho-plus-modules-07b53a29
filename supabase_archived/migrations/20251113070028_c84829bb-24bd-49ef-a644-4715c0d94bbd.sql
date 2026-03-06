-- Criar tabela de configuração de inventários cíclicos
CREATE TABLE IF NOT EXISTS public.inventario_agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  periodicidade TEXT NOT NULL CHECK (periodicidade IN ('SEMANAL', 'MENSAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL')),
  dia_execucao INTEGER CHECK (dia_execucao BETWEEN 1 AND 31),
  dia_semana INTEGER CHECK (dia_semana BETWEEN 0 AND 6),
  tipo_inventario TEXT NOT NULL CHECK (tipo_inventario IN ('GERAL', 'CICLICO', 'PARCIAL', 'ROTATIVO')),
  categorias_ids TEXT[],
  responsavel TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  ultima_execucao TIMESTAMPTZ,
  proxima_execucao TIMESTAMPTZ,
  notificar_responsavel BOOLEAN DEFAULT true,
  notificar_dias_antes INTEGER DEFAULT 1,
  observacoes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.inventario_agendamentos ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view agendamentos from their clinic"
  ON public.inventario_agendamentos FOR SELECT
  USING (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can create agendamentos in their clinic"
  ON public.inventario_agendamentos FOR INSERT
  WITH CHECK (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can update agendamentos from their clinic"
  ON public.inventario_agendamentos FOR UPDATE
  USING (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can delete agendamentos from their clinic"
  ON public.inventario_agendamentos FOR DELETE
  USING (clinic_id = get_user_clinic_id(auth.uid()));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_inventario_agendamentos_updated_at
  BEFORE UPDATE ON public.inventario_agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_inventario_agendamentos_clinic_id ON public.inventario_agendamentos(clinic_id);
CREATE INDEX idx_inventario_agendamentos_proxima_execucao ON public.inventario_agendamentos(proxima_execucao);
CREATE INDEX idx_inventario_agendamentos_ativo ON public.inventario_agendamentos(ativo);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventario_agendamentos;