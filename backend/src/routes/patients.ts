import { Router } from 'express';
import { getPatients, getPatientById, createPatient } from '../controllers/patientsController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);
router.get('/', getPatients);
router.get('/:id', getPatientById);
router.post('/', createPatient);

export default router;
