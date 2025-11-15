import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Clock, CheckCircle, TrendingUp } from "lucide-react";

export function TeleodontoDashboard() {
  const stats = [
    {
      title: "Sessões Hoje",
      value: "12",
      icon: Video,
      trend: "+15%",
      description: "vs. semana passada"
    },
    {
      title: "Duração Média",
      value: "45min",
      icon: Clock,
      trend: "-5min",
      description: "otimização"
    },
    {
      title: "Taxa de Conclusão",
      value: "98%",
      icon: CheckCircle,
      trend: "+2%",
      description: "excelente"
    },
    {
      title: "Satisfação",
      value: "4.8/5",
      icon: TrendingUp,
      trend: "+0.3",
      description: "muito bom"
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
