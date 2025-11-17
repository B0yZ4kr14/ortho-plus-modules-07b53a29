/**
 * DadosComerciaisVO - Value Object
 * 
 * Encapsula dados comerciais/CRM do paciente.
 */

export interface DadosComerciaisProps {
  campanhaOrigemId?: string;
  origemId?: string;
  promotorId?: string;
  eventoId?: string;
  telemarketingAgent?: string;
  escolaridade?: 'fundamental' | 'medio' | 'superior' | 'pos_graduacao' | 'mestrado' | 'doutorado';
  estadoCivil?: 'solteiro' | 'casado' | 'divorciado' | 'viuvo' | 'uniao_estavel';
  profissao?: string;
  empresa?: string;
  rendaMensal?: number;
}

export class DadosComerciaisVO {
  readonly campanhaOrigemId?: string;
  readonly origemId?: string;
  readonly promotorId?: string;
  readonly eventoId?: string;
  readonly telemarketingAgent?: string;
  readonly escolaridade?: string;
  readonly estadoCivil?: string;
  readonly profissao?: string;
  readonly empresa?: string;
  readonly rendaMensal?: number;

  constructor(props: DadosComerciaisProps) {
    this.campanhaOrigemId = props.campanhaOrigemId;
    this.origemId = props.origemId;
    this.promotorId = props.promotorId;
    this.eventoId = props.eventoId;
    this.telemarketingAgent = props.telemarketingAgent;
    this.escolaridade = props.escolaridade;
    this.estadoCivil = props.estadoCivil;
    this.profissao = props.profissao;
    this.empresa = props.empresa;
    this.rendaMensal = props.rendaMensal;

    this.validate();
  }

  private validate(): void {
    if (this.rendaMensal !== undefined && this.rendaMensal < 0) {
      throw new Error('Renda mensal não pode ser negativa');
    }

    const escolaridadeValida = [
      'fundamental',
      'medio',
      'superior',
      'pos_graduacao',
      'mestrado',
      'doutorado',
    ];
    if (this.escolaridade && !escolaridadeValida.includes(this.escolaridade)) {
      throw new Error(`Escolaridade inválida: ${this.escolaridade}`);
    }

    const estadoCivilValido = [
      'solteiro',
      'casado',
      'divorciado',
      'viuvo',
      'uniao_estavel',
    ];
    if (this.estadoCivil && !estadoCivilValido.includes(this.estadoCivil)) {
      throw new Error(`Estado civil inválido: ${this.estadoCivil}`);
    }
  }

  equals(other: DadosComerciaisVO): boolean {
    return (
      this.campanhaOrigemId === other.campanhaOrigemId &&
      this.origemId === other.origemId &&
      this.promotorId === other.promotorId &&
      this.eventoId === other.eventoId &&
      this.telemarketingAgent === other.telemarketingAgent &&
      this.escolaridade === other.escolaridade &&
      this.estadoCivil === other.estadoCivil &&
      this.profissao === other.profissao &&
      this.empresa === other.empresa &&
      this.rendaMensal === other.rendaMensal
    );
  }

  static empty(): DadosComerciaisVO {
    return new DadosComerciaisVO({});
  }
}
