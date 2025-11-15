/**
 * BTCPay Server Integration Service
 * Gerencia pagamentos em criptomoedas via BTCPay Server
 */

export type CryptoCurrency = 'BTC' | 'USDT' | 'ETH' | 'LTC' | 'DAI';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'CONFIRMED' | 'EXPIRED' | 'FAILED';

interface CreateInvoiceRequest {
  amount: number; // Em moeda fiduciária (BRL)
  currency: string; // 'BRL'
  orderId: string;
  buyerEmail?: string;
  notificationUrl?: string;
  redirectUrl?: string;
  metadata?: Record<string, any>;
}

interface BTCPayInvoice {
  id: string;
  checkoutLink: string;
  status: PaymentStatus;
  cryptoAmount: number;
  cryptoCurrency: CryptoCurrency;
  expirationTime: Date;
  qrCode: string;
  paymentAddress: string;
}

interface WebhookPayload {
  invoiceId: string;
  status: PaymentStatus;
  currency: CryptoCurrency;
  amount: number;
  btcPaid: number;
  timestamp: string;
  orderId: string;
}

export class BTCPayService {
  private baseUrl: string;
  private storeId: string;
  private apiKey: string;

  constructor() {
    // Configurações virão de secrets/env
    this.baseUrl = process.env.BTCPAY_SERVER_URL || 'https://btcpay.example.com';
    this.storeId = process.env.BTCPAY_STORE_ID || '';
    this.apiKey = process.env.BTCPAY_API_KEY || '';
  }

  /**
   * Cria uma invoice no BTCPay Server
   */
  async createInvoice(request: CreateInvoiceRequest): Promise<BTCPayInvoice> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/stores/${this.storeId}/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${this.apiKey}`,
        },
        body: JSON.stringify({
          amount: request.amount.toString(),
          currency: request.currency,
          checkout: {
            redirectURL: request.redirectUrl,
            paymentMethods: ['BTC', 'BTC-LightningNetwork', 'ETH', 'USDT', 'LTC', 'DAI'],
          },
          metadata: {
            orderId: request.orderId,
            buyerEmail: request.buyerEmail,
            ...request.metadata,
          },
          additionalNotificationUrl: request.notificationUrl,
        }),
      });

      if (!response.ok) {
        throw new Error(`BTCPay API Error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        id: data.id,
        checkoutLink: data.checkoutLink,
        status: this.mapBTCPayStatus(data.status),
        cryptoAmount: 0, // Será preenchido após seleção de moeda
        cryptoCurrency: 'BTC',
        expirationTime: new Date(data.expirationTime),
        qrCode: data.invoiceLink + '/qr',
        paymentAddress: '', // Será preenchido após seleção de moeda
      };
    } catch (error) {
      console.error('BTCPay CreateInvoice Error:', error);
      throw new Error('Falha ao criar invoice de pagamento');
    }
  }

  /**
   * Consulta o status de uma invoice
   */
  async getInvoiceStatus(invoiceId: string): Promise<PaymentStatus> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/stores/${this.storeId}/invoices/${invoiceId}`,
        {
          headers: {
            'Authorization': `token ${this.apiKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`BTCPay API Error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.mapBTCPayStatus(data.status);
    } catch (error) {
      console.error('BTCPay GetInvoiceStatus Error:', error);
      throw new Error('Falha ao consultar status do pagamento');
    }
  }

  /**
   * Valida assinatura de webhook do BTCPay
   */
  validateWebhookSignature(payload: string, signature: string, secret: string): boolean {
    // Implementar validação HMAC SHA256
    // const hmac = crypto.createHmac('sha256', secret);
    // const expectedSignature = hmac.update(payload).digest('hex');
    // return signature === expectedSignature;
    return true; // Placeholder
  }

  /**
   * Processa webhook do BTCPay
   */
  async processWebhook(payload: WebhookPayload): Promise<void> {
    console.log('Processing BTCPay Webhook:', payload);
    
    // A lógica de processamento será implementada no ProcessWebhookUseCase
    // Aqui apenas validamos e parseamos o payload
  }

  /**
   * Mapeia status do BTCPay para nosso enum
   */
  private mapBTCPayStatus(btcPayStatus: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      'New': 'PENDING',
      'Processing': 'PROCESSING',
      'Expired': 'EXPIRED',
      'Invalid': 'FAILED',
      'Settled': 'CONFIRMED',
      'Complete': 'CONFIRMED',
    };
    return statusMap[btcPayStatus] || 'PENDING';
  }

  /**
   * Gera QR Code data para pagamento
   */
  generatePaymentQRData(cryptoCurrency: CryptoCurrency, address: string, amount: number): string {
    const uriSchemes: Record<CryptoCurrency, string> = {
      BTC: 'bitcoin',
      ETH: 'ethereum',
      USDT: 'ethereum', // ERC-20
      LTC: 'litecoin',
      DAI: 'ethereum', // ERC-20
    };

    const scheme = uriSchemes[cryptoCurrency];
    return `${scheme}:${address}?amount=${amount}`;
  }
}
