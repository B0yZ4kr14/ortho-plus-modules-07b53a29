-- Corrigir search_path da função (dropar trigger primeiro)
DROP TRIGGER IF EXISTS trigger_atualizar_roi_campanha ON pacientes.campanhas_odontologicas;
DROP FUNCTION IF EXISTS pacientes.atualizar_roi_campanha() CASCADE;

CREATE OR REPLACE FUNCTION pacientes.atualizar_roi_campanha()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pacientes, public, pg_temp
AS $$
BEGIN
  NEW.roi := CASE 
    WHEN NEW.investimento_total > 0 
    THEN ((NEW.receita_gerada - NEW.investimento_total) / NEW.investimento_total) * 100
    ELSE 0
  END;
  
  NEW.custo_por_lead := CASE
    WHEN NEW.leads_gerados > 0
    THEN NEW.investimento_total / NEW.leads_gerados
    ELSE 0
  END;
  
  NEW.custo_por_paciente := CASE
    WHEN NEW.pacientes_convertidos > 0
    THEN NEW.investimento_total / NEW.pacientes_convertidos
    ELSE 0
  END;
  
  NEW.taxa_conversao_lead_paciente := CASE
    WHEN NEW.leads_gerados > 0
    THEN (NEW.pacientes_convertidos::DECIMAL / NEW.leads_gerados) * 100
    ELSE 0
  END;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

-- Recriar trigger
CREATE TRIGGER trigger_atualizar_roi_campanha
  BEFORE INSERT OR UPDATE ON pacientes.campanhas_odontologicas
  FOR EACH ROW
  EXECUTE FUNCTION pacientes.atualizar_roi_campanha();