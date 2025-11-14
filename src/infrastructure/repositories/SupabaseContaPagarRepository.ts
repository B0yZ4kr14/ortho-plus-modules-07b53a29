import { ContaPagar, CategoriaContaPagar } from '@/domain/entities/ContaPagar';
import { IContaPagarRepository } from '@/domain/repositories/IContaPagarRepository';
import { supabase } from '@/integrations/supabase/client';
import { ContaPagarMapper } from './mappers/ContaPagarMapper';

/**
 * Implementação do repositório de ContaPagar usando Supabase
 */
export class SupabaseContaPagarRepository implements IContaPagarRepository {
  async findById(id: string): Promise<ContaPagar | null> {
    const { data, error } = await supabase
      .from('contas_pagar')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return ContaPagarMapper.toDomain(data);
  }

  async findByClinicId(clinicId: string): Promise<ContaPagar[]> {
    const { data, error } = await supabase
      .from('contas_pagar')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('data_vencimento', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map(row => ContaPagarMapper.toDomain(row));
  }

  async findPendentes(clinicId: string): Promise<ContaPagar[]> {
    const { data, error } = await supabase
      .from('contas_pagar')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('status', 'PENDENTE')
      .order('data_vencimento', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map(row => ContaPagarMapper.toDomain(row));
  }

  async findVencidas(clinicId: string): Promise<ContaPagar[]> {
    const hoje = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('contas_pagar')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('status', 'PENDENTE')
      .lt('data_vencimento', hoje)
      .order('data_vencimento', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map(row => ContaPagarMapper.toDomain(row));
  }

  async findByFornecedor(clinicId: string, fornecedor: string): Promise<ContaPagar[]> {
    const { data, error } = await supabase
      .from('contas_pagar')
      .select('*')
      .eq('clinic_id', clinicId)
      .ilike('fornecedor', `%${fornecedor}%`)
      .order('data_vencimento', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map(row => ContaPagarMapper.toDomain(row));
  }

  async findByCategoria(clinicId: string, categoria: CategoriaContaPagar): Promise<ContaPagar[]> {
    const { data, error } = await supabase
      .from('contas_pagar')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('categoria', categoria)
      .order('data_vencimento', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map(row => ContaPagarMapper.toDomain(row));
  }

  async findByPeriodo(clinicId: string, startDate: Date, endDate: Date): Promise<ContaPagar[]> {
    const { data, error } = await supabase
      .from('contas_pagar')
      .select('*')
      .eq('clinic_id', clinicId)
      .gte('data_vencimento', startDate.toISOString())
      .lte('data_vencimento', endDate.toISOString())
      .order('data_vencimento', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map(row => ContaPagarMapper.toDomain(row));
  }

  async save(conta: ContaPagar): Promise<void> {
    const insert = ContaPagarMapper.toSupabaseInsert(conta);

    const { error } = await supabase
      .from('contas_pagar')
      .insert(insert);

    if (error) {
      throw new Error(`Erro ao salvar conta a pagar: ${error.message}`);
    }
  }

  async update(conta: ContaPagar): Promise<void> {
    const insert = ContaPagarMapper.toSupabaseInsert(conta);

    const { error } = await supabase
      .from('contas_pagar')
      .update(insert)
      .eq('id', conta.id);

    if (error) {
      throw new Error(`Erro ao atualizar conta a pagar: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('contas_pagar')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar conta a pagar: ${error.message}`);
    }
  }
}
