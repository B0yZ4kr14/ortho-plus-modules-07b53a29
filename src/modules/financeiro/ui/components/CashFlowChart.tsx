import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CashFlowResult } from '../../application/use-cases/GetCashFlowUseCase';

interface CashFlowChartProps {
  cashFlow: CashFlowResult | null;
  loading?: boolean;
}

export function CashFlowChart({ cashFlow, loading }: CashFlowChartProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">Carregando dados...</p>
        </CardContent>
      </Card>
    );
  }

  if (!cashFlow) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">Nenhum dado disponível.</p>
        </CardContent>
      </Card>
    );
  }

  const data = [
    {
      name: 'Realizadas',
      Receitas: cashFlow.totalReceitas,
      Despesas: cashFlow.totalDespesas,
    },
    {
      name: 'Pendentes',
      Receitas: cashFlow.receitasPendentes,
      Despesas: cashFlow.despesasPendentes,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fluxo de Caixa</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Receitas</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {cashFlow.totalReceitas.toFixed(2)}
              </p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Despesas</p>
              <p className="text-2xl font-bold text-red-600">
                R$ {cashFlow.totalDespesas.toFixed(2)}
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Saldo</p>
              <p className={`text-2xl font-bold ${cashFlow.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {cashFlow.saldo.toFixed(2)}
              </p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="Receitas" fill="#10b981" />
              <Bar dataKey="Despesas" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
