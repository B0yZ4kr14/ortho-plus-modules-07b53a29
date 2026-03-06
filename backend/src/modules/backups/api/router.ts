import { Router } from 'express';
import { backupController } from './backupController';

const router = Router();

// Endpoint que emula a Edge Function 'backup-manager'
// Gerencia deduplication, immutability, streaming, integrity-check, auto-config,
// download, replicate, test-restore, upload-cloud, validate, volatility-check
router.post('/manager', backupController.manager);

export default router;
