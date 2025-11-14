import { Produto } from '@/domain/entities/Produto';
import { IProdutoRepository } from '@/domain/repositories/IProdutoRepository';

export interface UpdateProdutoInput {
  produtoId: string;
  nome?: string;
  descricao?: string;
  categoria?: 'MATERIAL' | 'MEDICAMENTO' | 'EQUIPAMENTO' | 'CONSUMIVEL' | 'OUTRO';
  unidadeMedida?: 'UNIDADE' | 'CAIXA' | 'PACOTE' | 'LITRO' | 'ML' | 'GRAMA' | 'KG';
  quantidadeMinima?: number;
  valorUnitario?: number;
  codigoBarras?: string;
  fornecedor?: string;
  localizacao?: string;
  observacoes?: string;
}

export interface UpdateProdutoOutput {
  produto: Produto;
}

/**
 * Use Case: Atualizar Produto
 * 
 * Atualiza informações de um produto existente.
 * Validações de domínio são aplicadas pela entidade.
 */
export class UpdateProdutoUseCase {
  constructor(
    private readonly produtoRepository: IProdutoRepository
  ) {}

  async execute(input: UpdateProdutoInput): Promise<UpdateProdutoOutput> {
    // Validações de input
    if (!input.produtoId?.trim()) {
      throw new Error('ID do produto é obrigatório');
    }

    // Buscar produto existente
    const produto = await this.produtoRepository.findById(input.produtoId);

    if (!produto) {
      throw new Error('Produto não encontrado');
    }

    // Verificar se código de barras já existe em outro produto
    if (input.codigoBarras && input.codigoBarras !== produto.codigoBarras) {
      const produtoExistente = await this.produtoRepository.findByCodigoBarras(
        input.codigoBarras,
        produto.clinicId
      );

      if (produtoExistente && produtoExistente.id !== produto.id) {
        throw new Error(`Já existe outro produto com o código de barras: ${input.codigoBarras}`);
      }
    }

    // Atualizar produto (validações de domínio são aplicadas pela entidade)
    produto.atualizar({
      nome: input.nome,
      descricao: input.descricao,
      categoria: input.categoria,
      unidadeMedida: input.unidadeMedida,
      quantidadeMinima: input.quantidadeMinima,
      valorUnitario: input.valorUnitario,
      codigoBarras: input.codigoBarras,
      fornecedor: input.fornecedor,
      localizacao: input.localizacao,
      observacoes: input.observacoes,
    });

    // Persistir mudanças
    await this.produtoRepository.update(produto);

    return { produto };
  }
}
