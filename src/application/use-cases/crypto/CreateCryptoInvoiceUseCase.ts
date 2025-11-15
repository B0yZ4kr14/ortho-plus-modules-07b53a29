/**
 * FASE 2 - TASK 2.6: Create Crypto Invoice Use Case
 */

import { CryptoTransaction } from '@/domain/entities/CryptoPayment';

export interface CreateCryptoInvoiceDTO {
  clinicId: string;
  patientId?: string;
  appointmentId?: string;
  amountBrl: number;
  cryptocurrency: 'BTC' | 'LN' | 'ETH' | 'LTC';
  customerEmail?: string;
  customerName?: string;
  timeoutMinutes?: number;
}

export interface ICryptoRepository {
  save(transaction: CryptoTransaction): Promise<void>;
  findByInvoiceId(invoiceId: string): Promise<CryptoTransaction | null>;
  findByClinic(clinicId: string, filters?: any): Promise<CryptoTransaction[]>;
}

export interface IBTCPayService {
  createInvoice(params: {
    storeId: string;
    amount: number;
    currency: string;
    orderId: string;
    metadata?: any;
  }): Promise<{
    invoiceId: string;
    checkoutLink: string;
    expiresAt: Date;
    exchangeRate: number;
    amountCrypto: number;
  }>;
  getInvoiceStatus(invoiceId: string): Promise<{
    status: string;
    transactionHash?: string;
    confirmations?: number;
    paidAt?: Date;
  }>;
}

export interface ICryptoConfigRepository {
  findByClinic(clinicId: string): Promise<{
    btcpayServerUrl: string;
    storeId: string;
    paymentTimeoutMinutes: number;
    isActive: boolean;
  } | null>;
}

export class CreateCryptoInvoiceUseCase {
  constructor(
    private repository: ICryptoRepository,
    private btcpayService: IBTCPayService,
    private configRepository: ICryptoConfigRepository
  ) {}

  async execute(dto: CreateCryptoInvoiceDTO): Promise<CryptoTransaction> {
    // Buscar configuração da clínica
    const config = await this.configRepository.findByClinic(dto.clinicId);
    if (!config || !config.isActive) {
      throw new Error('Pagamentos em criptomoedas não estão configurados para esta clínica');
    }

    // Criar invoice no BTCPay
    const invoice = await this.btcpayService.createInvoice({
      storeId: config.storeId,
      amount: dto.amountBrl,
      currency: 'BRL',
      orderId: `ORTHO-${Date.now()}`,
      metadata: {
        patientId: dto.patientId,
        appointmentId: dto.appointmentId,
        customerEmail: dto.customerEmail,
        customerName: dto.customerName,
      },
    });

    // Criar transação
    const transaction = CryptoTransaction.create({
      clinicId: dto.clinicId,
      patientId: dto.patientId,
      appointmentId: dto.appointmentId,
      btcpayInvoiceId: invoice.invoiceId,
      btcpayCheckoutLink: invoice.checkoutLink,
      amountBrl: dto.amountBrl,
      amountCrypto: invoice.amountCrypto,
      cryptocurrency: dto.cryptocurrency,
      exchangeRate: invoice.exchangeRate,
      expiresAt: invoice.expiresAt,
      customerEmail: dto.customerEmail,
      customerName: dto.customerName,
    });

    // Persistir
    await this.repository.save(transaction);

    return transaction;
  }
}
