import { IProntuarioRepository } from '@/domain/repositories/IProntuarioRepository';
import { Prontuario } from '@/domain/entities/Prontuario';
import { ProntuarioMapper } from '../mappers/ProntuarioMapper';
import { supabase } from '@/integrations/supabase/client';
import { InfrastructureError } from '../errors/InfrastructureError';
import { NotFoundError } from '../errors/NotFoundError';

export class SupabaseProntuarioRepository implements IProntuarioRepository {
  async findById(id: string): Promise<Prontuario | null> {
    try {
      const { data, error } = await supabase
        .from('prontuarios')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return ProntuarioMapper.toDomain(data);
    } catch (error) {
      throw new InfrastructureError('Erro ao buscar prontuário', error);
    }
  }

  async findByPatientId(patientId: string, clinicId: string): Promise<Prontuario | null> {
    try {
      const { data, error } = await supabase
        .from('prontuarios')
        .select('*')
        .eq('patient_id', patientId)
        .eq('clinic_id', clinicId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return ProntuarioMapper.toDomain(data);
    } catch (error) {
      throw new InfrastructureError('Erro ao buscar prontuário do paciente', error);
    }
  }

  async findByClinicId(clinicId: string): Promise<Prontuario[]> {
    try {
      const { data, error } = await supabase
        .from('prontuarios')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map(ProntuarioMapper.toDomain);
    } catch (error) {
      throw new InfrastructureError('Erro ao buscar prontuários da clínica', error);
    }
  }

  async findActiveByClinicId(clinicId: string): Promise<Prontuario[]> {
    // Como não temos campo de status, retornamos todos
    return this.findByClinicId(clinicId);
  }

  async findByNumero(numero: string, clinicId: string): Promise<Prontuario | null> {
    // Como não temos campo numero, usamos o ID como fallback
    try {
      const { data, error } = await supabase
        .from('prontuarios')
        .select('*')
        .eq('clinic_id', clinicId)
        .ilike('id', `%${numero}%`)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return ProntuarioMapper.toDomain(data);
    } catch (error) {
      throw new InfrastructureError('Erro ao buscar prontuário por número', error);
    }
  }

  async save(prontuario: Prontuario): Promise<void> {
    try {
      const data = ProntuarioMapper.toInsert(prontuario);
      
      const { error } = await supabase
        .from('prontuarios')
        .insert(data);

      if (error) throw error;
    } catch (error) {
      throw new InfrastructureError('Erro ao salvar prontuário', error);
    }
  }

  async update(prontuario: Prontuario): Promise<void> {
    try {
      const data = ProntuarioMapper.toPersistence(prontuario);
      
      const { error } = await supabase
        .from('prontuarios')
        .update(data)
        .eq('id', prontuario.id);

      if (error) throw error;
    } catch (error) {
      throw new InfrastructureError('Erro ao atualizar prontuário', error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('prontuarios')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      throw new InfrastructureError('Erro ao deletar prontuário', error);
    }
  }
}
