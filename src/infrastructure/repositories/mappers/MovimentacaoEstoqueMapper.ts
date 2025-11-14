import { MovimentacaoEstoque, MovimentacaoEstoqueProps } from '@/domain/entities/MovimentacaoEstoque';
import { Database } from '@/integrations/supabase/types';

type MovimentacaoRow = Database['public']['Tables']['movimentacoes_estoque']['Row'];
type MovimentacaoInsert = Database['public']['Tables']['movimentacoes_estoque']['Insert'];

/**
 * Mapper: MovimentacaoEstoque Entity <-> Supabase movimentacoes_estoque table
 */
export class MovimentacaoEstoqueMapper {
  /**
   * Converte row do Supabase para Entidade de Domínio
   */
  static toDomain(row: MovimentacaoRow): MovimentacaoEstoque {
    const props: MovimentacaoEstoqueProps = {
      id: row.id,
      produtoId: row.produto_id,
      clinicId: row.clinic_id,
      tipo: row.tipo as MovimentacaoEstoqueProps['tipo'],
      quantidade: Number(row.quantidade),
      quantidadeAnterior: Number(row.quantidade_anterior),
      quantidadeAtual: Number(row.quantidade_atual),
      valorUnitario: Number(row.valor_unitario),
      valorTotal: Number(row.valor_total),
      motivo: row.motivo ?? undefined,
      observacoes: row.observacoes ?? undefined,
      usuarioId: row.usuario_id,
      createdAt: new Date(row.created_at),
    };

    return MovimentacaoEstoque.restore(props);
  }

  /**
   * Converte Entidade de Domínio para Insert do Supabase
   */
  static toSupabaseInsert(entity: MovimentacaoEstoque): MovimentacaoInsert {
    return {
      id: entity.id,
      produto_id: entity.produtoId,
      clinic_id: entity.clinicId,
      tipo: entity.tipo,
      quantidade: entity.quantidade,
      quantidade_anterior: entity.quantidadeAnterior,
      quantidade_atual: entity.quantidadeAtual,
      valor_unitario: entity.valorUnitario,
      valor_total: entity.valorTotal,
      motivo: entity.motivo,
      observacoes: entity.observacoes,
      usuario_id: entity.usuarioId,
      created_at: entity.createdAt.toISOString(),
    };
  }
}
