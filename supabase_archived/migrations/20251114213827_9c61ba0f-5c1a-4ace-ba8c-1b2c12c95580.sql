-- Criar tabela para armazenar odontogramas
CREATE TABLE IF NOT EXISTS public.odontogramas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prontuario_id UUID NOT NULL REFERENCES public.prontuarios(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  teeth JSONB NOT NULL DEFAULT '{}',
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  history JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_odontograma_per_prontuario UNIQUE (prontuario_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_odontogramas_prontuario_id ON public.odontogramas(prontuario_id);
CREATE INDEX IF NOT EXISTS idx_odontogramas_clinic_id ON public.odontogramas(clinic_id);
CREATE INDEX IF NOT EXISTS idx_odontogramas_updated_at ON public.odontogramas(updated_at);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_odontogramas_updated_at
  BEFORE UPDATE ON public.odontogramas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies
ALTER TABLE public.odontogramas ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem visualizar odontogramas da sua clínica
CREATE POLICY "Users can view odontogramas from their clinic"
  ON public.odontogramas
  FOR SELECT
  USING (
    clinic_id = (
      SELECT clinic_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

-- Policy: Usuários podem criar odontogramas na sua clínica
CREATE POLICY "Users can create odontogramas in their clinic"
  ON public.odontogramas
  FOR INSERT
  WITH CHECK (
    clinic_id = (
      SELECT clinic_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

-- Policy: Usuários podem atualizar odontogramas da sua clínica
CREATE POLICY "Users can update odontogramas from their clinic"
  ON public.odontogramas
  FOR UPDATE
  USING (
    clinic_id = (
      SELECT clinic_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

-- Policy: Apenas ADMINs podem deletar odontogramas
CREATE POLICY "Only admins can delete odontogramas"
  ON public.odontogramas
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 
      FROM public.profiles 
      WHERE id = auth.uid() 
        AND clinic_id = odontogramas.clinic_id
        AND app_role = 'ADMIN'
    )
  );

-- Comentários para documentação
COMMENT ON TABLE public.odontogramas IS 'Armazena odontogramas dos pacientes com status de cada dente e histórico de alterações';
COMMENT ON COLUMN public.odontogramas.teeth IS 'JSON com status de cada dente (numeração FDI) e suas superfícies';
COMMENT ON COLUMN public.odontogramas.history IS 'Array JSON com histórico de todas as alterações realizadas';
COMMENT ON COLUMN public.odontogramas.last_updated IS 'Data da última alteração no odontograma';