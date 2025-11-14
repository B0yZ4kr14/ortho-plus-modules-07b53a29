import { Produto } from '@/domain/entities/Produto';
import { IProdutoRepository } from '@/domain/repositories/IProdutoRepository';

export interface GetProdutoByIdInput {
  produtoId: string;
}

export interface GetProdutoByIdOutput {
  produto: Produto;
}

/**
 * Use Case: Buscar Produto por ID
 * 
 * Busca um produto específico pelo seu ID.
 */
export class GetProdutoByIdUseCase {
  constructor(
    private readonly produtoRepository: IProdutoRepository
  ) {}

  async execute(input: GetProdutoByIdInput): Promise<GetProdutoByIdOutput> {
    // Validações de input
    if (!input.produtoId?.trim()) {
      throw new Error('ID do produto é obrigatório');
    }

    // Buscar produto
    const produto = await this.produtoRepository.findById(input.produtoId);

    if (!produto) {
      throw new Error('Produto não encontrado');
    }

    return { produto };
  }
}
