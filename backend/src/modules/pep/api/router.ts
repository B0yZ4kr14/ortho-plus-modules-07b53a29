import { Router, Request, Response } from 'express';
import { PepController } from './PepController';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function createPepRouter(): Router {
  const router = Router();
  const controller = new PepController();

  // Prontuarios
  router.post('/prontuarios', (req, res) => controller.createProntuario(req, res));
  router.get('/prontuarios/patient/:patientId', (req, res) => controller.listProntuariosByPatient(req, res));
  router.post('/prontuarios/:id/assinar', (req, res) => controller.assinarDigitalmente(req, res));

  // Odontogramas
  router.get('/odontogramas/:id', async (req: Request, res: Response) => {
    try {
      const data = await (prisma as any).odontogramas.findUnique({ where: { id: req.params.id } });
      if (!data) return res.status(404).json({ error: 'Odontograma not found' });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  router.get('/odontogramas/history', async (req: Request, res: Response) => {
    try {
      const { patient_id } = req.query;
      const data = await (prisma as any).pep_odontograma_history.findMany({
        where: patient_id ? { patient_id: String(patient_id) } : {},
        orderBy: { created_at: 'desc' },
      });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  router.post('/odontogramas/history', async (req: Request, res: Response) => {
    try {
      const data = await (prisma as any).pep_odontograma_history.create({ data: req.body });
      return res.status(201).json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  router.put('/odontogramas/:id', async (req: Request, res: Response) => {
    try {
      const data = await (prisma as any).odontogramas.update({
        where: { id: req.params.id },
        data: req.body,
      });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  return router;
}
