import { AggregateRoot } from '@/core/domain/AggregateRoot';
import { Email } from '@/core/domain/valueObjects/Email';
import { Phone } from '@/core/domain/valueObjects/Phone';
import { LeadConvertedEvent } from '../events/LeadConvertedEvent';

export type LeadStatus = 'NOVO' | 'CONTATO' | 'QUALIFICADO' | 'PROPOSTA' | 'CONVERTIDO' | 'PERDIDO';
export type LeadSource = 'SITE' | 'REDES_SOCIAIS' | 'INDICACAO' | 'ANUNCIO' | 'OUTRO';

export interface LeadProps {
  id: string;
  clinicId: string;
  name: string;
  email: Email;
  phone: Phone;
  source: LeadSource;
  status: LeadStatus;
  score: number;
  notes?: string;
  assignedTo?: string;
  convertedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class Lead extends AggregateRoot<LeadProps> {
  private constructor(props: LeadProps) {
    super(props);
  }

  get id(): string {
    return this.props.id;
  }

  get clinicId(): string {
    return this.props.clinicId;
  }

  get status(): LeadStatus {
    return this.props.status;
  }

  get score(): number {
    return this.props.score;
  }

  static create(params: {
    clinicId: string;
    name: string;
    email: string;
    phone: string;
    source: LeadSource;
  }): Lead {
    const id = crypto.randomUUID();
    const now = new Date();

    return new Lead({
      id,
      clinicId: params.clinicId,
      name: params.name,
      email: Email.create(params.email),
      phone: Phone.create(params.phone),
      source: params.source,
      status: 'NOVO',
      score: 0,
      createdAt: now,
      updatedAt: now,
    });
  }

  updateStatus(status: LeadStatus): void {
    if (this.props.status === 'CONVERTIDO' || this.props.status === 'PERDIDO') {
      throw new Error('Não é possível alterar status de lead convertido ou perdido');
    }

    this.props.status = status;
    this.props.updatedAt = new Date();

    // Increase score based on status progression
    if (status === 'QUALIFICADO') {
      this.props.score = Math.min(this.props.score + 20, 100);
    } else if (status === 'PROPOSTA') {
      this.props.score = Math.min(this.props.score + 30, 100);
    }
  }

  convert(convertedBy: string, patientId: string, valorEstimado?: number): void {
    if (this.props.status === 'CONVERTIDO') {
      throw new Error('Lead já foi convertido');
    }

    if (this.props.status === 'PERDIDO') {
      throw new Error('Lead perdido não pode ser convertido');
    }

    this.props.status = 'CONVERTIDO';
    this.props.convertedAt = new Date();
    this.props.score = 100;
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      new LeadConvertedEvent({
        leadId: this.id,
        clinicId: this.clinicId,
        leadNome: this.props.name,
        patientId,
        valorEstimado,
        convertedBy,
      })
    );
  }

  assignTo(userId: string): void {
    this.props.assignedTo = userId;
    this.props.updatedAt = new Date();
  }

  static fromPersistence(data: any): Lead {
    return new Lead({
      id: data.id,
      clinicId: data.clinic_id,
      name: data.name,
      email: Email.create(data.email),
      phone: Phone.create(data.phone),
      source: data.source,
      status: data.status,
      score: data.score,
      notes: data.notes,
      assignedTo: data.assigned_to,
      convertedAt: data.converted_at ? new Date(data.converted_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    });
  }

  toPersistence(): any {
    return {
      id: this.props.id,
      clinic_id: this.props.clinicId,
      name: this.props.name,
      email: this.props.email.toString(),
      phone: this.props.phone.toString(),
      source: this.props.source,
      status: this.props.status,
      score: this.props.score,
      notes: this.props.notes,
      assigned_to: this.props.assignedTo,
      converted_at: this.props.convertedAt?.toISOString(),
      created_at: this.props.createdAt.toISOString(),
      updated_at: this.props.updatedAt.toISOString(),
    };
  }
}
