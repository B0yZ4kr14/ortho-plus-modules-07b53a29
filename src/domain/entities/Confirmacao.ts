/**
 * Entidade de Confirmação
 * Representa uma confirmação de agendamento via WhatsApp
 */

export interface ConfirmacaoProps {
  id: string;
  agendamentoId: string;
  phoneNumber: string;
  confirmationMethod: 'WHATSAPP' | 'SMS' | 'EMAIL' | 'TELEFONE';
  status: 'PENDENTE' | 'ENVIADA' | 'CONFIRMADA' | 'ERRO';
  messageContent?: string;
  sentAt?: Date;
  confirmedAt?: Date;
  errorMessage?: string;
  createdAt: Date;
}

export class Confirmacao {
  private constructor(private props: ConfirmacaoProps) {}

  /**
   * Factory method para criar nova confirmação
   */
  static create(
    props: Omit<ConfirmacaoProps, 'id' | 'createdAt' | 'status'>
  ): Confirmacao {
    // Validações de domínio
    if (!props.agendamentoId?.trim()) {
      throw new Error('ID do agendamento é obrigatório');
    }

    if (!props.phoneNumber?.trim()) {
      throw new Error('Número de telefone é obrigatório');
    }

    // Validação básica de formato de telefone (números e caracteres especiais)
    const phoneRegex = /^[\d\s()+\-]+$/;
    if (!phoneRegex.test(props.phoneNumber)) {
      throw new Error('Formato de telefone inválido');
    }

    if (!props.confirmationMethod) {
      throw new Error('Método de confirmação é obrigatório');
    }

    return new Confirmacao({
      ...props,
      id: crypto.randomUUID(),
      status: 'PENDENTE',
      createdAt: new Date(),
    });
  }

  /**
   * Factory method para restaurar confirmação do banco
   */
  static restore(props: ConfirmacaoProps): Confirmacao {
    return new Confirmacao(props);
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get agendamentoId(): string {
    return this.props.agendamentoId;
  }

  get phoneNumber(): string {
    return this.props.phoneNumber;
  }

  get confirmationMethod(): ConfirmacaoProps['confirmationMethod'] {
    return this.props.confirmationMethod;
  }

  get status(): ConfirmacaoProps['status'] {
    return this.props.status;
  }

  get messageContent(): string | undefined {
    return this.props.messageContent;
  }

  get sentAt(): Date | undefined {
    return this.props.sentAt;
  }

  get confirmedAt(): Date | undefined {
    return this.props.confirmedAt;
  }

  get errorMessage(): string | undefined {
    return this.props.errorMessage;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  // Domain Methods

  /**
   * Verifica se pode ser enviada
   */
  podeSerEnviada(): boolean {
    return this.props.status === 'PENDENTE';
  }

  /**
   * Marca como enviada
   */
  marcarEnviada(messageContent: string): void {
    if (!this.podeSerEnviada()) {
      throw new Error('Apenas confirmações PENDENTES podem ser enviadas');
    }

    if (!messageContent?.trim()) {
      throw new Error('Conteúdo da mensagem é obrigatório');
    }

    this.props.status = 'ENVIADA';
    this.props.messageContent = messageContent;
    this.props.sentAt = new Date();
  }

  /**
   * Verifica se pode ser confirmada
   */
  podeSerConfirmada(): boolean {
    return this.props.status === 'ENVIADA';
  }

  /**
   * Marca como confirmada pelo paciente
   */
  confirmar(): void {
    if (!this.podeSerConfirmada()) {
      throw new Error('Apenas confirmações ENVIADAS podem ser confirmadas');
    }

    this.props.status = 'CONFIRMADA';
    this.props.confirmedAt = new Date();
  }

  /**
   * Marca como erro
   */
  marcarErro(errorMessage: string): void {
    if (!errorMessage?.trim()) {
      throw new Error('Mensagem de erro é obrigatória');
    }

    this.props.status = 'ERRO';
    this.props.errorMessage = errorMessage;
  }

  /**
   * Verifica se foi confirmada
   */
  isConfirmada(): boolean {
    return this.props.status === 'CONFIRMADA';
  }

  /**
   * Verifica se teve erro
   */
  hasErro(): boolean {
    return this.props.status === 'ERRO';
  }

  /**
   * Verifica se ainda está pendente
   */
  isPendente(): boolean {
    return this.props.status === 'PENDENTE';
  }

  /**
   * Calcula tempo desde criação (em minutos)
   */
  getTempoDesdeEnvio(): number | null {
    if (!this.props.sentAt) return null;
    
    const agora = new Date();
    const diff = agora.getTime() - this.props.sentAt.getTime();
    return Math.floor(diff / 1000 / 60); // minutos
  }

  /**
   * Converte para objeto plano
   */
  toObject(): ConfirmacaoProps {
    return { ...this.props };
  }
}
