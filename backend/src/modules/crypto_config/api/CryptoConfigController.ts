/**
 * CryptoConfigController
 * API para configuração de exchanges, wallets e portfolio de criptomoedas
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { ExchangeConfig } from '../domain/entities/ExchangeConfig';

export class CryptoConfigController {
  async listExchanges(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      // Mock data
      const exchanges = [
        new ExchangeConfig({
          id: crypto.randomUUID(),
          clinicId,
          exchangeType: 'BINANCE',
          apiKey: 'binance_api_key_***',
          apiSecret: 'encrypted_secret',
          isActive: true,
          lastSyncAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ];

      res.json({
        exchanges: exchanges.map(e => e.toJSON()),
      });
    } catch (error) {
      console.error('Error listing exchanges:', error);
      res.status(500).json({ error: 'Erro ao listar exchanges' });
    }
  }

  async createExchange(req: Request, res: Response): Promise<void> {
    try {
      const schema = z.object({
        exchangeType: z.enum(['BINANCE', 'COINBASE', 'KRAKEN', 'MERCADO_BITCOIN']),
        apiKey: z.string().min(10),
        apiSecret: z.string().min(10),
      });

      const data = schema.parse(req.body);
      const clinicId = req.user?.clinicId;

      if (!clinicId || req.user?.role !== 'ADMIN') {
        res.status(403).json({ error: 'Acesso negado' });
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
        message: 'Exchange configurada com sucesso',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Dados inválidos', details: error.errors });
        return;
      }
      console.error('Error creating exchange:', error);
      res.status(500).json({ error: 'Erro ao configurar exchange' });
    }
  }

  async getPortfolio(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      // Mock portfolio data
      const portfolio = {
        totalValueUSD: 15250.75,
        assets: [
          { symbol: 'BTC', amount: 0.5, valueUSD: 13000.0, allocation: 85.2 },
          { symbol: 'ETH', amount: 2.5, valueUSD: 2000.5, allocation: 13.1 },
          { symbol: 'USDT', amount: 250.25, valueUSD: 250.25, allocation: 1.7 },
        ],
        lastUpdated: new Date(),
      };

      res.json({ portfolio });
    } catch (error) {
      console.error('Error getting portfolio:', error);
      res.status(500).json({ error: 'Erro ao obter portfolio' });
    }
  }

  async getDCAStrategies(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      // Mock DCA strategies
      const strategies = [
        {
          id: crypto.randomUUID(),
          asset: 'BTC',
          amountBRL: 500,
          frequency: 'WEEKLY',
          isActive: true,
          nextExecutionAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        },
      ];

      res.json({ strategies });
    } catch (error) {
      console.error('Error getting DCA strategies:', error);
      res.status(500).json({ error: 'Erro ao obter estratégias DCA' });
    }
  }
}
