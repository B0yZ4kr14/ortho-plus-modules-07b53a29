import { supabase } from '@/integrations/supabase/client';
import { Lead } from '../../domain/entities/Lead';
import { ILeadRepository } from '../../domain/repositories/ILeadRepository';
import { LeadMapper } from '../mappers/LeadMapper';

export class LeadRepositorySupabase implements ILeadRepository {
  async save(lead: Lead): Promise<Lead> {
    const data = LeadMapper.toPersistence(lead);
    
    const { data: savedData, error } = await supabase
      .from('crm_leads')
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(`Erro ao salvar lead: ${error.message}`);
    if (!savedData) throw new Error('Nenhum dado retornado ao salvar lead');

    return LeadMapper.toDomain(savedData);
  }

  async findById(id: string): Promise<Lead | null> {
    const { data, error } = await supabase
      .from('crm_leads')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Erro ao buscar lead: ${error.message}`);
    }

    return data ? LeadMapper.toDomain(data) : null;
  }

  async findByClinicId(clinicId: string): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('crm_leads')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Erro ao buscar leads: ${error.message}`);

    return data ? data.map(LeadMapper.toDomain) : [];
  }

  async findByResponsavel(responsavelId: string): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('crm_leads')
      .select('*')
      .eq('responsavel_id', responsavelId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Erro ao buscar leads do responsável: ${error.message}`);

    return data ? data.map(LeadMapper.toDomain) : [];
  }

  async findByStatus(clinicId: string, status: string): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('crm_leads')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Erro ao buscar leads por status: ${error.message}`);

    return data ? data.map(LeadMapper.toDomain) : [];
  }

  async update(lead: Lead): Promise<Lead> {
    const data = LeadMapper.toPersistence(lead);
    
    const { data: updatedData, error } = await supabase
      .from('crm_leads')
      .update(data)
      .eq('id', lead.id)
      .select()
      .single();

    if (error) throw new Error(`Erro ao atualizar lead: ${error.message}`);
    if (!updatedData) throw new Error('Nenhum dado retornado ao atualizar lead');

    return LeadMapper.toDomain(updatedData);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('crm_leads')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Erro ao deletar lead: ${error.message}`);
  }
}
