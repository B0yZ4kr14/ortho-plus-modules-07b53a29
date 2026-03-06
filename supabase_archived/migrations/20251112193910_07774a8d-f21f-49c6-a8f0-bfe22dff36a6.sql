-- Tabela para gerenciar acesso de usuários a múltiplas clínicas
CREATE TABLE IF NOT EXISTS public.user_clinic_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, clinic_id)
);

-- Enable RLS
ALTER TABLE public.user_clinic_access ENABLE ROW LEVEL SECURITY;

-- Users can view their own clinic access
CREATE POLICY "Users can view their own clinic access"
  ON public.user_clinic_access
  FOR SELECT
  USING (user_id = auth.uid());

-- Admins can manage clinic access
CREATE POLICY "Admins can manage clinic access"
  ON public.user_clinic_access
  FOR ALL
  USING (has_role(auth.uid(), 'ADMIN'));

-- Trigger para updated_at
CREATE TRIGGER update_user_clinic_access_updated_at
  BEFORE UPDATE ON public.user_clinic_access
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir acesso padrão para usuários existentes
INSERT INTO public.user_clinic_access (user_id, clinic_id, is_default)
SELECT p.id, p.clinic_id, true
FROM public.profiles p
WHERE p.clinic_id IS NOT NULL
ON CONFLICT (user_id, clinic_id) DO NOTHING;