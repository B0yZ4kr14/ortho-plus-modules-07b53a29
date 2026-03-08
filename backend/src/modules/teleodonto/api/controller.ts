import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export class TeleodontoController {
  async listTeleconsultas(req: Request, res: Response) {
    try {
      const { clinic_id, status, dentist_id } = req.query;
      const where: any = {};
      if (clinic_id) where.clinic_id = String(clinic_id);
      if (status) where.status = String(status);
      if (dentist_id) where.dentist_id = String(dentist_id);
      const data = await (prisma as any).teleconsultas.findMany({
        where,
        orderBy: { scheduled_at: "desc" },
      });
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await (prisma as any).teleconsultas.findUnique({ where: { id } });
      if (!data) return res.status(404).json({ error: "Teleconsulta not found" });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const data = await (prisma as any).teleconsultas.create({ data: req.body });
      return res.status(201).json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await (prisma as any).teleconsultas.update({
        where: { id },
        data: req.body,
      });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
