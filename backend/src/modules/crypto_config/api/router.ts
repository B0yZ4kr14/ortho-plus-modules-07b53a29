/**
 * Crypto Config Module Router
 */

import { Router } from 'express';
import { CryptoConfigController } from './CryptoConfigController';

export function createCryptoConfigRouter(): Router {
  const router = Router();
  const controller = new CryptoConfigController();

  router.get('/exchanges', (req, res) => controller.listExchanges(req, res));
  router.post('/exchanges', (req, res) => controller.createExchange(req, res));
  router.get('/portfolio', (req, res) => controller.getPortfolio(req, res));
  router.get('/dca-strategies', (req, res) => controller.getDCAStrategies(req, res));

  return router;
}
