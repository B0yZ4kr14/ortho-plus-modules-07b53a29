import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export class LGPDController {
  // --- Consentimentos ---
  async listConsentimentos(req: Request, res: Response) {
    try {
      const { patient_id, clinic_id } = req.query;
      const where: any = {};
      if (patient_id) where.patient_id = String(patient_id);
      if (clinic_id) where.clinic_id = String(clinic_id);
      const data = await (prisma as any).lgpd_data_consents.findMany({
        where,
        orderBy: { created_at: "desc" },
      });
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async createConsentimento(req: Request, res: Response) {
    try {
      const data = await (prisma as any).lgpd_data_consents.create({
        data: req.body,
      });
      res.status(201).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // --- Solicitações ---
  async listSolicitacoes(req: Request, res: Response) {
    try {
      const { clinic_id, status } = req.query;
      const where: any = {};
      if (clinic_id) where.clinic_id = String(clinic_id);
      if (status) where.status = String(status);
      const data = await (prisma as any).lgpd_data_requests.findMany({
        where,
        orderBy: { created_at: "desc" },
      });
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async createSolicitacao(req: Request, res: Response) {
    try {
      const data = await (prisma as any).lgpd_data_requests.create({
        data: req.body,
      });
      res.status(201).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateSolicitacao(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await (prisma as any).lgpd_data_requests.update({
        where: { id },
        data: req.body,
      });
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
