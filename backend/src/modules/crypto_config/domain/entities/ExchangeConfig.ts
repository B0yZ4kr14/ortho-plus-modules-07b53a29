/**
 * ExchangeConfig Entity
 * Configuração de exchange de criptomoedas
 */

export type ExchangeType = 'BINANCE' | 'COINBASE' | 'KRAKEN' | 'MERCADO_BITCOIN';

export interface ExchangeConfigProps {
  id: string;
  clinicId: string;
  exchangeType: ExchangeType;
  apiKey: string;
  apiSecret: string; // Deve ser criptografado no storage
  isActive: boolean;
  lastSyncAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class ExchangeConfig {
  constructor(private props: ExchangeConfigProps) {}

  get id(): string {
    return this.props.id;
  }

  get clinicId(): string {
    return this.props.clinicId;
  }

  get exchangeType(): ExchangeType {
    return this.props.exchangeType;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  updateSync(): void {
    this.props.lastSyncAt = new Date();
  }

  needsSync(): boolean {
    if (!this.props.lastSyncAt) return true;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return this.props.lastSyncAt < fiveMinutesAgo;
  }

  toJSON(): Omit<ExchangeConfigProps, 'apiSecret'> {
    const { apiSecret, ...rest } = this.props;
    return rest;
  }
}
