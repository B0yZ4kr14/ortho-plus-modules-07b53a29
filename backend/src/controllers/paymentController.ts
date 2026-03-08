import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

// Helper for error responses
const handleError = (
  res: Response,
  error: any,
  message: string = "Internal Server Error",
  status: number = 500,
) => {
  console.error(message, error);
  res.status(status).json({ error: error.message || message });
};

/**
 * Replaces 'enviar-cobranca' edge function
 * Sends a billing notice to a patient via email or whatsapp (mock logic)
 */
export const enviarCobranca = async (req: Request, res: Response) => {
  try {
    const { contaReceberId, method, message } = req.body;

    if (!contaReceberId || !method) {
      return res
        .status(400)
        .json({ error: "contaReceberId and method are required" });
    }

    // Find the billing record
    const cobranca = await (prisma as any).contas_receber.findUnique({
      where: { id: contaReceberId },
      include: { patients: true },
    });

    if (!cobranca || !cobranca.patients) {
      return res
        .status(404)
        .json({ error: "Billing record or Patient not found" });
    }

    // TODO: integrate with Twilio/WhatsApp or SendGrid

    // Update status if needed or record log
    await (prisma as any).comunicacao_logs.create({
      data: {
        paciente_id: cobranca.patient_id,
        clinic_id: cobranca.clinic_id,
        tipo: method.toUpperCase(),
        mensagem: message || `Cobrança de R$ ${cobranca.valor} enviada.`,
        status: "ENVIADO",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Cobrança enviada com sucesso",
    });
  } catch (error: any) {
    handleError(res, error, "Error in enviar-cobranca");
    return;
  }
};

/**
 * Replaces 'processar-pagamento' edge function
 * Basic payment processing logic (e.g. Credit Card, PIX)
 */
export const processarPagamento = async (req: Request, res: Response) => {
  try {
    const { contaReceberId, amount, paymentMethod } = req.body;

    if (!contaReceberId || !amount || !paymentMethod) {
      return res.status(400).json({ error: "Required fields missing" });
    }


    // Mock API call to payment gateway (Stripe, Pagar.me, etc)
    const transactionId = `txn_${Date.now()}`;

    // Execute in transaction
    await prisma.$transaction(async (tx: any) => {
      // 1. Update bill
      await tx.contas_receber.update({
        where: { id: contaReceberId },
        data: {
          status: "PAGO",
          data_pagamento: new Date(),
          metodo_pagamento: paymentMethod,
        },
      });

      // 2. Insert transaction log
      const bill = await tx.contas_receber.findUnique({
        where: { id: contaReceberId },
      });
      if (bill) {
        await tx.transacoes_pagamento.create({
          data: {
            clinic_id: bill.clinic_id,
            patient_id: bill.patient_id,
            valor: amount,
            metodo_pagamento: paymentMethod,
            status: "APROVADO",
            gateway_transaction_id: transactionId,
            observacoes: `Processado via API backend`,
          },
        });
      }
    });

    return res.status(200).json({
      success: true,
      transaction_id: transactionId,
      status: "APPROVED",
    });
  } catch (error: any) {
    handleError(res, error, "Error in processar-pagamento");
    return;
  }
};

/**
 * Replaces 'processar-pagamento-tef' edge function
 * Handles TEF (Transferência Eletrônica de Fundos) terminal integrations
 */
export const processarPagamentoTef = async (req: Request, res: Response) => {
  try {
    const { terminalId: _terminalId, amount: _amount, installments: _installments } = req.body;

    return res.status(200).json({
      success: true,
      message: "TEF operation initiated",
      status: "WAITING_PINPAD_INTERACTION",
    });
  } catch (error: any) {
    handleError(res, error, "Error in processar-pagamento-tef");
    return;
  }
};

/**
 * Replaces 'processar-split-pagamento' edge function
 * Splits a payment amongst clinic and multiple professionals
 */
export const processarSplitPagamento = async (req: Request, res: Response) => {
  try {
    const { transactionId, splits } = req.body;
    // splits: [{ receiverId, percentage/amount }]

    if (!transactionId || !splits || !splits.length) {
      return res
        .status(400)
        .json({ error: "transactionId and splits mapping are required" });
    }

    // TODO: call payment gateway split API; record split items in db for financial reporting

    return res.status(200).json({
      success: true,
      message: "Split rules applied successfully",
    });
  } catch (error: any) {
    handleError(res, error, "Error in processar-split-pagamento");
    return;
  }
};
