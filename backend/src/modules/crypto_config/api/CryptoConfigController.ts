/**
 * CryptoConfigController
 * API para configuração de exchanges, wallets e portfolio de criptomoedas
 */

import { Request, Response } from "express";
import { z } from "zod";
import { ExchangeConfig } from "../domain/entities/ExchangeConfig";

export class CryptoConfigController {
  async listExchanges(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Não autenticado" });
        return;
      }

      // Mock data
      const exchanges = [
        new ExchangeConfig({
          id: crypto.randomUUID(),
          clinicId,
          exchangeType: "BINANCE",
          apiKey: "binance_api_key_***",
          apiSecret: "encrypted_secret",
          isActive: true,
          lastSyncAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ];

      res.json({
        exchanges: exchanges.map((e) => e.toJSON()),
      });
    } catch (error) {
      console.error("Error listing exchanges:", error);
      res.status(500).json({ error: "Erro ao listar exchanges" });
    }
  }

  async createExchange(req: Request, res: Response): Promise<void> {
    try {
      const schema = z.object({
        exchangeType: z.enum([
          "BINANCE",
          "COINBASE",
          "KRAKEN",
          "MERCADO_BITCOIN",
        ]),
        apiKey: z.string().min(10),
        apiSecret: z.string().min(10),
      });

      const data = schema.parse(req.body);
      const clinicId = req.user?.clinicId;

      if (!clinicId || req.user?.role !== "ADMIN") {
        res.status(403).json({ error: "Acesso negado" });
        return;
      }

      const exchange = new ExchangeConfig({
        id: crypto.randomUUID(),
        clinicId,
        exchangeType: data.exchangeType,
        apiKey: data.apiKey,
        apiSecret: data.apiSecret, // Em produção, criptografar antes de salvar
        isActive: true,
        lastSyncAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      res.status(201).json({
        exchange: exchange.toJSON(),
        message: "Exchange configurada com sucesso",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ error: "Dados inválidos", details: error.errors });
        return;
      }
      console.error("Error creating exchange:", error);
      res.status(500).json({ error: "Erro ao configurar exchange" });
    }
  }

  async getPortfolio(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Não autenticado" });
        return;
      }

      // Mock portfolio data
      const portfolio = {
        totalValueUSD: 15250.75,
        assets: [
          { symbol: "BTC", amount: 0.5, valueUSD: 13000.0, allocation: 85.2 },
          { symbol: "ETH", amount: 2.5, valueUSD: 2000.5, allocation: 13.1 },
          { symbol: "USDT", amount: 250.25, valueUSD: 250.25, allocation: 1.7 },
        ],
        lastUpdated: new Date(),
      };

      res.json({ portfolio });
    } catch (error) {
      console.error("Error getting portfolio:", error);
      res.status(500).json({ error: "Erro ao obter portfolio" });
    }
  }

  async getDCAStrategies(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Não autenticado" });
        return;
      }

      // Mock DCA strategies
      const strategies = [
        {
          id: crypto.randomUUID(),
          asset: "BTC",
          amountBRL: 500,
          frequency: "WEEKLY",
          isActive: true,
          nextExecutionAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        },
      ];

      res.json({ strategies });
    } catch (error) {
      console.error("Error getting DCA strategies:", error);
      res.status(500).json({ error: "Erro ao obter estratégias DCA" });
    }
  }

  // Edge Function: manage-offline-wallet
  async manageOfflineWallet(req: Request, res: Response): Promise<void> {
    try {
      const {
        action,
        wallet_name,
        hardware_type,
        xpub,
        derivation_path,
        supported_coins,
        notes,
      } = req.body;

      if (action === "create") {
        const { PrismaClient } = require("@prisma/client");
        const prisma = new PrismaClient();

        // Stub insert
        const newWallet = await (prisma as any).crypto_offline_wallets.create({
          data: {
            wallet_name,
            hardware_type,
            xpub_encrypted: xpub,
            derivation_path,
            supported_coins: supported_coins || [],
            notes,
            is_verified: false,
          },
        });

        res.json({ success: true, wallet: newWallet });
        return;
      }

      res.status(400).json({ error: "Invalid action" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Edge Function: validate-xpub
  async validateXpub(req: Request, res: Response): Promise<void> {
    try {
      const { xpub /*, derivationPath, index */ } = req.body;

      if (!xpub || !xpub.match(/^(xpub|ypub|zpub|tpub)/)) {
        throw new Error("xPub inválido");
      }

      const mockAddress = `bc1q${Math.random().toString(36).substring(2, 42)}`;
      res.json({ address: mockAddress });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Edge Function: sync-crypto-wallet
  async syncCryptoWallet(req: Request, res: Response): Promise<void> {
    try {
      const { walletId } = req.body;

      if (!walletId) {
        res.status(400).json({ error: "walletId is required" });
        return;
      }

      // Simplified sync stub - In a real setup, would hit Binance/Coinbase API, update balance, and log to audit_logs
      const balance = 0.5;
      const exchangeRate = 350000;
      const balanceBRL = balance * exchangeRate;

      res.json({
        success: true,
        wallet_id: walletId,
        balance,
        balance_brl: balanceBRL,
        exchange_rate: exchangeRate,
      });
    } catch (error: any) {
      console.error("Error in sync-crypto-wallet:", error);
      res.status(500).json({ error: error.message });
    }
  }

  // Edge Function: crypto-realtime-notifications
  async realtimeNotify(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.query.clinicId;
      if (!clinicId) {
        res.status(400).json({ error: "Missing clinicId parameter" });
        return;
      }

      // Websocket endpoints in real environments often get handled by socket.io or separate ws server
      // This serves as an HTTP trigger to emulate the logic or just returning placeholder info
      res.json({
        success: true,
        message: "Websocket setup instructed via WS server ideally.",
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Edge Function: webhook-crypto-transaction
  async webhookCryptoTransaction(req: Request, res: Response): Promise<void> {
    try {
      // Stub implementation of webhook-crypto-transaction
      const payload = req.body;
      const webhookSignature = req.headers["x-webhook-signature"];

      if (!webhookSignature) {
        console.warn(
          "Webhook without signature - validation skipped for development",
        );
      }

      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();

      const wallet = await (prisma as any).crypto_wallets.findFirst({
        where: {
          wallet_address: payload.wallet_address,
          coin_type: payload.coin_type,
        },
        include: { crypto_exchange_config: true },
      });

      if (!wallet) {
        res.status(404).json({ error: "Wallet not found" });
        return;
      }

      const existingTx = await (prisma as any).crypto_transactions.findFirst({
        where: { transaction_hash: payload.transaction_hash },
      });

      // Fetch exchange rate logic
      const exchangeRate = 350000; // Stub, replace with real fetch
      const amountBrl = payload.amount * exchangeRate;

      const processingFeePercentage =
        wallet.crypto_exchange_config?.processing_fee_percentage || 0;
      const processingFeeBrl = (amountBrl * processingFeePercentage) / 100;
      const netAmountBrl = amountBrl - processingFeeBrl;

      if (existingTx) {
        const newStatus =
          payload.confirmations >= 3 ? "CONFIRMADO" : "PENDENTE";

        await (prisma as any).crypto_transactions.update({
          where: { id: existingTx.id },
          data: {
            confirmations: payload.confirmations,
            status: newStatus,
            updated_at: new Date(),
          },
        });

        if (newStatus === "CONFIRMADO" && existingTx.status !== "CONFIRMADO") {
          await (prisma as any).crypto_wallets.update({
            where: { id: wallet.id },
            data: {
              balance: wallet.balance + payload.amount,
              balance_brl: wallet.balance_brl + amountBrl,
              last_sync_at: new Date(),
            },
          });

          if (existingTx.conta_receber_id) {
            await (prisma as any).contas_receber.update({
              where: { id: existingTx.conta_receber_id },
              data: { status: "PAGO", data_pagamento: new Date() },
            });
          }
        }
      } else {
        await (prisma as any).crypto_transactions.create({
          data: {
            clinic_id: wallet.clinic_id,
            exchange_config_id: wallet.exchange_config_id,
            wallet_id: wallet.id,
            transaction_hash: payload.transaction_hash,
            coin_type: payload.coin_type,
            amount_crypto: payload.amount,
            amount_brl: amountBrl,
            exchange_rate: exchangeRate,
            processing_fee_brl: processingFeeBrl,
            net_amount_brl: netAmountBrl,
            tipo: "RECEBIMENTO",
            status: payload.confirmations >= 3 ? "CONFIRMADO" : "PENDENTE",
            confirmations: payload.confirmations,
            required_confirmations: 3,
            from_address: payload.from_address,
            to_address: payload.wallet_address,
            network_fee: payload.network_fee,
          },
        });

        if (payload.confirmations >= 3) {
          await (prisma as any).crypto_wallets.update({
            where: { id: wallet.id },
            data: {
              balance: wallet.balance + payload.amount,
              balance_brl: wallet.balance_brl + amountBrl,
              last_sync_at: new Date(),
            },
          });
        }
      }

      await (prisma as any).audit_logs.create({
        data: {
          clinic_id: wallet.clinic_id,
          action: "CRYPTO_TRANSACTION_WEBHOOK",
          details: {
            transaction_hash: payload.transaction_hash,
            coin_type: payload.coin_type,
            amount: payload.amount,
            confirmations: payload.confirmations,
            exchange: payload.exchange,
          },
        },
      });

      res.json({
        success: true,
        message: "Webhook processed successfully",
        confirmations: payload.confirmations,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
