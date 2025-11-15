import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, TrendingDown, Clock, CheckCircle } from "lucide-react";

export function InadimplenciaDashboard() {
  const stats = [
    {
      title: "Total Inadimplente",
      value: "R$ 23.450",
      icon: AlertCircle,
      trend: "-8%",
      description: "redução este mês",
      color: "text-destructive"
    },
    {
      title: "Contas Vencidas",
      value: "15",
      icon: Clock,
      trend: "-3",
      description: "vs. mês anterior"
    },
    {
      title: "Taxa de Recuperação",
      value: "67%",
      icon: TrendingDown,
      trend: "+12%",
      description: "excelente"
    },
    {
      title: "Cobranças Resolvidas",
      value: "28",
      icon: CheckCircle,
      trend: "+5",
      description: "este mês"
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
            <stat.icon className={`h-4 w-4 ${stat.color || 'text-muted-foreground'}`} />
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
