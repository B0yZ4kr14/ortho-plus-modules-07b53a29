import { Patient } from '@/domain/entities/Patient';
import { IPatientRepository } from '@/domain/repositories/IPatientRepository';
import { NotFoundError, UnauthorizedError } from '@/infrastructure/errors';

interface GetPatientByIdDTO {
  patientId: string;
  requestingUserClinicId: string;
}

export class GetPatientByIdUseCase {
  constructor(private patientRepository: IPatientRepository) {}

  async execute(dto: GetPatientByIdDTO): Promise<Patient> {
    const patient = await this.patientRepository.findById(dto.patientId);

    if (!patient) {
      throw new NotFoundError('Paciente', dto.patientId);
    }

    // Verificar se o usuário tem acesso ao paciente (mesma clínica)
    if (patient.clinicId !== dto.requestingUserClinicId) {
      throw new UnauthorizedError('Você não tem permissão para acessar este paciente');
    }

    return patient;
  }
}
