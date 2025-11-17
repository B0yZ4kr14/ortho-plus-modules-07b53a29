/**
 * IPatientRepository - Repository interface do agregado Patient
 * 
 * Define contrato para persistência de pacientes.
 */

import { Patient } from '../entities/Patient';
import { PatientStatus } from '../value-objects/PatientStatus';

export interface PatientFilters {
  clinicId: string;
  statusCode?: string;
  searchTerm?: string;
  origemId?: string;
  promotorId?: string;
  campanhaId?: string;
  isActive?: boolean;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IPatientRepository {
  /**
   * Salva novo paciente
   */
  save(patient: Patient): Promise<void>;

  /**
   * Atualiza paciente existente
   */
  update(patient: Patient): Promise<void>;

  /**
   * Busca paciente por ID
   */
  findById(id: string, clinicId: string): Promise<Patient | null>;

  /**
   * Busca paciente por CPF
   */
  findByCPF(cpf: string, clinicId: string): Promise<Patient | null>;

  /**
   * Busca paciente por Email
   */
  findByEmail(email: string, clinicId: string): Promise<Patient | null>;

  /**
   * Lista pacientes com filtros e paginação
   */
  findMany(
    filters: PatientFilters,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<Patient>>;

  /**
   * Conta pacientes por status
   */
  countByStatus(clinicId: string): Promise<Record<string, number>>;

  /**
   * Registra mudança de status no histórico
   */
  saveStatusHistory(
    patientId: string,
    fromStatus: string | null,
    toStatus: string,
    reason: string,
    changedBy: string,
    metadata?: Record<string, any>
  ): Promise<void>;

  /**
   * Busca histórico de status do paciente
   */
  getStatusHistory(patientId: string): Promise<any[]>;

  /**
   * Verifica se paciente existe
   */
  exists(id: string, clinicId: string): Promise<boolean>;

  /**
   * Deleta paciente (soft delete)
   */
  delete(id: string, clinicId: string): Promise<void>;
}
