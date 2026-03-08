import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export class AdminToolsController {
  // --- ADRs ---
  async listADRs(_req: Request, res: Response) {
    try {
      const data = await (prisma as any).architecture_decision_records.findMany({
        orderBy: { created_at: "desc" },
      });
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async createADR(req: Request, res: Response) {
    try {
      const data = await (prisma as any).architecture_decision_records.create({ data: req.body });
      res.status(201).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // --- Wiki ---
  async listWiki(_req: Request, res: Response) {
    try {
      const data = await (prisma as any).wiki_pages.findMany({
        orderBy: { updated_at: "desc" },
      });
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async createWikiEntry(req: Request, res: Response) {
    try {
      const data = await (prisma as any).wiki_pages.create({
        data: req.body,
      });
      res.status(201).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateWikiEntry(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await (prisma as any).wiki_pages.update({
        where: { id },
        data: req.body,
      });
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
