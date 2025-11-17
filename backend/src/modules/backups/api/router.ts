/**
 * Backups Module Router
 */

import { Router } from 'express';
import { BackupsController } from './BackupsController';

export function createBackupsRouter(): Router {
  const router = Router();
  const controller = new BackupsController();

  router.get('/', (req, res) => controller.listBackups(req, res));
  router.post('/', (req, res) => controller.createBackup(req, res));
  router.get('/statistics', (req, res) => controller.getBackupStatistics(req, res));
  router.post('/:backupId/verify', (req, res) => controller.verifyBackup(req, res));

  return router;
}
