import { Prontuario } from '../entities/Prontuario';

/**
 * Interface do repositório de prontuários
 * Define o contrato que os adapters de infraestrutura devem implementar
 */
export interface IProntuarioRepository {
  /**
   * Busca um prontuário por ID
   */
  findById(id: string): Promise<Prontuario | null>;

  /**
   * Busca o prontuário de um paciente específico
   */
  findByPatientId(patientId: string, clinicId: string): Promise<Prontuario | null>;

  /**
   * Busca todos os prontuários de uma clínica
   */
  findByClinicId(clinicId: string): Promise<Prontuario[]>;

  /**
   * Busca prontuários ativos de uma clínica
   */
  findActiveByClinicId(clinicId: string): Promise<Prontuario[]>;

  /**
   * Busca prontuário por número
   */
  findByNumero(numero: string, clinicId: string): Promise<Prontuario | null>;

  /**
   * Salva um novo prontuário
   */
  save(prontuario: Prontuario): Promise<void>;

  /**
   * Atualiza um prontuário existente
   */
  update(prontuario: Prontuario): Promise<void>;

  /**
   * Remove um prontuário (soft delete)
   */
  delete(id: string): Promise<void>;
}
