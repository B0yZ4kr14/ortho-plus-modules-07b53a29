-- Criar tabela de inventários
CREATE TABLE IF NOT EXISTS public.inventarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  numero TEXT NOT NULL,
  data DATE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('GERAL', 'CICLICO', 'PARCIAL', 'ROTATIVO')),
  status TEXT NOT NULL DEFAULT 'PLANEJADO' CHECK (status IN ('PLANEJADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO')),
  responsavel TEXT NOT NULL,
  total_itens INTEGER DEFAULT 0,
  itens_contados INTEGER DEFAULT 0,
  divergencias_encontradas INTEGER DEFAULT 0,
  valor_divergencias DECIMAL(10,2) DEFAULT 0,
  observacoes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(clinic_id, numero)
);

-- Criar tabela de itens do inventário
CREATE TABLE IF NOT EXISTS public.inventario_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventario_id UUID NOT NULL REFERENCES public.inventarios(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL,
  produto_nome TEXT NOT NULL,
  quantidade_sistema DECIMAL(10,3) NOT NULL,
  quantidade_fisica DECIMAL(10,3),
  divergencia DECIMAL(10,3),
  percentual_divergencia DECIMAL(5,2),
  valor_unitario DECIMAL(10,2) NOT NULL,
  valor_divergencia DECIMAL(10,2),
  lote TEXT,
  contado_por UUID REFERENCES auth.users(id),
  contado_em TIMESTAMPTZ,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(inventario_id, produto_id, lote)
);

-- Enable RLS
ALTER TABLE public.inventarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventario_itens ENABLE ROW LEVEL SECURITY;

-- RLS Policies para inventarios
CREATE POLICY "Users can view inventarios from their clinic"
  ON public.inventarios FOR SELECT
  USING (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can create inventarios in their clinic"
  ON public.inventarios FOR INSERT
  WITH CHECK (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can update inventarios from their clinic"
  ON public.inventarios FOR UPDATE
  USING (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can delete inventarios from their clinic"
  ON public.inventarios FOR DELETE
  USING (clinic_id = get_user_clinic_id(auth.uid()));

-- RLS Policies para inventario_itens
CREATE POLICY "Users can view inventario_itens from their clinic"
  ON public.inventario_itens FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.inventarios
      WHERE inventarios.id = inventario_itens.inventario_id
        AND inventarios.clinic_id = get_user_clinic_id(auth.uid())
    )
  );

CREATE POLICY "Users can create inventario_itens in their clinic"
  ON public.inventario_itens FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.inventarios
      WHERE inventarios.id = inventario_itens.inventario_id
        AND inventarios.clinic_id = get_user_clinic_id(auth.uid())
    )
  );

CREATE POLICY "Users can update inventario_itens from their clinic"
  ON public.inventario_itens FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.inventarios
      WHERE inventarios.id = inventario_itens.inventario_id
        AND inventarios.clinic_id = get_user_clinic_id(auth.uid())
    )
  );

CREATE POLICY "Users can delete inventario_itens from their clinic"
  ON public.inventario_itens FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.inventarios
      WHERE inventarios.id = inventario_itens.inventario_id
        AND inventarios.clinic_id = get_user_clinic_id(auth.uid())
    )
  );

-- Trigger para atualizar updated_at
CREATE TRIGGER update_inventarios_updated_at
  BEFORE UPDATE ON public.inventarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes para performance
CREATE INDEX idx_inventarios_clinic_id ON public.inventarios(clinic_id);
CREATE INDEX idx_inventarios_status ON public.inventarios(status);
CREATE INDEX idx_inventarios_data ON public.inventarios(data);
CREATE INDEX idx_inventario_itens_inventario_id ON public.inventario_itens(inventario_id);
CREATE INDEX idx_inventario_itens_produto_id ON public.inventario_itens(produto_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventarios;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventario_itens;