import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export class FidelidadeController {
  // --- Pontos ---
  async getPoints(req: Request, res: Response) {
    try {
      const { patient_id, clinic_id } = req.query;
      const where: any = {};
      if (patient_id) where.patient_id = String(patient_id);
      if (clinic_id) where.clinic_id = String(clinic_id);
      const data = await (prisma as any).fidelidade_pontos.findMany({
        where,
        orderBy: { created_at: "desc" },
      });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async addPoints(req: Request, res: Response) {
    try {
      const data = await (prisma as any).fidelidade_pontos.create({
        data: req.body,
      });
      return res.status(201).json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // --- Badges ---
  async listBadges(req: Request, res: Response) {
    try {
      const { clinic_id } = req.query;
      const where = clinic_id ? { clinic_id: String(clinic_id) } : {};
      const data = await (prisma as any).fidelidade_badges.findMany({
        where,
        orderBy: { nome: "asc" },
      });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createBadge(req: Request, res: Response) {
    try {
      const data = await (prisma as any).fidelidade_badges.create({
        data: req.body,
      });
      return res.status(201).json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // --- Recompensas ---
  async listRecompensas(req: Request, res: Response) {
    try {
      const { clinic_id, ativo } = req.query;
      const where: any = {};
      if (clinic_id) where.clinic_id = String(clinic_id);
      if (ativo !== undefined) where.ativo = ativo === "true";
      const data = await (prisma as any).fidelidade_recompensas.findMany({
        where,
        orderBy: { pontos_necessarios: "asc" },
      });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createRecompensa(req: Request, res: Response) {
    try {
      const data = await (prisma as any).fidelidade_recompensas.create({
        data: req.body,
      });
      return res.status(201).json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // --- Indicações ---
  async listIndicacoes(req: Request, res: Response) {
    try {
      const { clinic_id, referrer_id } = req.query;
      const where: any = {};
      if (clinic_id) where.clinic_id = String(clinic_id);
      if (referrer_id) where.referrer_id = String(referrer_id);
      const data = await (prisma as any).fidelidade_indicacoes.findMany({
        where,
        orderBy: { created_at: "desc" },
      });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createIndicacao(req: Request, res: Response) {
    try {
      const data = await (prisma as any).fidelidade_indicacoes.create({
        data: req.body,
      });
      return res.status(201).json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
