/**
 * Domain Entity: IncidenteCaixa
 * 
 * Representa um incidente de segurança relacionado ao caixa (roubos, furtos, etc.)
 */

export type TipoIncidenteCaixa = 'ROUBO' | 'FURTO' | 'PERDA' | 'ERRO_OPERACIONAL' | 'OUTRO';

export interface IncidenteCaixaProps {
  id: string;
  clinicId: string;
  tipoIncidente: TipoIncidenteCaixa;
  dataIncidente: Date;
  horarioIncidente: string;
  diaSemana: number; // 0-6 (Domingo a Sábado)
  valorPerdido?: number;
  valorCaixaMomento?: number;
  descricao?: string;
  boletimOcorrencia?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export class IncidenteCaixa {
  private constructor(private props: IncidenteCaixaProps) {
    this.validate();
  }

  // Factory Methods
  static create(
    props: Omit<IncidenteCaixaProps, 'id' | 'createdAt' | 'updatedAt'>
  ): IncidenteCaixa {
    const now = new Date();
    
    return new IncidenteCaixa({
      ...props,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: IncidenteCaixaProps): IncidenteCaixa {
    return new IncidenteCaixa(props);
  }

  // Getters
  get id(): string { return this.props.id; }
  get clinicId(): string { return this.props.clinicId; }
  get tipoIncidente(): TipoIncidenteCaixa { return this.props.tipoIncidente; }
  get dataIncidente(): Date { return this.props.dataIncidente; }
  get horarioIncidente(): string { return this.props.horarioIncidente; }
  get diaSemana(): number { return this.props.diaSemana; }
  get valorPerdido(): number | undefined { return this.props.valorPerdido; }
  get valorCaixaMomento(): number | undefined { return this.props.valorCaixaMomento; }
  get descricao(): string | undefined { return this.props.descricao; }
  get boletimOcorrencia(): string | undefined { return this.props.boletimOcorrencia; }
  get metadata(): Record<string, any> | undefined { return this.props.metadata; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  // Domain Methods
  calcularImpacto(): number {
    return this.props.valorPerdido || 0;
  }

  calcularPercentualPerda(): number {
    if (!this.props.valorCaixaMomento || !this.props.valorPerdido) {
      return 0;
    }
    return (this.props.valorPerdido / this.props.valorCaixaMomento) * 100;
  }

  temBoletim(): boolean {
    return !!this.props.boletimOcorrencia?.trim();
  }

  isGrave(): boolean {
    // Considera grave se valor perdido > R$ 1000 ou se for roubo
    const valorGrave = (this.props.valorPerdido || 0) > 1000;
    const tipoGrave = this.props.tipoIncidente === 'ROUBO';
    return valorGrave || tipoGrave;
  }

  getDiaSemanaTexto(): string {
    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return dias[this.props.diaSemana] || 'Desconhecido';
  }

  // Validations
  private validate(): void {
    if (!this.props.horarioIncidente?.trim()) {
      throw new Error('Horário do incidente é obrigatório');
    }
    if (this.props.diaSemana < 0 || this.props.diaSemana > 6) {
      throw new Error('Dia da semana deve estar entre 0 (Domingo) e 6 (Sábado)');
    }
    if (this.props.valorPerdido !== undefined && this.props.valorPerdido < 0) {
      throw new Error('Valor perdido não pode ser negativo');
    }
    if (this.props.valorCaixaMomento !== undefined && this.props.valorCaixaMomento < 0) {
      throw new Error('Valor do caixa no momento não pode ser negativo');
    }
  }
}
