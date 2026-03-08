import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export class SplitPagamentoController {
  // --- Configuração de split ---
  async getConfig(req: Request, res: Response) {
    try {
      const { clinic_id } = req.query;
      const where = clinic_id ? { clinic_id: String(clinic_id) } : {};
      const data = await (prisma as any).split_pagamento_config.findMany({
        where,
      });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async upsertConfig(req: Request, res: Response) {
    try {
      const { clinic_id, ...rest } = req.body;
      const existing = await (prisma as any).split_pagamento_config.findFirst({
        where: { clinic_id },
      });
      let data;
      if (existing) {
        data = await (prisma as any).split_pagamento_config.update({
          where: { id: existing.id },
          data: rest,
        });
      } else {
        data = await (prisma as any).split_pagamento_config.create({
          data: { clinic_id, ...rest },
        });
      }
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // --- Comissões ---
  async listComissoes(req: Request, res: Response) {
    try {
      const { clinic_id, dentist_id, periodo } = req.query;
      const where: any = {};
      if (clinic_id) where.clinic_id = String(clinic_id);
      if (dentist_id) where.dentist_id = String(dentist_id);
      if (periodo) where.periodo = String(periodo);
      const data = await (prisma as any).split_comissoes.findMany({
        where,
        orderBy: { created_at: "desc" },
      });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createComissao(req: Request, res: Response) {
    try {
      const data = await (prisma as any).split_comissoes.create({
        data: req.body,
      });
      return res.status(201).json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // --- Transações ---
  async listTransacoes(req: Request, res: Response) {
    try {
      const { clinic_id, status } = req.query;
      const where: any = {};
      if (clinic_id) where.clinic_id = String(clinic_id);
      if (status) where.status = String(status);
      const data = await (prisma as any).split_transacoes.findMany({
        where,
        orderBy: { created_at: "desc" },
      });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
