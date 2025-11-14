import { Atividade } from '../../domain/entities/Atividade';
import { IAtividadeRepository } from '../../domain/repositories/IAtividadeRepository';

interface CreateAtividadeInput {
  leadId: string;
  clinicId: string;
  tipo: string;
  titulo: string;
  descricao?: string;
  dataAgendada?: Date;
  responsavelId: string;
}

export class CreateAtividadeUseCase {
  constructor(private atividadeRepository: IAtividadeRepository) {}

  async execute(input: CreateAtividadeInput): Promise<Atividade> {
    // Validações
    if (!input.leadId) {
      throw new Error('ID do lead é obrigatório');
    }

    if (!input.titulo || input.titulo.trim().length === 0) {
      throw new Error('Título da atividade é obrigatório');
    }

    if (!input.responsavelId) {
      throw new Error('Responsável é obrigatório');
    }

    // Criar entidade Atividade
    const atividade = new Atividade({
      id: crypto.randomUUID(),
      leadId: input.leadId,
      clinicId: input.clinicId,
      tipo: input.tipo as any,
      titulo: input.titulo.trim(),
      descricao: input.descricao?.trim(),
      dataAgendada: input.dataAgendada,
      status: 'AGENDADA',
      responsavelId: input.responsavelId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Persistir
    return await this.atividadeRepository.save(atividade);
  }
}
