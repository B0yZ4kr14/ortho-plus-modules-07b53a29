import { Odontograma } from '../entities/Odontograma';

/**
 * Interface do repositório de Odontograma
 * Define o contrato que os adapters de infraestrutura devem implementar
 */
export interface IOdontogramaRepository {
  /**
   * Busca um odontograma por ID
   */
  findById(id: string): Promise<Odontograma | null>;

  /**
   * Busca o odontograma de um prontuário específico
   */
  findByProntuarioId(prontuarioId: string): Promise<Odontograma | null>;

  /**
   * Busca todos os odontogramas de uma clínica
   */
  findByClinicId(clinicId: string): Promise<Odontograma[]>;

  /**
   * Salva um novo odontograma
   */
  save(odontograma: Odontograma): Promise<void>;

  /**
   * Atualiza um odontograma existente
   */
  update(odontograma: Odontograma): Promise<void>;

  /**
   * Remove um odontograma
   */
  delete(id: string): Promise<void>;
}
