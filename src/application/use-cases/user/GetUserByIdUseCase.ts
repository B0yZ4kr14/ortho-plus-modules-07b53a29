import { User } from '@/domain/entities/User';
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { NotFoundError, UnauthorizedError } from '@/infrastructure/errors';

interface GetUserByIdDTO {
  userId: string;
  requestingUserId: string;
  requestingUserClinicId: string;
}

export class GetUserByIdUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(dto: GetUserByIdDTO): Promise<User> {
    const user = await this.userRepository.findById(dto.userId);

    if (!user) {
      throw new NotFoundError('Usuário', dto.userId);
    }

    // Usuários só podem ver outros usuários da mesma clínica
    if (user.clinicId !== dto.requestingUserClinicId) {
      throw new UnauthorizedError('Você não tem permissão para acessar este usuário');
    }

    return user;
  }
}
