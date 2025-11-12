-- Criar clínica padrão
INSERT INTO public.clinics (id, name) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Clínica Ortho+ Demo')
ON CONFLICT (id) DO NOTHING;

-- Criar usuário admin padrão no auth.users
-- NOTA: Este comando será executado via Supabase Auth API no próximo passo
-- O password hash para "Admin" será gerado automaticamente

-- Criar perfil para o admin
INSERT INTO public.profiles (id, full_name, clinic_id)
SELECT 
  id,
  'Administrador',
  '00000000-0000-0000-0000-000000000001'
FROM auth.users
WHERE email = 'admin@orthoplus.com'
ON CONFLICT (id) DO UPDATE 
SET clinic_id = '00000000-0000-0000-0000-000000000001',
    full_name = 'Administrador';

-- Criar role ADMIN para o usuário
INSERT INTO public.user_roles (user_id, role)
SELECT 
  id,
  'ADMIN'::app_role
FROM auth.users
WHERE email = 'admin@orthoplus.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Criar tabela de agendamentos se não existir
CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES public.clinics(id) NOT NULL,
  patient_id uuid NOT NULL,
  dentist_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'agendado',
  treatment_id uuid REFERENCES public.pep_tratamentos(id),
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Policies para appointments
CREATE POLICY "Users can view appointments from their clinic"
ON public.appointments
FOR SELECT
USING (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can create appointments in their clinic"
ON public.appointments
FOR INSERT
WITH CHECK (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can update appointments from their clinic"
ON public.appointments
FOR UPDATE
USING (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can delete appointments from their clinic"
ON public.appointments
FOR DELETE
USING (clinic_id = get_user_clinic_id(auth.uid()));

-- Trigger para updated_at
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();