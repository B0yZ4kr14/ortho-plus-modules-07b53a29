/**
 * Evolucao Entity
 * Representa uma evolução clínica no tratamento do paciente
 */
export interface EvolucaoProps {
  id: string;
  tratamentoId: string;
  prontuarioId: string;
  clinicId: string;
  data: Date;
  descricao: string;
  procedimentosRealizados: string[];
  observacoes?: string;
  assinadoPor: string;
  assinadoEm?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Evolucao {
  private props: EvolucaoProps;

  private constructor(props: EvolucaoProps) {
    this.props = props;
  }

  static create(props: Omit<EvolucaoProps, 'id' | 'createdAt' | 'updatedAt'>): Evolucao {
    // Validações de domínio
    if (!props.tratamentoId) {
      throw new Error('ID do tratamento é obrigatório');
    }

    if (!props.prontuarioId) {
      throw new Error('ID do prontuário é obrigatório');
    }

    if (!props.descricao || props.descricao.trim().length < 10) {
      throw new Error('Descrição da evolução deve ter pelo menos 10 caracteres');
    }

    if (!props.procedimentosRealizados || props.procedimentosRealizados.length === 0) {
      throw new Error('Pelo menos um procedimento realizado deve ser informado');
    }

    if (!props.assinadoPor) {
      throw new Error('Responsável pela assinatura é obrigatório');
    }

    const now = new Date();

    return new Evolucao({
      ...props,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: EvolucaoProps): Evolucao {
    return new Evolucao(props);
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get tratamentoId(): string {
    return this.props.tratamentoId;
  }

  get prontuarioId(): string {
    return this.props.prontuarioId;
  }

  get clinicId(): string {
    return this.props.clinicId;
  }

  get data(): Date {
    return this.props.data;
  }

  get descricao(): string {
    return this.props.descricao;
  }

  get procedimentosRealizados(): string[] {
    return [...this.props.procedimentosRealizados];
  }

  get observacoes(): string | undefined {
    return this.props.observacoes;
  }

  get assinadoPor(): string {
    return this.props.assinadoPor;
  }

  get assinadoEm(): Date | undefined {
    return this.props.assinadoEm;
  }

  get createdBy(): string {
    return this.props.createdBy;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Domain methods
  isAssinada(): boolean {
    return this.props.assinadoEm !== undefined;
  }

  assinar(): void {
    if (this.isAssinada()) {
      throw new Error('Evolução já foi assinada');
    }
    this.props.assinadoEm = new Date();
    this.props.updatedAt = new Date();
  }

  adicionarProcedimento(procedimento: string): void {
    if (!procedimento || procedimento.trim().length === 0) {
      throw new Error('Procedimento não pode ser vazio');
    }
    if (this.isAssinada()) {
      throw new Error('Não é possível adicionar procedimentos em evolução já assinada');
    }
    this.props.procedimentosRealizados.push(procedimento.trim());
    this.props.updatedAt = new Date();
  }

  removerProcedimento(procedimento: string): void {
    if (this.isAssinada()) {
      throw new Error('Não é possível remover procedimentos de evolução já assinada');
    }
    const index = this.props.procedimentosRealizados.indexOf(procedimento);
    if (index === -1) {
      throw new Error('Procedimento não encontrado');
    }
    this.props.procedimentosRealizados.splice(index, 1);
    if (this.props.procedimentosRealizados.length === 0) {
      throw new Error('Pelo menos um procedimento deve permanecer');
    }
    this.props.updatedAt = new Date();
  }

  atualizarDescricao(novaDescricao: string): void {
    if (!novaDescricao || novaDescricao.trim().length < 10) {
      throw new Error('Descrição da evolução deve ter pelo menos 10 caracteres');
    }
    if (this.isAssinada()) {
      throw new Error('Não é possível atualizar descrição de evolução já assinada');
    }
    this.props.descricao = novaDescricao.trim();
    this.props.updatedAt = new Date();
  }

  adicionarObservacao(observacao: string): void {
    if (!observacao || observacao.trim().length === 0) {
      throw new Error('Observação não pode ser vazia');
    }
    const timestamp = new Date().toLocaleString('pt-BR');
    this.props.observacoes = `${this.props.observacoes || ''}\n[${timestamp}] ${observacao}`.trim();
    this.props.updatedAt = new Date();
  }

  // Conversão para primitivos
  toObject(): EvolucaoProps {
    return {
      ...this.props,
      procedimentosRealizados: [...this.props.procedimentosRealizados],
    };
  }
}
