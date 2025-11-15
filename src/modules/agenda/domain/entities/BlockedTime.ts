export interface BlockedTimeProps {
  id: string;
  clinicId: string;
  dentistId: string;
  startDatetime: Date;
  endDatetime: Date;
  reason: string;
  createdBy: string;
  createdAt: Date;
}

export class BlockedTime {
  constructor(private props: BlockedTimeProps) {
    this.validate();
  }

  private validate(): void {
    if (!this.props.clinicId) {
      throw new Error('ID da clínica é obrigatório');
    }
    if (!this.props.dentistId) {
      throw new Error('ID do dentista é obrigatório');
    }
    if (!this.props.startDatetime) {
      throw new Error('Data/hora de início é obrigatória');
    }
    if (!this.props.endDatetime) {
      throw new Error('Data/hora de fim é obrigatória');
    }
    if (this.props.startDatetime >= this.props.endDatetime) {
      throw new Error('Data/hora de início deve ser antes da data/hora de fim');
    }
    if (!this.props.reason || this.props.reason.trim().length === 0) {
      throw new Error('Motivo do bloqueio é obrigatório');
    }
    if (!this.props.createdBy) {
      throw new Error('Usuário criador é obrigatório');
    }
  }

  // Getters
  get id(): string { return this.props.id; }
  get clinicId(): string { return this.props.clinicId; }
  get dentistId(): string { return this.props.dentistId; }
  get startDatetime(): Date { return this.props.startDatetime; }
  get endDatetime(): Date { return this.props.endDatetime; }
  get reason(): string { return this.props.reason; }
  get createdBy(): string { return this.props.createdBy; }
  get createdAt(): Date { return this.props.createdAt; }

  // Domain methods
  isActive(checkDate: Date = new Date()): boolean {
    return checkDate >= this.props.startDatetime && checkDate < this.props.endDatetime;
  }

  overlaps(start: Date, end: Date): boolean {
    return this.props.startDatetime < end && this.props.endDatetime > start;
  }

  contains(datetime: Date): boolean {
    return datetime >= this.props.startDatetime && datetime < this.props.endDatetime;
  }

  getDurationMinutes(): number {
    return Math.floor((this.props.endDatetime.getTime() - this.props.startDatetime.getTime()) / 60000);
  }

  updateReason(newReason: string): void {
    if (!newReason || newReason.trim().length === 0) {
      throw new Error('Motivo não pode ser vazio');
    }
    this.props.reason = newReason;
  }

  toJSON(): BlockedTimeProps {
    return { ...this.props };
  }
}
