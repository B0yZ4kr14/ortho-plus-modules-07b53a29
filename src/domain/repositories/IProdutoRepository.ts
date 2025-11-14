import { Produto } from '../entities/Produto';

/**
 * Interface do repositório de Produtos
 * Define o contrato que os adapters de infraestrutura devem implementar
 */
export interface IProdutoRepository {
  /**
   * Busca um produto por ID
   */
  findById(id: string): Promise<Produto | null>;

  /**
   * Busca produto por código de barras
   */
  findByCodigoBarras(codigoBarras: string, clinicId: string): Promise<Produto | null>;

  /**
   * Busca todos os produtos de uma clínica
   */
  findByClinicId(clinicId: string): Promise<Produto[]>;

  /**
   * Busca produtos ativos de uma clínica
   */
  findActiveByClinicId(clinicId: string): Promise<Produto[]>;

  /**
   * Busca produtos por categoria
   */
  findByCategoria(
    clinicId: string,
    categoria: 'MATERIAL' | 'MEDICAMENTO' | 'EQUIPAMENTO' | 'CONSUMIVEL' | 'OUTRO'
  ): Promise<Produto[]>;

  /**
   * Busca produtos com estoque baixo
   */
  findEstoqueBaixo(clinicId: string): Promise<Produto[]>;

  /**
   * Busca produtos com estoque zerado
   */
  findEstoqueZerado(clinicId: string): Promise<Produto[]>;

  /**
   * Salva um novo produto
   */
  save(produto: Produto): Promise<void>;

  /**
   * Atualiza um produto existente
   */
  update(produto: Produto): Promise<void>;

  /**
   * Remove um produto
   */
  delete(id: string): Promise<void>;
}
