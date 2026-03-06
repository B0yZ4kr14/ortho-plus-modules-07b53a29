/**
 * FASE 3 - SPRINT 3: Generate Payment Address Use Case
 *
 * Responsável por gerar endereços de pagamento para wallets offline (xPub)
 * ou buscar endereços de deposit via APIs de exchanges.
 */

export interface GeneratePaymentAddressDTO {
  clinicId: string;
  walletId: string; // ID da crypto_exchange_config ou crypto_offline_wallets
  walletType: "exchange" | "offline";
  amount: number;
  cryptocurrency: "BTC" | "ETH" | "USDT" | "BNB";
  orderId: string;
  metadata?: Record<string, any>;
}

export interface PaymentAddressResult {
  address: string;
  qrCodeData: string; // BIP21 URI format
  addressIndex?: number; // Para offline wallets (xPub derivation)
  invoiceId?: string; // Para BTCPay Server
  expiresAt: Date;
  transactionId: string; // ID da transação criada no DB
}

export class GeneratePaymentAddressUseCase {
  async execute(dto: GeneratePaymentAddressDTO): Promise<PaymentAddressResult> {
    try {
      if (dto.walletType === "exchange") {
        return await this.generateExchangeAddress(dto);
      } else {
        return await this.generateOfflineWalletAddress(dto);
      }
    } catch (error) {
      console.error("[GeneratePaymentAddressUseCase] Error:", error);
      throw new Error(`Failed to generate payment address: ${error.message}`);
    }
  }

  private async generateExchangeAddress(
    dto: GeneratePaymentAddressDTO,
  ): Promise<PaymentAddressResult> {
    // Mock de endereço (em produção, buscar do DB)
    const depositAddress = `bc1q${Math.random().toString(36).substring(2, 42)}`;
    const qrCodeData = this.generateBIP21URI(
      dto.cryptocurrency,
      depositAddress,
      dto.amount,
      `Order-${dto.orderId}`,
    );
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    return {
      address: depositAddress,
      qrCodeData,
      expiresAt,
      transactionId: `tx-${Date.now()}`,
    };
  }

  private async generateOfflineWalletAddress(
    dto: GeneratePaymentAddressDTO,
  ): Promise<PaymentAddressResult> {
    const nextIndex = Math.floor(Math.random() * 100);
    const derivedAddress = this.mockDeriveAddress(
      "xpub...",
      nextIndex,
      "p2wpkh",
    );
    const qrCodeData = this.generateBIP21URI(
      dto.cryptocurrency,
      derivedAddress,
      dto.amount,
      `Order-${dto.orderId}`,
    );
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    return {
      address: derivedAddress,
      qrCodeData,
      addressIndex: nextIndex,
      expiresAt,
      transactionId: `tx-${Date.now()}`,
    };
  }

  /**
   * Gera URI BIP21 para QR Code
   * Formato: bitcoin:address?amount=0.001&label=Order-123
   */
  private generateBIP21URI(
    cryptocurrency: string,
    address: string,
    amount: number,
    label: string,
  ): string {
    const scheme = cryptocurrency.toLowerCase();
    return `${scheme}:${address}?amount=${amount}&label=${encodeURIComponent(label)}`;
  }

  /**
   * Mock de derivação de endereço (em produção, usar lib BIP32)
   *
   * IMPORTANTE: Em produção, implementar usando:
   * - bitcoinjs-lib (para Bitcoin)
   * - ethers.js (para Ethereum)
   * - ou chamar Edge Function que faz a derivação
   */
  private mockDeriveAddress(
    xpub: string,
    index: number,
    addressType: string,
  ): string {
    // SegWit Native (bc1...) - BIP84
    if (addressType === "p2wpkh") {
      return `bc1q${Math.random().toString(36).substring(2, 42)}${index}`;
    }

    // SegWit Wrapped (3...) - BIP49
    if (addressType === "p2sh") {
      return `3${Math.random().toString(36).substring(2, 34).toUpperCase()}${index}`;
    }

    // Legacy (1...) - BIP44
    return `1${Math.random().toString(36).substring(2, 34).toUpperCase()}${index}`;
  }
}

// Export singleton instance
export const generatePaymentAddressUseCase =
  new GeneratePaymentAddressUseCase();
