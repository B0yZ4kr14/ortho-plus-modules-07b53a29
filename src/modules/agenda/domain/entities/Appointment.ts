export type AppointmentStatus = 
  | 'AGENDADO' 
  | 'CONFIRMADO' 
  | 'REALIZADO' 
  | 'CANCELADO' 
  | 'FALTOU';

export type AppointmentType = 
  | 'CONSULTA' 
  | 'RETORNO' 
  | 'EMERGENCIA' 
  | 'AVALIACAO' 
  | 'PROCEDIMENTO';

export interface AppointmentProps {
  id: string;
  clinicId: string;
  patientId: string;
  dentistId: string;
  scheduledDatetime: Date;
  durationMinutes: number;
  status: AppointmentStatus;
  appointmentType: AppointmentType;
  notes?: string;
  confirmedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  noShow: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Appointment {
  constructor(private props: AppointmentProps) {
    this.validate();
  }

  private validate(): void {
    if (!this.props.clinicId) {
      throw new Error('ID da clínica é obrigatório');
    }
    if (!this.props.patientId) {
      throw new Error('ID do paciente é obrigatório');
    }
    if (!this.props.dentistId) {
      throw new Error('ID do dentista é obrigatório');
    }
    if (!this.props.scheduledDatetime) {
      throw new Error('Data/hora do agendamento é obrigatória');
    }
    if (this.props.durationMinutes <= 0 || this.props.durationMinutes % 15 !== 0) {
      throw new Error('Duração deve ser múltiplo de 15 minutos');
    }
    // Não pode agendar no passado (exceto se já existente)
    if (!this.props.id && this.props.scheduledDatetime < new Date()) {
      throw new Error('Não é possível agendar no passado');
    }
  }

  // Getters
  get id(): string { return this.props.id; }
  get clinicId(): string { return this.props.clinicId; }
  get patientId(): string { return this.props.patientId; }
  get dentistId(): string { return this.props.dentistId; }
  get scheduledDatetime(): Date { return this.props.scheduledDatetime; }
  get durationMinutes(): number { return this.props.durationMinutes; }
  get status(): AppointmentStatus { return this.props.status; }
  get appointmentType(): AppointmentType { return this.props.appointmentType; }
  get notes(): string | undefined { return this.props.notes; }
  get confirmedAt(): Date | undefined { return this.props.confirmedAt; }
  get completedAt(): Date | undefined { return this.props.completedAt; }
  get cancelledAt(): Date | undefined { return this.props.cancelledAt; }
  get cancellationReason(): string | undefined { return this.props.cancellationReason; }
  get noShow(): boolean { return this.props.noShow; }
  get createdBy(): string { return this.props.createdBy; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  // Computed properties
  get endDatetime(): Date {
    return new Date(this.props.scheduledDatetime.getTime() + this.props.durationMinutes * 60000);
  }

  get canBeConfirmed(): boolean {
    return this.props.status === 'AGENDADO';
  }

  get canBeCancelled(): boolean {
    return ['AGENDADO', 'CONFIRMADO'].includes(this.props.status);
  }

  get canBeRescheduled(): boolean {
    return ['AGENDADO', 'CONFIRMADO'].includes(this.props.status);
  }

  // Domain methods
  confirm(): void {
    if (this.props.status !== 'AGENDADO') {
      throw new Error('Apenas agendamentos com status AGENDADO podem ser confirmados');
    }
    
    // Não pode confirmar menos de 2h antes
    const twoHoursBeforeAppointment = new Date(this.props.scheduledDatetime.getTime() - 2 * 60 * 60 * 1000);
    if (new Date() > twoHoursBeforeAppointment) {
      throw new Error('Não é possível confirmar com menos de 2 horas de antecedência');
    }

    this.props.status = 'CONFIRMADO';
    this.props.confirmedAt = new Date();
    this.props.updatedAt = new Date();
  }

  cancel(reason?: string): void {
    if (!this.canBeCancelled) {
      throw new Error('Este agendamento não pode ser cancelado');
    }

    // Exigir motivo se cancelar com menos de 24h de antecedência
    const twentyFourHoursBeforeAppointment = new Date(
      this.props.scheduledDatetime.getTime() - 24 * 60 * 60 * 1000
    );
    if (new Date() > twentyFourHoursBeforeAppointment && !reason) {
      throw new Error('É obrigatório informar o motivo do cancelamento com menos de 24h de antecedência');
    }

    this.props.status = 'CANCELADO';
    this.props.cancelledAt = new Date();
    this.props.cancellationReason = reason;
    this.props.updatedAt = new Date();
  }

  reschedule(newDatetime: Date): void {
    if (!this.canBeRescheduled) {
      throw new Error('Este agendamento não pode ser reagendado');
    }

    if (newDatetime < new Date()) {
      throw new Error('Não é possível reagendar para o passado');
    }

    this.props.scheduledDatetime = newDatetime;
    this.props.status = 'AGENDADO'; // Reset para AGENDADO ao reagendar
    this.props.confirmedAt = undefined;
    this.props.updatedAt = new Date();
  }

  markAsCompleted(): void {
    if (this.props.status === 'CANCELADO') {
      throw new Error('Não é possível marcar agendamento cancelado como realizado');
    }

    this.props.status = 'REALIZADO';
    this.props.completedAt = new Date();
    this.props.updatedAt = new Date();
  }

  markAsNoShow(): void {
    if (this.props.status !== 'AGENDADO' && this.props.status !== 'CONFIRMADO') {
      throw new Error('Apenas agendamentos AGENDADO ou CONFIRMADO podem ser marcados como falta');
    }

    this.props.status = 'FALTOU';
    this.props.noShow = true;
    this.props.updatedAt = new Date();
  }

  updateNotes(notes: string): void {
    this.props.notes = notes;
    this.props.updatedAt = new Date();
  }

  overlaps(other: Appointment): boolean {
    return (
      this.props.scheduledDatetime < other.endDatetime &&
      this.endDatetime > other.scheduledDatetime
    );
  }

  toJSON(): AppointmentProps {
    return { ...this.props };
  }
}
