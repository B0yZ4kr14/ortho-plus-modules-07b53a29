import { ContaReceber } from '@/domain/entities/ContaReceber';
import { IContaReceberRepository } from '@/domain/repositories/IContaReceberRepository';

export interface ReceberContaInput {
  contaId: string;
  valorPago: number;
  dataPagamento: Date;
  formaPagamento: string;
  parcial?: boolean;
}

export interface ReceberContaOutput {
  conta: ContaReceber;
}

/**
 * Use Case: Receber Conta
 * 
 * Registra o recebimento (total ou parcial) de uma conta a receber
 */
export class ReceberContaUseCase {
  constructor(
    private readonly contaReceberRepository: IContaReceberRepository
  ) {}

  async execute(input: ReceberContaInput): Promise<ReceberContaOutput> {
    // Validações de input
    if (!input.contaId?.trim()) {
      throw new Error('ID da conta é obrigatório');
    }
    if (input.valorPago <= 0) {
      throw new Error('Valor recebido deve ser maior que zero');
    }
    if (!input.formaPagamento?.trim()) {
      throw new Error('Forma de pagamento é obrigatória');
    }

    // Buscar conta
    const conta = await this.contaReceberRepository.findById(input.contaId);
    if (!conta) {
      throw new Error('Conta não encontrada');
    }

    // Registrar recebimento
    if (input.parcial) {
      conta.receberParcial(input.valorPago, input.dataPagamento, input.formaPagamento);
    } else {
      conta.receber(input.valorPago, input.dataPagamento, input.formaPagamento);
    }

    // Atualizar no repositório
    await this.contaReceberRepository.update(conta);

    return { conta };
  }
}
