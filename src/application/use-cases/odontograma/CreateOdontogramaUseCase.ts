/**
 * FASE 2 - TASK 2.3: Create Odontograma Use Case
 */

import { Odontograma } from '@/domain/entities/Odontograma';

export interface CreateOdontogramaDTO {
  prontuarioId: string;
}

export interface IOdontogramaRepository {
  save(odontograma: Odontograma): Promise<void>;
  findByProntuario(prontuarioId: string): Promise<Odontograma | null>;
}

export class CreateOdontogramaUseCase {
  constructor(private repository: IOdontogramaRepository) {}

  async execute(dto: CreateOdontogramaDTO): Promise<Odontograma> {
    // Verificar se já existe odontograma para este prontuário
    const existing = await this.repository.findByProntuario(dto.prontuarioId);
    if (existing) {
      throw new Error('Já existe um odontograma para este prontuário');
    }

    // Criar novo odontograma usando entity existente
    const odontograma = Odontograma.create({
      prontuarioId: dto.prontuarioId,
    });

    // Persistir
    await this.repository.save(odontograma);

    return odontograma;
  }
}
