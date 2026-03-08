import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export class BIController {
  // --- Dashboards ---
  async listDashboards(req: Request, res: Response) {
    try {
      const { clinic_id } = req.query;
      const where = clinic_id ? { clinic_id: String(clinic_id) } : {};
      const data = await (prisma as any).bi_dashboards.findMany({
        where,
        orderBy: { created_at: "desc" },
      });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getDashboardById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await (prisma as any).bi_dashboards.findUnique({
        where: { id },
      });
      if (!data) return res.status(404).json({ error: "Dashboard not found" });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createDashboard(req: Request, res: Response) {
    try {
      const data = await (prisma as any).bi_dashboards.create({
        data: req.body,
      });
      return res.status(201).json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async updateDashboard(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await (prisma as any).bi_dashboards.update({
        where: { id },
        data: req.body,
      });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // --- Metricas ---
  async getMetricas(req: Request, res: Response) {
    try {
      const { clinic_id, periodo, tipo } = req.query;
      const where: any = {};
      if (clinic_id) where.clinic_id = String(clinic_id);
      if (periodo) where.periodo = String(periodo);
      if (tipo) where.tipo = String(tipo);
      const data = await (prisma as any).bi_metricas.findMany({
        where,
        orderBy: { data_referencia: "desc" },
      });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // --- Widgets ---
  async listWidgets(req: Request, res: Response) {
    try {
      const { dashboard_id } = req.params;
      const data = await (prisma as any).bi_widgets.findMany({
        where: { dashboard_id },
        orderBy: { posicao: "asc" },
      });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createWidget(req: Request, res: Response) {
    try {
      const { dashboard_id } = req.params;
      const data = await (prisma as any).bi_widgets.create({
        data: { ...req.body, dashboard_id },
      });
      return res.status(201).json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async updateWidget(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await (prisma as any).bi_widgets.update({
        where: { id },
        data: req.body,
      });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async deleteWidget(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await (prisma as any).bi_widgets.delete({ where: { id } });
      return res.status(204).send();
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
