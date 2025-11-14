import { Patient } from '@/domain/entities/Patient';
import { IPatientRepository } from '@/domain/repositories/IPatientRepository';
import { Email } from '@/domain/value-objects/Email';
import { Phone } from '@/domain/value-objects/Phone';
import { NotFoundError, UnauthorizedError } from '@/infrastructure/errors';

interface UpdatePatientDTO {
  patientId: string;
  requestingUserClinicId: string;
  fullName?: string;
  email?: string;
  phone?: string;
  riskScoreMedical?: number;
  riskScoreSurgical?: number;
  riskScoreAnesthetic?: number;
  riskScoreOverall?: number;
}

export class UpdatePatientUseCase {
  constructor(private patientRepository: IPatientRepository) {}

  async execute(dto: UpdatePatientDTO): Promise<Patient> {
    // Buscar paciente
    const patient = await this.patientRepository.findById(dto.patientId);

    if (!patient) {
      throw new NotFoundError('Paciente', dto.patientId);
    }

    // Verificar permissão
    if (patient.clinicId !== dto.requestingUserClinicId) {
      throw new UnauthorizedError('Você não tem permissão para atualizar este paciente');
    }

    // Aplicar mudanças usando métodos de domínio
    if (dto.fullName) {
      patient.updateFullName(dto.fullName);
    }

    if (dto.email) {
      patient.updateEmail(Email.create(dto.email));
    }

    if (dto.phone) {
      patient.updatePhone(Phone.create(dto.phone));
    }

    if (
      dto.riskScoreMedical !== undefined ||
      dto.riskScoreSurgical !== undefined ||
      dto.riskScoreAnesthetic !== undefined ||
      dto.riskScoreOverall !== undefined
    ) {
      patient.updateRiskScores(
        dto.riskScoreMedical ?? patient.riskScoreMedical,
        dto.riskScoreSurgical ?? patient.riskScoreSurgical,
        dto.riskScoreAnesthetic ?? patient.riskScoreAnesthetic,
        dto.riskScoreOverall ?? patient.riskScoreOverall
      );
    }

    // Persistir
    await this.patientRepository.update(patient);

    return patient;
  }
}
