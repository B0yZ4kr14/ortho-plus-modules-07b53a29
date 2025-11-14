import { ContaReceber } from '@/domain/entities/ContaReceber';
import { IContaReceberRepository } from '@/domain/repositories/IContaReceberRepository';

export interface CreateContaReceberInput {
  clinicId: string;
  patientId?: string;
  descricao: string;
  valor: number;
  dataEmissao: Date;
  dataVencimento: Date;
  parcelaNumero?: number;
  parcelaTotal?: number;
  observacoes?: string;
  createdBy?: string;
}

export interface CreateContaReceberOutput {
  conta: ContaReceber;
}

/**
 * Use Case: Criar Conta a Receber
 * 
 * Cria uma nova conta a receber (pagamentos de pacientes, etc.)
 */
export class CreateContaReceberUseCase {
  constructor(
    private readonly contaReceberRepository: IContaReceberRepository
  ) {}

  async execute(input: CreateContaReceberInput): Promise<CreateContaReceberOutput> {
    // Validações de input
    if (!input.clinicId?.trim()) {
      throw new Error('ID da clínica é obrigatório');
    }
    if (!input.descricao?.trim()) {
      throw new Error('Descrição é obrigatória');
    }
    if (input.valor <= 0) {
      throw new Error('Valor deve ser maior que zero');
    }
    if (input.dataVencimento < input.dataEmissao) {
      throw new Error('Data de vencimento não pode ser anterior à data de emissão');
    }

    // Criar entidade
    const conta = ContaReceber.create({
      clinicId: input.clinicId,
      patientId: input.patientId,
      descricao: input.descricao,
      valor: input.valor,
      dataEmissao: input.dataEmissao,
      dataVencimento: input.dataVencimento,
      parcelaNumero: input.parcelaNumero,
      parcelaTotal: input.parcelaTotal,
      observacoes: input.observacoes,
      createdBy: input.createdBy,
    });

    // Salvar no repositório
    await this.contaReceberRepository.save(conta);

    return { conta };
  }
}
