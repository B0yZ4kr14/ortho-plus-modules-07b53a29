export type AtividadeTipo = 'LIGACAO' | 'EMAIL' | 'REUNIAO' | 'WHATSAPP' | 'VISITA' | 'OUTRO';
export type AtividadeStatus = 'AGENDADA' | 'CONCLUIDA' | 'CANCELADA';

export interface AtividadeProps {
  id: string;
  leadId: string;
  clinicId: string;
  tipo: AtividadeTipo;
  titulo: string;
  descricao?: string;
  dataAgendada?: Date;
  dataConclusao?: Date;
  status: AtividadeStatus;
  responsavelId: string;
  resultado?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Atividade {
  constructor(private props: AtividadeProps) {
    this.validate();
  }

  private validate(): void {
    if (!this.props.leadId) {
      throw new Error('ID do lead é obrigatório');
    }
    if (!this.props.clinicId) {
      throw new Error('ID da clínica é obrigatório');
    }
    if (!this.props.titulo || this.props.titulo.trim().length === 0) {
      throw new Error('Título da atividade é obrigatório');
    }
    if (!this.props.responsavelId) {
      throw new Error('Responsável é obrigatório');
    }
  }

  // Getters
  get id(): string { return this.props.id; }
  get leadId(): string { return this.props.leadId; }
  get clinicId(): string { return this.props.clinicId; }
  get tipo(): AtividadeTipo { return this.props.tipo; }
  get titulo(): string { return this.props.titulo; }
  get descricao(): string | undefined { return this.props.descricao; }
  get dataAgendada(): Date | undefined { return this.props.dataAgendada; }
  get dataConclusao(): Date | undefined { return this.props.dataConclusao; }
  get status(): AtividadeStatus { return this.props.status; }
  get responsavelId(): string { return this.props.responsavelId; }
  get resultado(): string | undefined { return this.props.resultado; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  // Domain methods
  concluir(resultado?: string): void {
    if (this.props.status === 'CONCLUIDA') {
      throw new Error('Atividade já está concluída');
    }
    this.props.status = 'CONCLUIDA';
    this.props.dataConclusao = new Date();
    if (resultado) {
      this.props.resultado = resultado;
    }
    this.props.updatedAt = new Date();
  }

  cancelar(): void {
    if (this.props.status === 'CONCLUIDA') {
      throw new Error('Não é possível cancelar uma atividade concluída');
    }
    this.props.status = 'CANCELADA';
    this.props.updatedAt = new Date();
  }

  reagendar(novaData: Date): void {
    if (this.props.status === 'CONCLUIDA') {
      throw new Error('Não é possível reagendar uma atividade concluída');
    }
    if (novaData < new Date()) {
      throw new Error('Data de agendamento deve ser futura');
    }
    this.props.dataAgendada = novaData;
    this.props.status = 'AGENDADA';
    this.props.updatedAt = new Date();
  }

  updateDescricao(descricao: string): void {
    this.props.descricao = descricao;
    this.props.updatedAt = new Date();
  }

  toJSON(): AtividadeProps {
    return { ...this.props };
  }
}
