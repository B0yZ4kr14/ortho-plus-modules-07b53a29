import { MessageTemplate } from '../valueObjects/MessageTemplate';

export type CampaignType = 'RECALL' | 'POS_CONSULTA' | 'ANIVERSARIO' | 'SEGMENTADA';
export type CampaignStatus = 'RASCUNHO' | 'ATIVA' | 'PAUSADA' | 'CONCLUIDA';

export interface CampaignMetrics {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalConverted: number;
  totalErrors: number;
}

export interface TargetSegment {
  lastVisitDays?: number; // Dias desde última visita
  ageRange?: { min: number; max: number };
  procedures?: string[]; // IDs de procedimentos
  hasAppointment?: boolean;
}

export interface CampaignProps {
  id: string;
  clinicId: string;
  name: string;
  description?: string;
  type: CampaignType;
  status: CampaignStatus;
  messageTemplate: MessageTemplate;
  targetSegment?: TargetSegment;
  scheduledDate?: Date;
  startDate?: Date;
  endDate?: Date;
  metrics?: CampaignMetrics;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Campaign {
  constructor(private props: CampaignProps) {
    this.validate();
  }

  private validate(): void {
    if (!this.props.clinicId) {
      throw new Error('ID da clínica é obrigatório');
    }

    if (!this.props.name || this.props.name.trim().length === 0) {
      throw new Error('Nome da campanha é obrigatório');
    }

    if (this.props.name.length > 100) {
      throw new Error('Nome da campanha não pode ter mais de 100 caracteres');
    }

    if (!this.props.createdBy) {
      throw new Error('Criador da campanha é obrigatório');
    }
  }

  // Getters
  get id(): string { return this.props.id; }
  get clinicId(): string { return this.props.clinicId; }
  get name(): string { return this.props.name; }
  get description(): string | undefined { return this.props.description; }
  get type(): CampaignType { return this.props.type; }
  get status(): CampaignStatus { return this.props.status; }
  get messageTemplate(): MessageTemplate { return this.props.messageTemplate; }
  get targetSegment(): TargetSegment | undefined { return this.props.targetSegment; }
  get scheduledDate(): Date | undefined { return this.props.scheduledDate; }
  get startDate(): Date | undefined { return this.props.startDate; }
  get endDate(): Date | undefined { return this.props.endDate; }
  get metrics(): CampaignMetrics | undefined { return this.props.metrics; }
  get createdBy(): string { return this.props.createdBy; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  // Getters para métricas
  getTotalSent(): number { return this.props.metrics?.totalSent || 0; }
  getTotalDelivered(): number { return this.props.metrics?.totalDelivered || 0; }
  getTotalOpened(): number { return this.props.metrics?.totalOpened || 0; }
  getTotalClicked(): number { return this.props.metrics?.totalClicked || 0; }
  getTotalConverted(): number { return this.props.metrics?.totalConverted || 0; }
  getTotalErrors(): number { return this.props.metrics?.totalErrors || 0; }

  getOpenRate(): number {
    const sent = this.getTotalSent();
    if (sent === 0) return 0;
    return (this.getTotalOpened() / sent) * 100;
  }

  getClickRate(): number {
    const opened = this.getTotalOpened();
    if (opened === 0) return 0;
    return (this.getTotalClicked() / opened) * 100;
  }

  getConversionRate(): number {
    const clicked = this.getTotalClicked();
    if (clicked === 0) return 0;
    return (this.getTotalConverted() / clicked) * 100;
  }

  // Domain Methods

  isDraft(): boolean {
    return this.props.status === 'RASCUNHO';
  }

  isActive(): boolean {
    return this.props.status === 'ATIVA';
  }

  isPaused(): boolean {
    return this.props.status === 'PAUSADA';
  }

  isCompleted(): boolean {
    return this.props.status === 'CONCLUIDA';
  }

  canBeActivated(): boolean {
    return this.props.status === 'RASCUNHO' || this.props.status === 'PAUSADA';
  }

  canBePaused(): boolean {
    return this.props.status === 'ATIVA';
  }

  canBeCompleted(): boolean {
    return this.props.status === 'ATIVA' || this.props.status === 'PAUSADA';
  }

  activate(): void {
    if (!this.canBeActivated()) {
      throw new Error('Campanha não pode ser ativada no estado atual');
    }

    this.props.status = 'ATIVA';
    
    if (!this.props.startDate) {
      this.props.startDate = new Date();
    }
    
    this.props.updatedAt = new Date();
  }

  pause(): void {
    if (!this.canBePaused()) {
      throw new Error('Campanha não pode ser pausada no estado atual');
    }

    this.props.status = 'PAUSADA';
    this.props.updatedAt = new Date();
  }

  complete(): void {
    if (!this.canBeCompleted()) {
      throw new Error('Campanha não pode ser concluída no estado atual');
    }

    this.props.status = 'CONCLUIDA';
    this.props.endDate = new Date();
    this.props.updatedAt = new Date();
  }

  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Nome da campanha não pode ser vazio');
    }

    if (name.length > 100) {
      throw new Error('Nome da campanha não pode ter mais de 100 caracteres');
    }

    this.props.name = name;
    this.props.updatedAt = new Date();
  }

  updateDescription(description: string): void {
    this.props.description = description;
    this.props.updatedAt = new Date();
  }

  updateMessageTemplate(template: MessageTemplate): void {
    if (!this.isDraft()) {
      throw new Error('Template só pode ser alterado em campanhas em rascunho');
    }

    this.props.messageTemplate = template;
    this.props.updatedAt = new Date();
  }

  updateTargetSegment(segment: TargetSegment): void {
    if (!this.isDraft()) {
      throw new Error('Segmento só pode ser alterado em campanhas em rascunho');
    }

    this.props.targetSegment = segment;
    this.props.updatedAt = new Date();
  }

  scheduleFor(date: Date): void {
    if (date < new Date()) {
      throw new Error('Data de agendamento não pode ser no passado');
    }

    this.props.scheduledDate = date;
    this.props.updatedAt = new Date();
  }

  updateMetrics(metrics: Partial<CampaignMetrics>): void {
    this.props.metrics = {
      ...this.props.metrics,
      totalSent: metrics.totalSent ?? this.props.metrics?.totalSent ?? 0,
      totalDelivered: metrics.totalDelivered ?? this.props.metrics?.totalDelivered ?? 0,
      totalOpened: metrics.totalOpened ?? this.props.metrics?.totalOpened ?? 0,
      totalClicked: metrics.totalClicked ?? this.props.metrics?.totalClicked ?? 0,
      totalConverted: metrics.totalConverted ?? this.props.metrics?.totalConverted ?? 0,
      totalErrors: metrics.totalErrors ?? this.props.metrics?.totalErrors ?? 0,
    };
    
    this.props.updatedAt = new Date();
  }

  getErrorRate(): number {
    if (!this.props.metrics || this.props.metrics.totalSent === 0) return 0;
    return (this.props.metrics.totalErrors / this.props.metrics.totalSent) * 100;
  }

  toJSON(): CampaignProps {
    return { ...this.props };
  }
}
