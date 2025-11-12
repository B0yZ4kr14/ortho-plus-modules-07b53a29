import { z } from 'zod';

export const exchangeConfigSchema = z.object({
  id: z.string().uuid().optional(),
  clinic_id: z.string().uuid(),
  exchange_name: z.enum(['BINANCE', 'COINBASE', 'KRAKEN', 'BYBIT', 'MERCADO_BITCOIN']),
  api_key_encrypted: z.string().optional(),
  is_active: z.boolean().default(true),
  wallet_address: z.string().optional(),
  supported_coins: z.array(z.string()).default(['BTC', 'ETH', 'USDT']),
  auto_convert_to_brl: z.boolean().default(false),
  conversion_threshold: z.number().default(0),
  created_by: z.string().uuid(),
});

export const cryptoWalletSchema = z.object({
  id: z.string().uuid().optional(),
  clinic_id: z.string().uuid(),
  exchange_config_id: z.string().uuid().optional(),
  wallet_address: z.string().min(1, 'Endereço da carteira é obrigatório'),
  coin_type: z.enum(['BTC', 'ETH', 'USDT', 'BNB', 'USDC']),
  wallet_name: z.string().min(1, 'Nome da carteira é obrigatório'),
  balance: z.number().default(0),
  balance_brl: z.number().default(0),
  is_active: z.boolean().default(true),
});

export const cryptoTransactionSchema = z.object({
  id: z.string().uuid().optional(),
  clinic_id: z.string().uuid(),
  exchange_config_id: z.string().uuid().optional(),
  wallet_id: z.string().uuid().optional(),
  patient_id: z.string().uuid().optional(),
  conta_receber_id: z.string().uuid().optional(),
  transaction_hash: z.string().optional(),
  coin_type: z.string(),
  amount_crypto: z.number().positive('Valor deve ser positivo'),
  amount_brl: z.number().positive('Valor em BRL deve ser positivo'),
  exchange_rate: z.number().positive('Taxa de câmbio deve ser positiva'),
  tipo: z.enum(['RECEBIMENTO', 'CONVERSAO', 'TRANSFERENCIA']).default('RECEBIMENTO'),
  status: z.enum(['PENDENTE', 'CONFIRMADO', 'CONVERTIDO', 'FALHOU']).default('PENDENTE'),
  confirmations: z.number().default(0),
  required_confirmations: z.number().default(3),
  from_address: z.string().optional(),
  to_address: z.string().optional(),
  network_fee: z.number().optional(),
  observacoes: z.string().optional(),
});

export type ExchangeConfig = z.infer<typeof exchangeConfigSchema>;
export type CryptoWallet = z.infer<typeof cryptoWalletSchema>;
export type CryptoTransaction = z.infer<typeof cryptoTransactionSchema>;

export interface CryptoTransactionComplete extends Omit<CryptoTransaction, 'id' | 'clinic_id'> {
  id?: string;
  clinic_id?: string;
  patient_name?: string;
  wallet_name?: string;
  exchange_name?: string;
  converted_to_brl_at?: string;
  created_at?: string;
  updated_at?: string;
}

export const exchangeLabels: Record<string, string> = {
  BINANCE: 'Binance',
  COINBASE: 'Coinbase',
  KRAKEN: 'Kraken',
  BYBIT: 'Bybit',
  MERCADO_BITCOIN: 'Mercado Bitcoin',
};

export const coinLabels: Record<string, string> = {
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  USDT: 'Tether',
  BNB: 'Binance Coin',
  USDC: 'USD Coin',
};

export const statusLabels: Record<string, string> = {
  PENDENTE: 'Pendente',
  CONFIRMADO: 'Confirmado',
  CONVERTIDO: 'Convertido',
  FALHOU: 'Falhou',
};

export const tipoLabels: Record<string, string> = {
  RECEBIMENTO: 'Recebimento',
  CONVERSAO: 'Conversão',
  TRANSFERENCIA: 'Transferência',
};
