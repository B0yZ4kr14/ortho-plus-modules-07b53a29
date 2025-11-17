/**
 * PatientStatus - Value Object
 * 
 * Representa um dos 15 estados canônicos do paciente.
 */

export const PATIENT_STATUS_CODES = [
  'ABANDONO',
  'AFASTAMENTO_TEMPORARIO',
  'A_PROTESTAR',
  'CANCELADO',
  'CONTENCAO',
  'CONCLUIDO',
  'ERUPCAO',
  'INATIVO',
  'MIGRADO',
  'PROSPECT',
  'PROTESTO',
  'RESPONSAVEL',
  'TRATAMENTO',
  'TRANSFERENCIA',
] as const;

export type PatientStatusCode = typeof PATIENT_STATUS_CODES[number];

export class PatientStatus {
  readonly code: PatientStatusCode;
  readonly name: string;
  readonly description?: string;
  readonly color?: string;

  constructor(
    code: PatientStatusCode,
    name: string,
    description?: string,
    color?: string
  ) {
    this.code = code;
    this.name = name;
    this.description = description;
    this.color = color;

    this.validate();
  }

  private validate(): void {
    if (!PATIENT_STATUS_CODES.includes(this.code)) {
      throw new Error(`Status inválido: ${this.code}`);
    }
  }

  equals(other: PatientStatus): boolean {
    return this.code === other.code;
  }

  isProspect(): boolean {
    return this.code === 'PROSPECT';
  }

  isEmTratamento(): boolean {
    return this.code === 'TRATAMENTO';
  }

  isConcluido(): boolean {
    return this.code === 'CONCLUIDO';
  }

  isInativo(): boolean {
    return this.code === 'INATIVO';
  }

  static prospect(): PatientStatus {
    return new PatientStatus('PROSPECT', 'Prospect', 'Lead potencial', '#F97316');
  }

  static tratamento(): PatientStatus {
    return new PatientStatus('TRATAMENTO', 'Em Tratamento', 'Tratamento em andamento', '#22C55E');
  }

  static concluido(): PatientStatus {
    return new PatientStatus('CONCLUIDO', 'Concluído', 'Tratamento concluído', '#10B981');
  }

  static fromCode(code: string): PatientStatus {
    if (!PATIENT_STATUS_CODES.includes(code as PatientStatusCode)) {
      throw new Error(`Status code inválido: ${code}`);
    }

    // Mapeamento simples (em produção, buscar do banco)
    const statusMap: Record<PatientStatusCode, { name: string; desc: string; color: string }> = {
      ABANDONO: { name: 'Abandono', desc: 'Paciente abandonou o tratamento', color: '#DC2626' },
      AFASTAMENTO_TEMPORARIO: { name: 'Afastamento Temporário', desc: 'Temporariamente afastado', color: '#F59E0B' },
      A_PROTESTAR: { name: 'A Protestar', desc: 'Pendências financeiras', color: '#EF4444' },
      CANCELADO: { name: 'Cancelado', desc: 'Tratamento cancelado', color: '#991B1B' },
      CONTENCAO: { name: 'Contenção', desc: 'Fase de contenção', color: '#3B82F6' },
      CONCLUIDO: { name: 'Concluído', desc: 'Tratamento concluído', color: '#10B981' },
      ERUPCAO: { name: 'Erupção', desc: 'Aguardando erupção dentária', color: '#8B5CF6' },
      INATIVO: { name: 'Inativo', desc: 'Paciente inativo', color: '#6B7280' },
      MIGRADO: { name: 'Migrado', desc: 'Migrado de outro sistema', color: '#14B8A6' },
      PROSPECT: { name: 'Prospect', desc: 'Lead potencial', color: '#F97316' },
      PROTESTO: { name: 'Protesto', desc: 'Protestado juridicamente', color: '#7C2D12' },
      RESPONSAVEL: { name: 'Responsável', desc: 'Responsável de outro paciente', color: '#0EA5E9' },
      TRATAMENTO: { name: 'Em Tratamento', desc: 'Tratamento em andamento', color: '#22C55E' },
      TRANSFERENCIA: { name: 'Transferência', desc: 'Em transferência', color: '#A855F7' },
    };

    const statusData = statusMap[code as PatientStatusCode];
    return new PatientStatus(
      code as PatientStatusCode,
      statusData.name,
      statusData.desc,
      statusData.color
    );
  }
}
