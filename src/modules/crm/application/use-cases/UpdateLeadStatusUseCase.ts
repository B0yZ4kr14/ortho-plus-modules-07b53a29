import { Lead, LeadStatus } from '../../domain/entities/Lead';
import { ILeadRepository } from '../../domain/repositories/ILeadRepository';

interface UpdateLeadStatusInput {
  leadId: string;
  newStatus: LeadStatus;
}

export class UpdateLeadStatusUseCase {
  constructor(private leadRepository: ILeadRepository) {}

  async execute(input: UpdateLeadStatusInput): Promise<Lead> {
    // Buscar lead
    const lead = await this.leadRepository.findById(input.leadId);
    
    if (!lead) {
      throw new Error('Lead não encontrado');
    }

    // Atualizar status
    lead.updateStatus(input.newStatus);

    // Persistir
    return await this.leadRepository.update(lead);
  }
}
