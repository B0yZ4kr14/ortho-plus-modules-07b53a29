import { ContaReceber } from '@/domain/entities/ContaReceber';
import { IContaReceberRepository } from '@/domain/repositories/IContaReceberRepository';

export interface ListContasReceberInput {
  clinicId: string;
  apenasPendentes?: boolean;
  apenasVencidas?: boolean;
  patientId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface ListContasReceberOutput {
  contas: ContaReceber[];
}

/**
 * Use Case: Listar Contas a Receber
 * 
 * Lista contas a receber com filtros opcionais
 */
export class ListContasReceberUseCase {
  constructor(
    private readonly contaReceberRepository: IContaReceberRepository
  ) {}

  async execute(input: ListContasReceberInput): Promise<ListContasReceberOutput> {
    // Validações de input
    if (!input.clinicId?.trim()) {
      throw new Error('ID da clínica é obrigatório');
    }

    let contas: ContaReceber[];

    // Aplicar filtros
    if (input.apenasPendentes) {
      contas = await this.contaReceberRepository.findPendentes(input.clinicId);
    } else if (input.apenasVencidas) {
      contas = await this.contaReceberRepository.findVencidas(input.clinicId);
    } else if (input.patientId) {
      contas = await this.contaReceberRepository.findByPatientId(input.clinicId, input.patientId);
    } else if (input.startDate && input.endDate) {
      contas = await this.contaReceberRepository.findByPeriodo(input.clinicId, input.startDate, input.endDate);
    } else {
      contas = await this.contaReceberRepository.findByClinicId(input.clinicId);
    }

    return { contas };
  }
}
