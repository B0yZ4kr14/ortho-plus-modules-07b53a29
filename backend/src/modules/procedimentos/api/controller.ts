import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export class ProcedimentosController {
  async listTemplates(req: Request, res: Response) {
    try {
      const { clinic_id, especialidade } = req.query;
      const where: any = {};
      if (clinic_id) where.clinic_id = String(clinic_id);
      if (especialidade) where.especialidade = String(especialidade);
      const data = await (prisma as any).procedimento_templates.findMany({
        where,
        orderBy: { nome: "asc" },
      });
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getTemplateById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await (prisma as any).procedimento_templates.findUnique({
        where: { id },
      });
      if (!data) return res.status(404).json({ error: "Template not found" });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createTemplate(req: Request, res: Response) {
    try {
      const data = await (prisma as any).procedimento_templates.create({
        data: req.body,
      });
      return res.status(201).json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async updateTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await (prisma as any).procedimento_templates.update({
        where: { id },
        data: req.body,
      });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
