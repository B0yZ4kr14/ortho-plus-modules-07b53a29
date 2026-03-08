import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export class OrcamentosController {
  async list(req: Request, res: Response) {
    try {
      const { clinic_id, patient_id, status } = req.query;
      const where: any = {};
      if (clinic_id) where.clinic_id = String(clinic_id);
      if (patient_id) where.patient_id = String(patient_id);
      if (status) where.status = String(status);
      const data = await (prisma as any).orcamentos.findMany({
        where,
        orderBy: { created_at: "desc" },
      });
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await (prisma as any).orcamentos.findUnique({ where: { id } });
      if (!data) return res.status(404).json({ error: "Orçamento not found" });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const data = await (prisma as any).orcamentos.create({ data: req.body });
      return res.status(201).json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await (prisma as any).orcamentos.update({
        where: { id },
        data: req.body,
      });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await (prisma as any).orcamentos.delete({ where: { id } });
      return res.status(204).send();
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // --- Items ---
  async listItems(req: Request, res: Response) {
    try {
      const { orcamento_id } = req.params;
      const data = await (prisma as any).orcamento_itens.findMany({
        where: { orcamento_id },
        orderBy: { created_at: "asc" },
      });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async addItem(req: Request, res: Response) {
    try {
      const { orcamento_id } = req.params;
      const data = await (prisma as any).orcamento_itens.create({
        data: { ...req.body, orcamento_id },
      });
      return res.status(201).json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
