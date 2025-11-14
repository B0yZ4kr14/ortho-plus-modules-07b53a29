-- Criar tabela para armazenar produtos do estoque
CREATE TABLE IF NOT EXISTS public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL CHECK (categoria IN ('MATERIAL', 'MEDICAMENTO', 'EQUIPAMENTO', 'CONSUMIVEL', 'OUTRO')),
  unidade_medida TEXT NOT NULL CHECK (unidade_medida IN ('UNIDADE', 'CAIXA', 'PACOTE', 'LITRO', 'ML', 'GRAMA', 'KG')),
  quantidade_atual NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (quantidade_atual >= 0),
  quantidade_minima NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (quantidade_minima >= 0),
  valor_unitario NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (valor_unitario >= 0),
  codigo_barras TEXT,
  fornecedor TEXT,
  localizacao TEXT,
  observacoes TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela para movimentações de estoque
CREATE TABLE IF NOT EXISTS public.movimentacoes_estoque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('ENTRADA', 'SAIDA', 'AJUSTE')),
  quantidade NUMERIC(10,2) NOT NULL CHECK (quantidade > 0),
  quantidade_anterior NUMERIC(10,2) NOT NULL CHECK (quantidade_anterior >= 0),
  quantidade_atual NUMERIC(10,2) NOT NULL CHECK (quantidade_atual >= 0),
  valor_unitario NUMERIC(10,2) NOT NULL CHECK (valor_unitario >= 0),
  valor_total NUMERIC(10,2) NOT NULL CHECK (valor_total >= 0),
  motivo TEXT,
  observacoes TEXT,
  usuario_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_produtos_clinic_id ON public.produtos(clinic_id);
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON public.produtos(categoria);
CREATE INDEX IF NOT EXISTS idx_produtos_codigo_barras ON public.produtos(codigo_barras) WHERE codigo_barras IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_produtos_ativo ON public.produtos(ativo);
CREATE INDEX IF NOT EXISTS idx_produtos_estoque_baixo ON public.produtos(clinic_id, quantidade_atual, quantidade_minima) WHERE quantidade_atual <= quantidade_minima;

CREATE INDEX IF NOT EXISTS idx_movimentacoes_produto_id ON public.movimentacoes_estoque(produto_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_clinic_id ON public.movimentacoes_estoque(clinic_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_tipo ON public.movimentacoes_estoque(tipo);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_usuario_id ON public.movimentacoes_estoque(usuario_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_created_at ON public.movimentacoes_estoque(created_at DESC);

-- Constraint para código de barras único por clínica
CREATE UNIQUE INDEX IF NOT EXISTS idx_produtos_codigo_barras_unique 
  ON public.produtos(clinic_id, codigo_barras) 
  WHERE codigo_barras IS NOT NULL;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_produtos_updated_at
  BEFORE UPDATE ON public.produtos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies para produtos
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view produtos from their clinic"
  ON public.produtos
  FOR SELECT
  USING (
    clinic_id = (
      SELECT clinic_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create produtos in their clinic"
  ON public.produtos
  FOR INSERT
  WITH CHECK (
    clinic_id = (
      SELECT clinic_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update produtos from their clinic"
  ON public.produtos
  FOR UPDATE
  USING (
    clinic_id = (
      SELECT clinic_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Only admins can delete produtos"
  ON public.produtos
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 
      FROM public.profiles 
      WHERE id = auth.uid() 
        AND clinic_id = produtos.clinic_id
        AND app_role = 'ADMIN'
    )
  );

-- RLS Policies para movimentações
ALTER TABLE public.movimentacoes_estoque ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view movimentacoes from their clinic"
  ON public.movimentacoes_estoque
  FOR SELECT
  USING (
    clinic_id = (
      SELECT clinic_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create movimentacoes in their clinic"
  ON public.movimentacoes_estoque
  FOR INSERT
  WITH CHECK (
    clinic_id = (
      SELECT clinic_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Only admins can delete movimentacoes"
  ON public.movimentacoes_estoque
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 
      FROM public.profiles 
      WHERE id = auth.uid() 
        AND clinic_id = movimentacoes_estoque.clinic_id
        AND app_role = 'ADMIN'
    )
  );

-- Comentários para documentação
COMMENT ON TABLE public.produtos IS 'Armazena produtos do estoque da clínica';
COMMENT ON TABLE public.movimentacoes_estoque IS 'Armazena histórico de movimentações de estoque (entrada/saída/ajuste)';
COMMENT ON COLUMN public.produtos.quantidade_minima IS 'Quantidade mínima para alerta de estoque baixo';
COMMENT ON COLUMN public.movimentacoes_estoque.tipo IS 'Tipo de movimentação: ENTRADA (compra), SAIDA (uso), AJUSTE (correção)';