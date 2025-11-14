import { ContaPagar } from '@/domain/entities/ContaPagar';
import { IContaPagarRepository } from '@/domain/repositories/IContaPagarRepository';

export interface PagarContaInput {
  contaId: string;
  valorPago: number;
  dataPagamento: Date;
  formaPagamento: string;
  parcial?: boolean;
}

export interface PagarContaOutput {
  conta: ContaPagar;
}

/**
 * Use Case: Pagar Conta
 * 
 * Registra o pagamento (total ou parcial) de uma conta a pagar
 */
export class PagarContaUseCase {
  constructor(
    private readonly contaPagarRepository: IContaPagarRepository
  ) {}

  async execute(input: PagarContaInput): Promise<PagarContaOutput> {
    // Validações de input
    if (!input.contaId?.trim()) {
      throw new Error('ID da conta é obrigatório');
    }
    if (input.valorPago <= 0) {
      throw new Error('Valor pago deve ser maior que zero');
    }
    if (!input.formaPagamento?.trim()) {
      throw new Error('Forma de pagamento é obrigatória');
    }

    // Buscar conta
    const conta = await this.contaPagarRepository.findById(input.contaId);
    if (!conta) {
      throw new Error('Conta não encontrada');
    }

    // Registrar pagamento
    if (input.parcial) {
      conta.pagarParcial(input.valorPago, input.dataPagamento, input.formaPagamento);
    } else {
      conta.pagar(input.valorPago, input.dataPagamento, input.formaPagamento);
    }

    // Atualizar no repositório
    await this.contaPagarRepository.update(conta);

    return { conta };
  }
}
