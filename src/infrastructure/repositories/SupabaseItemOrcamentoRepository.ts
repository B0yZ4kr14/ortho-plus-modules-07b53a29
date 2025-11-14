import { ItemOrcamento } from '@/domain/entities/ItemOrcamento';
import { IItemOrcamentoRepository } from '@/domain/repositories/IItemOrcamentoRepository';
import { supabase } from '@/integrations/supabase/client';
import { ItemOrcamentoMapper } from './mappers/ItemOrcamentoMapper';

/**
 * Implementação do repositório de Itens de Orçamento usando Supabase
 */
export class SupabaseItemOrcamentoRepository implements IItemOrcamentoRepository {
  async findById(id: string): Promise<ItemOrcamento | null> {
    const { data, error } = await supabase
      .from('budget_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return ItemOrcamentoMapper.toDomain(data);
  }

  async findByOrcamentoId(orcamentoId: string): Promise<ItemOrcamento[]> {
    const { data, error } = await supabase
      .from('budget_items')
      .select('*')
      .eq('budget_id', orcamentoId)
      .order('ordem', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map(row => ItemOrcamentoMapper.toDomain(row));
  }

  async save(item: ItemOrcamento): Promise<void> {
    const insert = ItemOrcamentoMapper.toSupabaseInsert(item);

    const { error } = await supabase
      .from('budget_items')
      .insert(insert);

    if (error) {
      throw new Error(`Erro ao salvar item de orçamento: ${error.message}`);
    }
  }

  async update(item: ItemOrcamento): Promise<void> {
    const insert = ItemOrcamentoMapper.toSupabaseInsert(item);

    const { error } = await supabase
      .from('budget_items')
      .update(insert)
      .eq('id', item.id);

    if (error) {
      throw new Error(`Erro ao atualizar item de orçamento: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('budget_items')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar item de orçamento: ${error.message}`);
    }
  }

  async deleteByOrcamentoId(orcamentoId: string): Promise<void> {
    const { error } = await supabase
      .from('budget_items')
      .delete()
      .eq('budget_id', orcamentoId);

    if (error) {
      throw new Error(`Erro ao deletar itens do orçamento: ${error.message}`);
    }
  }
}
