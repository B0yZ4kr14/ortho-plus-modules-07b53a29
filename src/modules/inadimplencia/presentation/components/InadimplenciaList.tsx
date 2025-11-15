import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, MessageSquare, Phone } from "lucide-react";

export function InadimplenciaList() {
  const debtors = [
    {
      id: "1",
      patient: "João Silva",
      value: "R$ 1.850,00",
      daysOverdue: 15,
      lastContact: "2025-11-10",
      status: "em_negociacao"
    },
    {
      id: "2",
      patient: "Maria Santos",
      value: "R$ 3.200,00",
      daysOverdue: 45,
      lastContact: "2025-11-01",
      status: "critico"
    },
    {
      id: "3",
      patient: "Pedro Costa",
      value: "R$ 950,00",
      daysOverdue: 8,
      lastContact: "2025-11-13",
      status: "novo"
    }
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, "default" | "secondary" | "destructive"> = {
      novo: "secondary",
      em_negociacao: "default",
      critico: "destructive"
    };
    return colors[status] || "default";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Inadimplentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {debtors.map((debtor) => (
            <div
              key={debtor.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <div>
                  <p className="font-medium">{debtor.patient}</p>
                  <p className="text-sm text-muted-foreground">
                    {debtor.daysOverdue} dias de atraso
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-bold">{debtor.value}</p>
                  <Badge variant={getStatusColor(debtor.status)}>
                    {debtor.status}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
