import React, { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AppointmentDataPoint {
  name: string;
  agendadas: number;
  realizadas: number;
}

interface RevenueDataPoint {
  name: string;
  receita: number;
  despesas: number;
}

interface DashboardChartsProps {
  appointmentsData: AppointmentDataPoint[];
  revenueData: RevenueDataPoint[];
}

/**
 * Componente memoizado de gráficos do Dashboard
 * Usa React.memo para evitar re-renders desnecessários
 */
export const DashboardChartsMemo = memo<DashboardChartsProps>(({ appointmentsData, revenueData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de Consultas */}
      <Card>
        <CardHeader>
          <CardTitle>Consultas da Semana</CardTitle>
          <CardDescription>Agendadas vs Realizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={appointmentsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Legend />
              <Bar dataKey="agendadas" fill="hsl(var(--primary))" name="Agendadas" />
              <Bar dataKey="realizadas" fill="hsl(var(--success))" name="Realizadas" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Receita */}
      <Card>
        <CardHeader>
          <CardTitle>Desempenho Financeiro</CardTitle>
          <CardDescription>Receitas e Despesas</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="receita" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Receita" 
              />
              <Line 
                type="monotone" 
                dataKey="despesas" 
                stroke="hsl(var(--destructive))" 
                strokeWidth={2}
                name="Despesas" 
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function para otimizar ainda mais
  return (
    JSON.stringify(prevProps.appointmentsData) === JSON.stringify(nextProps.appointmentsData) &&
    JSON.stringify(prevProps.revenueData) === JSON.stringify(nextProps.revenueData)
  );
});

DashboardChartsMemo.displayName = 'DashboardChartsMemo';
