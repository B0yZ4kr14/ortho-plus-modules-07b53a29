import { ITratamentoRepository } from '@/domain/repositories/ITratamentoRepository';
import { Tratamento } from '@/domain/entities/Tratamento';
import { TratamentoMapper } from '../mappers/TratamentoMapper';
import { supabase } from '@/integrations/supabase/client';
import { InfrastructureError } from '../errors/InfrastructureError';
import { NotFoundError } from '../errors/NotFoundError';

export class SupabaseTratamentoRepository implements ITratamentoRepository {
  async findById(id: string): Promise<Tratamento | null> {
    try {
      const { data, error } = await supabase
        .from('pep_tratamentos')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return TratamentoMapper.toDomain(data);
    } catch (error) {
      throw new InfrastructureError('Erro ao buscar tratamento', error);
    }
  }

  async findByProntuarioId(prontuarioId: string): Promise<Tratamento[]> {
    try {
      // ✅ OTIMIZAÇÃO FASE 3: JOIN para evitar N+1 queries
      const { data, error } = await supabase
        .from('pep_tratamentos')
        .select(`
          *,
          prontuarios!inner(
            id,
            clinic_id,
            patient_id
          )
        `)
        .eq('prontuario_id', prontuarioId)
        .order('data_inicio', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map(TratamentoMapper.toDomain);
    } catch (error) {
      throw new InfrastructureError('Erro ao buscar tratamentos do prontuário', error);
    }
  }

  async findByStatus(
    prontuarioId: string,
    status: 'PLANEJADO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO'
  ): Promise<Tratamento[]> {
    try {
      const { data, error } = await supabase
        .from('pep_tratamentos')
        .select('*')
        .eq('prontuario_id', prontuarioId)
        .eq('status', status)
        .order('data_inicio', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map(TratamentoMapper.toDomain);
    } catch (error) {
      throw new InfrastructureError('Erro ao buscar tratamentos por status', error);
    }
  }

  async findAtivos(prontuarioId: string): Promise<Tratamento[]> {
    try {
      const { data, error } = await supabase
        .from('pep_tratamentos')
        .select('*')
        .eq('prontuario_id', prontuarioId)
        .in('status', ['PLANEJADO', 'EM_ANDAMENTO'])
        .order('data_inicio', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map(TratamentoMapper.toDomain);
    } catch (error) {
      throw new InfrastructureError('Erro ao buscar tratamentos ativos', error);
    }
  }

  async findByClinicId(clinicId: string): Promise<Tratamento[]> {
    try {
      // Precisamos fazer join com prontuarios para filtrar por clinic_id
      const { data, error } = await supabase
        .from('pep_tratamentos')
        .select(`
          *,
          prontuarios!inner(clinic_id)
        `)
        .eq('prontuarios.clinic_id', clinicId)
        .order('data_inicio', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map(TratamentoMapper.toDomain);
    } catch (error) {
      throw new InfrastructureError('Erro ao buscar tratamentos da clínica', error);
    }
  }

  async save(tratamento: Tratamento): Promise<void> {
    try {
      const data = TratamentoMapper.toInsert(tratamento);
      
      const { error } = await supabase
        .from('pep_tratamentos')
        .insert(data);

      if (error) throw error;
    } catch (error) {
      throw new InfrastructureError('Erro ao salvar tratamento', error);
    }
  }

  async update(tratamento: Tratamento): Promise<void> {
    try {
      const data = TratamentoMapper.toPersistence(tratamento);
      
      const { error } = await supabase
        .from('pep_tratamentos')
        .update(data)
        .eq('id', tratamento.id);

      if (error) throw error;
    } catch (error) {
      throw new InfrastructureError('Erro ao atualizar tratamento', error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('pep_tratamentos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      throw new InfrastructureError('Erro ao deletar tratamento', error);
    }
  }
}
