import { Patient } from '@/domain/entities/Patient';
import { IPatientRepository } from '@/domain/repositories/IPatientRepository';

interface ListPatientsByClinicDTO {
  clinicId: string;
  activeOnly?: boolean;
}

export class ListPatientsByClinicUseCase {
  constructor(private patientRepository: IPatientRepository) {}

  async execute(dto: ListPatientsByClinicDTO): Promise<Patient[]> {
    if (dto.activeOnly) {
      return this.patientRepository.findActiveByClinicId(dto.clinicId);
    }

    return this.patientRepository.findByClinicId(dto.clinicId);
  }
}
