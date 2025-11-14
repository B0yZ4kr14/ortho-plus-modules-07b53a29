import { Tratamento } from '../entities/Tratamento';

/**
 * Interface do repositório de tratamentos
 * Define o contrato que os adapters de infraestrutura devem implementar
 */
export interface ITratamentoRepository {
  /**
   * Busca um tratamento por ID
   */
  findById(id: string): Promise<Tratamento | null>;

  /**
   * Busca todos os tratamentos de um prontuário
   */
  findByProntuarioId(prontuarioId: string): Promise<Tratamento[]>;

  /**
   * Busca tratamentos por status
   */
  findByStatus(prontuarioId: string, status: 'PLANEJADO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO'): Promise<Tratamento[]>;

  /**
   * Busca tratamentos ativos (planejados ou em andamento)
   */
  findAtivos(prontuarioId: string): Promise<Tratamento[]>;

  /**
   * Busca tratamentos de uma clínica
   */
  findByClinicId(clinicId: string): Promise<Tratamento[]>;

  /**
   * Salva um novo tratamento
   */
  save(tratamento: Tratamento): Promise<void>;

  /**
   * Atualiza um tratamento existente
   */
  update(tratamento: Tratamento): Promise<void>;

  /**
   * Remove um tratamento
   */
  delete(id: string): Promise<void>;
}
