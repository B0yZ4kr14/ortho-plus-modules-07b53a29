/**
 * Dashboard Router
 */

import { Router } from 'express';
import { IDatabaseConnection } from '@/infrastructure/database/IDatabaseConnection';
import { DashboardController } from '../controllers/DashboardController';

export function createDashboardRouter(db: IDatabaseConnection): Router {
  const router = Router();
  const controller = new DashboardController(db);

  /**
   * GET /api/dashboard/overview
   * Retorna dados consolidados do dashboard
   */
  router.get('/overview', (req, res) => controller.getOverview(req, res));

  return router;
}
