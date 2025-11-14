import { Patient } from '@/domain/entities/Patient';
import { IPatientRepository } from '@/domain/repositories/IPatientRepository';
import { Email } from '@/domain/value-objects/Email';
import { CPF } from '@/domain/value-objects/CPF';
import { Phone } from '@/domain/value-objects/Phone';
import { ValidationError } from '@/infrastructure/errors';

interface CreatePatientDTO {
  clinicId: string;
  fullName: string;
  email?: string;
  cpf?: string;
  phone?: string;
  birthDate?: Date;
}

export class CreatePatientUseCase {
  constructor(private patientRepository: IPatientRepository) {}

  async execute(dto: CreatePatientDTO): Promise<Patient> {
    // Validações de negócio
    if (!dto.clinicId) {
      throw new ValidationError('Clínica é obrigatória');
    }

    if (!dto.fullName || dto.fullName.trim().length < 3) {
      throw new ValidationError('Nome deve ter pelo menos 3 caracteres');
    }

    // Se CPF foi fornecido, validar se já existe
    if (dto.cpf) {
      const existingPatient = await this.patientRepository.findByCPF(dto.cpf, dto.clinicId);
      if (existingPatient) {
        throw new ValidationError('Já existe um paciente com este CPF');
      }
    }

    // Criar Value Objects
    const email = dto.email ? Email.create(dto.email) : undefined;
    const cpf = dto.cpf ? CPF.create(dto.cpf) : undefined;
    const phone = dto.phone ? Phone.create(dto.phone) : undefined;

    // Criar entidade Patient
    const patient = Patient.create({
      clinicId: dto.clinicId,
      fullName: dto.fullName.trim(),
      email,
      cpf,
      phone,
      birthDate: dto.birthDate,
      riskLevel: 'baixo',
      riskScoreMedical: 0,
      riskScoreSurgical: 0,
      riskScoreAnesthetic: 0,
      riskScoreOverall: 0,
      isActive: true,
    });

    // Persistir
    await this.patientRepository.save(patient);

    return patient;
  }
}
