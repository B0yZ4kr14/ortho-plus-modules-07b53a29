import { PageHeader } from '@/components/shared/PageHeader';
import { TrendingUp } from 'lucide-react';
import { InventarioHistoricoComparacao } from '@/modules/estoque/components/InventarioHistoricoComparacao';

export default function EstoqueInventarioHistorico() {
  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Histórico de Inventários"
        description="Análise comparativa e evolução de divergências ao longo do tempo"
        icon={TrendingUp}
      />
      
      <InventarioHistoricoComparacao />
    </div>
  );
}
