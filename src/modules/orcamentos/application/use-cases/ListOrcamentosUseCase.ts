import { Orcamento, StatusOrcamento } from '../../domain/entities/Orcamento';
import { IOrcamentoRepository } from '../../domain/repositories/IOrcamentoRepository';

export interface ListOrcamentosInput {
  clinicId: string;
  status?: StatusOrcamento;
  patientId?: string;
}

export interface ListOrcamentosOutput {
  orcamentos: Orcamento[];
}

export class ListOrcamentosUseCase {
  constructor(private readonly orcamentoRepository: IOrcamentoRepository) {}

  async execute(input: ListOrcamentosInput): Promise<ListOrcamentosOutput> {
    let orcamentos: Orcamento[];

    if (input.patientId) {
      orcamentos = await this.orcamentoRepository.findByPatientId(input.patientId, input.clinicId);
    } else if (input.status) {
      orcamentos = await this.orcamentoRepository.findByStatus(input.clinicId, input.status);
    } else {
      orcamentos = await this.orcamentoRepository.findByClinicId(input.clinicId);
    }

    return { orcamentos };
  }
}
