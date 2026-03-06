-- Tabela de replicação de backups entre clínicas
CREATE TABLE IF NOT EXISTS public.backup_replications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  target_clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  backup_id UUID NOT NULL REFERENCES public.backup_history(id) ON DELETE CASCADE,
  replication_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (replication_status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED')),
  region TEXT NOT NULL,
  storage_provider TEXT NOT NULL,
  storage_path TEXT,
  file_size_bytes BIGINT,
  checksum_md5 TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_backup_replications_source_clinic ON public.backup_replications(source_clinic_id);
CREATE INDEX idx_backup_replications_target_clinic ON public.backup_replications(target_clinic_id);
CREATE INDEX idx_backup_replications_backup_id ON public.backup_replications(backup_id);
CREATE INDEX idx_backup_replications_status ON public.backup_replications(replication_status);

-- RLS Policies
ALTER TABLE public.backup_replications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view replications from their clinic"
  ON public.backup_replications FOR SELECT
  USING (
    source_clinic_id = get_user_clinic_id(auth.uid()) OR
    target_clinic_id = get_user_clinic_id(auth.uid())
  );

CREATE POLICY "System can manage replications"
  ON public.backup_replications FOR ALL
  USING (true);

-- Tabela de configuração fiscal para NFCe
CREATE TABLE IF NOT EXISTS public.fiscal_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  ambiente TEXT NOT NULL DEFAULT 'HOMOLOGACAO' CHECK (ambiente IN ('HOMOLOGACAO', 'PRODUCAO')),
  tipo_emissao TEXT NOT NULL DEFAULT 'NFCE' CHECK (tipo_emissao IN ('NFCE', 'SAT', 'MFE')),
  certificado_digital TEXT,
  senha_certificado TEXT,
  serie_nfce INTEGER DEFAULT 1,
  numero_ultimo_nfce INTEGER DEFAULT 0,
  cnpj TEXT NOT NULL,
  razao_social TEXT NOT NULL,
  nome_fantasia TEXT,
  inscricao_estadual TEXT,
  regime_tributario TEXT NOT NULL DEFAULT 'SIMPLES_NACIONAL' CHECK (regime_tributario IN ('SIMPLES_NACIONAL', 'LUCRO_PRESUMIDO', 'LUCRO_REAL')),
  codigo_regime_tributario INTEGER DEFAULT 1,
  csc_id TEXT,
  csc_token TEXT,
  endereco JSONB DEFAULT '{}',
  email_contabilidade TEXT,
  contingencia_enabled BOOLEAN DEFAULT false,
  contingencia_motivo TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(clinic_id)
);

CREATE INDEX idx_fiscal_config_clinic ON public.fiscal_config(clinic_id);

ALTER TABLE public.fiscal_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage fiscal config in their clinic"
  ON public.fiscal_config FOR ALL
  USING (
    clinic_id = get_user_clinic_id(auth.uid()) AND
    has_role(auth.uid(), 'ADMIN'::app_role)
  );

-- Tabela de NFCe emitidas
CREATE TABLE IF NOT EXISTS public.nfce_emitidas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  venda_id UUID NOT NULL,
  numero_nfce INTEGER NOT NULL,
  serie INTEGER NOT NULL,
  chave_acesso TEXT NOT NULL UNIQUE,
  protocolo_autorizacao TEXT,
  data_emissao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valor_total NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'PROCESSANDO' CHECK (status IN ('PROCESSANDO', 'AUTORIZADA', 'CANCELADA', 'DENEGADA', 'REJEITADA')),
  tipo_emissao TEXT NOT NULL,
  ambiente TEXT NOT NULL,
  xml_nfce TEXT,
  xml_cancelamento TEXT,
  motivo_cancelamento TEXT,
  data_cancelamento TIMESTAMP WITH TIME ZONE,
  qrcode_url TEXT,
  pdf_url TEXT,
  contingencia BOOLEAN DEFAULT false,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_nfce_clinic ON public.nfce_emitidas(clinic_id);
CREATE INDEX idx_nfce_venda ON public.nfce_emitidas(venda_id);
CREATE INDEX idx_nfce_chave ON public.nfce_emitidas(chave_acesso);
CREATE INDEX idx_nfce_status ON public.nfce_emitidas(status);

ALTER TABLE public.nfce_emitidas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view NFCe from their clinic"
  ON public.nfce_emitidas FOR SELECT
  USING (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "System can manage NFCe"
  ON public.nfce_emitidas FOR ALL
  USING (true);

-- Tabela de produtos/serviços para PDV com informações fiscais
CREATE TABLE IF NOT EXISTS public.pdv_produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'PRODUTO' CHECK (tipo IN ('PRODUTO', 'SERVICO')),
  ncm TEXT,
  cest TEXT,
  cfop TEXT DEFAULT '5102',
  unidade_medida TEXT DEFAULT 'UN',
  valor_unitario NUMERIC(10, 2) NOT NULL,
  estoque_atual NUMERIC(10, 3) DEFAULT 0,
  estoque_minimo NUMERIC(10, 3) DEFAULT 0,
  controla_estoque BOOLEAN DEFAULT false,
  icms_aliquota NUMERIC(5, 2) DEFAULT 0,
  pis_aliquota NUMERIC(5, 2) DEFAULT 0,
  cofins_aliquota NUMERIC(5, 2) DEFAULT 0,
  cst_icms TEXT DEFAULT '102',
  cst_pis TEXT DEFAULT '07',
  cst_cofins TEXT DEFAULT '07',
  origem_mercadoria INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(clinic_id, codigo)
);

CREATE INDEX idx_pdv_produtos_clinic ON public.pdv_produtos(clinic_id);
CREATE INDEX idx_pdv_produtos_codigo ON public.pdv_produtos(codigo);

ALTER TABLE public.pdv_produtos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage produtos from their clinic"
  ON public.pdv_produtos FOR ALL
  USING (clinic_id = get_user_clinic_id(auth.uid()));

-- Trigger para updated_at
CREATE TRIGGER update_backup_replications_updated_at
  BEFORE UPDATE ON public.backup_replications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fiscal_config_updated_at
  BEFORE UPDATE ON public.fiscal_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_nfce_emitidas_updated_at
  BEFORE UPDATE ON public.nfce_emitidas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pdv_produtos_updated_at
  BEFORE UPDATE ON public.pdv_produtos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();