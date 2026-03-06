import { logger } from "@/infrastructure/logger";
import { Request, Response } from "express";
import { z } from "zod";

const createVendaSchema = z.object({
  patientId: z.string().uuid().optional(),
  vendedorId: z.string().uuid(),
  itens: z.array(
    z.object({
      produtoId: z.string().uuid(),
      descricao: z.string(),
      quantidade: z.number().positive(),
      valorUnitario: z.number().positive(),
      valorDesconto: z.number().min(0).default(0),
    }),
  ),
  pagamentos: z.array(
    z.object({
      formaPagamento: z.enum([
        "DINHEIRO",
        "CREDITO",
        "DEBITO",
        "PIX",
        "CRYPTO",
      ]),
      valor: z.number().positive(),
      parcelas: z.number().int().positive().default(1),
    }),
  ),
});

export class PdvController {
  async createVenda(req: Request, res: Response): Promise<void> {
    try {
      createVendaSchema.parse(req.body);
      const clinicId = req.user?.clinicId;

      if (!clinicId) {
        res.status(401).json({ error: "Clinic ID not found in token" });
        return;
      }

      // TODO: Implement VendaRepository and use case
      // const venda = await createVendaUseCase.execute({ ...validatedData, clinicId });

      logger.info("Venda created", { clinicId });
      res.status(201).json({ message: "Venda created successfully (stub)" });
    } catch (error) {
      logger.error("Error creating venda", { error });
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ error: "Validation error", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async listVendas(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;

      if (!clinicId) {
        res.status(401).json({ error: "Clinic ID not found in token" });
        return;
      }

      // TODO: Implement VendaRepository query
      logger.info("Listing vendas", { clinicId });
      res.status(200).json({ vendas: [] });
    } catch (error) {
      logger.error("Error listing vendas", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
