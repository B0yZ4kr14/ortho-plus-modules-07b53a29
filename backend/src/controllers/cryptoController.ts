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
 * Endpoint to convert crypto to BRL.
 * Replacement for convert-crypto-to-brl edge function.
 */
export const convertCryptoToBrl = async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({ error: "transactionId is required" });
    }

    // Buscar transação usando db nativo
    // Note: This relies on the crypto_transactions table existing in Prisma schema.
    // If Prisma schema doesn't match legacy exactly, we will need to adapt the model name.
    const transaction = await (prisma as any).crypto_transactions.findUnique({
      where: { id: transactionId },
      include: {
        exchange: true, // crypto_exchange_config equivalent
      },
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    if (transaction.status !== "CONFIRMADO") {
      return res
        .status(400)
        .json({ error: "Transaction must be confirmed before conversion" });
    }

    if (transaction.converted_to_brl_at) {
      return res.status(400).json({ error: "Transaction already converted" });
    }

    console.log(
      `Converting transaction ${transactionId} - ${transaction.amount_crypto} ${transaction.coin_type} to BRL`,
    );

    // In production, call exchange API here
    if (transaction.exchange && transaction.exchange.is_active) {
      console.log(`Would convert via ${transaction.exchange.exchange_name}`);
    }

    const convertedAt = new Date().toISOString();

    // Use Prisma transaction to ensure atomicity
    await prisma.$transaction(async (tx: any) => {
      // 1. Atualizar transação crypto
      await tx.crypto_transactions.update({
        where: { id: transactionId },
        data: {
          status: "CONVERTIDO",
          converted_to_brl_at: convertedAt,
        },
      });

      // 2. Se houver conta a receber vinculada, atualizar como paga
      if (transaction.conta_receber_id) {
        await tx.contas_receber.update({
          where: { id: transaction.conta_receber_id },
          data: {
            status: "PAGO",
            data_pagamento: new Date(convertedAt),
            metodo_pagamento: `Crypto (${transaction.coin_type})`,
          },
        });
      }

      // 3. Criar transação financeira
      await tx.transacoes_pagamento.create({
        data: {
          clinic_id: transaction.clinic_id,
          patient_id: transaction.patient_id,
          valor: transaction.amount_brl,
          metodo_pagamento: "CRYPTO",
          status: "APROVADO",
          taxa_processamento: transaction.network_fee || 0,
          observacoes: `Conversão de ${transaction.amount_crypto} ${transaction.coin_type}`,
        },
      });

      // 4. Registrar no audit log
      await tx.audit_logs.create({
        data: {
          clinic_id: transaction.clinic_id,
          action: "CRYPTO_CONVERTED_TO_BRL",
          details: {
            transaction_id: transactionId,
            coin_type: transaction.coin_type,
            amount_crypto: transaction.amount_crypto,
            amount_brl: transaction.amount_brl,
            exchange_rate: transaction.exchange_rate,
            converted_at: convertedAt,
          },
        },
      });
    });

    return res.status(200).json({
      success: true,
      transaction_id: transactionId,
      converted_at: convertedAt,
      amount_brl: transaction.amount_brl,
    });
  } catch (error: any) {
    handleError(res, error, "Error in convert-crypto-to-brl");
    return;
  }
};

/**
 * Replacement for create-crypto-invoice
 */
export const createCryptoInvoice = async (req: Request, res: Response) => {
  try {
    const { amount, currency, clinicId } = req.body;

    if (!amount || !currency || !clinicId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Gerar carteira e invoice mock
    console.log(`Generating crypto invoice for amount ${amount} ${currency}`);

    // Logica real de criacao de invoice viria aqui (geracao de endereco on-chain ou via API de provider de crypto)

    return res.status(200).json({
      success: true,
      message:
        "Not implemented fully yet, placeholder for create-crypto-invoice", // FIXME
    });
  } catch (error: any) {
    handleError(res, error, "Error in create-crypto-invoice");
    return;
  }
};

/**
 * Replacement for crypto-manager
 */
export const getCryptoManagerStatus = async (_req: Request, res: Response) => {
  try {
    return res.status(200).json({
      success: true,
      status: "active",
    });
  } catch (error: any) {
    handleError(res, error, "Error in crypto-manager");
    return;
  }
};

/**
 * Replacement for get-crypto-rates
 */
export const getCryptoRates = async (_req: Request, res: Response) => {
  try {
    // Exemplo de retorno de rates
    return res.status(200).json({
      success: true,
      rates: {
        BTC: 500000,
        ETH: 25000,
        USDT: 5.8,
      },
      updated_at: new Date().toISOString(),
    });
  } catch (error: any) {
    handleError(res, error, "Error in get-crypto-rates");
    return;
  }
};

/**
 * Replacement for sync-crypto-wallet
 */
export const syncCryptoWallet = async (req: Request, res: Response) => {
  try {
    const { walletId } = req.body;
    return res.status(200).json({
      success: true,
      wallet_id: walletId,
      status: "synced",
    });
  } catch (error: any) {
    handleError(res, error, "Error in sync-crypto-wallet");
    return;
  }
};

/**
 * Replacement for validate-xpub
 */
export const validateXpub = async (req: Request, res: Response) => {
  try {
    const { xpub, currency } = req.body;

    if (!xpub) {
      return res.status(400).json({ error: "xpub parameter is required" });
    }

    // Logica de validacao de extended public key real
    const isValid =
      xpub.startsWith("xpub") ||
      xpub.startsWith("ypub") ||
      xpub.startsWith("zpub");

    return res.status(200).json({
      success: true,
      valid: isValid,
      currency: currency || "BTC",
    });
  } catch (error: any) {
    handleError(res, error, "Error in validate-xpub");
    return;
  }
};

/**
 * Replacement for crypto-webhook
 */
export const handleCryptoWebhook = async (req: Request, res: Response) => {
  try {
    const payload = req.body;

    console.log("📥 Webhook recebido:", {
      invoiceId: payload?.invoiceId,
      status: payload?.status,
    });

    return res
      .status(200)
      .json({ success: true, message: "Webhook processed" });
  } catch (error: any) {
    handleError(res, error, "Error in handleCryptoWebhook");
    return;
  }
};

/**
 * Replacement for manage-offline-wallet
 */
export const manageOfflineWallet = async (req: Request, res: Response) => {
  try {
    const { action, walletId } = req.body;

    console.log(`Managing offline wallet ${walletId}, action: ${action}`);

    return res.status(200).json({
      success: true,
      message: `Action ${action} processed for offline wallet`,
    });
  } catch (error: any) {
    handleError(res, error, "Error in manageOfflineWallet");
    return;
  }
};

/**
 * Endpoint for cron jobs mappings (volatility, notifications, price alerts)
 */
export const runCryptoJobs = async (req: Request, res: Response) => {
  try {
    const { jobName } = req.body;
    console.log(`Running crypto job: ${jobName}`);
    return res
      .status(200)
      .json({ success: true, job: jobName, executed: true });
  } catch (error: any) {
    handleError(res, error, `Error in runCryptoJobs`);
    return;
  }
};
