/**
 * FASE 2 - TASK 2.6: BTCPay Server / Crypto Payments Domain Entity
 * Representa transações de pagamento em criptomoedas via BTCPay Server
 */

export type Cryptocurrency = 'BTC' | 'LN' | 'ETH' | 'LTC';
export type TransactionStatus = 'pending' | 'processing' | 'confirmed' | 'completed' | 'expired' | 'invalid' | 'refunded';
export type PaymentMethod = 'btc' | 'lightning';
export type HealthStatus = 'healthy' | 'degraded' | 'down';

export interface CryptoConfigProps {
  id: string;
  clinicId: string;
  btcpayServerUrl: string;
  storeId: string;
  acceptedCryptocurrencies: Cryptocurrency[];
  autoConvertToBrl: boolean;
  paymentTimeoutMinutes: number;
  confirmationBlocksRequired: number;
  isActive: boolean;
  healthStatus?: HealthStatus;
  lastHealthCheck?: Date;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
}

export class CryptoConfig {
  private constructor(private props: CryptoConfigProps) {}

  static create(
    props: Omit<CryptoConfigProps, 'id' | 'isActive' | 'createdAt' | 'updatedAt'>
  ): CryptoConfig {
    if (!props.clinicId || !props.btcpayServerUrl || !props.storeId || !props.createdBy) {
      throw new Error('Dados obrigatórios não fornecidos');
    }

    return new CryptoConfig({
      ...props,
      id: crypto.randomUUID(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static restore(props: CryptoConfigProps): CryptoConfig {
    return new CryptoConfig(props);
  }

  get id() { return this.props.id; }
  get clinicId() { return this.props.clinicId; }
  get btcpayServerUrl() { return this.props.btcpayServerUrl; }
  get isActive() { return this.props.isActive; }
  get healthStatus() { return this.props.healthStatus; }

  ativar(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  desativar(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  atualizarHealthStatus(status: HealthStatus): void {
    this.props.healthStatus = status;
    this.props.lastHealthCheck = new Date();
    this.props.updatedAt = new Date();
  }

  toObject(): CryptoConfigProps {
    return { ...this.props };
  }
}

/**
 * Crypto Transaction
 */
export interface CryptoTransactionProps {
  id: string;
  clinicId: string;
  walletId?: string;
  patientId?: string;
  appointmentId?: string;
  
  // BTCPay
  btcpayInvoiceId: string;
  btcpayCheckoutLink: string;
  
  // Valores
  amountBrl: number;
  amountCrypto: number;
  cryptocurrency: Cryptocurrency;
  exchangeRate: number;
  
  // Status
  status: TransactionStatus;
  
  // Blockchain
  transactionHash?: string;
  blockHeight?: number;
  confirmations: number;
  networkFeeSats?: number;
  
  // Timestamps
  createdAt: Date;
  paidAt?: Date;
  confirmedAt?: Date;
  expiresAt: Date;
  
  // Metadata
  paymentMethod?: PaymentMethod;
  customerEmail?: string;
  customerName?: string;
}

export class CryptoTransaction {
  private constructor(private props: CryptoTransactionProps) {}

  static create(
    props: Omit<CryptoTransactionProps, 'id' | 'status' | 'confirmations' | 'createdAt'>
  ): CryptoTransaction {
    if (!props.clinicId || !props.btcpayInvoiceId || !props.btcpayCheckoutLink) {
      throw new Error('Dados obrigatórios não fornecidos');
    }

    if (props.expiresAt <= new Date()) {
      throw new Error('Data de expiração deve ser futura');
    }

    return new CryptoTransaction({
      ...props,
      id: crypto.randomUUID(),
      status: 'pending',
      confirmations: 0,
      createdAt: new Date(),
    });
  }

  static restore(props: CryptoTransactionProps): CryptoTransaction {
    return new CryptoTransaction(props);
  }

  get id() { return this.props.id; }
  get clinicId() { return this.props.clinicId; }
  get status() { return this.props.status; }
  get btcpayInvoiceId() { return this.props.btcpayInvoiceId; }
  get btcpayCheckoutLink() { return this.props.btcpayCheckoutLink; }
  get amountBrl() { return this.props.amountBrl; }
  get amountCrypto() { return this.props.amountCrypto; }
  get cryptocurrency() { return this.props.cryptocurrency; }
  get confirmations() { return this.props.confirmations; }
  get expiresAt() { return this.props.expiresAt; }

  // Domain methods
  marcarComoPago(transactionHash: string, paymentMethod: PaymentMethod): void {
    if (this.props.status !== 'pending') {
      throw new Error('Transação não está pendente');
    }

    this.props.status = 'processing';
    this.props.transactionHash = transactionHash;
    this.props.paymentMethod = paymentMethod;
    this.props.paidAt = new Date();
  }

  adicionarConfirmacao(blockHeight: number): void {
    if (this.props.status !== 'processing') {
      throw new Error('Transação não está em processamento');
    }

    this.props.confirmations++;
    this.props.blockHeight = blockHeight;

    // Se atingiu confirmações necessárias, marcar como confirmado
    // (lógica básica, na prática isso virá da config da clínica)
    if (this.props.confirmations >= 1) {
      this.props.status = 'confirmed';
      this.props.confirmedAt = new Date();
    }
  }

  completar(): void {
    if (this.props.status !== 'confirmed') {
      throw new Error('Transação não está confirmada');
    }

    this.props.status = 'completed';
  }

  marcarComoExpirada(): void {
    if (this.props.status === 'completed' || this.props.status === 'confirmed') {
      throw new Error('Não é possível expirar transação confirmada/completa');
    }

    this.props.status = 'expired';
  }

  marcarComoInvalida(): void {
    this.props.status = 'invalid';
  }

  estornar(): void {
    if (this.props.status !== 'completed') {
      throw new Error('Apenas transações completas podem ser estornadas');
    }

    this.props.status = 'refunded';
  }

  calcularTaxaConversao(): number {
    return this.props.amountBrl / this.props.amountCrypto;
  }

  estaExpirada(): boolean {
    return new Date() > this.props.expiresAt && this.props.status === 'pending';
  }

  toObject(): CryptoTransactionProps {
    return { ...this.props };
  }
}

/**
 * Crypto Wallet
 */
export interface CryptoWalletProps {
  id: string;
  clinicId: string;
  cryptocurrency: Cryptocurrency;
  walletAddress: string;
  walletLabel?: string;
  balanceSats: number;
  balanceBrl: number;
  lastBalanceUpdate?: Date;
  isActive: boolean;
  isWatchingOnly: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class CryptoWallet {
  private constructor(private props: CryptoWalletProps) {}

  static create(
    props: Omit<CryptoWalletProps, 'id' | 'balanceSats' | 'balanceBrl' | 'isActive' | 'isWatchingOnly' | 'createdAt' | 'updatedAt'>
  ): CryptoWallet {
    return new CryptoWallet({
      ...props,
      id: crypto.randomUUID(),
      balanceSats: 0,
      balanceBrl: 0,
      isActive: true,
      isWatchingOnly: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static restore(props: CryptoWalletProps): CryptoWallet {
    return new CryptoWallet(props);
  }

  get id() { return this.props.id; }
  get walletAddress() { return this.props.walletAddress; }
  get balanceSats() { return this.props.balanceSats; }
  get balanceBrl() { return this.props.balanceBrl; }
  get cryptocurrency() { return this.props.cryptocurrency; }

  atualizarSaldo(sats: number, brl: number): void {
    this.props.balanceSats = sats;
    this.props.balanceBrl = brl;
    this.props.lastBalanceUpdate = new Date();
    this.props.updatedAt = new Date();
  }

  toObject(): CryptoWalletProps {
    return { ...this.props };
  }
}
