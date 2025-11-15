import React, { memo } from 'react';
import { MarketRatesWidget } from './MarketRatesWidget';
import { CryptoRatesWidget } from '../CryptoRatesWidget';

/**
 * Componente memoizado de widgets do Dashboard
 * Agrupa widgets de cotações (Market Rates e Crypto) para evitar re-renders
 */
export const DashboardWidgetsMemo = memo(() => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <MarketRatesWidget />
      <CryptoRatesWidget />
    </div>
  );
});

DashboardWidgetsMemo.displayName = 'DashboardWidgetsMemo';
