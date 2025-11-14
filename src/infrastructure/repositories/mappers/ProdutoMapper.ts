import { Produto, ProdutoProps } from '@/domain/entities/Produto';
import { Database } from '@/integrations/supabase/types';

type ProdutoRow = Database['public']['Tables']['produtos']['Row'];
type ProdutoInsert = Database['public']['Tables']['produtos']['Insert'];

/**
 * Mapper: Produto Entity <-> Supabase produtos table
 */
export class ProdutoMapper {
  /**
   * Converte row do Supabase para Entidade de Domínio
   */
  static toDomain(row: ProdutoRow): Produto {
    const props: ProdutoProps = {
      id: row.id,
      clinicId: row.clinic_id,
      nome: row.nome,
      descricao: row.descricao ?? undefined,
      categoria: row.categoria as ProdutoProps['categoria'],
      unidadeMedida: row.unidade_medida as ProdutoProps['unidadeMedida'],
      quantidadeAtual: Number(row.quantidade_atual),
      quantidadeMinima: Number(row.quantidade_minima),
      valorUnitario: Number(row.valor_unitario),
      codigoBarras: row.codigo_barras ?? undefined,
      fornecedor: row.fornecedor ?? undefined,
      localizacao: row.localizacao ?? undefined,
      observacoes: row.observacoes ?? undefined,
      ativo: row.ativo,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };

    return Produto.restore(props);
  }

  /**
   * Converte Entidade de Domínio para Insert do Supabase
   */
  static toSupabaseInsert(entity: Produto): ProdutoInsert {
    return {
      id: entity.id,
      clinic_id: entity.clinicId,
      nome: entity.nome,
      descricao: entity.descricao,
      categoria: entity.categoria,
      unidade_medida: entity.unidadeMedida,
      quantidade_atual: entity.quantidadeAtual,
      quantidade_minima: entity.quantidadeMinima,
      valor_unitario: entity.valorUnitario,
      codigo_barras: entity.codigoBarras,
      fornecedor: entity.fornecedor,
      localizacao: entity.localizacao,
      observacoes: entity.observacoes,
      ativo: entity.ativo,
      created_at: entity.createdAt.toISOString(),
      updated_at: entity.updatedAt.toISOString(),
    };
  }
}
