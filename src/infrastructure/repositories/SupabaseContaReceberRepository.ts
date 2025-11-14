import { ContaReceber } from '@/domain/entities/ContaReceber';
import { IContaReceberRepository } from '@/domain/repositories/IContaReceberRepository';
import { supabase } from '@/integrations/supabase/client';
import { ContaReceberMapper } from './mappers/ContaReceberMapper';

/**
 * Implementação do repositório de ContaReceber usando Supabase
 */
export class SupabaseContaReceberRepository implements IContaReceberRepository {
  async findById(id: string): Promise<ContaReceber | null> {
    const { data, error } = await supabase
      .from('contas_receber')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return ContaReceberMapper.toDomain(data);
  }

  async findByClinicId(clinicId: string): Promise<ContaReceber[]> {
    const { data, error } = await supabase
      .from('contas_receber')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('data_vencimento', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map(row => ContaReceberMapper.toDomain(row));
  }

  async findByPatientId(clinicId: string, patientId: string): Promise<ContaReceber[]> {
    const { data, error } = await supabase
      .from('contas_receber')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('patient_id', patientId)
      .order('data_vencimento', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map(row => ContaReceberMapper.toDomain(row));
  }

  async findPendentes(clinicId: string): Promise<ContaReceber[]> {
    const { data, error } = await supabase
      .from('contas_receber')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('status', 'PENDENTE')
      .order('data_vencimento', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map(row => ContaReceberMapper.toDomain(row));
  }

  async findVencidas(clinicId: string): Promise<ContaReceber[]> {
    const hoje = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('contas_receber')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('status', 'PENDENTE')
      .lt('data_vencimento', hoje)
      .order('data_vencimento', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map(row => ContaReceberMapper.toDomain(row));
  }

  async findByPeriodo(clinicId: string, startDate: Date, endDate: Date): Promise<ContaReceber[]> {
    const { data, error } = await supabase
      .from('contas_receber')
      .select('*')
      .eq('clinic_id', clinicId)
      .gte('data_vencimento', startDate.toISOString())
      .lte('data_vencimento', endDate.toISOString())
      .order('data_vencimento', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map(row => ContaReceberMapper.toDomain(row));
  }

  async save(conta: ContaReceber): Promise<void> {
    const insert = ContaReceberMapper.toSupabaseInsert(conta);

    const { error } = await supabase
      .from('contas_receber')
      .insert(insert);

    if (error) {
      throw new Error(`Erro ao salvar conta a receber: ${error.message}`);
    }
  }

  async update(conta: ContaReceber): Promise<void> {
    const insert = ContaReceberMapper.toSupabaseInsert(conta);

    const { error } = await supabase
      .from('contas_receber')
      .update(insert)
      .eq('id', conta.id);

    if (error) {
      throw new Error(`Erro ao atualizar conta a receber: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('contas_receber')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar conta a receber: ${error.message}`);
    }
  }
}
