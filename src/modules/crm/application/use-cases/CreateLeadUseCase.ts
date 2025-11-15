import { Lead } from '../../domain/entities/Lead';
import { ILeadRepository } from '../../domain/repositories/ILeadRepository';

interface CreateLeadInput {
  clinicId: string;
  nome: string;
  email?: string;
  telefone?: string;
  origem: string;
  interesseDescricao?: string;
  valorEstimado?: number;
  responsavelId?: string;
}

export class CreateLeadUseCase {
  constructor(private leadRepository: ILeadRepository) {}

  async execute(input: CreateLeadInput): Promise<Lead> {
    // Validações
    if (!input.nome || input.nome.trim().length === 0) {
      throw new Error('Nome do lead é obrigatório');
    }

    if (!input.email && !input.telefone) {
      throw new Error('Email ou telefone é obrigatório');
    }

    if (!input.clinicId) {
      throw new Error('ID da clínica é obrigatório');
    }

    // Criar entidade Lead
    const lead = new Lead({
      id: crypto.randomUUID(),
      clinicId: input.clinicId,
      nome: input.nome.trim(),
      email: input.email?.trim(),
      telefone: input.telefone?.trim(),
      origem: input.origem as any,
      status: 'NOVO',
      interesseDescricao: input.interesseDescricao?.trim(),
      valorEstimado: input.valorEstimado,
      responsavelId: input.responsavelId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Persistir
    return await this.leadRepository.save(lead);
  }
}
