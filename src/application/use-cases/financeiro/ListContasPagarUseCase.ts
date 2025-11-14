import { ContaPagar, CategoriaContaPagar } from '@/domain/entities/ContaPagar';
import { IContaPagarRepository } from '@/domain/repositories/IContaPagarRepository';

export interface ListContasPagarInput {
  clinicId: string;
  apenasPendentes?: boolean;
  apenasVencidas?: boolean;
  fornecedor?: string;
  categoria?: CategoriaContaPagar;
  startDate?: Date;
  endDate?: Date;
}

export interface ListContasPagarOutput {
  contas: ContaPagar[];
}

/**
 * Use Case: Listar Contas a Pagar
 * 
 * Lista contas a pagar com filtros opcionais
 */
export class ListContasPagarUseCase {
  constructor(
    private readonly contaPagarRepository: IContaPagarRepository
  ) {}

  async execute(input: ListContasPagarInput): Promise<ListContasPagarOutput> {
    // Validações de input
    if (!input.clinicId?.trim()) {
      throw new Error('ID da clínica é obrigatório');
    }

    let contas: ContaPagar[];

    // Aplicar filtros
    if (input.apenasPendentes) {
      contas = await this.contaPagarRepository.findPendentes(input.clinicId);
    } else if (input.apenasVencidas) {
      contas = await this.contaPagarRepository.findVencidas(input.clinicId);
    } else if (input.fornecedor) {
      contas = await this.contaPagarRepository.findByFornecedor(input.clinicId, input.fornecedor);
    } else if (input.categoria) {
      contas = await this.contaPagarRepository.findByCategoria(input.clinicId, input.categoria);
    } else if (input.startDate && input.endDate) {
      contas = await this.contaPagarRepository.findByPeriodo(input.clinicId, input.startDate, input.endDate);
    } else {
      contas = await this.contaPagarRepository.findByClinicId(input.clinicId);
    }

    return { contas };
  }
}
