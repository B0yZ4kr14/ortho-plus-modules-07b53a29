import { Module } from '@/domain/entities/Module';
import { IModuleRepository } from '@/domain/repositories/IModuleRepository';

interface GetActiveModulesDTO {
  clinicId: string;
}

export class GetActiveModulesUseCase {
  constructor(private moduleRepository: IModuleRepository) {}

  async execute(dto: GetActiveModulesDTO): Promise<Module[]> {
    return this.moduleRepository.findActiveByClinicId(dto.clinicId);
  }
}
