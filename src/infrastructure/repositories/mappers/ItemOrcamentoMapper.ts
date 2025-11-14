import { ItemOrcamento, ItemOrcamentoProps } from '@/domain/entities/ItemOrcamento';
import { Database } from '@/integrations/supabase/types';

type BudgetItemRow = Database['public']['Tables']['budget_items']['Row'];
type BudgetItemInsert = Database['public']['Tables']['budget_items']['Insert'];

/**
 * Mapper: ItemOrcamento Entity <-> Supabase budget_items table
 */
export class ItemOrcamentoMapper {
  /**
   * Converte row do Supabase para Entidade de Domínio
   */
  static toDomain(row: BudgetItemRow): ItemOrcamento {
    const props: ItemOrcamentoProps = {
      id: row.id,
      orcamentoId: row.budget_id,
      procedimentoId: row.procedimento_id ?? undefined,
      descricao: row.descricao,
      denteRegiao: row.dente_regiao ?? undefined,
      quantidade: row.quantidade,
      valorUnitario: row.valor_unitario,
      descontoPercentual: row.desconto_percentual ?? 0,
      descontoValor: row.desconto_valor ?? 0,
      valorTotal: row.valor_total,
      ordem: row.ordem,
      observacoes: row.observacoes ?? undefined,
      createdAt: new Date(row.created_at),
    };

    return ItemOrcamento.restore(props);
  }

  /**
   * Converte Entidade de Domínio para Insert do Supabase
   */
  static toSupabaseInsert(entity: ItemOrcamento): BudgetItemInsert {
    return {
      id: entity.id,
      budget_id: entity.orcamentoId,
      procedimento_id: entity.procedimentoId,
      descricao: entity.descricao,
      dente_regiao: entity.denteRegiao,
      quantidade: entity.quantidade,
      valor_unitario: entity.valorUnitario,
      desconto_percentual: entity.descontoPercentual,
      desconto_valor: entity.descontoValor,
      valor_total: entity.valorTotal,
      ordem: entity.ordem,
      observacoes: entity.observacoes,
      created_at: entity.createdAt.toISOString(),
    };
  }
}
