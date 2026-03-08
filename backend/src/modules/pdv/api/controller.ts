import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export class PDVController {
  async getDashboardExecutivo(req: Request, res: Response) {
    try {
      const { clinic_id, periodo } = req.query;
      const where: any = {};
      if (clinic_id) where.clinic_id = String(clinic_id);
      if (periodo) where.periodo = String(periodo);
      const data = await (prisma as any).pdv_dashboard.findMany({
        where,
        orderBy: { data_referencia: "desc" },
      });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getMetasGamificacao(req: Request, res: Response) {
    try {
      const { clinic_id } = req.query;
      const where = clinic_id ? { clinic_id: String(clinic_id) } : {};
      const data = await (prisma as any).pdv_metas_gamificacao.findMany({
        where,
        orderBy: { created_at: "desc" },
      });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
