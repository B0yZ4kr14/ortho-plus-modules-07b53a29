import { MovimentoCaixa } from '../entities/MovimentoCaixa';

/**
 * Interface do repositório de Movimentos de Caixa
 * Define o contrato que os adapters de infraestrutura devem implementar
 */
export interface IMovimentoCaixaRepository {
  /**
   * Busca um movimento por ID
   */
  findById(id: string): Promise<MovimentoCaixa | null>;

  /**
   * Busca todos os movimentos de uma clínica
   */
  findByClinicId(clinicId: string): Promise<MovimentoCaixa[]>;

  /**
   * Busca movimentos abertos de uma clínica
   */
  findAbertos(clinicId: string): Promise<MovimentoCaixa[]>;

  /**
   * Busca o último movimento aberto
   */
  findUltimoAberto(clinicId: string): Promise<MovimentoCaixa | null>;

  /**
   * Busca movimentos em um período
   */
  findByPeriodo(clinicId: string, startDate: Date, endDate: Date): Promise<MovimentoCaixa[]>;

  /**
   * Busca sangrías de uma clínica
   */
  findSangrias(clinicId: string): Promise<MovimentoCaixa[]>;

  /**
   * Salva um novo movimento
   */
  save(movimento: MovimentoCaixa): Promise<void>;

  /**
   * Atualiza um movimento existente
   */
  update(movimento: MovimentoCaixa): Promise<void>;

  /**
   * Remove um movimento
   */
  delete(id: string): Promise<void>;
}
