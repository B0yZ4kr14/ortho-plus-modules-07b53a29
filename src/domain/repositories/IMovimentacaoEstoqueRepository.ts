import { MovimentacaoEstoque } from '../entities/MovimentacaoEstoque';

/**
 * Interface do repositório de MovimentacaoEstoque
 * Define o contrato que os adapters de infraestrutura devem implementar
 */
export interface IMovimentacaoEstoqueRepository {
  /**
   * Busca uma movimentação por ID
   */
  findById(id: string): Promise<MovimentacaoEstoque | null>;

  /**
   * Busca todas as movimentações de um produto
   */
  findByProdutoId(produtoId: string): Promise<MovimentacaoEstoque[]>;

  /**
   * Busca movimentações de um produto em um período
   */
  findByProdutoAndDateRange(
    produtoId: string,
    startDate: Date,
    endDate: Date
  ): Promise<MovimentacaoEstoque[]>;

  /**
   * Busca todas as movimentações de uma clínica
   */
  findByClinicId(clinicId: string): Promise<MovimentacaoEstoque[]>;

  /**
   * Busca movimentações por tipo
   */
  findByTipo(
    clinicId: string,
    tipo: 'ENTRADA' | 'SAIDA' | 'AJUSTE'
  ): Promise<MovimentacaoEstoque[]>;

  /**
   * Busca movimentações de um usuário
   */
  findByUsuarioId(usuarioId: string): Promise<MovimentacaoEstoque[]>;

  /**
   * Salva uma nova movimentação
   */
  save(movimentacao: MovimentacaoEstoque): Promise<void>;

  /**
   * Remove uma movimentação (use com cuidado - auditoria)
   */
  delete(id: string): Promise<void>;
}
