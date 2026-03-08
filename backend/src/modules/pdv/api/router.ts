import { Router } from 'express';
import { PdvController } from './PdvController';
import { PDVController as PDVDashboardController } from './controller';

export function createPdvRouter(): Router {
  const router = Router();
  const controller = new PdvController();
  const dashboardCtrl = new PDVDashboardController();

  router.post('/vendas', (req, res) => controller.createVenda(req, res));
  router.get('/vendas', (req, res) => controller.listVendas(req, res));
  router.get('/dashboard-executivo', (req, res) => dashboardCtrl.getDashboardExecutivo(req, res));
  router.get('/metas-gamificacao', (req, res) => dashboardCtrl.getMetasGamificacao(req, res));

  return router;
}
