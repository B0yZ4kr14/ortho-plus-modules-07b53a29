import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Users, Calendar } from "lucide-react";

export function BIMetrics() {
  const metrics = [
    {
      title: "Receita Mensal",
      value: "R$ 185.420",
      icon: DollarSign,
      trend: "+15.3%",
      description: "vs. mês anterior"
    },
    {
      title: "Novos Pacientes",
      value: "124",
      icon: Users,
      trend: "+8.2%",
      description: "este mês"
    },
    {
      title: "Taxa de Ocupação",
      value: "87%",
      icon: Calendar,
      trend: "+3.5%",
      description: "capacidade"
    },
    {
      title: "Ticket Médio",
      value: "R$ 1.485",
      icon: TrendingUp,
      trend: "+6.8%",
      description: "por paciente"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.title}
            </CardTitle>
            <metric.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-primary">{metric.trend}</span> {metric.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
