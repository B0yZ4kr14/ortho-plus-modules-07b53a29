import { Lead } from '../../domain/entities/Lead';
import { ILeadRepository } from '../../domain/repositories/ILeadRepository';

interface GetLeadsByStatusInput {
  clinicId: string;
  status: string;
}

export class GetLeadsByStatusUseCase {
  constructor(private leadRepository: ILeadRepository) {}

  async execute(input: GetLeadsByStatusInput): Promise<Lead[]> {
    if (!input.clinicId) {
      throw new Error('ID da clínica é obrigatório');
    }

    return await this.leadRepository.findByStatus(input.clinicId, input.status);
  }
}
