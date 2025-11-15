import { Lead, LeadSource } from '../../domain/entities/Lead';
import { ILeadRepository } from '../../domain/repositories/ILeadRepository';

export interface CreateLeadInput {
  clinicId: string;
  nome: string;
  email?: string;
  telefone?: string;
  origem: LeadSource;
  interesseDescricao?: string;
  valorEstimado?: number;
  responsavelId?: string;
}

/**
 * Use Case: Criar Lead no CRM
 * 
 * Cria um novo lead no funil de vendas da clínica.
 * Validações de domínio aplicadas pela entidade.
 */
export class CreateLeadUseCase {
  constructor(private readonly leadRepository: ILeadRepository) {}

  async execute(input: CreateLeadInput): Promise<Lead> {
    if (!input.clinicId?.trim()) {
      throw new Error('ID da clínica é obrigatório');
    }

    if (!input.nome?.trim()) {
      throw new Error('Nome do lead é obrigatório');
    }

    if (!input.email && !input.telefone) {
      throw new Error('Email ou telefone é obrigatório');
    }

    // Criar entidade de domínio
    const lead = new Lead({
      id: crypto.randomUUID(),
      clinicId: input.clinicId,
      nome: input.nome,
      email: input.email,
      telefone: input.telefone,
      origem: input.origem,
      status: 'NOVO', // Status inicial
      interesseDescricao: input.interesseDescricao,
      valorEstimado: input.valorEstimado,
      responsavelId: input.responsavelId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Persistir no repositório
    const savedLead = await this.leadRepository.save(lead);

    return savedLead;
  }
}
