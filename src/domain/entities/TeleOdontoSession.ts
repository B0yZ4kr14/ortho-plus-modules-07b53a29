/**
 * FASE 2 - TASK 2.4: Teleodontologia Domain Entity
 * Representa uma sessão de telemedicina odontológica
 */

export type SessionStatus = 'agendada' | 'em_andamento' | 'concluida' | 'cancelada' | 'nao_compareceu';
export type Platform = 'jitsi' | 'zoom' | 'meet' | 'teams';
export type QualidadeMedia = 'excelente' | 'boa' | 'regular' | 'ruim';

export interface TeleOdontoSessionProps {
  id: string;
  clinicId: string;
  patientId: string;
  dentistId: string;
  appointmentId?: string;
  
  // Agendamento
  scheduledStart: Date;
  scheduledEnd: Date;
  
  // Status
  status: SessionStatus;
  
  // Videoconferência
  roomId?: string;
  roomUrl?: string;
  platform: Platform;
  recordingUrl?: string;
  
  // Metadados
  duracaoMinutos?: number;
  startedAt?: Date;
  endedAt?: Date;
  patientJoinedAt?: Date;
  dentistJoinedAt?: Date;
  
  // LGPD
  consentimentoGravacao: boolean;
  consentimentoAssinadoEm?: Date;
  
  // Clínica
  notasPreConsulta?: string;
  notasPosConsulta?: string;
  diagnosticoPrelimininar?: string;
  prescricoes: Array<{
    medicamento: string;
    dosagem: string;
    duracao: string;
  }>;
  
  // Qualidade
  qualidadeVideo?: QualidadeMedia;
  qualidadeAudio?: QualidadeMedia;
  problemasTecnicos?: string;
  
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
}

export class TeleOdontoSession {
  private constructor(private props: TeleOdontoSessionProps) {}

  static create(
    props: Omit<TeleOdontoSessionProps, 'id' | 'status' | 'prescricoes' | 'consentimentoGravacao' | 'createdAt' | 'updatedAt'>
  ): TeleOdontoSession {
    if (!props.clinicId || !props.patientId || !props.dentistId || !props.createdBy) {
      throw new Error('Dados obrigatórios não fornecidos');
    }

    if (props.scheduledEnd <= props.scheduledStart) {
      throw new Error('Data de fim deve ser após data de início');
    }

    return new TeleOdontoSession({
      ...props,
      id: crypto.randomUUID(),
      status: 'agendada',
      consentimentoGravacao: false,
      prescricoes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static restore(props: TeleOdontoSessionProps): TeleOdontoSession {
    return new TeleOdontoSession(props);
  }

  // Getters
  get id() { return this.props.id; }
  get clinicId() { return this.props.clinicId; }
  get patientId() { return this.props.patientId; }
  get dentistId() { return this.props.dentistId; }
  get status() { return this.props.status; }
  get scheduledStart() { return this.props.scheduledStart; }
  get scheduledEnd() { return this.props.scheduledEnd; }
  get roomUrl() { return this.props.roomUrl; }
  get platform() { return this.props.platform; }
  get prescricoes() { return this.props.prescricoes; }

  // Domain methods
  iniciarSessao(roomId: string, roomUrl: string): void {
    if (this.props.status !== 'agendada') {
      throw new Error('Sessão não está no estado agendada');
    }

    this.props.status = 'em_andamento';
    this.props.roomId = roomId;
    this.props.roomUrl = roomUrl;
    this.props.startedAt = new Date();
    this.props.updatedAt = new Date();
  }

  registrarEntradaPaciente(): void {
    this.props.patientJoinedAt = new Date();
    this.props.updatedAt = new Date();
  }

  registrarEntradaDentista(): void {
    this.props.dentistJoinedAt = new Date();
    this.props.updatedAt = new Date();
  }

  finalizarSessao(notasPosConsulta: string, diagnostico?: string): void {
    if (this.props.status !== 'em_andamento') {
      throw new Error('Sessão não está em andamento');
    }

    this.props.status = 'concluida';
    this.props.endedAt = new Date();
    this.props.notasPosConsulta = notasPosConsulta;
    if (diagnostico) {
      this.props.diagnosticoPrelimininar = diagnostico;
    }

    // Calcular duração
    if (this.props.startedAt) {
      const diff = this.props.endedAt.getTime() - this.props.startedAt.getTime();
      this.props.duracaoMinutos = Math.floor(diff / 60000);
    }

    this.props.updatedAt = new Date();
  }

  cancelar(): void {
    if (this.props.status === 'concluida') {
      throw new Error('Não é possível cancelar sessão já concluída');
    }

    this.props.status = 'cancelada';
    this.props.updatedAt = new Date();
  }

  registrarNaoComparecimento(): void {
    this.props.status = 'nao_compareceu';
    this.props.updatedAt = new Date();
  }

  assinarConsentimentoGravacao(): void {
    this.props.consentimentoGravacao = true;
    this.props.consentimentoAssinadoEm = new Date();
    this.props.updatedAt = new Date();
  }

  adicionarPrescricao(medicamento: string, dosagem: string, duracao: string): void {
    this.props.prescricoes.push({ medicamento, dosagem, duracao });
    this.props.updatedAt = new Date();
  }

  avaliarQualidadeTecnica(
    qualidadeVideo: QualidadeMedia,
    qualidadeAudio: QualidadeMedia,
    problemas?: string
  ): void {
    this.props.qualidadeVideo = qualidadeVideo;
    this.props.qualidadeAudio = qualidadeAudio;
    if (problemas) {
      this.props.problemasTecnicos = problemas;
    }
    this.props.updatedAt = new Date();
  }

  toObject(): TeleOdontoSessionProps {
    return { ...this.props };
  }
}
