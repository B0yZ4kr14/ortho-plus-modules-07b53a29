import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export class MarketingController {
  // --- Campanhas ---
  async listCampanhas(req: Request, res: Response) {
    try {
      const { clinic_id, status } = req.query;
      const where: any = {};
      if (clinic_id) where.clinic_id = String(clinic_id);
      if (status) where.status = String(status);
      const data = await (prisma as any).marketing_campanhas.findMany({
        where,
        orderBy: { created_at: "desc" },
      });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getCampanhaById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await (prisma as any).marketing_campanhas.findUnique({
        where: { id },
      });
      if (!data) return res.status(404).json({ error: "Campanha not found" });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createCampanha(req: Request, res: Response) {
    try {
      const data = await (prisma as any).marketing_campanhas.create({
        data: req.body,
      });
      return res.status(201).json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async updateCampanha(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await (prisma as any).marketing_campanhas.update({
        where: { id },
        data: req.body,
      });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // --- Envios ---
  async listEnvios(req: Request, res: Response) {
    try {
      const { campanha_id, status } = req.query;
      const where: any = {};
      if (campanha_id) where.campanha_id = String(campanha_id);
      if (status) where.status = String(status);
      const data = await (prisma as any).marketing_envios.findMany({
        where,
        orderBy: { enviado_em: "desc" },
      });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createEnvio(req: Request, res: Response) {
    try {
      const data = await (prisma as any).marketing_envios.create({
        data: req.body,
      });
      return res.status(201).json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // --- Recalls ---
  async listRecalls(req: Request, res: Response) {
    try {
      const { clinic_id, tipo } = req.query;
      const where: any = {};
      if (clinic_id) where.clinic_id = String(clinic_id);
      if (tipo) where.tipo = String(tipo);
      const data = await (prisma as any).marketing_recalls.findMany({
        where,
        orderBy: { data_recall: "desc" },
      });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createRecall(req: Request, res: Response) {
    try {
      const data = await (prisma as any).marketing_recalls.create({
        data: req.body,
      });
      return res.status(201).json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
