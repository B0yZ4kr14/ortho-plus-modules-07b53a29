import { Router } from 'express';
import { getClinics, getClinicById } from '../controllers/clinicsController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);
router.get('/', getClinics);
router.get('/:id', getClinicById);

export default router;
