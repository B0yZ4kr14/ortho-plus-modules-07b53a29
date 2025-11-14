import { IncidenteCaixa, TipoIncidenteCaixa } from '../entities/IncidenteCaixa';

/**
 * Interface do repositório de Incidentes de Caixa
 * Define o contrato que os adapters de infraestrutura devem implementar
 */
export interface IIncidenteCaixaRepository {
  /**
   * Busca um incidente por ID
   */
  findById(id: string): Promise<IncidenteCaixa | null>;

  /**
   * Busca todos os incidentes de uma clínica
   */
  findByClinicId(clinicId: string): Promise<IncidenteCaixa[]>;

  /**
   * Busca incidentes por tipo
   */
  findByTipo(clinicId: string, tipo: TipoIncidenteCaixa): Promise<IncidenteCaixa[]>;

  /**
   * Busca incidentes em um período
   */
  findByPeriodo(clinicId: string, startDate: Date, endDate: Date): Promise<IncidenteCaixa[]>;

  /**
   * Busca incidentes graves (valor alto ou tipo roubo)
   */
  findGraves(clinicId: string): Promise<IncidenteCaixa[]>;

  /**
   * Salva um novo incidente
   */
  save(incidente: IncidenteCaixa): Promise<void>;

  /**
   * Atualiza um incidente existente
   */
  update(incidente: IncidenteCaixa): Promise<void>;

  /**
   * Remove um incidente
   */
  delete(id: string): Promise<void>;
}
