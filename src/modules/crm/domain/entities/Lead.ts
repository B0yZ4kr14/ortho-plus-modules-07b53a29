export type LeadStatus = 'NOVO' | 'CONTATO_INICIAL' | 'QUALIFICADO' | 'PROPOSTA' | 'NEGOCIACAO' | 'GANHO' | 'PERDIDO';
export type LeadSource = 'SITE' | 'TELEFONE' | 'INDICACAO' | 'REDES_SOCIAIS' | 'EVENTO' | 'OUTRO';

export interface LeadProps {
  id: string;
  clinicId: string;
  nome: string;
  email?: string;
  telefone?: string;
  origem: LeadSource;
  status: LeadStatus;
  interesseDescricao?: string;
  valorEstimado?: number;
  responsavelId?: string;
  tags?: string[];
  proximoContato?: Date;
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Lead {
  constructor(private props: LeadProps) {
    this.validate();
  }

  private validate(): void {
    if (!this.props.clinicId) {
      throw new Error('ID da clínica é obrigatório');
    }
    if (!this.props.nome || this.props.nome.trim().length === 0) {
      throw new Error('Nome do lead é obrigatório');
    }
    if (!this.props.email && !this.props.telefone) {
      throw new Error('Email ou telefone é obrigatório');
    }
  }

  // Getters
  get id(): string { return this.props.id; }
  get clinicId(): string { return this.props.clinicId; }
  get nome(): string { return this.props.nome; }
  get email(): string | undefined { return this.props.email; }
  get telefone(): string | undefined { return this.props.telefone; }
  get origem(): LeadSource { return this.props.origem; }
  get status(): LeadStatus { return this.props.status; }
  get interesseDescricao(): string | undefined { return this.props.interesseDescricao; }
  get valorEstimado(): number | undefined { return this.props.valorEstimado; }
  get responsavelId(): string | undefined { return this.props.responsavelId; }
  get tags(): string[] | undefined { return this.props.tags; }
  get proximoContato(): Date | undefined { return this.props.proximoContato; }
  get observacoes(): string | undefined { return this.props.observacoes; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  // Domain methods
  updateStatus(newStatus: LeadStatus): void {
    this.props.status = newStatus;
    this.props.updatedAt = new Date();
  }

  atribuirResponsavel(responsavelId: string): void {
    if (!responsavelId) {
      throw new Error('ID do responsável é obrigatório');
    }
    this.props.responsavelId = responsavelId;
    this.props.updatedAt = new Date();
  }

  agendarProximoContato(data: Date): void {
    if (!data || data < new Date()) {
      throw new Error('Data do próximo contato deve ser futura');
    }
    this.props.proximoContato = data;
    this.props.updatedAt = new Date();
  }

  addTag(tag: string): void {
    if (!tag || tag.trim().length === 0) {
      throw new Error('Tag não pode ser vazia');
    }
    if (!this.props.tags) {
      this.props.tags = [];
    }
    if (!this.props.tags.includes(tag)) {
      this.props.tags.push(tag);
      this.props.updatedAt = new Date();
    }
  }

  removeTag(tag: string): void {
    if (this.props.tags) {
      this.props.tags = this.props.tags.filter(t => t !== tag);
      this.props.updatedAt = new Date();
    }
  }

  updateValorEstimado(valor: number): void {
    if (valor < 0) {
      throw new Error('Valor estimado não pode ser negativo');
    }
    this.props.valorEstimado = valor;
    this.props.updatedAt = new Date();
  }

  marcarComoGanho(): void {
    this.props.status = 'GANHO';
    this.props.updatedAt = new Date();
  }

  marcarComoPerdido(motivo?: string): void {
    this.props.status = 'PERDIDO';
    if (motivo) {
      this.props.observacoes = (this.props.observacoes || '') + `\nMotivo perda: ${motivo}`;
    }
    this.props.updatedAt = new Date();
  }

  toJSON(): LeadProps {
    return { ...this.props };
  }
}
