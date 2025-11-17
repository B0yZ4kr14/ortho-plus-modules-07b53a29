/**
 * PatientRepositoryPostgres - Implementação PostgreSQL
 * 
 * Implementa IPatientRepository usando PostgreSQL com schema isolado.
 */

import {
  IPatientRepository,
  PatientFilters,
  PaginationOptions,
  PaginatedResult,
} from '../../domain/repositories/IPatientRepository';
import { Patient, PatientProps } from '../../domain/entities/Patient';
import { PatientStatus } from '../../domain/value-objects/PatientStatus';
import { DadosComerciaisVO } from '../../domain/value-objects/DadosComerciaisVO';
import { IDatabaseConnection } from '@/infrastructure/database/IDatabaseConnection';
import { logger } from '@/infrastructure/logger';

export class PatientRepositoryPostgres implements IPatientRepository {
  constructor(private db: IDatabaseConnection) {}

  async save(patient: Patient): Promise<void> {
    const props = patient.toObject();

    await this.db.query(
      `INSERT INTO pacientes.patients (
        id, clinic_id, full_name, cpf, rg, birth_date, gender,
        email, phone, mobile, address_street, address_number,
        address_complement, address_neighborhood, address_city,
        address_state, address_zipcode, status_code,
        campanha_origem_id, origem_id, promotor_id, evento_id,
        telemarketing_agent, escolaridade, estado_civil, profissao,
        empresa, renda_mensal, notes, is_active,
        created_at, updated_at, created_by, updated_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
        $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26,
        $27, $28, $29, $30, $31, $32, $33, $34
      )`,
      [
        props.id,
        props.clinicId,
        props.fullName,
        props.cpf,
        props.rg,
        props.birthDate,
        props.gender,
        props.email,
        props.phone,
        props.mobile,
        props.addressStreet,
        props.addressNumber,
        props.addressComplement,
        props.addressNeighborhood,
        props.addressCity,
        props.addressState,
        props.addressZipcode,
        props.status.code,
        props.dadosComerciais?.campanhaOrigemId,
        props.dadosComerciais?.origemId,
        props.dadosComerciais?.promotorId,
        props.dadosComerciais?.eventoId,
        props.dadosComerciais?.telemarketingAgent,
        props.dadosComerciais?.escolaridade,
        props.dadosComerciais?.estadoCivil,
        props.dadosComerciais?.profissao,
        props.dadosComerciais?.empresa,
        props.dadosComerciais?.rendaMensal,
        props.notes,
        props.isActive,
        props.createdAt,
        props.updatedAt,
        props.createdBy,
        props.updatedBy,
      ]
    );

    logger.debug('Patient saved', { patientId: props.id });
  }

  async update(patient: Patient): Promise<void> {
    const props = patient.toObject();

    await this.db.query(
      `UPDATE pacientes.patients SET
        full_name = $3, cpf = $4, rg = $5, birth_date = $6, gender = $7,
        email = $8, phone = $9, mobile = $10, address_street = $11,
        address_number = $12, address_complement = $13, address_neighborhood = $14,
        address_city = $15, address_state = $16, address_zipcode = $17,
        status_code = $18, campanha_origem_id = $19, origem_id = $20,
        promotor_id = $21, evento_id = $22, telemarketing_agent = $23,
        escolaridade = $24, estado_civil = $25, profissao = $26,
        empresa = $27, renda_mensal = $28, notes = $29, is_active = $30,
        updated_at = $31, updated_by = $32
      WHERE id = $1 AND clinic_id = $2`,
      [
        props.id,
        props.clinicId,
        props.fullName,
        props.cpf,
        props.rg,
        props.birthDate,
        props.gender,
        props.email,
        props.phone,
        props.mobile,
        props.addressStreet,
        props.addressNumber,
        props.addressComplement,
        props.addressNeighborhood,
        props.addressCity,
        props.addressState,
        props.addressZipcode,
        props.status.code,
        props.dadosComerciais?.campanhaOrigemId,
        props.dadosComerciais?.origemId,
        props.dadosComerciais?.promotorId,
        props.dadosComerciais?.eventoId,
        props.dadosComerciais?.telemarketingAgent,
        props.dadosComerciais?.escolaridade,
        props.dadosComerciais?.estadoCivil,
        props.dadosComerciais?.profissao,
        props.dadosComerciais?.empresa,
        props.dadosComerciais?.rendaMensal,
        props.notes,
        props.isActive,
        props.updatedAt,
        props.updatedBy,
      ]
    );

    logger.debug('Patient updated', { patientId: props.id });
  }

  async findById(id: string, clinicId: string): Promise<Patient | null> {
    const result = await this.db.query(
      `SELECT * FROM pacientes.patients WHERE id = $1 AND clinic_id = $2`,
      [id, clinicId]
    );

    if (result.rows.length === 0) return null;

    return this.toDomain(result.rows[0]);
  }

  async findByCPF(cpf: string, clinicId: string): Promise<Patient | null> {
    const result = await this.db.query(
      `SELECT * FROM pacientes.patients WHERE cpf = $1 AND clinic_id = $2`,
      [cpf, clinicId]
    );

    if (result.rows.length === 0) return null;

    return this.toDomain(result.rows[0]);
  }

  async findByEmail(email: string, clinicId: string): Promise<Patient | null> {
    const result = await this.db.query(
      `SELECT * FROM pacientes.patients WHERE email = $1 AND clinic_id = $2`,
      [email, clinicId]
    );

    if (result.rows.length === 0) return null;

    return this.toDomain(result.rows[0]);
  }

  async findMany(
    filters: PatientFilters,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<Patient>> {
    // Build WHERE clause dynamically
    const conditions: string[] = ['clinic_id = $1'];
    const params: any[] = [filters.clinicId];
    let paramIndex = 2;

    if (filters.statusCode) {
      conditions.push(`status_code = $${paramIndex++}`);
      params.push(filters.statusCode);
    }

    if (filters.origemId) {
      conditions.push(`origem_id = $${paramIndex++}`);
      params.push(filters.origemId);
    }

    if (filters.promotorId) {
      conditions.push(`promotor_id = $${paramIndex++}`);
      params.push(filters.promotorId);
    }

    if (filters.campanhaId) {
      conditions.push(`campanha_origem_id = $${paramIndex++}`);
      params.push(filters.campanhaId);
    }

    if (filters.isActive !== undefined) {
      conditions.push(`is_active = $${paramIndex++}`);
      params.push(filters.isActive);
    }

    if (filters.searchTerm) {
      conditions.push(`(full_name ILIKE $${paramIndex} OR cpf ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`);
      params.push(`%${filters.searchTerm}%`);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    // Count total
    const countResult = await this.db.query(
      `SELECT COUNT(*) as total FROM pacientes.patients WHERE ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    // Query with pagination
    const offset = (pagination.page - 1) * pagination.limit;
    const sortBy = pagination.sortBy || 'created_at';
    const sortOrder = pagination.sortOrder || 'desc';

    const result = await this.db.query(
      `SELECT * FROM pacientes.patients 
       WHERE ${whereClause}
       ORDER BY ${sortBy} ${sortOrder}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, pagination.limit, offset]
    );

    const patients = result.rows.map((row) => this.toDomain(row));

    return {
      data: patients,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async countByStatus(clinicId: string): Promise<Record<string, number>> {
    const result = await this.db.query(
      `SELECT status_code, COUNT(*) as count
       FROM pacientes.patients
       WHERE clinic_id = $1 AND is_active = true
       GROUP BY status_code`,
      [clinicId]
    );

    const counts: Record<string, number> = {};
    for (const row of result.rows) {
      counts[row.status_code] = parseInt(row.count);
    }

    return counts;
  }

  async saveStatusHistory(
    patientId: string,
    fromStatus: string | null,
    toStatus: string,
    reason: string,
    changedBy: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.db.query(
      `INSERT INTO pacientes.patient_status_history 
       (patient_id, from_status, to_status, reason, changed_by, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [patientId, fromStatus, toStatus, reason, changedBy, JSON.stringify(metadata || {})]
    );
  }

  async getStatusHistory(patientId: string): Promise<any[]> {
    const result = await this.db.query(
      `SELECT * FROM pacientes.patient_status_history
       WHERE patient_id = $1
       ORDER BY changed_at DESC`,
      [patientId]
    );

    return result.rows;
  }

  async exists(id: string, clinicId: string): Promise<boolean> {
    const result = await this.db.query(
      `SELECT 1 FROM pacientes.patients WHERE id = $1 AND clinic_id = $2`,
      [id, clinicId]
    );
    return result.rows.length > 0;
  }

  async delete(id: string, clinicId: string): Promise<void> {
    // Soft delete
    await this.db.query(
      `UPDATE pacientes.patients SET is_active = false, updated_at = NOW()
       WHERE id = $1 AND clinic_id = $2`,
      [id, clinicId]
    );
  }

  // Mapper: DB row -> Domain entity
  private toDomain(row: any): Patient {
    const status = PatientStatus.fromCode(row.status_code);

    const dadosComerciais =
      row.campanha_origem_id ||
      row.origem_id ||
      row.promotor_id ||
      row.evento_id ||
      row.telemarketing_agent ||
      row.escolaridade ||
      row.estado_civil ||
      row.profissao ||
      row.empresa ||
      row.renda_mensal
        ? new DadosComerciaisVO({
            campanhaOrigemId: row.campanha_origem_id,
            origemId: row.origem_id,
            promotorId: row.promotor_id,
            eventoId: row.evento_id,
            telemarketingAgent: row.telemarketing_agent,
            escolaridade: row.escolaridade,
            estadoCivil: row.estado_civil,
            profissao: row.profissao,
            empresa: row.empresa,
            rendaMensal: row.renda_mensal,
          })
        : undefined;

    const props: PatientProps = {
      id: row.id,
      clinicId: row.clinic_id,
      fullName: row.full_name,
      cpf: row.cpf,
      rg: row.rg,
      birthDate: row.birth_date ? new Date(row.birth_date) : undefined,
      gender: row.gender,
      email: row.email,
      phone: row.phone,
      mobile: row.mobile,
      addressStreet: row.address_street,
      addressNumber: row.address_number,
      addressComplement: row.address_complement,
      addressNeighborhood: row.address_neighborhood,
      addressCity: row.address_city,
      addressState: row.address_state,
      addressZipcode: row.address_zipcode,
      status,
      dadosComerciais,
      notes: row.notes,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      createdBy: row.created_by,
      updatedBy: row.updated_by,
    };

    return Patient.reconstitute(props);
  }
}
