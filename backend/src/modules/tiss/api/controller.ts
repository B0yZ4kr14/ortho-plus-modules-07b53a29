import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export class TISSController {
  // --- Guias ---
  async listGuias(req: Request, res: Response) {
    try {
      const { clinic_id, tipo, status } = req.query;
      const where: any = {};
      if (clinic_id) where.clinic_id = String(clinic_id);
      if (tipo) where.tipo = String(tipo);
      if (status) where.status = String(status);
      const data = await (prisma as any).tiss_guias.findMany({
        where,
        orderBy: { created_at: "desc" },
      });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getGuiaById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await (prisma as any).tiss_guias.findUnique({
        where: { id },
      });
      if (!data) return res.status(404).json({ error: "Guia not found" });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createGuia(req: Request, res: Response) {
    try {
      const data = await (prisma as any).tiss_guias.create({ data: req.body });
      return res.status(201).json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async updateGuia(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await (prisma as any).tiss_guias.update({
        where: { id },
        data: req.body,
      });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // --- Lotes ---
  async listLotes(req: Request, res: Response) {
    try {
      const { clinic_id, status } = req.query;
      const where: any = {};
      if (clinic_id) where.clinic_id = String(clinic_id);
      if (status) where.status = String(status);
      const data = await (prisma as any).tiss_lotes.findMany({
        where,
        orderBy: { created_at: "desc" },
      });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createLote(req: Request, res: Response) {
    try {
      const data = await (prisma as any).tiss_lotes.create({ data: req.body });
      return res.status(201).json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async updateLote(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await (prisma as any).tiss_lotes.update({
        where: { id },
        data: req.body,
      });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
