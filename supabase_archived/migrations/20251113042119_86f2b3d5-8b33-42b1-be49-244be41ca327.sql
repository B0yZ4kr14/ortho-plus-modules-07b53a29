-- Add stop-loss configuration to crypto_price_alerts table
ALTER TABLE crypto_price_alerts
ADD COLUMN auto_convert_on_trigger boolean DEFAULT false,
ADD COLUMN conversion_percentage numeric DEFAULT 100 CHECK (conversion_percentage > 0 AND conversion_percentage <= 100),
ADD COLUMN stop_loss_enabled boolean DEFAULT false;

COMMENT ON COLUMN crypto_price_alerts.auto_convert_on_trigger IS 'Se true, converte automaticamente cripto para BRL quando alerta é disparado';
COMMENT ON COLUMN crypto_price_alerts.conversion_percentage IS 'Percentual do saldo da wallet a ser convertido (1-100%)';
COMMENT ON COLUMN crypto_price_alerts.stop_loss_enabled IS 'Se true, funciona como stop-loss automático';

-- Create table for candlestick/OHLC data
CREATE TABLE crypto_candlestick_data (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coin_type text NOT NULL,
  interval text NOT NULL, -- '1m', '5m', '15m', '1h', '4h', '1d'
  open_time timestamptz NOT NULL,
  close_time timestamptz NOT NULL,
  open_price numeric NOT NULL,
  high_price numeric NOT NULL,
  low_price numeric NOT NULL,
  close_price numeric NOT NULL,
  volume numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(coin_type, interval, open_time)
);

CREATE INDEX idx_candlestick_coin_interval ON crypto_candlestick_data(coin_type, interval);
CREATE INDEX idx_candlestick_time ON crypto_candlestick_data(open_time DESC);

-- RLS policies for candlestick data
ALTER TABLE crypto_candlestick_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view candlestick data"
ON crypto_candlestick_data FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "System can insert candlestick data"
ON crypto_candlestick_data FOR INSERT
TO authenticated
WITH CHECK (true);