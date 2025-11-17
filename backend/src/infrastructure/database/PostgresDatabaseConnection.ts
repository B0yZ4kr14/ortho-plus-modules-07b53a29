/**
 * PostgresDatabaseConnection - Implementação PostgreSQL nativo
 * 
 * Suporta:
 * - Supabase Self-Hosted
 * - PostgreSQL local/on-premises
 */

import { Pool, PoolClient } from 'pg';
import {
  IDatabaseConnection,
  DatabaseConfig,
  QueryResult,
  Transaction,
} from './IDatabaseConnection';
import { logger } from '@/infrastructure/logger';

export class PostgresDatabaseConnection implements IDatabaseConnection {
  private pool: Pool;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
    this.pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl: config.ssl ? { rejectUnauthorized: false } : false,
      max: 20, // max pool size
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      statement_timeout: 30000,
      ...(config.schema && { 
        options: `-c search_path=${config.schema},public` 
      }),
    });

    this.pool.on('error', (err) => {
      logger.error('Unexpected database pool error', { error: err, config: this.config });
    });

    logger.info('PostgreSQL connection pool initialized', {
      host: config.host,
      database: config.database,
      schema: config.schema,
    });
  }

  async query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const result = await this.pool.query(sql, params);
      const duration = Date.now() - start;
      
      logger.debug('Query executed', {
        sql: sql.substring(0, 100),
        params: params?.length,
        rowCount: result.rowCount,
        duration,
      });

      return {
        rows: result.rows as T[],
        rowCount: result.rowCount || 0,
      };
    } catch (error) {
      logger.error('Query execution failed', {
        sql: sql.substring(0, 100),
        params: params?.length,
        error,
      });
      throw error;
    }
  }

  async beginTransaction(): Promise<Transaction> {
    const client = await this.pool.connect();
    await client.query('BEGIN');

    return {
      query: async <T = any>(sql: string, params?: any[]) => {
        const result = await client.query(sql, params);
        return {
          rows: result.rows as T[],
          rowCount: result.rowCount || 0,
        };
      },
      commit: async () => {
        try {
          await client.query('COMMIT');
        } finally {
          client.release();
        }
      },
      rollback: async () => {
        try {
          await client.query('ROLLBACK');
        } finally {
          client.release();
        }
      },
    };
  }

  async queryWithRetry<T = any>(
    sql: string,
    params?: any[],
    maxRetries: number = 3
  ): Promise<QueryResult<T>> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.query<T>(sql, params);
      } catch (error) {
        lastError = error as Error;
        logger.warn('Query retry attempt', {
          attempt,
          maxRetries,
          sql: sql.substring(0, 100),
          error,
        });

        if (attempt < maxRetries) {
          // Exponential backoff
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempt) * 100)
          );
        }
      }
    }

    throw lastError;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.pool.query('SELECT 1 as health');
      return result.rows[0]?.health === 1;
    } catch (error) {
      logger.error('Health check failed', { error });
      return false;
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
    logger.info('PostgreSQL connection pool closed', {
      database: this.config.database,
    });
  }

  getPool(): Pool {
    return this.pool;
  }
}
