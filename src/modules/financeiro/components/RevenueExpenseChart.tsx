import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MonthlyData } from '../types/financeiro.types';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface RevenueExpenseChartProps {
  data: MonthlyData[];
}

export function RevenueExpenseChart({ data }: RevenueExpenseChartProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Receita vs Despesa</h3>
        <Tabs defaultValue="month">
          <TabsList>
            <TabsTrigger value="day">Dia</TabsTrigger>
            <TabsTrigger value="week">Semana</TabsTrigger>
            <TabsTrigger value="month">Mês</TabsTrigger>
            <TabsTrigger value="year">Ano</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <ChartContainer
        config={{
          revenue: {
            label: 'Receita',
            color: 'hsl(var(--primary))',
          },
          expense: {
            label: 'Despesa',
            color: 'hsl(var(--destructive))',
          },
        }}
        className="h-[300px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="month" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => `R$ ${value / 1000}k`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Bar 
              dataKey="revenue" 
              fill="hsl(var(--primary))" 
              radius={[4, 4, 0, 0]}
              name="Receita"
            />
            <Bar 
              dataKey="expense" 
              fill="hsl(var(--destructive))" 
              radius={[4, 4, 0, 0]}
              name="Despesa"
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Card>
  );
}
