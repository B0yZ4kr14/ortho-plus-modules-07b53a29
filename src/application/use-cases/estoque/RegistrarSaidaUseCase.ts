import { Produto } from '@/domain/entities/Produto';
import { MovimentacaoEstoque } from '@/domain/entities/MovimentacaoEstoque';
import { IProdutoRepository } from '@/domain/repositories/IProdutoRepository';
import { IMovimentacaoEstoqueRepository } from '@/domain/repositories/IMovimentacaoEstoqueRepository';

export interface RegistrarSaidaInput {
  produtoId: string;
  quantidade: number;
  motivo?: string;
  observacoes?: string;
  usuarioId: string;
}

export interface RegistrarSaidaOutput {
  produto: Produto;
  movimentacao: MovimentacaoEstoque;
}

/**
 * Use Case: Registrar Saída de Estoque
 * 
 * Registra uma saída de mercadoria do estoque.
 * Cria movimentação e atualiza quantidade do produto.
 * Valida disponibilidade antes de processar.
 */
export class RegistrarSaidaUseCase {
  constructor(
    private readonly produtoRepository: IProdutoRepository,
    private readonly movimentacaoRepository: IMovimentacaoEstoqueRepository
  ) {}

  async execute(input: RegistrarSaidaInput): Promise<RegistrarSaidaOutput> {
    // Validações de input
    if (!input.produtoId?.trim()) {
      throw new Error('ID do produto é obrigatório');
    }

    if (!input.usuarioId?.trim()) {
      throw new Error('ID do usuário é obrigatório');
    }

    if (!input.quantidade || input.quantidade <= 0) {
      throw new Error('Quantidade deve ser maior que zero');
    }

    // Buscar produto
    const produto = await this.produtoRepository.findById(input.produtoId);

    if (!produto) {
      throw new Error('Produto não encontrado');
    }

    if (!produto.ativo) {
      throw new Error('Produto está inativo');
    }

    const quantidadeAnterior = produto.quantidadeAtual;

    // Criar movimentação (validará disponibilidade)
    const movimentacao = MovimentacaoEstoque.create({
      produtoId: produto.id,
      clinicId: produto.clinicId,
      tipo: 'SAIDA',
      quantidade: input.quantidade,
      quantidadeAnterior,
      valorUnitario: produto.valorUnitario,
      motivo: input.motivo,
      observacoes: input.observacoes,
      usuarioId: input.usuarioId,
    });

    // Remover do estoque do produto (validará disponibilidade novamente)
    produto.removerEstoque(input.quantidade);

    // Persistir mudanças
    await this.movimentacaoRepository.save(movimentacao);
    await this.produtoRepository.update(produto);

    return { produto, movimentacao };
  }
}
