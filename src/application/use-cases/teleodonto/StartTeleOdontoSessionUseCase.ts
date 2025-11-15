/**
 * FASE 2 - TASK 2.4: Start TeleOdonto Session Use Case
 */

import { TeleOdontoSession } from '@/domain/entities/TeleOdontoSession';
import { ITeleOdontoRepository } from './CreateTeleOdontoSessionUseCase';

export interface StartTeleOdontoSessionDTO {
  sessionId: string;
  userId: string; // Pode ser dentista ou paciente
  userRole: 'dentist' | 'patient';
}

export interface IRoomProvider {
  createRoom(sessionId: string, platform: string): Promise<{
    roomId: string;
    roomUrl: string;
  }>;
}

export class StartTeleOdontoSessionUseCase {
  constructor(
    private repository: ITeleOdontoRepository,
    private roomProvider: IRoomProvider
  ) {}

  async execute(dto: StartTeleOdontoSessionDTO): Promise<{
    session: TeleOdontoSession;
    roomUrl: string;
  }> {
    // Buscar sessão
    const session = await this.repository.findById(dto.sessionId);
    if (!session) {
      throw new Error('Sessão não encontrada');
    }

    // Verificar se usuário tem permissão
    if (dto.userRole === 'dentist' && session.dentistId !== dto.userId) {
      throw new Error('Usuário não é o dentista desta sessão');
    }

    if (dto.userRole === 'patient' && session.patientId !== dto.userId) {
      throw new Error('Usuário não é o paciente desta sessão');
    }

    // Se sessão ainda não foi iniciada, criar room
    if (session.status === 'agendada' && !session.roomUrl) {
      const { roomId, roomUrl } = await this.roomProvider.createRoom(
        session.id,
        session.platform
      );
      session.iniciarSessao(roomId, roomUrl);
    }

    // Registrar entrada do usuário
    if (dto.userRole === 'dentist') {
      session.registrarEntradaDentista();
    } else {
      session.registrarEntradaPaciente();
    }

    // Salvar alterações
    await this.repository.save(session);

    return {
      session,
      roomUrl: session.roomUrl!,
    };
  }
}
