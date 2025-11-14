import { ContaPagar, CategoriaContaPagar } from '../entities/ContaPagar';

/**
 * Interface do repositório de Contas a Pagar
 * Define o contrato que os adapters de infraestrutura devem implementar
 */
export interface IContaPagarRepository {
  /**
   * Busca uma conta por ID
   */
  findById(id: string): Promise<ContaPagar | null>;

  /**
   * Busca todas as contas de uma clínica
   */
  findByClinicId(clinicId: string): Promise<ContaPagar[]>;

  /**
   * Busca contas pendentes de uma clínica
   */
  findPendentes(clinicId: string): Promise<ContaPagar[]>;

  /**
   * Busca contas vencidas de uma clínica
   */
  findVencidas(clinicId: string): Promise<ContaPagar[]>;

  /**
   * Busca contas por fornecedor
   */
  findByFornecedor(clinicId: string, fornecedor: string): Promise<ContaPagar[]>;

  /**
   * Busca contas por categoria
   */
  findByCategoria(clinicId: string, categoria: CategoriaContaPagar): Promise<ContaPagar[]>;

  /**
   * Busca contas em um período
   */
  findByPeriodo(clinicId: string, startDate: Date, endDate: Date): Promise<ContaPagar[]>;

  /**
   * Salva uma nova conta
   */
  save(conta: ContaPagar): Promise<void>;

  /**
   * Atualiza uma conta existente
   */
  update(conta: ContaPagar): Promise<void>;

  /**
   * Remove uma conta
   */
  delete(id: string): Promise<void>;
}
