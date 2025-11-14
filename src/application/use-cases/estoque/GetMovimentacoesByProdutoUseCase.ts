import { MovimentacaoEstoque } from '@/domain/entities/MovimentacaoEstoque';
import { IMovimentacaoEstoqueRepository } from '@/domain/repositories/IMovimentacaoEstoqueRepository';

export interface GetMovimentacoesByProdutoInput {
  produtoId: string;
  startDate?: Date;
  endDate?: Date;
}

export interface GetMovimentacoesByProdutoOutput {
  movimentacoes: MovimentacaoEstoque[];
}

/**
 * Use Case: Buscar Movimentações de um Produto
 * 
 * Busca o histórico de movimentações de um produto.
 * Opcionalmente filtra por período.
 */
export class GetMovimentacoesByProdutoUseCase {
  constructor(
    private readonly movimentacaoRepository: IMovimentacaoEstoqueRepository
  ) {}

  async execute(input: GetMovimentacoesByProdutoInput): Promise<GetMovimentacoesByProdutoOutput> {
    // Validações de input
    if (!input.produtoId?.trim()) {
      throw new Error('ID do produto é obrigatório');
    }

    // Buscar movimentações
    let movimentacoes: MovimentacaoEstoque[];

    if (input.startDate && input.endDate) {
      // Validar datas
      if (input.endDate < input.startDate) {
        throw new Error('Data de fim deve ser posterior à data de início');
      }

      movimentacoes = await this.movimentacaoRepository.findByProdutoAndDateRange(
        input.produtoId,
        input.startDate,
        input.endDate
      );
    } else {
      movimentacoes = await this.movimentacaoRepository.findByProdutoId(input.produtoId);
    }

    return { movimentacoes };
  }
}
