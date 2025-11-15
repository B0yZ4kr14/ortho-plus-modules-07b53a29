import { Module } from '../entities/Module';

export interface ModuleDependency {
  module_key: string;
  depends_on_module_key: string;
  depends_on_module_name: string;
}

/**
 * Interface do repositório de módulos
 * Define o contrato que os adapters de infraestrutura devem implementar
 */
export interface IModuleRepository {
  /**
   * Busca um módulo por ID
   */
  findById(id: number): Promise<Module | null>;

  /**
   * Busca um módulo por chave
   */
  findByKey(moduleKey: string): Promise<Module | null>;

  /**
   * Busca todos os módulos contratados de uma clínica
   */
  findByClinicId(clinicId: string): Promise<Module[]>;

  /**
   * Busca módulos ativos de uma clínica
   */
  findActiveByClinicId(clinicId: string): Promise<Module[]>;

  /**
   * Busca módulos por categoria
   */
  findByCategory(category: string): Promise<Module[]>;

  /**
   * Ativa um módulo
   */
  activate(moduleId: number, clinicId: string): Promise<void>;

  /**
   * Desativa um módulo
   */
  deactivate(moduleId: number, clinicId: string): Promise<void>;

  /**
   * Busca dependências de um módulo
   */
  findDependencies(moduleKey: string): Promise<ModuleDependency[]>;

  /**
   * Busca módulos ativos que dependem de um módulo específico
   */
  findDependentsActive(moduleKey: string, clinicId: string): Promise<Array<{
    module_key: string;
    name: string;
  }>>;
}
