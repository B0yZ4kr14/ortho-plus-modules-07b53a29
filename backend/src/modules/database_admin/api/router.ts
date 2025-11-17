/**
 * Database Admin Module Router
 */

import { Router } from 'express';
import { DatabaseAdminController } from './DatabaseAdminController';

export function createDatabaseAdminRouter(): Router {
  const router = Router();
  const controller = new DatabaseAdminController();

  router.get('/health', (req, res) => controller.getHealth(req, res));
  router.get('/slow-queries', (req, res) => controller.getSlowQueries(req, res));
  router.get('/connection-pool', (req, res) => controller.getConnectionPool(req, res));
  router.post('/maintenance', (req, res) => controller.runMaintenance(req, res));

  return router;
}
