-- Criar tabela de funcionários
CREATE TABLE IF NOT EXISTS public.funcionarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL,
  rg TEXT,
  data_nascimento DATE NOT NULL,
  sexo TEXT NOT NULL CHECK (sexo IN ('M', 'F', 'Outro')),
  telefone TEXT NOT NULL,
  celular TEXT NOT NULL,
  email TEXT NOT NULL,
  
  -- Endereço (JSONB para flexibilidade)
  endereco JSONB NOT NULL,
  
  -- Cargo e dados de trabalho
  cargo TEXT NOT NULL,
  data_admissao DATE NOT NULL,
  salario DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- Permissões (JSONB para flexibilidade)
  permissoes JSONB NOT NULL DEFAULT '{}',
  
  -- Horário de trabalho (JSONB)
  horario_trabalho JSONB NOT NULL,
  dias_trabalho INTEGER[] NOT NULL,
  
  observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo', 'Férias', 'Afastado')),
  
  -- Campos de autenticação (opcional, para vincular com auth.users)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  avatar_url TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_cpf_per_clinic UNIQUE (clinic_id, cpf)
);

-- Habilitar RLS
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver funcionários da própria clínica
CREATE POLICY "Users can view funcionarios from their clinic"
  ON public.funcionarios
  FOR SELECT
  USING (
    clinic_id IN (
      SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Política: Admins podem inserir funcionários
CREATE POLICY "Admins can insert funcionarios"
  ON public.funcionarios
  FOR INSERT
  WITH CHECK (
    clinic_id IN (
      SELECT clinic_id FROM public.profiles 
      WHERE id = auth.uid() AND app_role = 'ADMIN'
    )
  );

-- Política: Admins podem atualizar funcionários
CREATE POLICY "Admins can update funcionarios"
  ON public.funcionarios
  FOR UPDATE
  USING (
    clinic_id IN (
      SELECT clinic_id FROM public.profiles 
      WHERE id = auth.uid() AND app_role = 'ADMIN'
    )
  );

-- Política: Admins podem deletar funcionários
CREATE POLICY "Admins can delete funcionarios"
  ON public.funcionarios
  FOR DELETE
  USING (
    clinic_id IN (
      SELECT clinic_id FROM public.profiles 
      WHERE id = auth.uid() AND app_role = 'ADMIN'
    )
  );

-- Criar índices para performance
CREATE INDEX idx_funcionarios_clinic_id ON public.funcionarios(clinic_id);
CREATE INDEX idx_funcionarios_status ON public.funcionarios(status);
CREATE INDEX idx_funcionarios_cargo ON public.funcionarios(cargo);
CREATE INDEX idx_funcionarios_cpf ON public.funcionarios(cpf);

-- Trigger para atualizar updated_at
CREATE TRIGGER set_funcionarios_updated_at
  BEFORE UPDATE ON public.funcionarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();