import { Produto } from '@/domain/entities/Produto';
import { MovimentacaoEstoque } from '@/domain/entities/MovimentacaoEstoque';
import { IProdutoRepository } from '@/domain/repositories/IProdutoRepository';
import { IMovimentacaoEstoqueRepository } from '@/domain/repositories/IMovimentacaoEstoqueRepository';

export interface RegistrarEntradaInput {
  produtoId: string;
  quantidade: number;
  valorUnitario?: number; // Se não fornecido, usa o valor do produto
  motivo?: string;
  observacoes?: string;
  usuarioId: string;
}

export interface RegistrarEntradaOutput {
  produto: Produto;
  movimentacao: MovimentacaoEstoque;
}

/**
 * Use Case: Registrar Entrada de Estoque
 * 
 * Registra uma entrada de mercadoria no estoque.
 * Cria movimentação e atualiza quantidade do produto.
 */
export class RegistrarEntradaUseCase {
  constructor(
    private readonly produtoRepository: IProdutoRepository,
    private readonly movimentacaoRepository: IMovimentacaoEstoqueRepository
  ) {}

  async execute(input: RegistrarEntradaInput): Promise<RegistrarEntradaOutput> {
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

    // Usar valor unitário fornecido ou o valor do produto
    const valorUnitario = input.valorUnitario ?? produto.valorUnitario;

    const quantidadeAnterior = produto.quantidadeAtual;

    // Criar movimentação
    const movimentacao = MovimentacaoEstoque.create({
      produtoId: produto.id,
      clinicId: produto.clinicId,
      tipo: 'ENTRADA',
      quantidade: input.quantidade,
      quantidadeAnterior,
      valorUnitario,
      motivo: input.motivo,
      observacoes: input.observacoes,
      usuarioId: input.usuarioId,
    });

    // Adicionar ao estoque do produto
    produto.adicionarEstoque(input.quantidade);

    // Persistir mudanças
    await this.movimentacaoRepository.save(movimentacao);
    await this.produtoRepository.update(produto);

    return { produto, movimentacao };
  }
}
