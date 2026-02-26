/**
 * Factory Pattern para criação de adapters de Exchange
 * Suporta múltiplas exchanges de forma unificada
 */

export interface ICryptoExchange {
  getWalletBalance(coin: string): Promise<number>;
  generateDepositAddress(coin: string): Promise<string>;
  getExchangeRate(from: string, to: string): Promise<number>;
  validateCredentials(): Promise<boolean>;
}

export type ExchangeName = 'BINANCE' | 'COINBASE' | 'KRAKEN' | 'MERCADO_BITCOIN' | 'BTCPAY';

export class ExchangeFactory {
  static async create(
    exchangeName: ExchangeName,
    apiKey: string,
    apiSecret: string,
    additionalConfig?: Record<string, any>
  ): Promise<ICryptoExchange> {
    switch (exchangeName) {
      case 'BINANCE': {
        const { BinanceAdapter } = await import('./BinanceAdapter');
        return new BinanceAdapter(apiKey, apiSecret);
      }
      case 'COINBASE': {
        const { CoinbaseAdapter } = await import('./CoinbaseAdapter');
        return new CoinbaseAdapter(apiKey, apiSecret);
      }
      case 'KRAKEN': {
        const { KrakenAdapter } = await import('./KrakenAdapter');
        return new KrakenAdapter(apiKey, apiSecret);
      }
      case 'MERCADO_BITCOIN': {
        const { MercadoBitcoinAdapter } = await import('./MercadoBitcoinAdapter');
        return new MercadoBitcoinAdapter(apiKey, apiSecret);
      }
      case 'BTCPAY': {
        const { BTCPayAdapter } = await import('./BTCPayAdapter');
        return new BTCPayAdapter(additionalConfig?.btcpayServerUrl, additionalConfig?.storeId, apiKey);
      }
      default:
        throw new Error(`Exchange ${exchangeName} não suportada`);
    }
  }

  static getSupportedExchanges(): ExchangeName[] {
    return ['BINANCE', 'COINBASE', 'KRAKEN', 'MERCADO_BITCOIN', 'BTCPAY'];
  }

  static getExchangeRequirements(exchangeName: ExchangeName): {
    requiresApiKey: boolean;
    requiresApiSecret: boolean;
    additionalFields?: string[];
  } {
    const requirements = {
      BINANCE: { requiresApiKey: true, requiresApiSecret: true },
      COINBASE: { requiresApiKey: true, requiresApiSecret: true },
      KRAKEN: { requiresApiKey: true, requiresApiSecret: true },
      MERCADO_BITCOIN: { requiresApiKey: true, requiresApiSecret: true },
      BTCPAY: {
        requiresApiKey: true,
        requiresApiSecret: false,
        additionalFields: ['btcpayServerUrl', 'storeId', 'webhookSecret'],
      },
    };

    return requirements[exchangeName];
  }
}
