import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

export function LGPDConsents() {
  const consents = [
    {
      id: "1",
      patient: "João Silva",
      type: "Tratamento de Dados",
      granted: true,
      date: "2025-11-01",
      expires: "2026-11-01"
    },
    {
      id: "2",
      patient: "Maria Santos",
      type: "Marketing",
      granted: false,
      date: "2025-11-05",
      expires: "-"
    },
    {
      id: "3",
      patient: "Pedro Costa",
      type: "Compartilhamento",
      granted: true,
      date: "2025-11-10",
      expires: "2026-11-10"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consentimentos Ativos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {consents.map((consent) => (
            <div
              key={consent.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-4">
                {consent.granted ? (
                  <CheckCircle className="h-8 w-8 text-primary" />
                ) : (
                  <XCircle className="h-8 w-8 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium">{consent.patient}</p>
                  <p className="text-sm text-muted-foreground">
                    {consent.type}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant={consent.granted ? "default" : "secondary"}>
                  {consent.granted ? "Concedido" : "Negado"}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  Expira: {consent.expires}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
