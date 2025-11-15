import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function LGPDRequests() {
  const requests = [
    {
      id: "1",
      type: "Acesso aos Dados",
      patient: "João Silva",
      date: "2025-11-15",
      status: "pendente",
      deadline: "2025-11-30"
    },
    {
      id: "2",
      type: "Exclusão de Dados",
      patient: "Maria Santos",
      date: "2025-11-14",
      status: "em_analise",
      deadline: "2025-11-29"
    },
    {
      id: "3",
      type: "Portabilidade",
      patient: "Pedro Costa",
      date: "2025-11-13",
      status: "concluida",
      deadline: "2025-11-28"
    }
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, "default" | "secondary" | "destructive"> = {
      pendente: "destructive",
      em_analise: "secondary",
      concluida: "default"
    };
    return colors[status] || "default";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitações LGPD</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <p className="font-medium">{request.type}</p>
                <p className="text-sm text-muted-foreground">
                  {request.patient} • {request.date}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    Prazo: {request.deadline}
                  </p>
                  <Badge variant={getStatusColor(request.status)}>
                    {request.status}
                  </Badge>
                </div>
                <Button size="sm">Processar</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
