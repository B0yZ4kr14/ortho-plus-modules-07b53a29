import { Agendamento } from '../entities/Agendamento';

/**
 * Interface do repositório de agendamentos
 * Define o contrato que os adapters de infraestrutura devem implementar
 */
export interface IAgendamentoRepository {
  /**
   * Busca um agendamento por ID
   */
  findById(id: string): Promise<Agendamento | null>;

  /**
   * Busca agendamentos de um dentista em um período
   */
  findByDentistAndDateRange(
    dentistId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Agendamento[]>;

  /**
   * Busca agendamentos de um paciente
   */
  findByPatientId(patientId: string, clinicId: string): Promise<Agendamento[]>;

  /**
   * Busca todos os agendamentos de uma clínica em um período
   */
  findByClinicAndDateRange(
    clinicId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Agendamento[]>;

  /**
   * Busca agendamentos por status
   */
  findByStatus(
    clinicId: string,
    status: 'AGENDADO' | 'CONFIRMADO' | 'EM_ATENDIMENTO' | 'CONCLUIDO' | 'CANCELADO' | 'FALTOU'
  ): Promise<Agendamento[]>;

  /**
   * Busca agendamentos ativos de uma clínica (não cancelados/concluídos)
   */
  findAtivos(clinicId: string): Promise<Agendamento[]>;

  /**
   * Verifica se há conflito de horário para um dentista
   */
  hasConflict(
    dentistId: string,
    startTime: Date,
    endTime: Date,
    excludeId?: string
  ): Promise<boolean>;

  /**
   * Salva um novo agendamento
   */
  save(agendamento: Agendamento): Promise<void>;

  /**
   * Atualiza um agendamento existente
   */
  update(agendamento: Agendamento): Promise<void>;

  /**
   * Remove um agendamento
   */
  delete(id: string): Promise<void>;
}
