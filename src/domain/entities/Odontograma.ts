import { v4 as uuidv4 } from 'uuid';
import {
  ToothStatus,
  ToothSurface,
  ToothData,
  OdontogramaHistoryEntry,
  ALL_TEETH,
} from '@/modules/pep/types/odontograma.types';

export interface OdontogramaProps {
  id: string;
  prontuarioId: string;
  teeth: Record<number, ToothData>;
  lastUpdated: Date;
  history: OdontogramaHistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entidade de Domínio: Odontograma
 * 
 * Representa o odontograma completo de um paciente, incluindo:
 * - Status de cada dente (32 dentes permanentes - numeração FDI)
 * - Status de superfícies individuais (mesial, distal, oclusal, vestibular, lingual)
 * - Histórico de alterações
 * - Notas e observações por dente
 */
export class Odontograma {
  private constructor(private props: OdontogramaProps) {}

  /**
   * Factory Method: Criar novo Odontograma
   * Inicializa todos os 32 dentes com status "hígido"
   */
  static create(data: {
    prontuarioId: string;
  }): Odontograma {
    // Validações
    if (!data.prontuarioId?.trim()) {
      throw new Error('ID do prontuário é obrigatório');
    }

    // Inicializar todos os dentes com status padrão
    const teeth: Record<number, ToothData> = {};
    const now = new Date().toISOString();

    ALL_TEETH.forEach(toothNumber => {
      teeth[toothNumber] = {
        number: toothNumber,
        status: 'higido',
        surfaces: {
          mesial: 'higido',
          distal: 'higido',
          oclusal: 'higido',
          vestibular: 'higido',
          lingual: 'higido',
        },
        updatedAt: now,
      };
    });

    const nowDate = new Date();

    return new Odontograma({
      id: uuidv4(),
      prontuarioId: data.prontuarioId,
      teeth,
      lastUpdated: nowDate,
      history: [],
      createdAt: nowDate,
      updatedAt: nowDate,
    });
  }

  /**
   * Factory Method: Restaurar Odontograma existente
   */
  static restore(props: OdontogramaProps): Odontograma {
    return new Odontograma(props);
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get prontuarioId(): string {
    return this.props.prontuarioId;
  }

  get teeth(): Record<number, ToothData> {
    return { ...this.props.teeth };
  }

  get lastUpdated(): Date {
    return this.props.lastUpdated;
  }

  get history(): OdontogramaHistoryEntry[] {
    return [...this.props.history];
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * Método de Domínio: Atualizar status geral de um dente
   */
  atualizarStatusDente(
    toothNumber: number,
    newStatus: ToothStatus,
    notes?: string
  ): void {
    // Validações
    if (!ALL_TEETH.includes(toothNumber)) {
      throw new Error(`Número de dente inválido: ${toothNumber}`);
    }

    const tooth = this.props.teeth[toothNumber];
    if (!tooth) {
      throw new Error(`Dente ${toothNumber} não encontrado no odontograma`);
    }

    // Atualizar status do dente
    const now = new Date().toISOString();
    this.props.teeth[toothNumber] = {
      ...tooth,
      status: newStatus,
      notes: notes || tooth.notes,
      updatedAt: now,
    };

    // Adicionar ao histórico
    this.adicionarHistorico([toothNumber], `Status alterado para: ${newStatus}`);

    this.props.updatedAt = new Date();
  }

  /**
   * Método de Domínio: Atualizar status de uma superfície específica
   */
  atualizarSuperficie(
    toothNumber: number,
    surface: ToothSurface,
    newStatus: ToothStatus
  ): void {
    // Validações
    if (!ALL_TEETH.includes(toothNumber)) {
      throw new Error(`Número de dente inválido: ${toothNumber}`);
    }

    const tooth = this.props.teeth[toothNumber];
    if (!tooth) {
      throw new Error(`Dente ${toothNumber} não encontrado no odontograma`);
    }

    // Atualizar superfície
    const now = new Date().toISOString();
    this.props.teeth[toothNumber] = {
      ...tooth,
      surfaces: {
        ...tooth.surfaces,
        [surface]: newStatus,
      },
      updatedAt: now,
    };

    // Adicionar ao histórico
    this.adicionarHistorico(
      [toothNumber],
      `Superfície ${surface} alterada para: ${newStatus}`
    );

    this.props.updatedAt = new Date();
  }

  /**
   * Método de Domínio: Atualizar notas de um dente
   */
  atualizarNotas(toothNumber: number, notes: string): void {
    // Validações
    if (!ALL_TEETH.includes(toothNumber)) {
      throw new Error(`Número de dente inválido: ${toothNumber}`);
    }

    const tooth = this.props.teeth[toothNumber];
    if (!tooth) {
      throw new Error(`Dente ${toothNumber} não encontrado no odontograma`);
    }

    // Atualizar notas
    const now = new Date().toISOString();
    this.props.teeth[toothNumber] = {
      ...tooth,
      notes,
      updatedAt: now,
    };

    this.props.updatedAt = new Date();
  }

  /**
   * Método de Domínio: Adicionar entrada no histórico
   */
  private adicionarHistorico(changedTeeth: number[], description?: string): void {
    const historyEntry: OdontogramaHistoryEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      teeth: { ...this.props.teeth },
      changedTeeth,
      description,
    };

    this.props.history.push(historyEntry);
    this.props.lastUpdated = new Date();
  }

  /**
   * Método de Domínio: Buscar dente por número
   */
  buscarDente(toothNumber: number): ToothData | null {
    return this.props.teeth[toothNumber] || null;
  }

  /**
   * Método de Domínio: Buscar dentes por status
   */
  buscarDentesPorStatus(status: ToothStatus): ToothData[] {
    return Object.values(this.props.teeth).filter(tooth => tooth.status === status);
  }

  /**
   * Método de Domínio: Contar dentes por status
   */
  contarDentesPorStatus(): Record<ToothStatus, number> {
    const counts: Record<ToothStatus, number> = {
      higido: 0,
      cariado: 0,
      obturado: 0,
      extraido: 0,
      ausente: 0,
      implante: 0,
    };

    Object.values(this.props.teeth).forEach(tooth => {
      counts[tooth.status]++;
    });

    return counts;
  }

  /**
   * Converte para objeto plain (para persistência)
   */
  toObject(): OdontogramaProps {
    return {
      id: this.props.id,
      prontuarioId: this.props.prontuarioId,
      teeth: { ...this.props.teeth },
      lastUpdated: this.props.lastUpdated,
      history: [...this.props.history],
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
