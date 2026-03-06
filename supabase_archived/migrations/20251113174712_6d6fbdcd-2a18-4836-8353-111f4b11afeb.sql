-- Criar tabela pdv_vendas se não existir
CREATE TABLE IF NOT EXISTS public.pdv_vendas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  caixa_movimento_id UUID,
  numero_venda TEXT NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('CONCLUIDA', 'CANCELADA')),
  forma_pagamento TEXT NOT NULL,
  observacoes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de configuração de impressoras fiscais SAT/MFe
CREATE TABLE IF NOT EXISTS public.sat_mfe_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  tipo_equipamento TEXT NOT NULL CHECK (tipo_equipamento IN ('SAT', 'MFE')),
  numero_serie TEXT NOT NULL,
  codigo_ativacao TEXT,
  ip_address TEXT,
  porta INTEGER,
  modelo TEXT,
  fabricante TEXT,
  versao_software TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_clinic_sat_mfe UNIQUE (clinic_id, numero_serie)
);

-- Tabela de log de impressões fiscais
CREATE TABLE IF NOT EXISTS public.sat_mfe_impressoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  config_id UUID NOT NULL REFERENCES public.sat_mfe_config(id) ON DELETE CASCADE,
  venda_id UUID REFERENCES public.pdv_vendas(id) ON DELETE SET NULL,
  nfce_id UUID REFERENCES public.nfce_emitidas(id) ON DELETE SET NULL,
  tipo_equipamento TEXT NOT NULL CHECK (tipo_equipamento IN ('SAT', 'MFE')),
  numero_sessao TEXT,
  codigo_autorizacao TEXT,
  chave_consulta TEXT,
  xml_enviado TEXT,
  xml_retorno TEXT,
  status TEXT NOT NULL CHECK (status IN ('AGUARDANDO', 'PROCESSANDO', 'SUCESSO', 'ERRO', 'CANCELADO')),
  mensagem_retorno TEXT,
  tentativas INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.pdv_vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sat_mfe_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sat_mfe_impressoes ENABLE ROW LEVEL SECURITY;

-- RLS Policies para pdv_vendas
CREATE POLICY "Users can view their clinic's sales"
  ON public.pdv_vendas FOR SELECT
  USING (clinic_id IN (
    SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert sales"
  ON public.pdv_vendas FOR INSERT
  WITH CHECK (
    clinic_id IN (
      SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies para sat_mfe_config
CREATE POLICY "Users can view their clinic's SAT/MFe config"
  ON public.sat_mfe_config FOR SELECT
  USING (clinic_id IN (
    SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can insert SAT/MFe config"
  ON public.sat_mfe_config FOR INSERT
  WITH CHECK (
    clinic_id IN (
      SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can update SAT/MFe config"
  ON public.sat_mfe_config FOR UPDATE
  USING (
    clinic_id IN (
      SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'ADMIN'
    )
  );

-- RLS Policies para sat_mfe_impressoes
CREATE POLICY "Users can view their clinic's SAT/MFe prints"
  ON public.sat_mfe_impressoes FOR SELECT
  USING (clinic_id IN (
    SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert SAT/MFe prints"
  ON public.sat_mfe_impressoes FOR INSERT
  WITH CHECK (
    clinic_id IN (
      SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pdv_vendas_clinic ON public.pdv_vendas(clinic_id);
CREATE INDEX IF NOT EXISTS idx_sat_mfe_config_clinic ON public.sat_mfe_config(clinic_id);
CREATE INDEX IF NOT EXISTS idx_sat_mfe_config_ativo ON public.sat_mfe_config(ativo) WHERE ativo = true;
CREATE INDEX IF NOT EXISTS idx_sat_mfe_impressoes_clinic ON public.sat_mfe_impressoes(clinic_id);
CREATE INDEX IF NOT EXISTS idx_sat_mfe_impressoes_venda ON public.sat_mfe_impressoes(venda_id);
CREATE INDEX IF NOT EXISTS idx_sat_mfe_impressoes_status ON public.sat_mfe_impressoes(status);
CREATE INDEX IF NOT EXISTS idx_sat_mfe_impressoes_created ON public.sat_mfe_impressoes(created_at DESC);

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_pdv_vendas_updated_at ON public.pdv_vendas;
CREATE TRIGGER update_pdv_vendas_updated_at
  BEFORE UPDATE ON public.pdv_vendas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_sat_mfe_config_updated_at ON public.sat_mfe_config;
CREATE TRIGGER update_sat_mfe_config_updated_at
  BEFORE UPDATE ON public.sat_mfe_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_sat_mfe_impressoes_updated_at ON public.sat_mfe_impressoes;
CREATE TRIGGER update_sat_mfe_impressoes_updated_at
  BEFORE UPDATE ON public.sat_mfe_impressoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir módulo no catálogo
INSERT INTO public.module_catalog (module_key, name, description, category)
VALUES 
  ('PDV_SAT_MFE', 'Impressoras Fiscais SAT/MFe', 'Integração com impressoras fiscais homologadas pela SEFAZ para impressão automática de cupom fiscal', 'Financeiro')
ON CONFLICT (module_key) DO NOTHING;