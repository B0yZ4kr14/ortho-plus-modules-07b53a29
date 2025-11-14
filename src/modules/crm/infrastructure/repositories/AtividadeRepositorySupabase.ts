import { supabase } from '@/integrations/supabase/client';
import { Atividade } from '../../domain/entities/Atividade';
import { IAtividadeRepository } from '../../domain/repositories/IAtividadeRepository';
import { AtividadeMapper } from '../mappers/AtividadeMapper';

export class AtividadeRepositorySupabase implements IAtividadeRepository {
  async save(atividade: Atividade): Promise<Atividade> {
    const data = AtividadeMapper.toPersistence(atividade);
    
    const { data: savedData, error } = await supabase
      .from('crm_activities')
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(`Erro ao salvar atividade: ${error.message}`);
    if (!savedData) throw new Error('Nenhum dado retornado ao salvar atividade');

    return AtividadeMapper.toDomain(savedData);
  }

  async findById(id: string): Promise<Atividade | null> {
    const { data, error } = await supabase
      .from('crm_activities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Erro ao buscar atividade: ${error.message}`);
    }

    return data ? AtividadeMapper.toDomain(data) : null;
  }

  async findByLeadId(leadId: string): Promise<Atividade[]> {
    const { data, error } = await supabase
      .from('crm_activities')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Erro ao buscar atividades do lead: ${error.message}`);

    return data?.map(AtividadeMapper.toDomain) ?? [];
  }

  async findByResponsavel(responsavelId: string): Promise<Atividade[]> {
    const { data, error } = await supabase
      .from('crm_activities')
      .select('*')
      .eq('assigned_to', responsavelId)
      .order('scheduled_date', { ascending: true });

    if (error) throw new Error(`Erro ao buscar atividades do responsável: ${error.message}`);

    return data?.map(AtividadeMapper.toDomain) ?? [];
  }

  async findAgendadasPorData(clinicId: string, data: Date): Promise<Atividade[]> {
    const startOfDay = new Date(data);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(data);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: activities, error } = await supabase
      .from('crm_activities')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('status', 'AGENDADA')
      .gte('scheduled_date', startOfDay.toISOString())
      .lte('scheduled_date', endOfDay.toISOString())
      .order('scheduled_date', { ascending: true });

    if (error) throw new Error(`Erro ao buscar atividades agendadas: ${error.message}`);

    return activities?.map(AtividadeMapper.toDomain) ?? [];
  }

  async update(atividade: Atividade): Promise<Atividade> {
    const data = AtividadeMapper.toPersistence(atividade);
    
    const { data: updatedData, error } = await supabase
      .from('crm_activities')
      .update(data)
      .eq('id', atividade.id)
      .select()
      .single();

    if (error) throw new Error(`Erro ao atualizar atividade: ${error.message}`);
    if (!updatedData) throw new Error('Nenhum dado retornado ao atualizar atividade');

    return AtividadeMapper.toDomain(updatedData);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('crm_activities')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Erro ao deletar atividade: ${error.message}`);
  }
}
