/**
 * FASE 2 - TASK 2.6: Process BTCPay Webhook Use Case
 */

import { CryptoTransaction } from '@/domain/entities/CryptoPayment';
import { ICryptoRepository } from './CreateCryptoInvoiceUseCase';

export interface ProcessWebhookDTO {
  invoiceId: string;
  eventType: 'InvoiceCreated' | 'InvoiceReceivedPayment' | 'InvoiceProcessing' | 'InvoiceExpired' | 'InvoiceSettled' | 'InvoiceInvalid';
  transactionHash?: string;
  confirmations?: number;
  blockHeight?: number;
  paymentMethod?: 'btc' | 'lightning';
}

export class ProcessWebhookUseCase {
  constructor(private repository: ICryptoRepository) {}

  async execute(dto: ProcessWebhookDTO): Promise<void> {
    // Buscar transação
    const transaction = await this.repository.findByInvoiceId(dto.invoiceId);
    if (!transaction) {
      throw new Error(`Transação não encontrada: ${dto.invoiceId}`);
    }

    // Processar evento
    switch (dto.eventType) {
      case 'InvoiceReceivedPayment':
        if (dto.transactionHash && dto.paymentMethod) {
          transaction.marcarComoPago(dto.transactionHash, dto.paymentMethod);
        }
        break;

      case 'InvoiceProcessing':
        if (dto.blockHeight) {
          transaction.adicionarConfirmacao(dto.blockHeight);
        }
        break;

      case 'InvoiceSettled':
        transaction.completar();
        break;

      case 'InvoiceExpired':
        transaction.marcarComoExpirada();
        break;

      case 'InvoiceInvalid':
        transaction.marcarComoInvalida();
        break;

      default:
        console.log(`Evento ignorado: ${dto.eventType}`);
        return;
    }

    // Salvar alterações
    await this.repository.save(transaction);
  }
}
