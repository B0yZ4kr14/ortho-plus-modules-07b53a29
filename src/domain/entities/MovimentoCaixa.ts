/**
 * Domain Entity: MovimentoCaixa
 * 
 * Representa uma movimentação de caixa (abertura, fechamento, sangria)
 */

export type TipoMovimentoCaixa = 'ABERTURA' | 'FECHAMENTO' | 'SANGRIA' | 'REFORCO';
export type StatusMovimentoCaixa = 'ABERTO' | 'FECHADO' | 'PROCESSADO';

export interface MovimentoCaixaProps {
  id: string;
  clinicId: string;
  caixaId?: string;
  tipo: TipoMovimentoCaixa;
  valor: number;
  status: StatusMovimentoCaixa;
  abertoEm?: Date;
  fechadoEm?: Date;
  valorInicial?: number;
  valorFinal?: number;
  valorEsperado?: number;
  diferenca?: number;
  observacoes?: string;
  motivoSangria?: string;
  horarioRisco?: string;
  riscoCalculado?: number;
  sugeridoPorIA?: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class MovimentoCaixa {
  private constructor(private props: MovimentoCaixaProps) {
    this.validate();
  }

  // Factory Methods
  static create(
    props: Omit<MovimentoCaixaProps, 'id' | 'createdAt' | 'updatedAt'>
  ): MovimentoCaixa {
    const now = new Date();
    
    return new MovimentoCaixa({
      ...props,
      id: crypto.randomUUID(),
      sugeridoPorIA: props.sugeridoPorIA ?? false,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: MovimentoCaixaProps): MovimentoCaixa {
    return new MovimentoCaixa(props);
  }

  // Getters
  get id(): string { return this.props.id; }
  get clinicId(): string { return this.props.clinicId; }
  get caixaId(): string | undefined { return this.props.caixaId; }
  get tipo(): TipoMovimentoCaixa { return this.props.tipo; }
  get valor(): number { return this.props.valor; }
  get status(): StatusMovimentoCaixa { return this.props.status; }
  get abertoEm(): Date | undefined { return this.props.abertoEm; }
  get fechadoEm(): Date | undefined { return this.props.fechadoEm; }
  get valorInicial(): number | undefined { return this.props.valorInicial; }
  get valorFinal(): number | undefined { return this.props.valorFinal; }
  get valorEsperado(): number | undefined { return this.props.valorEsperado; }
  get diferenca(): number | undefined { return this.props.diferenca; }
  get observacoes(): string | undefined { return this.props.observacoes; }
  get motivoSangria(): string | undefined { return this.props.motivoSangria; }
  get horarioRisco(): string | undefined { return this.props.horarioRisco; }
  get riscoCalculado(): number | undefined { return this.props.riscoCalculado; }
  get sugeridoPorIA(): boolean | undefined { return this.props.sugeridoPorIA; }
  get createdBy(): string { return this.props.createdBy; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  // Domain Methods
  abrir(valorInicial: number): void {
    if (this.props.status === 'ABERTO') {
      throw new Error('Caixa já está aberto');
    }
    if (valorInicial < 0) {
      throw new Error('Valor inicial não pode ser negativo');
    }

    this.props.valorInicial = valorInicial;
    this.props.abertoEm = new Date();
    this.props.status = 'ABERTO';
    this.props.updatedAt = new Date();
  }

  fechar(valorFinal: number, valorEsperado: number): void {
    if (this.props.status !== 'ABERTO') {
      throw new Error('Apenas caixas abertos podem ser fechados');
    }
    if (valorFinal < 0) {
      throw new Error('Valor final não pode ser negativo');
    }

    this.props.valorFinal = valorFinal;
    this.props.valorEsperado = valorEsperado;
    this.props.diferenca = valorFinal - valorEsperado;
    this.props.fechadoEm = new Date();
    this.props.status = 'FECHADO';
    this.props.updatedAt = new Date();
  }

  calcularDiferenca(): number {
    if (this.props.valorFinal === undefined || this.props.valorEsperado === undefined) {
      return 0;
    }
    return this.props.valorFinal - this.props.valorEsperado;
  }

  isAberto(): boolean {
    return this.props.status === 'ABERTO';
  }

  isFechado(): boolean {
    return this.props.status === 'FECHADO';
  }

  hasDiferenca(): boolean {
    return this.props.diferenca !== undefined && this.props.diferenca !== 0;
  }

  isSangria(): boolean {
    return this.props.tipo === 'SANGRIA';
  }

  isReforco(): boolean {
    return this.props.tipo === 'REFORCO';
  }

  // Validations
  private validate(): void {
    if (this.props.valor < 0) {
      throw new Error('Valor não pode ser negativo');
    }
    if (this.props.tipo === 'SANGRIA' && !this.props.motivoSangria?.trim()) {
      throw new Error('Motivo da sangria é obrigatório');
    }
    if (this.props.valorInicial !== undefined && this.props.valorInicial < 0) {
      throw new Error('Valor inicial não pode ser negativo');
    }
    if (this.props.valorFinal !== undefined && this.props.valorFinal < 0) {
      throw new Error('Valor final não pode ser negativo');
    }
  }
}
