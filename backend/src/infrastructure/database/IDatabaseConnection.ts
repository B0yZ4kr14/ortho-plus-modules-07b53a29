/**
 * IDatabaseConnection - Abstração de conexão com banco de dados
 * 
 * Permite trocar implementação (Supabase Cloud <-> PostgreSQL local)
 * sem alterar lógica de negócio dos módulos.
 */

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  schema?: string;
  ssl?: boolean;
}

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

export interface Transaction {
  query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

export interface IDatabaseConnection {
  /**
   * Executa query SQL simples
   */
  query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>>;

  /**
   * Inicia transação para operações atômicas
   */
  beginTransaction(): Promise<Transaction>;

  /**
   * Executa query com retry automático
   */
  queryWithRetry<T = any>(
    sql: string,
    params?: any[],
    maxRetries?: number
  ): Promise<QueryResult<T>>;

  /**
   * Verifica saúde da conexão
   */
  healthCheck(): Promise<boolean>;

  /**
   * Fecha conexão
   */
  close(): Promise<void>;

  /**
   * Obtém pool de conexões para uso direto (se necessário)
   */
  getPool(): any;
}

/**
 * Tipo de implementação de banco
 */
export enum DatabaseType {
  SUPABASE_CLOUD = 'supabase_cloud',
  SUPABASE_SELF_HOSTED = 'supabase_self_hosted',
  POSTGRES_LOCAL = 'postgres_local',
}
