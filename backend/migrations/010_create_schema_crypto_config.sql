-- Migration: 010 - Create Schema crypto_config
-- Módulo: CRYPTO CONFIG (Administração)
-- Descrição: Schema para configuração de criptomoedas, exchanges, hardwallets e portfolio

-- ============================================================================
-- 1. CREATE SCHEMA
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS crypto_config;

-- ============================================================================
-- 2. ENUMS
-- ============================================================================
CREATE TYPE crypto_config.exchange_provider AS ENUM (
  'BINANCE',
  'COINBASE',
  'KRAKEN',
  'MERCADO_BITCOIN',
  'FOXBIT',
  'BITFINEX',
  'BITSTAMP'
);

CREATE TYPE crypto_config.wallet_type AS ENUM (
  'HARDWALLET',  -- Ledger, Trezor
  'BTCPAY',      -- BTCPay Server (xPub)
  'OFFLINE',     -- Paper wallet, cold storage
  'HOT'          -- Online wallet
);

CREATE TYPE crypto_config.hardwallet_brand AS ENUM (
  'LEDGER_NANO_S',
  'LEDGER_NANO_X',
  'TREZOR_ONE',
  'TREZOR_MODEL_T',
  'OTHER'
);

CREATE TYPE crypto_config.cryptocurrency AS ENUM (
  'BTC',   -- Bitcoin
  'ETH',   -- Ethereum
  'USDT',  -- Tether
  'USDC',  -- USD Coin
  'BNB',   -- Binance Coin
  'XRP',   -- Ripple
  'ADA',   -- Cardano
  'SOL',   -- Solana
  'DOT',   -- Polkadot
  'MATIC'  -- Polygon
);

-- ============================================================================
-- 3. EXCHANGE CONFIGURATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS crypto_config.exchange_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  
  -- Exchange info
  provider crypto_config.exchange_provider NOT NULL,
  exchange_name TEXT NOT NULL, -- Nome customizado
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Credentials (ENCRYPTED)
  api_key_encrypted TEXT NOT NULL,
  api_secret_encrypted TEXT NOT NULL,
  api_passphrase_encrypted TEXT, -- Alguns exchanges requerem
  
  -- Permissions
  permissions JSONB NOT NULL DEFAULT '{"read": true, "trade": false, "withdraw": false}',
  
  -- Configuration
  default_for_payments BOOLEAN NOT NULL DEFAULT false,
  supported_cryptocurrencies crypto_config.cryptocurrency[] NOT NULL,
  
  -- Monitoring
  last_sync_at TIMESTAMPTZ,
  last_sync_status TEXT, -- 'SUCCESS', 'FAILED'
  last_error TEXT,
  
  -- Rate limiting
  requests_per_minute INTEGER NOT NULL DEFAULT 60,
  
  -- Context
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_clinic_exchange UNIQUE (clinic_id, provider)
);

CREATE INDEX idx_exchange_config_clinic ON crypto_config.exchange_configurations(clinic_id);
CREATE INDEX idx_exchange_config_active ON crypto_config.exchange_configurations(clinic_id, is_active);

-- ============================================================================
-- 4. WALLET CONFIGURATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS crypto_config.wallet_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  
  -- Wallet info
  wallet_type crypto_config.wallet_type NOT NULL,
  wallet_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Hardwallet specific
  hardwallet_brand crypto_config.hardwallet_brand,
  device_serial TEXT,
  
  -- BTCPay specific
  btcpay_server_url TEXT,
  btcpay_store_id TEXT,
  xpub TEXT, -- Extended Public Key
  
  -- Addresses (por cryptocurrency)
  addresses JSONB NOT NULL DEFAULT '{}', -- { "BTC": "bc1q...", "ETH": "0x..." }
  
  -- Security
  requires_2fa BOOLEAN NOT NULL DEFAULT true,
  requires_device_confirmation BOOLEAN NOT NULL DEFAULT false,
  
  -- Monitoring
  last_balance_check_at TIMESTAMPTZ,
  last_balance JSONB, -- { "BTC": "0.5", "ETH": "2.3" }
  
  -- Context
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wallet_config_clinic ON crypto_config.wallet_configurations(clinic_id);
CREATE INDEX idx_wallet_config_type ON crypto_config.wallet_configurations(wallet_type);

-- ============================================================================
-- 5. PORTFOLIO HOLDINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS crypto_config.portfolio_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  
  -- Asset
  cryptocurrency crypto_config.cryptocurrency NOT NULL,
  
  -- Quantity
  quantity DECIMAL(24, 8) NOT NULL, -- Suporta até 8 casas decimais (padrão cripto)
  
  -- Source
  source_type TEXT NOT NULL, -- 'EXCHANGE', 'WALLET', 'MANUAL'
  source_id UUID, -- ID da exchange ou wallet
  
  -- Acquisition
  avg_purchase_price_usd DECIMAL(18, 2),
  total_cost_usd DECIMAL(18, 2),
  
  -- Current value (cache)
  current_price_usd DECIMAL(18, 2),
  current_value_usd DECIMAL(18, 2),
  unrealized_pnl_usd DECIMAL(18, 2), -- Profit/Loss não realizado
  unrealized_pnl_percent DECIMAL(10, 2),
  
  -- Last update
  last_price_update_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT positive_quantity CHECK (quantity > 0),
  CONSTRAINT unique_clinic_crypto_source UNIQUE (clinic_id, cryptocurrency, source_type, source_id)
);

CREATE INDEX idx_portfolio_clinic ON crypto_config.portfolio_holdings(clinic_id);
CREATE INDEX idx_portfolio_crypto ON crypto_config.portfolio_holdings(cryptocurrency);

-- ============================================================================
-- 6. TRANSACTION HISTORY (Crypto)
-- ============================================================================
CREATE TABLE IF NOT EXISTS crypto_config.transaction_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  
  -- Transaction info
  transaction_type TEXT NOT NULL, -- 'BUY', 'SELL', 'RECEIVE', 'SEND', 'TRANSFER'
  cryptocurrency crypto_config.cryptocurrency NOT NULL,
  
  -- Amounts
  amount DECIMAL(24, 8) NOT NULL,
  price_usd DECIMAL(18, 2) NOT NULL,
  total_usd DECIMAL(18, 2) NOT NULL,
  fee_amount DECIMAL(24, 8),
  fee_currency crypto_config.cryptocurrency,
  
  -- Source/Destination
  source_type TEXT, -- 'EXCHANGE', 'WALLET'
  source_id UUID,
  destination_type TEXT,
  destination_id UUID,
  
  -- Blockchain
  tx_hash TEXT, -- Hash da transação on-chain
  confirmations INTEGER,
  blockchain_network TEXT, -- 'MAINNET', 'TESTNET'
  
  -- Exchange specific
  exchange_order_id TEXT,
  exchange_trade_id TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'CONFIRMED', 'FAILED'
  
  -- Timestamps
  transaction_date TIMESTAMPTZ NOT NULL,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_transaction_type CHECK (
    transaction_type IN ('BUY', 'SELL', 'RECEIVE', 'SEND', 'TRANSFER')
  ),
  CONSTRAINT valid_status CHECK (
    status IN ('PENDING', 'CONFIRMED', 'FAILED')
  )
);

CREATE INDEX idx_crypto_tx_clinic ON crypto_config.transaction_history(clinic_id, transaction_date DESC);
CREATE INDEX idx_crypto_tx_hash ON crypto_config.transaction_history(tx_hash);
CREATE INDEX idx_crypto_tx_crypto ON crypto_config.transaction_history(cryptocurrency);

-- ============================================================================
-- 7. DCA STRATEGIES (Dollar-Cost Averaging)
-- ============================================================================
CREATE TABLE IF NOT EXISTS crypto_config.dca_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  
  -- Strategy info
  strategy_name TEXT NOT NULL,
  cryptocurrency crypto_config.cryptocurrency NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- DCA config
  amount_per_purchase_usd DECIMAL(18, 2) NOT NULL,
  frequency TEXT NOT NULL, -- 'DAILY', 'WEEKLY', 'MONTHLY'
  frequency_day TEXT, -- 'MONDAY', '1', etc
  execution_time TIME NOT NULL DEFAULT '09:00:00',
  
  -- Limits
  max_total_investment_usd DECIMAL(18, 2),
  current_total_invested_usd DECIMAL(18, 2) NOT NULL DEFAULT 0,
  
  -- Exchange
  exchange_id UUID REFERENCES crypto_config.exchange_configurations(id) ON DELETE CASCADE,
  
  -- Alert thresholds
  alert_on_price_drop_percent DECIMAL(5, 2), -- Alerta se preço cair X%
  alert_on_price_spike_percent DECIMAL(5, 2), -- Alerta se preço subir X%
  
  -- Execution info
  last_execution_at TIMESTAMPTZ,
  next_execution_at TIMESTAMPTZ NOT NULL,
  total_purchases INTEGER NOT NULL DEFAULT 0,
  
  -- Notifications
  notification_emails TEXT[],
  
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT positive_amount CHECK (amount_per_purchase_usd > 0)
);

CREATE INDEX idx_dca_clinic ON crypto_config.dca_strategies(clinic_id);
CREATE INDEX idx_dca_next_execution ON crypto_config.dca_strategies(next_execution_at) WHERE is_active = true;

-- ============================================================================
-- 8. PRICE ALERTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS crypto_config.price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  
  -- Alert info
  alert_name TEXT NOT NULL,
  cryptocurrency crypto_config.cryptocurrency NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Conditions
  condition_type TEXT NOT NULL, -- 'ABOVE', 'BELOW', 'CHANGE_PERCENT'
  threshold_value DECIMAL(18, 2) NOT NULL,
  
  -- Notifications
  notification_emails TEXT[],
  notification_webhooks TEXT[],
  
  -- Status
  last_triggered_at TIMESTAMPTZ,
  trigger_count INTEGER NOT NULL DEFAULT 0,
  
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_condition_type CHECK (
    condition_type IN ('ABOVE', 'BELOW', 'CHANGE_PERCENT')
  )
);

CREATE INDEX idx_price_alerts_clinic ON crypto_config.price_alerts(clinic_id);
CREATE INDEX idx_price_alerts_active ON crypto_config.price_alerts(is_active);

-- ============================================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE crypto_config.exchange_configurations ENABLE ROW LEVEL SECURITY;
CREATE POLICY exchange_config_clinic_isolation ON crypto_config.exchange_configurations
  FOR ALL USING (clinic_id IN (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

ALTER TABLE crypto_config.wallet_configurations ENABLE ROW LEVEL SECURITY;
CREATE POLICY wallet_config_clinic_isolation ON crypto_config.wallet_configurations
  FOR ALL USING (clinic_id IN (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

ALTER TABLE crypto_config.portfolio_holdings ENABLE ROW LEVEL SECURITY;
CREATE POLICY portfolio_clinic_isolation ON crypto_config.portfolio_holdings
  FOR ALL USING (clinic_id IN (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

ALTER TABLE crypto_config.transaction_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY crypto_tx_clinic_isolation ON crypto_config.transaction_history
  FOR ALL USING (clinic_id IN (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

ALTER TABLE crypto_config.dca_strategies ENABLE ROW LEVEL SECURITY;
CREATE POLICY dca_clinic_isolation ON crypto_config.dca_strategies
  FOR ALL USING (clinic_id IN (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

ALTER TABLE crypto_config.price_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY price_alerts_clinic_isolation ON crypto_config.price_alerts
  FOR ALL USING (clinic_id IN (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

-- ============================================================================
-- 10. TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION crypto_config.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_exchange_config_updated
  BEFORE UPDATE ON crypto_config.exchange_configurations
  FOR EACH ROW EXECUTE FUNCTION crypto_config.update_updated_at();

CREATE TRIGGER trg_wallet_config_updated
  BEFORE UPDATE ON crypto_config.wallet_configurations
  FOR EACH ROW EXECUTE FUNCTION crypto_config.update_updated_at();

CREATE TRIGGER trg_portfolio_updated
  BEFORE UPDATE ON crypto_config.portfolio_holdings
  FOR EACH ROW EXECUTE FUNCTION crypto_config.update_updated_at();

CREATE TRIGGER trg_dca_updated
  BEFORE UPDATE ON crypto_config.dca_strategies
  FOR EACH ROW EXECUTE FUNCTION crypto_config.update_updated_at();

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================
COMMENT ON SCHEMA crypto_config IS 'Módulo de Configuração de Criptomoedas - Exchanges, Hardwallets, Portfolio e DCA';
COMMENT ON TABLE crypto_config.exchange_configurations IS 'Configurações de exchanges de criptomoedas com credenciais encriptadas';
COMMENT ON TABLE crypto_config.wallet_configurations IS 'Configurações de carteiras (hardwallets, BTCPay, offline)';
COMMENT ON TABLE crypto_config.portfolio_holdings IS 'Holdings consolidados do portfolio de criptomoedas';
COMMENT ON TABLE crypto_config.transaction_history IS 'Histórico completo de transações cripto (compras, vendas, transferências)';
COMMENT ON TABLE crypto_config.dca_strategies IS 'Estratégias automatizadas de Dollar-Cost Averaging';
COMMENT ON TABLE crypto_config.price_alerts IS 'Alertas de preço configuráveis para criptomoedas';
