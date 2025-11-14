import { ContaPagar, CategoriaContaPagar } from '@/domain/entities/ContaPagar';
import { IContaPagarRepository } from '@/domain/repositories/IContaPagarRepository';

export interface CreateContaPagarInput {
  clinicId: string;
  descricao: string;
  fornecedor: string;
  categoria: CategoriaContaPagar;
  valor: number;
  dataEmissao: Date;
  dataVencimento: Date;
  recorrente?: boolean;
  periodicidade?: string;
  parcelaNumero?: number;
  parcelaTotal?: number;
  observacoes?: string;
  anexoUrl?: string;
  createdBy?: string;
}

export interface CreateContaPagarOutput {
  conta: ContaPagar;
}

/**
 * Use Case: Criar Conta a Pagar
 * 
 * Cria uma nova conta a pagar (fornecedores, despesas, etc.)
 */
export class CreateContaPagarUseCase {
  constructor(
    private readonly contaPagarRepository: IContaPagarRepository
  ) {}

  async execute(input: CreateContaPagarInput): Promise<CreateContaPagarOutput> {
    // Validações de input
    if (!input.clinicId?.trim()) {
      throw new Error('ID da clínica é obrigatório');
    }
    if (!input.descricao?.trim()) {
      throw new Error('Descrição é obrigatória');
    }
    if (!input.fornecedor?.trim()) {
      throw new Error('Fornecedor é obrigatório');
    }
    if (input.valor <= 0) {
      throw new Error('Valor deve ser maior que zero');
    }
    if (input.dataVencimento < input.dataEmissao) {
      throw new Error('Data de vencimento não pode ser anterior à data de emissão');
    }

    // Criar entidade
    const conta = ContaPagar.create({
      clinicId: input.clinicId,
      descricao: input.descricao,
      fornecedor: input.fornecedor,
      categoria: input.categoria,
      valor: input.valor,
      dataEmissao: input.dataEmissao,
      dataVencimento: input.dataVencimento,
      recorrente: input.recorrente || false,
      periodicidade: input.periodicidade,
      parcelaNumero: input.parcelaNumero,
      parcelaTotal: input.parcelaTotal,
      observacoes: input.observacoes,
      anexoUrl: input.anexoUrl,
      createdBy: input.createdBy,
    });

    // Salvar no repositório
    await this.contaPagarRepository.save(conta);

    return { conta };
  }
}
