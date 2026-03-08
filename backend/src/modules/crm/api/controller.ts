import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export class CRMController {
  async listLeads(req: Request, res: Response) {
    try {
      const { clinic_id, status } = req.query;
      const where: any = {};
      if (clinic_id) where.clinic_id = String(clinic_id);
      if (status) where.status = String(status);
      const data = await (prisma as any).crm_leads.findMany({
        where,
        orderBy: { created_at: "desc" },
      });
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getLeadById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await (prisma as any).crm_leads.findUnique({ where: { id } });
      if (!data) return res.status(404).json({ error: "Lead not found" });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createLead(req: Request, res: Response) {
    try {
      const data = await (prisma as any).crm_leads.create({ data: req.body });
      return res.status(201).json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async updateLead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await (prisma as any).crm_leads.update({
        where: { id },
        data: req.body,
      });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async deleteLead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await (prisma as any).crm_leads.delete({ where: { id } });
      return res.status(204).send();
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
