import { Evolucao } from '../entities/Evolucao';

/**
 * Interface do repositório de evoluções
 * Define o contrato que os adapters de infraestrutura devem implementar
 */
export interface IEvolucaoRepository {
  /**
   * Busca uma evolução por ID
   */
  findById(id: string): Promise<Evolucao | null>;

  /**
   * Busca todas as evoluções de um tratamento
   */
  findByTratamentoId(tratamentoId: string): Promise<Evolucao[]>;

  /**
   * Busca todas as evoluções de um prontuário
   */
  findByProntuarioId(prontuarioId: string): Promise<Evolucao[]>;

  /**
   * Busca evoluções de uma clínica
   */
  findByClinicId(clinicId: string): Promise<Evolucao[]>;

  /**
   * Busca evoluções por período
   */
  findByDateRange(prontuarioId: string, startDate: Date, endDate: Date): Promise<Evolucao[]>;

  /**
   * Busca evoluções não assinadas
   */
  findPendingSignature(prontuarioId: string): Promise<Evolucao[]>;

  /**
   * Salva uma nova evolução
   */
  save(evolucao: Evolucao): Promise<void>;

  /**
   * Atualiza uma evolução existente
   */
  update(evolucao: Evolucao): Promise<void>;

  /**
   * Remove uma evolução
   */
  delete(id: string): Promise<void>;
}
