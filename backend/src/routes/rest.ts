import { Router } from 'express';
import * as restController from '../controllers/restController';

const router = Router();

// To emulate Supabase's /rest/v1/:table
router.get('/:table', restController.getAll);
router.get('/:table/:id', restController.getById);
router.post('/:table', restController.create);
router.patch('/:table/:id', restController.update);
router.delete('/:table/:id', restController.remove);

export default router;
