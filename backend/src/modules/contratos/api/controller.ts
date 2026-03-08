import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export class ContratosController {
  async list(req: Request, res: Response) {
    try {
      const { clinic_id } = req.query;
      const where = clinic_id ? { clinic_id: String(clinic_id) } : {};
      const data = await (prisma as any).contratos.findMany({
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
      const data = await (prisma as any).contratos.findUnique({ where: { id } });
      if (!data) return res.status(404).json({ error: "Contrato not found" });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const data = await (prisma as any).contratos.create({ data: req.body });
      return res.status(201).json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await (prisma as any).contratos.update({
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
      await (prisma as any).contratos.delete({ where: { id } });
      return res.status(204).send();
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async listTemplates(_req: Request, res: Response) {
    try {
      const data = await (prisma as any).contrato_templates.findMany({
        orderBy: { nome: "asc" },
      });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
