-- FASE 14: Módulo Enterprise de Pacientes
-- Tabela principal de pacientes com 85+ campos organizados por domínio

CREATE TABLE IF NOT EXISTS public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  
  -- IDENTIFICAÇÃO (15 campos)
  patient_code TEXT UNIQUE, -- Código interno da clínica
  full_name TEXT NOT NULL,
  social_name TEXT, -- Nome social (LGPD)
  cpf TEXT UNIQUE,
  rg TEXT,
  birth_date DATE NOT NULL,
  gender TEXT CHECK (gender IN ('masculino', 'feminino', 'outro', 'prefiro_nao_dizer')),
  marital_status TEXT CHECK (marital_status IN ('solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel')),
  nationality TEXT DEFAULT 'brasileiro',
  occupation TEXT,
  education_level TEXT,
  
  -- CONTATOS (8 campos)
  email TEXT,
  phone_primary TEXT NOT NULL,
  phone_secondary TEXT,
  phone_emergency TEXT,
  emergency_contact_name TEXT,
  emergency_contact_relationship TEXT,
  
  -- ENDEREÇO (8 campos)
  address_street TEXT,
  address_number TEXT,
  address_complement TEXT,
  address_neighborhood TEXT,
  address_city TEXT,
  address_state TEXT,
  address_zipcode TEXT,
  address_country TEXT DEFAULT 'Brasil',
  
  -- ANAMNESE - HISTÓRICO MÉDICO (20 campos)
  has_systemic_disease BOOLEAN DEFAULT false,
  systemic_diseases TEXT[], -- Array de doenças
  has_cardiovascular_disease BOOLEAN DEFAULT false,
  cardiovascular_details TEXT,
  has_diabetes BOOLEAN DEFAULT false,
  diabetes_type TEXT,
  diabetes_controlled BOOLEAN,
  has_hypertension BOOLEAN DEFAULT false,
  hypertension_controlled BOOLEAN,
  has_allergies BOOLEAN DEFAULT false,
  allergies_list TEXT[], -- Array de alergias
  has_medication_allergy BOOLEAN DEFAULT false,
  medication_allergies TEXT[],
  current_medications TEXT[], -- Medicamentos em uso
  has_bleeding_disorder BOOLEAN DEFAULT false,
  bleeding_disorder_details TEXT,
  is_pregnant BOOLEAN DEFAULT false,
  pregnancy_trimester INTEGER CHECK (pregnancy_trimester BETWEEN 1 AND 3),
  is_breastfeeding BOOLEAN DEFAULT false,
  has_hepatitis BOOLEAN DEFAULT false,
  hepatitis_type TEXT,
  has_hiv BOOLEAN DEFAULT false,
  has_smoking_habit BOOLEAN DEFAULT false,
  smoking_frequency TEXT,
  has_alcohol_habit BOOLEAN DEFAULT false,
  alcohol_frequency TEXT,
  
  -- EXAME CLÍNICO (12 campos)
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  heart_rate INTEGER,
  blood_type TEXT CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  weight_kg NUMERIC(5,2),
  height_cm INTEGER,
  bmi NUMERIC(4,2), -- Calculado automaticamente
  main_complaint TEXT, -- Queixa principal
  pain_level INTEGER CHECK (pain_level BETWEEN 0 AND 10),
  clinical_observations TEXT,
  oral_hygiene_quality TEXT CHECK (oral_hygiene_quality IN ('excelente', 'boa', 'regular', 'ruim')),
  gum_condition TEXT CHECK (gum_condition IN ('saudavel', 'gengivite', 'periodontite', 'outro')),
  
  -- RISK SCORE (5 campos - calculados automaticamente)
  risk_score_medical INTEGER DEFAULT 0 CHECK (risk_score_medical BETWEEN 0 AND 100),
  risk_score_surgical INTEGER DEFAULT 0 CHECK (risk_score_surgical BETWEEN 0 AND 100),
  risk_score_anesthetic INTEGER DEFAULT 0 CHECK (risk_score_anesthetic BETWEEN 0 AND 100),
  risk_score_overall INTEGER DEFAULT 0 CHECK (risk_score_overall BETWEEN 0 AND 100),
  risk_level TEXT CHECK (risk_level IN ('baixo', 'moderado', 'alto', 'critico')),
  
  -- FINANCEIRO (4 campos)
  total_debt NUMERIC(10,2) DEFAULT 0,
  total_paid NUMERIC(10,2) DEFAULT 0,
  payment_status TEXT DEFAULT 'em_dia' CHECK (payment_status IN ('em_dia', 'atrasado', 'inadimplente')),
  preferred_payment_method TEXT,
  
  -- LGPD E CONSENTIMENTOS (5 campos)
  lgpd_consent BOOLEAN DEFAULT false,
  lgpd_consent_date TIMESTAMPTZ,
  image_usage_consent BOOLEAN DEFAULT false,
  treatment_consent BOOLEAN DEFAULT false,
  data_sharing_consent BOOLEAN DEFAULT false,
  
  -- METADATA (6 campos)
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'arquivado')),
  first_appointment_date DATE,
  last_appointment_date DATE,
  total_appointments INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  -- Índices para performance
  CONSTRAINT unique_patient_code_per_clinic UNIQUE (clinic_id, patient_code)
);

-- Índices para otimização de consultas
CREATE INDEX idx_patients_clinic_id ON public.patients(clinic_id);
CREATE INDEX idx_patients_full_name ON public.patients(full_name);
CREATE INDEX idx_patients_cpf ON public.patients(cpf) WHERE cpf IS NOT NULL;
CREATE INDEX idx_patients_status ON public.patients(status);
CREATE INDEX idx_patients_risk_level ON public.patients(risk_level);
CREATE INDEX idx_patients_created_at ON public.patients(created_at DESC);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para calcular Risk Score automaticamente
CREATE OR REPLACE FUNCTION public.calculate_patient_risk_score()
RETURNS TRIGGER AS $$
DECLARE
  medical_score INTEGER := 0;
  surgical_score INTEGER := 0;
  anesthetic_score INTEGER := 0;
  overall_score INTEGER := 0;
BEGIN
  -- MEDICAL RISK SCORE (0-100)
  -- Doenças cardiovasculares: +25
  IF NEW.has_cardiovascular_disease THEN medical_score := medical_score + 25; END IF;
  
  -- Diabetes não controlada: +20
  IF NEW.has_diabetes AND NOT COALESCE(NEW.diabetes_controlled, false) THEN 
    medical_score := medical_score + 20; 
  END IF;
  
  -- Hipertensão não controlada: +15
  IF NEW.has_hypertension AND NOT COALESCE(NEW.hypertension_controlled, false) THEN 
    medical_score := medical_score + 15; 
  END IF;
  
  -- HIV/AIDS: +15
  IF NEW.has_hiv THEN medical_score := medical_score + 15; END IF;
  
  -- Hepatite: +10
  IF NEW.has_hepatitis THEN medical_score := medical_score + 10; END IF;
  
  -- Distúrbios de coagulação: +15
  IF NEW.has_bleeding_disorder THEN medical_score := medical_score + 15; END IF;
  
  -- SURGICAL RISK SCORE (0-100)
  surgical_score := medical_score; -- Base no risco médico
  
  -- Anticoagulantes: +20
  IF NEW.current_medications IS NOT NULL AND 
     (NEW.current_medications::text ILIKE ANY(ARRAY['%varfarina%', '%heparina%', '%clopidogrel%', '%aspirina%'])) THEN
    surgical_score := surgical_score + 20;
  END IF;
  
  -- Distúrbios de coagulação: +25
  IF NEW.has_bleeding_disorder THEN surgical_score := surgical_score + 25; END IF;
  
  -- ANESTHETIC RISK SCORE (0-100)
  anesthetic_score := medical_score; -- Base no risco médico
  
  -- Alergias a medicamentos: +20
  IF NEW.has_medication_allergy THEN anesthetic_score := anesthetic_score + 20; END IF;
  
  -- Doenças cardiovasculares: +15 adicional
  IF NEW.has_cardiovascular_disease THEN anesthetic_score := anesthetic_score + 15; END IF;
  
  -- OVERALL RISK SCORE (média ponderada)
  overall_score := (medical_score * 40 + surgical_score * 30 + anesthetic_score * 30) / 100;
  
  -- Limitar scores a 100
  medical_score := LEAST(medical_score, 100);
  surgical_score := LEAST(surgical_score, 100);
  anesthetic_score := LEAST(anesthetic_score, 100);
  overall_score := LEAST(overall_score, 100);
  
  -- Determinar nível de risco
  NEW.risk_score_medical := medical_score;
  NEW.risk_score_surgical := surgical_score;
  NEW.risk_score_anesthetic := anesthetic_score;
  NEW.risk_score_overall := overall_score;
  
  IF overall_score >= 75 THEN
    NEW.risk_level := 'critico';
  ELSIF overall_score >= 50 THEN
    NEW.risk_level := 'alto';
  ELSIF overall_score >= 25 THEN
    NEW.risk_level := 'moderado';
  ELSE
    NEW.risk_level := 'baixo';
  END IF;
  
  -- Calcular BMI se tiver peso e altura
  IF NEW.weight_kg IS NOT NULL AND NEW.height_cm IS NOT NULL AND NEW.height_cm > 0 THEN
    NEW.bmi := NEW.weight_kg / POWER(NEW.height_cm / 100.0, 2);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para calcular risk score
CREATE TRIGGER calculate_patient_risk_score_trigger
  BEFORE INSERT OR UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_patient_risk_score();

-- RLS Policies
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view patients from their clinic"
  ON public.patients FOR SELECT
  USING (clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create patients in their clinic"
  ON public.patients FOR INSERT
  WITH CHECK (clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update patients from their clinic"
  ON public.patients FOR UPDATE
  USING (clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete patients from their clinic"
  ON public.patients FOR DELETE
  USING (clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

-- Audit log para pacientes
CREATE OR REPLACE FUNCTION public.log_patient_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (clinic_id, user_id, action, details)
    VALUES (
      NEW.clinic_id,
      auth.uid(),
      'PATIENT_CREATED',
      jsonb_build_object(
        'patient_id', NEW.id,
        'patient_name', NEW.full_name,
        'risk_level', NEW.risk_level
      )
    );
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (clinic_id, user_id, action, details)
    VALUES (
      NEW.clinic_id,
      auth.uid(),
      'PATIENT_UPDATED',
      jsonb_build_object(
        'patient_id', NEW.id,
        'patient_name', NEW.full_name,
        'old_risk_level', OLD.risk_level,
        'new_risk_level', NEW.risk_level,
        'changes', jsonb_build_object(
          'medical_score_delta', NEW.risk_score_medical - OLD.risk_score_medical,
          'surgical_score_delta', NEW.risk_score_surgical - OLD.risk_score_surgical
        )
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER log_patient_changes_trigger
  AFTER INSERT OR UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.log_patient_changes();