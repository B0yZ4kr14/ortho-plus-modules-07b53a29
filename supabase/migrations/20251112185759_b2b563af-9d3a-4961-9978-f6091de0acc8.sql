-- Tabela de Pedidos de Compra
CREATE TABLE IF NOT EXISTS public.estoque_pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id),
  numero_pedido TEXT NOT NULL,
  fornecedor_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'ENVIADO', 'RECEBIDO', 'CANCELADO')),
  tipo TEXT NOT NULL DEFAULT 'MANUAL' CHECK (tipo IN ('MANUAL', 'AUTOMATICO')),
  data_pedido TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_prevista_entrega TIMESTAMPTZ,
  data_recebimento TIMESTAMPTZ,
  valor_total DECIMAL(10,2) DEFAULT 0,
  observacoes TEXT,
  gerado_automaticamente BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL
);

-- Tabela de Itens do Pedido
CREATE TABLE IF NOT EXISTS public.estoque_pedidos_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID NOT NULL REFERENCES public.estoque_pedidos(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL,
  quantidade DECIMAL(10,2) NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  quantidade_recebida DECIMAL(10,2) DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de Configurações de Pedidos Automáticos
CREATE TABLE IF NOT EXISTS public.estoque_pedidos_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id),
  produto_id UUID NOT NULL,
  quantidade_reposicao DECIMAL(10,2) NOT NULL,
  ponto_pedido DECIMAL(10,2) NOT NULL,
  gerar_automaticamente BOOLEAN DEFAULT TRUE,
  dias_entrega_estimados INTEGER DEFAULT 7,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(clinic_id, produto_id)
);

-- RLS Policies para estoque_pedidos
ALTER TABLE public.estoque_pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view pedidos from their clinic"
  ON public.estoque_pedidos FOR SELECT
  USING (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can create pedidos in their clinic"
  ON public.estoque_pedidos FOR INSERT
  WITH CHECK (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can update pedidos from their clinic"
  ON public.estoque_pedidos FOR UPDATE
  USING (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can delete pedidos from their clinic"
  ON public.estoque_pedidos FOR DELETE
  USING (clinic_id = get_user_clinic_id(auth.uid()));

-- RLS Policies para estoque_pedidos_itens
ALTER TABLE public.estoque_pedidos_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view pedido items from their clinic"
  ON public.estoque_pedidos_itens FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.estoque_pedidos
    WHERE estoque_pedidos.id = estoque_pedidos_itens.pedido_id
      AND estoque_pedidos.clinic_id = get_user_clinic_id(auth.uid())
  ));

CREATE POLICY "Users can create pedido items in their clinic"
  ON public.estoque_pedidos_itens FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.estoque_pedidos
    WHERE estoque_pedidos.id = estoque_pedidos_itens.pedido_id
      AND estoque_pedidos.clinic_id = get_user_clinic_id(auth.uid())
  ));

CREATE POLICY "Users can update pedido items from their clinic"
  ON public.estoque_pedidos_itens FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.estoque_pedidos
    WHERE estoque_pedidos.id = estoque_pedidos_itens.pedido_id
      AND estoque_pedidos.clinic_id = get_user_clinic_id(auth.uid())
  ));

CREATE POLICY "Users can delete pedido items from their clinic"
  ON public.estoque_pedidos_itens FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.estoque_pedidos
    WHERE estoque_pedidos.id = estoque_pedidos_itens.pedido_id
      AND estoque_pedidos.clinic_id = get_user_clinic_id(auth.uid())
  ));

-- RLS Policies para estoque_pedidos_config
ALTER TABLE public.estoque_pedidos_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view config from their clinic"
  ON public.estoque_pedidos_config FOR SELECT
  USING (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can manage config in their clinic"
  ON public.estoque_pedidos_config FOR ALL
  USING (clinic_id = get_user_clinic_id(auth.uid()));

-- Triggers para updated_at
CREATE TRIGGER update_estoque_pedidos_updated_at
  BEFORE UPDATE ON public.estoque_pedidos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_estoque_pedidos_config_updated_at
  BEFORE UPDATE ON public.estoque_pedidos_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.estoque_pedidos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.estoque_pedidos_itens;
ALTER PUBLICATION supabase_realtime ADD TABLE public.estoque_pedidos_config;