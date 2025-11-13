-- Add cascade fields to crypto_price_alerts for DCA strategy
ALTER TABLE crypto_price_alerts
ADD COLUMN cascade_group_id uuid DEFAULT NULL,
ADD COLUMN cascade_order integer DEFAULT 1,
ADD COLUMN cascade_enabled boolean DEFAULT false;

COMMENT ON COLUMN crypto_price_alerts.cascade_group_id IS 'Agrupa alertas que fazem parte da mesma estratégia DCA em cascata';
COMMENT ON COLUMN crypto_price_alerts.cascade_order IS 'Ordem de execução dentro do grupo de cascata (1, 2, 3...)';
COMMENT ON COLUMN crypto_price_alerts.cascade_enabled IS 'Se true, este alerta faz parte de uma estratégia de cascata';

-- Create index for cascade queries
CREATE INDEX idx_crypto_alerts_cascade ON crypto_price_alerts(cascade_group_id, cascade_order) WHERE cascade_enabled = true;