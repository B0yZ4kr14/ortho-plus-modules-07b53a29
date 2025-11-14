import { IncidenteCaixa, TipoIncidenteCaixa } from '@/domain/entities/IncidenteCaixa';
import { IIncidenteCaixaRepository } from '@/domain/repositories/IIncidenteCaixaRepository';
import { supabase } from '@/integrations/supabase/client';
import { IncidenteCaixaMapper } from './mappers/IncidenteCaixaMapper';

/**
 * Implementação do repositório de IncidenteCaixa usando Supabase
 */
export class SupabaseIncidenteCaixaRepository implements IIncidenteCaixaRepository {
  async findById(id: string): Promise<IncidenteCaixa | null> {
    const { data, error } = await supabase
      .from('caixa_incidentes')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return IncidenteCaixaMapper.toDomain(data);
  }

  async findByClinicId(clinicId: string): Promise<IncidenteCaixa[]> {
    const { data, error } = await supabase
      .from('caixa_incidentes')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('data_incidente', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(row => IncidenteCaixaMapper.toDomain(row));
  }

  async findByTipo(clinicId: string, tipo: TipoIncidenteCaixa): Promise<IncidenteCaixa[]> {
    const { data, error } = await supabase
      .from('caixa_incidentes')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('tipo_incidente', tipo)
      .order('data_incidente', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(row => IncidenteCaixaMapper.toDomain(row));
  }

  async findByPeriodo(clinicId: string, startDate: Date, endDate: Date): Promise<IncidenteCaixa[]> {
    const { data, error } = await supabase
      .from('caixa_incidentes')
      .select('*')
      .eq('clinic_id', clinicId)
      .gte('data_incidente', startDate.toISOString())
      .lte('data_incidente', endDate.toISOString())
      .order('data_incidente', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(row => IncidenteCaixaMapper.toDomain(row));
  }

  async findGraves(clinicId: string): Promise<IncidenteCaixa[]> {
    const { data, error } = await supabase
      .from('caixa_incidentes')
      .select('*')
      .eq('clinic_id', clinicId)
      .or('tipo_incidente.eq.ROUBO,valor_perdido.gt.1000')
      .order('data_incidente', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(row => IncidenteCaixaMapper.toDomain(row));
  }

  async save(incidente: IncidenteCaixa): Promise<void> {
    const insert = IncidenteCaixaMapper.toSupabaseInsert(incidente);

    const { error } = await supabase
      .from('caixa_incidentes')
      .insert(insert);

    if (error) {
      throw new Error(`Erro ao salvar incidente de caixa: ${error.message}`);
    }
  }

  async update(incidente: IncidenteCaixa): Promise<void> {
    const insert = IncidenteCaixaMapper.toSupabaseInsert(incidente);

    const { error } = await supabase
      .from('caixa_incidentes')
      .update(insert)
      .eq('id', incidente.id);

    if (error) {
      throw new Error(`Erro ao atualizar incidente de caixa: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('caixa_incidentes')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar incidente de caixa: ${error.message}`);
    }
  }
}
