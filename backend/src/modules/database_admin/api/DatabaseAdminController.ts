/**
 * DatabaseAdminController
 * API para administração e monitoramento do banco de dados
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { DatabaseHealth } from '../domain/entities/DatabaseHealth';

export class DatabaseAdminController {
  async getHealth(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      // Mock data - em produção, consultar métricas reais do PostgreSQL
      const health = new DatabaseHealth({
        id: crypto.randomUUID(),
        clinicId,
        connectionPoolSize: 20,
        activeConnections: 8,
        idleConnections: 12,
        slowQueriesCount: 3,
        averageQueryTime: 45.2,
        diskUsagePercent: 65,
        lastVacuum: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        lastAnalyze: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        timestamp: new Date(),
      });

      res.json({
        health: health.toJSON(),
        isHealthy: health.isHealthy(),
        needsMaintenance: health.needsMaintenance(),
      });
    } catch (error) {
      console.error('Error getting database health:', error);
      res.status(500).json({ error: 'Erro ao obter saúde do banco' });
    }
  }

  async getSlowQueries(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      // Mock data - em produção, consultar pg_stat_statements
      const slowQueries = [
        {
          query: 'SELECT * FROM pacientes.pacientes WHERE clinic_id = $1',
          calls: 1250,
          averageTime: 125.5,
          totalTime: 156875,
          lastExecuted: new Date(),
        },
        {
          query: 'SELECT * FROM financeiro.transactions WHERE clinic_id = $1 AND status = $2',
          calls: 890,
          averageTime: 98.3,
          totalTime: 87487,
          lastExecuted: new Date(),
        },
      ];

      res.json({ slowQueries });
    } catch (error) {
      console.error('Error getting slow queries:', error);
      res.status(500).json({ error: 'Erro ao obter queries lentas' });
    }
  }

  async runMaintenance(req: Request, res: Response): Promise<void> {
    try {
      const schema = z.object({
        operation: z.enum(['VACUUM', 'ANALYZE', 'REINDEX', 'VACUUM_FULL']),
        targetSchema: z.string().optional(),
      });

      const { operation, targetSchema } = schema.parse(req.body);
      const clinicId = req.user?.clinicId;

      if (!clinicId || req.user?.role !== 'ADMIN') {
        res.status(403).json({ error: 'Acesso negado' });
        return;
      }

      console.log(`Running maintenance: ${operation} on ${targetSchema || 'all schemas'}`);

      // Mock - em produção, executar comandos reais de manutenção
      res.json({
        success: true,
        operation,
        startedAt: new Date(),
        message: `Manutenção ${operation} iniciada com sucesso`,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Dados inválidos', details: error.errors });
        return;
      }
      console.error('Error running maintenance:', error);
      res.status(500).json({ error: 'Erro ao executar manutenção' });
    }
  }

  async getConnectionPool(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      // Mock data - em produção, consultar pg_stat_activity
      const poolStats = {
        maxConnections: 100,
        activeConnections: 23,
        idleConnections: 15,
        waitingConnections: 2,
        connectionsByModule: {
          pacientes: 5,
          financeiro: 8,
          pep: 4,
          inventario: 3,
          pdv: 3,
        },
      };

      res.json({ poolStats });
    } catch (error) {
      console.error('Error getting connection pool:', error);
      res.status(500).json({ error: 'Erro ao obter pool de conexões' });
    }
  }
}
