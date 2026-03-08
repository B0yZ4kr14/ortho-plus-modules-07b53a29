import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export class InadimplenciaController {
  // --- Inadimplentes ---
  async listInadimplentes(req: Request, res: Response) {
    try {
      const { clinic_id, status } = req.query;
      const where: any = {};
      if (clinic_id) where.clinic_id = String(clinic_id);
      if (status) where.status = String(status);
      const data = await (prisma as any).inadimplentes.findMany({
        where,
        orderBy: { valor_devido: "desc" },
      });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getInadimplente(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await (prisma as any).inadimplentes.findUnique({
        where: { id },
      });
      if (!data) return res.status(404).json({ error: "Inadimplente not found" });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async updateInadimplente(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await (prisma as any).inadimplentes.update({
        where: { id },
        data: req.body,
      });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // --- Campanhas de cobrança ---
  async listCampanhasCobranca(req: Request, res: Response) {
    try {
      const { clinic_id, status } = req.query;
      const where: any = {};
      if (clinic_id) where.clinic_id = String(clinic_id);
      if (status) where.status = String(status);
      const data = await (prisma as any).campanhas_inadimplencia.findMany({
        where,
        orderBy: { created_at: "desc" },
      });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createCampanhaCobranca(req: Request, res: Response) {
    try {
      const data = await (prisma as any).campanhas_inadimplencia.create({
        data: req.body,
      });
      return res.status(201).json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async updateCampanhaCobranca(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await (prisma as any).campanhas_inadimplencia.update({
        where: { id },
        data: req.body,
      });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
