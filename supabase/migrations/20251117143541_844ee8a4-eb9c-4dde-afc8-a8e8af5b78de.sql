-- ============================================
-- CORREÇÃO ALTA A1: Adicionar search_path a Funções
-- ============================================

-- Identificar e corrigir funções SECURITY DEFINER sem search_path

-- 1. update_wiki_updated_at
CREATE OR REPLACE FUNCTION public.update_wiki_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. create_wiki_version
CREATE OR REPLACE FUNCTION public.create_wiki_version()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND (OLD.content != NEW.content OR OLD.title != NEW.title) THEN
    NEW.version = OLD.version + 1;
    INSERT INTO public.wiki_page_versions (page_id, version, title, content, changed_by, change_summary)
    VALUES (NEW.id, NEW.version, NEW.title, NEW.content, auth.uid(), 'Version ' || NEW.version::text);
  END IF;
  RETURN NEW;
END;
$$;

-- 3. cleanup_expired_patient_sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_patient_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.patient_sessions WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- 4. calculate_patient_risk_score
CREATE OR REPLACE FUNCTION public.calculate_patient_risk_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  medical_score INTEGER := 0;
  surgical_score INTEGER := 0;
  anesthetic_score INTEGER := 0;
  overall_score INTEGER := 0;
BEGIN
  -- MEDICAL RISK SCORE
  IF NEW.has_cardiovascular_disease THEN medical_score := medical_score + 25; END IF;
  IF NEW.has_diabetes AND NOT COALESCE(NEW.diabetes_controlled, false) THEN medical_score := medical_score + 20; END IF;
  IF NEW.has_hypertension AND NOT COALESCE(NEW.hypertension_controlled, false) THEN medical_score := medical_score + 15; END IF;
  IF NEW.has_hiv THEN medical_score := medical_score + 15; END IF;
  IF NEW.has_hepatitis THEN medical_score := medical_score + 10; END IF;
  IF NEW.has_bleeding_disorder THEN medical_score := medical_score + 15; END IF;
  
  surgical_score := medical_score;
  IF NEW.current_medications IS NOT NULL AND (NEW.current_medications::text ILIKE ANY(ARRAY['%varfarina%', '%heparina%', '%clopidogrel%', '%aspirina%'])) THEN
    surgical_score := surgical_score + 20;
  END IF;
  IF NEW.has_bleeding_disorder THEN surgical_score := surgical_score + 25; END IF;
  
  anesthetic_score := medical_score;
  IF NEW.has_medication_allergy THEN anesthetic_score := anesthetic_score + 20; END IF;
  IF NEW.has_cardiovascular_disease THEN anesthetic_score := anesthetic_score + 15; END IF;
  
  overall_score := (medical_score * 40 + surgical_score * 30 + anesthetic_score * 30) / 100;
  
  NEW.risk_score_medical := LEAST(medical_score, 100);
  NEW.risk_score_surgical := LEAST(surgical_score, 100);
  NEW.risk_score_anesthetic := LEAST(anesthetic_score, 100);
  NEW.risk_score_overall := LEAST(overall_score, 100);
  
  IF overall_score >= 75 THEN NEW.risk_level := 'critico';
  ELSIF overall_score >= 50 THEN NEW.risk_level := 'alto';
  ELSIF overall_score >= 25 THEN NEW.risk_level := 'moderado';
  ELSE NEW.risk_level := 'baixo';
  END IF;
  
  IF NEW.weight_kg IS NOT NULL AND NEW.height_cm IS NOT NULL AND NEW.height_cm > 0 THEN
    NEW.bmi := NEW.weight_kg / POWER(NEW.height_cm / 100.0, 2);
  END IF;
  
  RETURN NEW;
END;
$$;