import { IEvolucaoRepository } from '@/domain/repositories/IEvolucaoRepository';
import { Evolucao } from '@/domain/entities/Evolucao';
import { EvolucaoMapper } from '../mappers/EvolucaoMapper';
import { supabase } from '@/integrations/supabase/client';
import { InfrastructureError } from '../errors/InfrastructureError';

export class SupabaseEvolucaoRepository implements IEvolucaoRepository {
  async findById(id: string): Promise<Evolucao | null> {
    try {
      const { data, error } = await supabase
        .from('pep_evolucoes')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return EvolucaoMapper.toDomain(data);
    } catch (error) {
      throw new InfrastructureError('Erro ao buscar evolução', error);
    }
  }

  async findByTratamentoId(tratamentoId: string): Promise<Evolucao[]> {
    try {
      const { data, error } = await supabase
        .from('pep_evolucoes')
        .select('*')
        .eq('tratamento_id', tratamentoId)
        .order('data_evolucao', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map(EvolucaoMapper.toDomain);
    } catch (error) {
      throw new InfrastructureError('Erro ao buscar evoluções do tratamento', error);
    }
  }

  async findByProntuarioId(prontuarioId: string): Promise<Evolucao[]> {
    try {
      // Fazer join com pep_tratamentos para filtrar por prontuario_id
      const { data, error } = await supabase
        .from('pep_evolucoes')
        .select(`
          *,
          pep_tratamentos!inner(prontuario_id)
        `)
        .eq('pep_tratamentos.prontuario_id', prontuarioId)
        .order('data_evolucao', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map(EvolucaoMapper.toDomain);
    } catch (error) {
      throw new InfrastructureError('Erro ao buscar evoluções do prontuário', error);
    }
  }

  async findByClinicId(clinicId: string): Promise<Evolucao[]> {
    try {
      // Fazer join duplo: evolucoes -> tratamentos -> prontuarios
      const { data, error } = await supabase
        .from('pep_evolucoes')
        .select(`
          *,
          pep_tratamentos!inner(
            prontuario_id,
            prontuarios!inner(clinic_id)
          )
        `)
        .eq('pep_tratamentos.prontuarios.clinic_id', clinicId)
        .order('data_evolucao', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map(EvolucaoMapper.toDomain);
    } catch (error) {
      throw new InfrastructureError('Erro ao buscar evoluções da clínica', error);
    }
  }

  async findByDateRange(
    prontuarioId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Evolucao[]> {
    try {
      const { data, error } = await supabase
        .from('pep_evolucoes')
        .select(`
          *,
          pep_tratamentos!inner(prontuario_id)
        `)
        .eq('pep_tratamentos.prontuario_id', prontuarioId)
        .gte('data_evolucao', startDate.toISOString().split('T')[0])
        .lte('data_evolucao', endDate.toISOString().split('T')[0])
        .order('data_evolucao', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map(EvolucaoMapper.toDomain);
    } catch (error) {
      throw new InfrastructureError('Erro ao buscar evoluções por período', error);
    }
  }

  async findPendingSignature(prontuarioId: string): Promise<Evolucao[]> {
    // Como a tabela atual considera criação = assinatura, retornamos array vazio
    // Em uma implementação real, filtraremos por assinado_em IS NULL
    return [];
  }

  async save(evolucao: Evolucao): Promise<void> {
    try {
      const data = EvolucaoMapper.toInsert(evolucao);
      
      const { error } = await supabase
        .from('pep_evolucoes')
        .insert(data);

      if (error) throw error;
    } catch (error) {
      throw new InfrastructureError('Erro ao salvar evolução', error);
    }
  }

  async update(evolucao: Evolucao): Promise<void> {
    try {
      const data = EvolucaoMapper.toPersistence(evolucao);
      
      const { error } = await supabase
        .from('pep_evolucoes')
        .update(data)
        .eq('id', evolucao.id);

      if (error) throw error;
    } catch (error) {
      throw new InfrastructureError('Erro ao atualizar evolução', error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('pep_evolucoes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      throw new InfrastructureError('Erro ao deletar evolução', error);
    }
  }
}
