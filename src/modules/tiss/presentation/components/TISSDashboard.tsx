import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Send, CheckCircle, XCircle } from "lucide-react";

export function TISSDashboard() {
  const stats = [
    {
      title: "Guias Pendentes",
      value: "23",
      icon: FileText,
      trend: "+5",
      description: "aguardando envio"
    },
    {
      title: "Enviadas este Mês",
      value: "142",
      icon: Send,
      trend: "+12%",
      description: "vs. mês anterior"
    },
    {
      title: "Taxa de Aprovação",
      value: "94%",
      icon: CheckCircle,
      trend: "+2%",
      description: "excelente"
    },
    {
      title: "Glosas",
      value: "8",
      icon: XCircle,
      trend: "-3",
      description: "redução"
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
