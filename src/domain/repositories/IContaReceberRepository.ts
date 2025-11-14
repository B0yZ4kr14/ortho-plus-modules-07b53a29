import { ContaReceber } from '../entities/ContaReceber';

/**
 * Interface do repositório de Contas a Receber
 * Define o contrato que os adapters de infraestrutura devem implementar
 */
export interface IContaReceberRepository {
  /**
   * Busca uma conta por ID
   */
  findById(id: string): Promise<ContaReceber | null>;

  /**
   * Busca todas as contas de uma clínica
   */
  findByClinicId(clinicId: string): Promise<ContaReceber[]>;

  /**
   * Busca contas de um paciente específico
   */
  findByPatientId(clinicId: string, patientId: string): Promise<ContaReceber[]>;

  /**
   * Busca contas pendentes de uma clínica
   */
  findPendentes(clinicId: string): Promise<ContaReceber[]>;

  /**
   * Busca contas vencidas de uma clínica
   */
  findVencidas(clinicId: string): Promise<ContaReceber[]>;

  /**
   * Busca contas em um período
   */
  findByPeriodo(clinicId: string, startDate: Date, endDate: Date): Promise<ContaReceber[]>;

  /**
   * Salva uma nova conta
   */
  save(conta: ContaReceber): Promise<void>;

  /**
   * Atualiza uma conta existente
   */
  update(conta: ContaReceber): Promise<void>;

  /**
   * Remove uma conta
   */
  delete(id: string): Promise<void>;
}
