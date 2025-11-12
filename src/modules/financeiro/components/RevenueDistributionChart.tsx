import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CategoryDistribution } from '../types/financeiro.types';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface RevenueDistributionChartProps {
  data: CategoryDistribution[];
}

const COLORS = {
  CONSULTA: 'hsl(var(--chart-1))',
  TRATAMENTO: 'hsl(var(--chart-2))',
  ORTODONTIA: 'hsl(var(--chart-3))',
  IMPLANTE: 'hsl(var(--chart-4))',
  OUTROS: 'hsl(var(--chart-5))',
};

const CATEGORY_LABELS: Record<string, string> = {
  CONSULTA: 'Consultas',
  TRATAMENTO: 'Tratamentos',
  ORTODONTIA: 'Ortodontia',
  IMPLANTE: 'Implantes',
  OUTROS: 'Outros',
};

export function RevenueDistributionChart({ data }: RevenueDistributionChartProps) {
  const chartData = data.map(item => ({
    name: CATEGORY_LABELS[item.category] || item.category,
    value: item.value,
    percentage: item.percentage,
  }));

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Distribuição de Receita</h3>
        <Tabs defaultValue="month">
          <TabsList>
            <TabsTrigger value="month">Mês</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ChartContainer
        config={{
          consultas: { label: 'Consultas', color: COLORS.CONSULTA },
          tratamentos: { label: 'Tratamentos', color: COLORS.TRATAMENTO },
          ortodontia: { label: 'Ortodontia', color: COLORS.ORTODONTIA },
          implantes: { label: 'Implantes', color: COLORS.IMPLANTE },
          outros: { label: 'Outros', color: COLORS.OUTROS },
        }}
        className="h-[300px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={Object.values(COLORS)[index % Object.values(COLORS).length]} 
                />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend 
              verticalAlign="middle" 
              align="right"
              layout="vertical"
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Card>
  );
}
