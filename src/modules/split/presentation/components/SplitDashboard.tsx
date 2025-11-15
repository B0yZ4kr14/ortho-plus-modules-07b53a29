import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Users, Percent } from "lucide-react";

export function SplitDashboard() {
  const stats = [
    {
      title: "Total Distribuído (Mês)",
      value: "R$ 125.450",
      icon: DollarSign,
      trend: "+12%",
      description: "vs. mês anterior"
    },
    {
      title: "Economia Tributária",
      value: "R$ 8.320",
      icon: TrendingUp,
      trend: "+5%",
      description: "otimização fiscal"
    },
    {
      title: "Profissionais Ativos",
      value: "8",
      icon: Users,
      trend: "+2",
      description: "novos este mês"
    },
    {
      title: "Taxa Média Split",
      value: "65%",
      icon: Percent,
      trend: "estável",
      description: "para profissionais"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-primary">{stat.trend}</span> {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
