import { Odontograma } from '@/domain/entities/Odontograma';
import { IOdontogramaRepository } from '@/domain/repositories/IOdontogramaRepository';
import { supabase } from '@/integrations/supabase/client';
import { OdontogramaMapper } from './mappers/OdontogramaMapper';

/**
 * Implementação do repositório de Odontograma usando Supabase
 */
export class SupabaseOdontogramaRepository implements IOdontogramaRepository {
  async findById(id: string): Promise<Odontograma | null> {
    const { data, error } = await supabase
      .from('odontogramas')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return OdontogramaMapper.toDomain(data);
  }

  async findByProntuarioId(prontuarioId: string): Promise<Odontograma | null> {
    const { data, error } = await supabase
      .from('odontogramas')
      .select('*')
      .eq('prontuario_id', prontuarioId)
      .single();

    if (error || !data) {
      return null;
    }

    return OdontogramaMapper.toDomain(data);
  }

  async findByClinicId(clinicId: string): Promise<Odontograma[]> {
    const { data, error } = await supabase
      .from('odontogramas')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('updated_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(row => OdontogramaMapper.toDomain(row));
  }

  async save(odontograma: Odontograma): Promise<void> {
    // Buscar clinic_id do prontuário
    const { data: prontuario, error: prontuarioError } = await supabase
      .from('prontuarios')
      .select('clinic_id')
      .eq('id', odontograma.prontuarioId)
      .single();

    if (prontuarioError || !prontuario) {
      throw new Error('Prontuário não encontrado');
    }

    const insert = OdontogramaMapper.toSupabaseInsert(odontograma, prontuario.clinic_id);

    const { error } = await supabase
      .from('odontogramas')
      .insert(insert);

    if (error) {
      throw new Error(`Erro ao salvar odontograma: ${error.message}`);
    }
  }

  async update(odontograma: Odontograma): Promise<void> {
    // Buscar clinic_id do prontuário
    const { data: prontuario, error: prontuarioError } = await supabase
      .from('prontuarios')
      .select('clinic_id')
      .eq('id', odontograma.prontuarioId)
      .single();

    if (prontuarioError || !prontuario) {
      throw new Error('Prontuário não encontrado');
    }

    const insert = OdontogramaMapper.toSupabaseInsert(odontograma, prontuario.clinic_id);

    const { error } = await supabase
      .from('odontogramas')
      .update(insert)
      .eq('id', odontograma.id);

    if (error) {
      throw new Error(`Erro ao atualizar odontograma: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('odontogramas')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar odontograma: ${error.message}`);
    }
  }
}
