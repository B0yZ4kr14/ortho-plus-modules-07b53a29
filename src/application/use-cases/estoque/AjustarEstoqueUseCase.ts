import { Produto } from '@/domain/entities/Produto';
import { MovimentacaoEstoque } from '@/domain/entities/MovimentacaoEstoque';
import { IProdutoRepository } from '@/domain/repositories/IProdutoRepository';
import { IMovimentacaoEstoqueRepository } from '@/domain/repositories/IMovimentacaoEstoqueRepository';

export interface AjustarEstoqueInput {
  produtoId: string;
  novaQuantidade: number;
  motivo: string; // Obrigatório para ajustes (auditoria)
  observacoes?: string;
  usuarioId: string;
}

export interface AjustarEstoqueOutput {
  produto: Produto;
  movimentacao: MovimentacaoEstoque;
}

/**
 * Use Case: Ajustar Estoque
 * 
 * Realiza ajuste manual de estoque (correção).
 * Cria movimentação de ajuste e atualiza quantidade do produto.
 * Requer motivo obrigatório para auditoria.
 */
export class AjustarEstoqueUseCase {
  constructor(
    private readonly produtoRepository: IProdutoRepository,
    private readonly movimentacaoRepository: IMovimentacaoEstoqueRepository
  ) {}

  async execute(input: AjustarEstoqueInput): Promise<AjustarEstoqueOutput> {
    // Validações de input
    if (!input.produtoId?.trim()) {
      throw new Error('ID do produto é obrigatório');
    }

    if (!input.usuarioId?.trim()) {
      throw new Error('ID do usuário é obrigatório');
    }

    if (!input.motivo?.trim()) {
      throw new Error('Motivo do ajuste é obrigatório');
    }

    if (input.novaQuantidade < 0) {
      throw new Error('Nova quantidade não pode ser negativa');
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

    // Criar movimentação de ajuste
    const movimentacao = MovimentacaoEstoque.create({
      produtoId: produto.id,
      clinicId: produto.clinicId,
      tipo: 'AJUSTE',
      quantidade: input.novaQuantidade, // No ajuste, a quantidade é absoluta
      quantidadeAnterior,
      valorUnitario: produto.valorUnitario,
      motivo: input.motivo,
      observacoes: input.observacoes,
      usuarioId: input.usuarioId,
    });

    // Ajustar estoque do produto
    produto.ajustarEstoque(input.novaQuantidade);

    // Persistir mudanças
    await this.movimentacaoRepository.save(movimentacao);
    await this.produtoRepository.update(produto);

    return { produto, movimentacao };
  }
}
