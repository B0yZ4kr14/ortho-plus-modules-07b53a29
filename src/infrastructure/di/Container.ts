/**
 * Simple Dependency Injection Container
 * 
 * Implementa o padrão Service Locator com register/resolve
 * para gerenciar dependências e facilitar testabilidade.
 */

type ServiceFactory<T> = () => T;
type ServiceInstance<T> = T;

export class Container {
  private services: Map<string, ServiceFactory<any> | ServiceInstance<any>> = new Map();
  private singletons: Map<string, ServiceInstance<any>> = new Map();

  /**
   * Registra um serviço no container
   * @param key - Identificador único do serviço
   * @param factory - Factory function ou instância do serviço
   * @param singleton - Se true, retorna sempre a mesma instância
   */
  register<T>(key: string, factory: ServiceFactory<T> | ServiceInstance<T>, singleton: boolean = true): void {
    this.services.set(key, factory);
    
    if (singleton && typeof factory !== 'function') {
      this.singletons.set(key, factory);
    }
  }

  /**
   * Resolve um serviço do container
   * @param key - Identificador do serviço
   * @returns Instância do serviço
   */
  resolve<T>(key: string): T {
    // Verificar se é singleton já instanciado
    if (this.singletons.has(key)) {
      return this.singletons.get(key) as T;
    }

    const service = this.services.get(key);

    if (!service) {
      throw new Error(`Serviço não registrado: ${key}`);
    }

    // Se é função, chamar factory
    if (typeof service === 'function') {
      const instance = service();
      
      // Armazenar como singleton se aplicável
      if (!this.singletons.has(key)) {
        this.singletons.set(key, instance);
      }
      
      return instance as T;
    }

    // Retornar instância direta
    return service as T;
  }

  /**
   * Verifica se um serviço está registrado
   */
  has(key: string): boolean {
    return this.services.has(key);
  }

  /**
   * Remove um serviço do container
   */
  unregister(key: string): void {
    this.services.delete(key);
    this.singletons.delete(key);
  }

  /**
   * Limpa todos os serviços
   */
  clear(): void {
    this.services.clear();
    this.singletons.clear();
  }

  /**
   * Cria um novo escopo (para testes)
   */
  createScope(): Container {
    const scope = new Container();
    
    // Copiar registros para o novo escopo
    this.services.forEach((factory, key) => {
      scope.register(key, factory, false);
    });
    
    return scope;
  }
}

// Container global da aplicação
export const container = new Container();
