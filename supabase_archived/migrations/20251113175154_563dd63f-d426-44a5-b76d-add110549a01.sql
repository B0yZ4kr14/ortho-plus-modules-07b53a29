-- Tabela de configuração de integração contábil
CREATE TABLE IF NOT EXISTS public.integracao_contabil_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  software TEXT NOT NULL CHECK (software IN ('TOTVS', 'SAP', 'CONTA_AZUL', 'OUTROS')),
  api_url TEXT NOT NULL,
  api_key TEXT,
  api_secret TEXT,
  codigo_empresa TEXT,
  envio_automatico BOOLEAN NOT NULL DEFAULT true,
  enviar_sped_fiscal BOOLEAN NOT NULL DEFAULT true,
  enviar_nfce_dados BOOLEAN NOT NULL DEFAULT true,
  periodicidade_envio TEXT NOT NULL DEFAULT 'DIARIO' CHECK (periodicidade_envio IN ('TEMPO_REAL', 'DIARIO', 'SEMANAL', 'MENSAL')),
  email_contador TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_clinic_software UNIQUE (clinic_id, software)
);

-- Tabela de log de envios para contabilidade
CREATE TABLE IF NOT EXISTS public.integracao_contabil_envios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  config_id UUID NOT NULL REFERENCES public.integracao_contabil_config(id) ON DELETE CASCADE,
  tipo_documento TEXT NOT NULL CHECK (tipo_documento IN ('SPED_FISCAL', 'NFCE_DADOS', 'RELATORIO_MENSAL')),
  periodo_referencia TEXT NOT NULL,
  arquivo_path TEXT,
  arquivo_size_bytes BIGINT,
  status TEXT NOT NULL CHECK (status IN ('PENDENTE', 'ENVIANDO', 'SUCESSO', 'ERRO', 'RETRY')) DEFAULT 'PENDENTE',
  tentativas INTEGER NOT NULL DEFAULT 0,
  max_tentativas INTEGER NOT NULL DEFAULT 3,
  erro_mensagem TEXT,
  response_data JSONB,
  enviado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela para NFCe em contingência offline (FS-DA)
CREATE TABLE IF NOT EXISTS public.nfce_contingencia (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  venda_id UUID REFERENCES public.pdv_vendas(id) ON DELETE SET NULL,
  numero_nfce INTEGER NOT NULL,
  serie INTEGER NOT NULL,
  chave_acesso TEXT NOT NULL,
  xml_nfce TEXT NOT NULL,
  valor_total NUMERIC(10,2) NOT NULL,
  forma_pagamento TEXT NOT NULL,
  itens JSONB NOT NULL,
  modo_contingencia TEXT NOT NULL DEFAULT 'FS-DA' CHECK (modo_contingencia IN ('FS-DA', 'OFFLINE')),
  motivo_contingencia TEXT NOT NULL,
  status_sincronizacao TEXT NOT NULL DEFAULT 'PENDENTE' CHECK (status_sincronizacao IN ('PENDENTE', 'SINCRONIZANDO', 'SINCRONIZADO', 'ERRO')),
  tentativas_sincronizacao INTEGER NOT NULL DEFAULT 0,
  erro_sincronizacao TEXT,
  protocolo_autorizacao TEXT,
  sincronizado_em TIMESTAMPTZ,
  emitido_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.integracao_contabil_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integracao_contabil_envios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nfce_contingencia ENABLE ROW LEVEL SECURITY;

-- RLS Policies para integracao_contabil_config
CREATE POLICY "Admins can manage contabil config"
  ON public.integracao_contabil_config FOR ALL
  USING (
    clinic_id IN (
      SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'ADMIN'
    )
  );

-- RLS Policies para integracao_contabil_envios
CREATE POLICY "Users can view contabil envios from their clinic"
  ON public.integracao_contabil_envios FOR SELECT
  USING (clinic_id IN (
    SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "System can manage contabil envios"
  ON public.integracao_contabil_envios FOR ALL
  USING (true);

-- RLS Policies para nfce_contingencia
CREATE POLICY "Users can view contingencia from their clinic"
  ON public.nfce_contingencia FOR SELECT
  USING (clinic_id IN (
    SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert contingencia"
  ON public.nfce_contingencia FOR INSERT
  WITH CHECK (
    clinic_id IN (
      SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "System can update contingencia"
  ON public.nfce_contingencia FOR UPDATE
  USING (true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_integracao_contabil_config_clinic ON public.integracao_contabil_config(clinic_id);
CREATE INDEX IF NOT EXISTS idx_integracao_contabil_config_ativo ON public.integracao_contabil_config(ativo) WHERE ativo = true;
CREATE INDEX IF NOT EXISTS idx_integracao_contabil_envios_clinic ON public.integracao_contabil_envios(clinic_id);
CREATE INDEX IF NOT EXISTS idx_integracao_contabil_envios_status ON public.integracao_contabil_envios(status);
CREATE INDEX IF NOT EXISTS idx_nfce_contingencia_clinic ON public.nfce_contingencia(clinic_id);
CREATE INDEX IF NOT EXISTS idx_nfce_contingencia_status ON public.nfce_contingencia(status_sincronizacao);
CREATE INDEX IF NOT EXISTS idx_nfce_contingencia_pendente ON public.nfce_contingencia(status_sincronizacao) WHERE status_sincronizacao = 'PENDENTE';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_integracao_contabil_config_updated_at ON public.integracao_contabil_config;
CREATE TRIGGER update_integracao_contabil_config_updated_at
  BEFORE UPDATE ON public.integracao_contabil_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_integracao_contabil_envios_updated_at ON public.integracao_contabil_envios;
CREATE TRIGGER update_integracao_contabil_envios_updated_at
  BEFORE UPDATE ON public.integracao_contabil_envios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_nfce_contingencia_updated_at ON public.nfce_contingencia;
CREATE TRIGGER update_nfce_contingencia_updated_at
  BEFORE UPDATE ON public.nfce_contingencia
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir módulos no catálogo
INSERT INTO public.module_catalog (module_key, name, description, category)
VALUES 
  ('PDV_INTEGRACAO_CONTABIL', 'Integração com Contabilidade', 'Envio automático de SPED Fiscal e dados de NFCe para softwares contábeis (TOTVS, SAP, Conta Azul)', 'Financeiro'),
  ('PDV_CONTINGENCIA_OFFLINE', 'Contingência Offline NFCe', 'Emissão de NFCe em modo contingência FS-DA sem conexão com SEFAZ, com sincronização automática posterior', 'Financeiro')
ON CONFLICT (module_key) DO NOTHING;