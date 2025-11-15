import { supabase } from '@/integrations/supabase/client';
import { ItemOrcamento } from '../../domain/entities/ItemOrcamento';
import { IItemOrcamentoRepository } from '../../domain/repositories/IItemOrcamentoRepository';

export class SupabaseItemOrcamentoRepository implements IItemOrcamentoRepository {
  async findById(id: string): Promise<ItemOrcamento | null> {
    const { data, error } = await supabase
      .from('budget_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.toDomain(data);
  }

  async findByBudgetId(budgetId: string): Promise<ItemOrcamento[]> {
    const { data, error } = await supabase
      .from('budget_items')
      .select('*')
      .eq('budget_id', budgetId)
      .order('ordem', { ascending: true });

    if (error || !data) return [];
    return data.map(this.toDomain);
  }

  async save(item: ItemOrcamento): Promise<void> {
    const data = this.toPersistence(item);
    const { error } = await supabase.from('budget_items').insert(data);
    if (error) throw new Error(`Erro ao salvar item: ${error.message}`);
  }

  async update(item: ItemOrcamento): Promise<void> {
    const data = this.toPersistence(item);
    const { error } = await supabase
      .from('budget_items')
      .update(data)
      .eq('id', item.id);
    if (error) throw new Error(`Erro ao atualizar item: ${error.message}`);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('budget_items').delete().eq('id', id);
    if (error) throw new Error(`Erro ao deletar item: ${error.message}`);
  }

  async deleteByBudgetId(budgetId: string): Promise<void> {
    const { error } = await supabase.from('budget_items').delete().eq('budget_id', budgetId);
    if (error) throw new Error(`Erro ao deletar itens do orçamento: ${error.message}`);
  }

  private toDomain(data: any): ItemOrcamento {
    return ItemOrcamento.restore({
      id: data.id,
      budgetId: data.budget_id,
      ordem: data.ordem,
      descricao: data.descricao,
      procedimentoId: data.procedimento_id,
      denteRegiao: data.dente_regiao,
      quantidade: data.quantidade,
      valorUnitario: data.valor_unitario,
      descontoPercentual: data.desconto_percentual,
      descontoValor: data.desconto_valor,
      valorTotal: data.valor_total,
      observacoes: data.observacoes,
      createdAt: new Date(data.created_at),
    });
  }

  private toPersistence(item: ItemOrcamento): any {
    return {
      id: item.id,
      budget_id: item.budgetId,
      ordem: item.ordem,
      descricao: item.descricao,
      procedimento_id: item.procedimentoId,
      dente_regiao: item.denteRegiao,
      quantidade: item.quantidade,
      valor_unitario: item.valorUnitario,
      desconto_percentual: item.descontoPercentual,
      desconto_valor: item.descontoValor,
      valor_total: item.valorTotal,
      observacoes: item.observacoes,
      created_at: item.createdAt.toISOString(),
    };
  }
}
