import { MovimentoCaixa } from '@/domain/entities/MovimentoCaixa';
import { IMovimentoCaixaRepository } from '@/domain/repositories/IMovimentoCaixaRepository';
import { supabase } from '@/integrations/supabase/client';
import { MovimentoCaixaMapper } from './mappers/MovimentoCaixaMapper';

/**
 * Implementação do repositório de MovimentoCaixa usando Supabase
 */
export class SupabaseMovimentoCaixaRepository implements IMovimentoCaixaRepository {
  async findById(id: string): Promise<MovimentoCaixa | null> {
    const { data, error } = await supabase
      .from('caixa_movimentos')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return MovimentoCaixaMapper.toDomain(data);
  }

  async findByClinicId(clinicId: string): Promise<MovimentoCaixa[]> {
    const { data, error } = await supabase
      .from('caixa_movimentos')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(row => MovimentoCaixaMapper.toDomain(row));
  }

  async findAbertos(clinicId: string): Promise<MovimentoCaixa[]> {
    const { data, error } = await supabase
      .from('caixa_movimentos')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('status', 'ABERTO')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(row => MovimentoCaixaMapper.toDomain(row));
  }

  async findUltimoAberto(clinicId: string): Promise<MovimentoCaixa | null> {
    const { data, error } = await supabase
      .from('caixa_movimentos')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('status', 'ABERTO')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return MovimentoCaixaMapper.toDomain(data);
  }

  async findByPeriodo(clinicId: string, startDate: Date, endDate: Date): Promise<MovimentoCaixa[]> {
    const { data, error } = await supabase
      .from('caixa_movimentos')
      .select('*')
      .eq('clinic_id', clinicId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(row => MovimentoCaixaMapper.toDomain(row));
  }

  async findSangrias(clinicId: string): Promise<MovimentoCaixa[]> {
    const { data, error } = await supabase
      .from('caixa_movimentos')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('tipo', 'SANGRIA')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(row => MovimentoCaixaMapper.toDomain(row));
  }

  async save(movimento: MovimentoCaixa): Promise<void> {
    const insert = MovimentoCaixaMapper.toSupabaseInsert(movimento);

    const { error } = await supabase
      .from('caixa_movimentos')
      .insert(insert);

    if (error) {
      throw new Error(`Erro ao salvar movimento de caixa: ${error.message}`);
    }
  }

  async update(movimento: MovimentoCaixa): Promise<void> {
    const insert = MovimentoCaixaMapper.toSupabaseInsert(movimento);

    const { error } = await supabase
      .from('caixa_movimentos')
      .update(insert)
      .eq('id', movimento.id);

    if (error) {
      throw new Error(`Erro ao atualizar movimento de caixa: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('caixa_movimentos')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar movimento de caixa: ${error.message}`);
    }
  }
}
