import { User } from '@/domain/entities/User';
import { IUserRepository } from '@/domain/repositories/IUserRepository';

interface ListUsersByClinicDTO {
  clinicId: string;
  activeOnly?: boolean;
  adminOnly?: boolean;
}

export class ListUsersByClinicUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(dto: ListUsersByClinicDTO): Promise<User[]> {
    if (dto.adminOnly) {
      return this.userRepository.findAdminsByClinicId(dto.clinicId);
    }

    if (dto.activeOnly) {
      return this.userRepository.findActiveByClinicId(dto.clinicId);
    }

    return this.userRepository.findByClinicId(dto.clinicId);
  }
}
