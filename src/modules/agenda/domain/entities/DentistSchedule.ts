export interface DentistScheduleProps {
  id: string;
  clinicId: string;
  dentistId: string;
  dayOfWeek: number; // 0-6 (Domingo a Sábado)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  breakStart?: string; // HH:MM format
  breakEnd?: string; // HH:MM format
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class DentistSchedule {
  constructor(private props: DentistScheduleProps) {
    this.validate();
  }

  private validate(): void {
    if (!this.props.clinicId) {
      throw new Error('ID da clínica é obrigatório');
    }
    if (!this.props.dentistId) {
      throw new Error('ID do dentista é obrigatório');
    }
    if (this.props.dayOfWeek < 0 || this.props.dayOfWeek > 6) {
      throw new Error('Dia da semana deve estar entre 0 (Domingo) e 6 (Sábado)');
    }
    if (!this.isValidTimeFormat(this.props.startTime)) {
      throw new Error('Horário de início inválido. Use formato HH:MM');
    }
    if (!this.isValidTimeFormat(this.props.endTime)) {
      throw new Error('Horário de fim inválido. Use formato HH:MM');
    }
    if (this.props.startTime >= this.props.endTime) {
      throw new Error('Horário de início deve ser antes do horário de fim');
    }
    if (this.props.breakStart && this.props.breakEnd) {
      if (!this.isValidTimeFormat(this.props.breakStart) || !this.isValidTimeFormat(this.props.breakEnd)) {
        throw new Error('Horários de intervalo inválidos. Use formato HH:MM');
      }
      if (this.props.breakStart >= this.props.breakEnd) {
        throw new Error('Início do intervalo deve ser antes do fim do intervalo');
      }
      if (this.props.breakStart < this.props.startTime || this.props.breakEnd > this.props.endTime) {
        throw new Error('Intervalo deve estar dentro do horário de trabalho');
      }
    }
  }

  private isValidTimeFormat(time: string): boolean {
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
  }

  // Getters
  get id(): string { return this.props.id; }
  get clinicId(): string { return this.props.clinicId; }
  get dentistId(): string { return this.props.dentistId; }
  get dayOfWeek(): number { return this.props.dayOfWeek; }
  get startTime(): string { return this.props.startTime; }
  get endTime(): string { return this.props.endTime; }
  get breakStart(): string | undefined { return this.props.breakStart; }
  get breakEnd(): string | undefined { return this.props.breakEnd; }
  get isActive(): boolean { return this.props.isActive; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  // Domain methods
  isAvailable(date: Date): boolean {
    if (!this.props.isActive) return false;
    return date.getDay() === this.props.dayOfWeek;
  }

  isTimeInWorkingHours(time: string): boolean {
    if (!this.isValidTimeFormat(time)) return false;
    return time >= this.props.startTime && time <= this.props.endTime;
  }

  isTimeInBreak(time: string): boolean {
    if (!this.props.breakStart || !this.props.breakEnd) return false;
    if (!this.isValidTimeFormat(time)) return false;
    return time >= this.props.breakStart && time < this.props.breakEnd;
  }

  getAvailableSlots(slotDurationMinutes: number = 30): string[] {
    const slots: string[] = [];
    const start = this.timeToMinutes(this.props.startTime);
    const end = this.timeToMinutes(this.props.endTime);
    const breakStart = this.props.breakStart ? this.timeToMinutes(this.props.breakStart) : null;
    const breakEnd = this.props.breakEnd ? this.timeToMinutes(this.props.breakEnd) : null;

    for (let minutes = start; minutes + slotDurationMinutes <= end; minutes += slotDurationMinutes) {
      // Skip if slot overlaps with break
      if (breakStart !== null && breakEnd !== null) {
        const slotEnd = minutes + slotDurationMinutes;
        if (minutes < breakEnd && slotEnd > breakStart) {
          continue;
        }
      }
      slots.push(this.minutesToTime(minutes));
    }

    return slots;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  updateTimes(startTime: string, endTime: string, breakStart?: string, breakEnd?: string): void {
    const oldStart = this.props.startTime;
    const oldEnd = this.props.endTime;
    const oldBreakStart = this.props.breakStart;
    const oldBreakEnd = this.props.breakEnd;

    // Temporarily update to validate
    this.props.startTime = startTime;
    this.props.endTime = endTime;
    this.props.breakStart = breakStart;
    this.props.breakEnd = breakEnd;

    try {
      this.validate();
      this.props.updatedAt = new Date();
    } catch (error) {
      // Revert on validation error
      this.props.startTime = oldStart;
      this.props.endTime = oldEnd;
      this.props.breakStart = oldBreakStart;
      this.props.breakEnd = oldBreakEnd;
      throw error;
    }
  }

  toJSON(): DentistScheduleProps {
    return { ...this.props };
  }
}
