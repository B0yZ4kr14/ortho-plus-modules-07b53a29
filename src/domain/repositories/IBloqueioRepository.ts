import { Bloqueio } from '../entities/Bloqueio';

/**
 * Interface do repositório de bloqueios
 * Define o contrato que os adapters de infraestrutura devem implementar
 */
export interface IBloqueioRepository {
  /**
   * Busca um bloqueio por ID
   */
  findById(id: string): Promise<Bloqueio | null>;

  /**
   * Busca bloqueios de um dentista em um período
   */
  findByDentistAndDateRange(
    dentistId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Bloqueio[]>;

  /**
   * Busca todos os bloqueios de uma clínica
   */
  findByClinicId(clinicId: string): Promise<Bloqueio[]>;

  /**
   * Busca bloqueios recorrentes de um dentista
   */
  findRecorrentesByDentist(dentistId: string): Promise<Bloqueio[]>;

  /**
   * Verifica se há bloqueio em um horário específico
   */
  hasBlockAt(
    dentistId: string,
    startTime: Date,
    endTime: Date
  ): Promise<boolean>;

  /**
   * Salva um novo bloqueio
   */
  save(bloqueio: Bloqueio): Promise<void>;

  /**
   * Atualiza um bloqueio existente
   */
  update(bloqueio: Bloqueio): Promise<void>;

  /**
   * Remove um bloqueio
   */
  delete(id: string): Promise<void>;
}
