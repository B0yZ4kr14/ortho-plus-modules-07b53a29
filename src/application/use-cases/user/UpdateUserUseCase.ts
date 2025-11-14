import { User } from '@/domain/entities/User';
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { NotFoundError, UnauthorizedError } from '@/infrastructure/errors';

interface UpdateUserDTO {
  userId: string;
  requestingUserId: string;
  requestingUserClinicId: string;
  requestingUserRole: string;
  fullName?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  appRole?: 'ADMIN' | 'MEMBER';
}

export class UpdateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(dto: UpdateUserDTO): Promise<User> {
    const user = await this.userRepository.findById(dto.userId);

    if (!user) {
      throw new NotFoundError('Usuário', dto.userId);
    }

    // Verificar permissão de acesso
    if (user.clinicId !== dto.requestingUserClinicId) {
      throw new UnauthorizedError('Você não tem permissão para atualizar este usuário');
    }

    // Apenas admins podem mudar roles
    if (dto.appRole && dto.requestingUserRole !== 'ADMIN') {
      throw new UnauthorizedError('Apenas administradores podem alterar roles');
    }

    // Aplicar mudanças usando métodos de domínio
    if (dto.fullName) {
      user.updateFullName(dto.fullName);
    }

    // Nota: Email não pode ser alterado (é imutável)

    if (dto.phone !== undefined) {
      user.updatePhone(dto.phone);
    }

    if (dto.avatarUrl !== undefined) {
      user.updateAvatarUrl(dto.avatarUrl);
    }

    if (dto.appRole && dto.requestingUserRole === 'ADMIN') {
      if (dto.appRole === 'ADMIN' && !user.isAdmin()) {
        user.promoteToAdmin();
      } else if (dto.appRole === 'MEMBER' && !user.isMember()) {
        user.demoteToMember();
      }
    }

    // Persistir
    await this.userRepository.update(user);

    return user;
  }
}
