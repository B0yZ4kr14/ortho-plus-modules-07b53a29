import { Produto } from '@/domain/entities/Produto';
import { IProdutoRepository } from '@/domain/repositories/IProdutoRepository';

export interface CreateProdutoInput {
  clinicId: string;
  nome: string;
  descricao?: string;
  categoria: 'MATERIAL' | 'MEDICAMENTO' | 'EQUIPAMENTO' | 'CONSUMIVEL' | 'OUTRO';
  unidadeMedida: 'UNIDADE' | 'CAIXA' | 'PACOTE' | 'LITRO' | 'ML' | 'GRAMA' | 'KG';
  quantidadeAtual: number;
  quantidadeMinima: number;
  valorUnitario: number;
  codigoBarras?: string;
  fornecedor?: string;
  localizacao?: string;
  observacoes?: string;
}

export interface CreateProdutoOutput {
  produto: Produto;
}

/**
 * Use Case: Criar Produto
 * 
 * Cria um novo produto no estoque da clínica.
 * Validações de domínio são aplicadas pela entidade.
 */
export class CreateProdutoUseCase {
  constructor(
    private readonly produtoRepository: IProdutoRepository
  ) {}

  async execute(input: CreateProdutoInput): Promise<CreateProdutoOutput> {
    // Validações de input
    if (!input.clinicId?.trim()) {
      throw new Error('ID da clínica é obrigatório');
    }

    if (!input.nome?.trim()) {
      throw new Error('Nome do produto é obrigatório');
    }

    // Verificar se código de barras já existe (se fornecido)
    if (input.codigoBarras) {
      const produtoExistente = await this.produtoRepository.findByCodigoBarras(
        input.codigoBarras,
        input.clinicId
      );

      if (produtoExistente) {
        throw new Error(`Já existe um produto com o código de barras: ${input.codigoBarras}`);
      }
    }

    // Criar entidade de produto (aplica validações de domínio)
    const produto = Produto.create({
      clinicId: input.clinicId,
      nome: input.nome,
      descricao: input.descricao,
      categoria: input.categoria,
      unidadeMedida: input.unidadeMedida,
      quantidadeAtual: input.quantidadeAtual,
      quantidadeMinima: input.quantidadeMinima,
      valorUnitario: input.valorUnitario,
      codigoBarras: input.codigoBarras,
      fornecedor: input.fornecedor,
      localizacao: input.localizacao,
      observacoes: input.observacoes,
    });

    // Persistir no repositório
    await this.produtoRepository.save(produto);

    return { produto };
  }
}
