import { Produto } from '@/domain/entities/Produto';
import { IProdutoRepository } from '@/domain/repositories/IProdutoRepository';

export interface ListProdutosByClinicInput {
  clinicId: string;
  apenasAtivos?: boolean;
}

export interface ListProdutosByClinicOutput {
  produtos: Produto[];
}

/**
 * Use Case: Listar Produtos da Clínica
 * 
 * Lista todos os produtos de uma clínica.
 * Opcionalmente filtra apenas produtos ativos.
 */
export class ListProdutosByClinicUseCase {
  constructor(
    private readonly produtoRepository: IProdutoRepository
  ) {}

  async execute(input: ListProdutosByClinicInput): Promise<ListProdutosByClinicOutput> {
    // Validações de input
    if (!input.clinicId?.trim()) {
      throw new Error('ID da clínica é obrigatório');
    }

    // Buscar produtos
    const produtos = input.apenasAtivos
      ? await this.produtoRepository.findActiveByClinicId(input.clinicId)
      : await this.produtoRepository.findByClinicId(input.clinicId);

    return { produtos };
  }
}
