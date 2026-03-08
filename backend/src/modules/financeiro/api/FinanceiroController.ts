import { logger } from "@/infrastructure/logger";
import { PrismaClient } from '@prisma/client'; const prisma = new PrismaClient();
import { Request, Response } from "express";

export class FinanceiroController {
  // ═══════════════════ TRANSACTIONS ═══════════════════

  async listTransactions(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }

      const { type, status, category_id, start_date, end_date, related_entity_type, related_entity_id } = req.query;

      const where: any = { clinic_id: clinicId };
      if (type) where.type = type;
      if (status) where.status = status;
      if (category_id) where.category_id = category_id;
      if (related_entity_type) where.related_entity_type = related_entity_type;
      if (related_entity_id) where.related_entity_id = related_entity_id;
      if (start_date || end_date) {
        where.due_date = {};
        if (start_date) where.due_date.gte = new Date(start_date as string);
        if (end_date) where.due_date.lte = new Date(end_date as string);
      }

      const data = await (prisma as any).financial_transactions.findMany({
        where, orderBy: { due_date: "desc" },
      });
      res.json(data);
    } catch (error) {
      logger.error("Error listing transactions", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getTransaction(req: Request, res: Response): Promise<void> {
    try {
      const data = await (prisma as any).financial_transactions.findUnique({ where: { id: req.params.id } });
      if (!data) { res.status(404).json({ error: "Not found" }); return; }
      res.json(data);
    } catch (error) {
      logger.error("Error getting transaction", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async createTransaction(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      const userId = req.user?.id;
      if (!clinicId || !userId) { res.status(401).json({ error: "Auth required" }); return; }

      const data = await (prisma as any).financial_transactions.create({
        data: { ...req.body, clinic_id: clinicId, created_by: userId },
      });
      res.status(201).json(data);
    } catch (error) {
      logger.error("Error creating transaction", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateTransaction(req: Request, res: Response): Promise<void> {
    try {
      const data = await (prisma as any).financial_transactions.update({
        where: { id: req.params.id }, data: req.body,
      });
      res.json(data);
    } catch (error) {
      logger.error("Error updating transaction", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async deleteTransaction(req: Request, res: Response): Promise<void> {
    try {
      await (prisma as any).financial_transactions.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting transaction", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async markTransactionAsPaid(req: Request, res: Response): Promise<void> {
    try {
      const data = await (prisma as any).financial_transactions.update({
        where: { id: req.params.id },
        data: { status: "PAGO", paid_date: new Date().toISOString(), ...req.body },
      });
      res.json(data);
    } catch (error) {
      logger.error("Error marking transaction as paid", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // ═══════════════════ CATEGORIES ═══════════════════

  async listCategories(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }

      const { type, is_active, name } = req.query;
      const where: any = { clinic_id: clinicId };
      if (type) where.type = type;
      if (is_active !== undefined) where.is_active = is_active === "true";
      if (name) where.name = name;

      const data = await prisma.financial_categories.findMany({
        where, orderBy: { name: "asc" },
      });
      res.json(data);
    } catch (error) {
      logger.error("Error listing categories", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getCategory(req: Request, res: Response): Promise<void> {
    try {
      const data = await prisma.financial_categories.findUnique({ where: { id: req.params.id } });
      if (!data) { res.status(404).json({ error: "Not found" }); return; }
      res.json(data);
    } catch (error) {
      logger.error("Error getting category", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }

      const data = await prisma.financial_categories.create({
        data: { ...req.body, clinic_id: clinicId },
      });
      res.status(201).json(data);
    } catch (error) {
      logger.error("Error creating category", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateCategory(req: Request, res: Response): Promise<void> {
    try {
      const data = await prisma.financial_categories.update({
        where: { id: req.params.id }, data: req.body,
      });
      res.json(data);
    } catch (error) {
      logger.error("Error updating category", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      await prisma.financial_categories.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting category", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // ═══════════════════ CASH REGISTERS ═══════════════════

  async listCashRegisters(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }

      const { status, opened_by, start_date, end_date } = req.query;
      const where: any = { clinic_id: clinicId };
      if (status) where.status = status;
      if (opened_by) where.opened_by = opened_by;
      if (start_date || end_date) {
        where.opened_at = {};
        if (start_date) where.opened_at.gte = new Date(start_date as string);
        if (end_date) where.opened_at.lte = new Date(end_date as string);
      }

      const data = await (prisma as any).cash_registers.findMany({
        where, orderBy: { opened_at: "desc" },
      });
      res.json(data);
    } catch (error) {
      logger.error("Error listing cash registers", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getCashRegister(req: Request, res: Response): Promise<void> {
    try {
      const data = await (prisma as any).cash_registers.findUnique({ where: { id: req.params.id } });
      if (!data) { res.status(404).json({ error: "Not found" }); return; }
      res.json(data);
    } catch (error) {
      logger.error("Error getting cash register", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async createCashRegister(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }

      const data = await (prisma as any).cash_registers.create({
        data: { ...req.body, clinic_id: clinicId },
      });
      res.status(201).json(data);
    } catch (error) {
      logger.error("Error creating cash register", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateCashRegister(req: Request, res: Response): Promise<void> {
    try {
      const data = await (prisma as any).cash_registers.update({
        where: { id: req.params.id }, data: req.body,
      });
      res.json(data);
    } catch (error) {
      logger.error("Error updating cash register", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async deleteCashRegister(req: Request, res: Response): Promise<void> {
    try {
      await (prisma as any).cash_registers.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting cash register", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // ═══════════════════ CAIXA MOVIMENTOS ═══════════════════

  async listMovimentos(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }

      const { status, tipo, start_date, end_date } = req.query;
      const where: any = { clinic_id: clinicId };
      if (status) where.status = status;
      if (tipo) where.tipo = tipo;
      if (start_date || end_date) {
        where.created_at = {};
        if (start_date) where.created_at.gte = new Date(start_date as string);
        if (end_date) where.created_at.lte = new Date(end_date as string);
      }

      const data = await prisma.caixa_movimentos.findMany({
        where, orderBy: { created_at: "desc" },
      });
      res.json(data);
    } catch (error) {
      logger.error("Error listing movimentos", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getMovimento(req: Request, res: Response): Promise<void> {
    try {
      const data = await prisma.caixa_movimentos.findUnique({ where: { id: req.params.id } });
      if (!data) { res.status(404).json({ error: "Not found" }); return; }
      res.json(data);
    } catch (error) {
      logger.error("Error getting movimento", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async createMovimento(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }

      const data = await prisma.caixa_movimentos.create({
        data: { ...req.body, clinic_id: clinicId },
      });
      res.status(201).json(data);
    } catch (error) {
      logger.error("Error creating movimento", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateMovimento(req: Request, res: Response): Promise<void> {
    try {
      const data = await prisma.caixa_movimentos.update({
        where: { id: req.params.id }, data: req.body,
      });
      res.json(data);
    } catch (error) {
      logger.error("Error updating movimento", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async deleteMovimento(req: Request, res: Response): Promise<void> {
    try {
      await prisma.caixa_movimentos.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting movimento", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // ═══════════════════ CAIXA INCIDENTES ═══════════════════

  async listIncidentes(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }

      const { tipo_incidente, start_date, end_date, graves } = req.query;
      const where: any = { clinic_id: clinicId };
      if (tipo_incidente) where.tipo_incidente = tipo_incidente;
      if (start_date || end_date) {
        where.data_incidente = {};
        if (start_date) where.data_incidente.gte = new Date(start_date as string);
        if (end_date) where.data_incidente.lte = new Date(end_date as string);
      }
      if (graves === "true") {
        where.OR = [
          { tipo_incidente: "ROUBO" },
          { valor_perdido: { gt: 1000 } },
        ];
      }

      const data = await prisma.caixa_incidentes.findMany({
        where, orderBy: { data_incidente: "desc" },
      });
      res.json(data);
    } catch (error) {
      logger.error("Error listing incidentes", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getIncidente(req: Request, res: Response): Promise<void> {
    try {
      const data = await prisma.caixa_incidentes.findUnique({ where: { id: req.params.id } });
      if (!data) { res.status(404).json({ error: "Not found" }); return; }
      res.json(data);
    } catch (error) {
      logger.error("Error getting incidente", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async createIncidente(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }

      const data = await prisma.caixa_incidentes.create({
        data: { ...req.body, clinic_id: clinicId },
      });
      res.status(201).json(data);
    } catch (error) {
      logger.error("Error creating incidente", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateIncidente(req: Request, res: Response): Promise<void> {
    try {
      const data = await prisma.caixa_incidentes.update({
        where: { id: req.params.id }, data: req.body,
      });
      res.json(data);
    } catch (error) {
      logger.error("Error updating incidente", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async deleteIncidente(req: Request, res: Response): Promise<void> {
    try {
      await prisma.caixa_incidentes.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting incidente", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // ═══════════════════ CONTAS A RECEBER ═══════════════════

  async listContasReceber(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }

      const data = await prisma.contas_receber.findMany({
        where: { clinic_id: clinicId },
        orderBy: { data_vencimento: "asc" },
      });
      res.json(data);
    } catch (error) {
      logger.error("Error listing contas a receber", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async createContaReceber(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      const userId = req.user?.id;
      if (!clinicId || !userId) { res.status(401).json({ error: "Auth required" }); return; }

      const data = await prisma.contas_receber.create({
        data: { ...req.body, clinic_id: clinicId, created_by: userId },
      });
      res.status(201).json(data);
    } catch (error) {
      logger.error("Error creating conta a receber", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateContaReceber(req: Request, res: Response): Promise<void> {
    try {
      const data = await prisma.contas_receber.update({
        where: { id: req.params.id }, data: req.body,
      });
      res.json(data);
    } catch (error) {
      logger.error("Error updating conta a receber", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async deleteContaReceber(req: Request, res: Response): Promise<void> {
    try {
      await prisma.contas_receber.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting conta a receber", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // ═══════════════════ CONTAS A PAGAR ═══════════════════

  async listContasPagar(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }

      const data = await prisma.contas_pagar.findMany({
        where: { clinic_id: clinicId },
        orderBy: { data_vencimento: "asc" },
      });
      res.json(data);
    } catch (error) {
      logger.error("Error listing contas a pagar", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async createContaPagar(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      const userId = req.user?.id;
      if (!clinicId || !userId) { res.status(401).json({ error: "Auth required" }); return; }

      const data = await prisma.contas_pagar.create({
        data: { ...req.body, clinic_id: clinicId, created_by: userId },
      });
      res.status(201).json(data);
    } catch (error) {
      logger.error("Error creating conta a pagar", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateContaPagar(req: Request, res: Response): Promise<void> {
    try {
      const data = await prisma.contas_pagar.update({
        where: { id: req.params.id }, data: req.body,
      });
      res.json(data);
    } catch (error) {
      logger.error("Error updating conta a pagar", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async deleteContaPagar(req: Request, res: Response): Promise<void> {
    try {
      await prisma.contas_pagar.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting conta a pagar", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // ═══════════════════ NOTAS FISCAIS ═══════════════════

  async listNotasFiscais(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }

      const data = await prisma.notas_fiscais.findMany({
        where: { clinic_id: clinicId },
        orderBy: { data_emissao: "desc" },
      });
      res.json(data);
    } catch (error) {
      logger.error("Error listing notas fiscais", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async createNotaFiscal(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      const userId = req.user?.id;
      if (!clinicId || !userId) { res.status(401).json({ error: "Auth required" }); return; }

      const data = await prisma.notas_fiscais.create({
        data: { ...req.body, clinic_id: clinicId, created_by: userId },
      });
      res.status(201).json(data);
    } catch (error) {
      logger.error("Error creating nota fiscal", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateNotaFiscal(req: Request, res: Response): Promise<void> {
    try {
      const data = await prisma.notas_fiscais.update({
        where: { id: req.params.id }, data: req.body,
      });
      res.json(data);
    } catch (error) {
      logger.error("Error updating nota fiscal", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async deleteNotaFiscal(req: Request, res: Response): Promise<void> {
    try {
      await prisma.notas_fiscais.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting nota fiscal", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // ═══════════════════ PDV VENDAS ═══════════════════

  async listVendasPDV(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }

      const { start_date } = req.query;
      const where: any = { clinic_id: clinicId };
      if (start_date) where.created_at = { gte: new Date(start_date as string) };

      const data = await (prisma as any).pdv_vendas.findMany({
        where,
        include: { pdv_venda_itens: true, pdv_pagamentos: true },
        orderBy: { created_at: "desc" },
      });
      res.json(data);
    } catch (error) {
      logger.error("Error listing vendas PDV", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // ═══════════════════ BANCO EXTRATOS ═══════════════════

  async listExtratos(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }

      const { conciliado } = req.query;
      const where: any = { clinic_id: clinicId };
      if (conciliado !== undefined) where.conciliado = conciliado === "true";

      const data = await (prisma as any).banco_extratos.findMany({
        where, orderBy: { data_movimento: "desc" },
      });
      res.json(data);
    } catch (error) {
      logger.error("Error listing extratos", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateExtrato(req: Request, res: Response): Promise<void> {
    try {
      const data = await (prisma as any).banco_extratos.update({
        where: { id: req.params.id }, data: req.body,
      });
      res.json(data);
    } catch (error) {
      logger.error("Error updating extrato", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // ═══════════════════ CASH FLOW ANALYTICS ═══════════════════

  async getCashFlow(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      const { startDate, endDate } = req.query;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }

      const dateFilter: any = {};
      if (startDate) dateFilter.gte = new Date(startDate as string);
      if (endDate) dateFilter.lte = new Date(endDate as string);

      const [receitas, despesas] = await Promise.all([
        prisma.financial_transactions.aggregate({
          where: { clinic_id: clinicId, type: "RECEITA", status: "PAGO", ...(startDate || endDate ? { paid_date: dateFilter } : {}) },
          _sum: { amount: true },
        }),
        prisma.financial_transactions.aggregate({
          where: { clinic_id: clinicId, type: "DESPESA", status: "PAGO", ...(startDate || endDate ? { paid_date: dateFilter } : {}) },
          _sum: { amount: true },
        }),
      ]);

      res.json({
        totalReceitas: receitas._sum.amount || 0,
        totalDespesas: despesas._sum.amount || 0,
        saldo: (receitas._sum.amount || 0) - (despesas._sum.amount || 0),
      });
    } catch (error) {
      logger.error("Error getting cash flow", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
