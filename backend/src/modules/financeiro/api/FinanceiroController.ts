import { logger } from "@/infrastructure/logger";
import { Request, Response } from "express";
import { z } from "zod";

const createTransactionSchema = z.object({
  type: z.enum(["RECEITA", "DESPESA"]),
  amount: z.number().positive(),
  description: z.string().min(3),
  categoryId: z.string().uuid().optional(),
  dueDate: z.string().datetime(),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
  relatedEntityType: z.string().optional(),
  relatedEntityId: z.string().uuid().optional(),
});

export class FinanceiroController {
  async createTransaction(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = createTransactionSchema.parse(req.body);
      const clinicId = req.user?.clinicId;
      const userId = req.user?.id;

      if (!clinicId || !userId) {
        res.status(401).json({ error: "User info not found in token" });
        return;
      }

      // TODO: Implement TransactionRepository and use case
      logger.info("Transaction created", {
        clinicId,
        type: validatedData.type,
      });
      res
        .status(201)
        .json({ message: "Transaction created successfully (stub)" });
    } catch (error) {
      logger.error("Error creating transaction", { error });
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ error: "Validation error", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async listTransactions(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;

      if (!clinicId) {
        res.status(401).json({ error: "Clinic ID not found in token" });
        return;
      }

      // TODO: Implement TransactionRepository query with filters
      logger.info("Listing transactions", { clinicId });
      res.status(200).json({ transactions: [] });
    } catch (error) {
      logger.error("Error listing transactions", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async markTransactionAsPaid(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // const { paidDate, paymentMethod } = req.body;

      // TODO: Implement use case
      logger.info("Transaction marked as paid", { id });
      res.status(200).json({ message: "Transaction marked as paid (stub)" });
    } catch (error) {
      logger.error("Error marking transaction as paid", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getCashFlow(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      const { startDate, endDate } = req.query;

      if (!clinicId) {
        res.status(401).json({ error: "Clinic ID not found in token" });
        return;
      }

      // TODO: Implement cash flow analytics query
      logger.info("Getting cash flow", { clinicId, startDate, endDate });
      res.status(200).json({
        totalReceitas: 0,
        totalDespesas: 0,
        saldo: 0,
      });
    } catch (error) {
      logger.error("Error getting cash flow", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
