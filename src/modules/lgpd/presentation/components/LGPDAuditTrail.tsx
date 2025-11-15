import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function LGPDAuditTrail() {
  const logs = [
    {
      id: "1",
      action: "Acesso ao Prontuário",
      user: "Dr. João Silva",
      timestamp: "2025-11-15 14:30",
      details: "Visualizou prontuário do paciente #12345"
    },
    {
      id: "2",
      action: "Exportação de Dados",
      user: "Admin",
      timestamp: "2025-11-15 13:15",
      details: "Exportou dados do paciente #67890"
    },
    {
      id: "3",
      action: "Consentimento Atualizado",
      user: "Sistema",
      timestamp: "2025-11-15 12:00",
      details: "Paciente atualizou consentimento de marketing"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trilha de Auditoria</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start justify-between p-4 border rounded-lg"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{log.action}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {log.timestamp}
                  </span>
                </div>
                <p className="text-sm">{log.details}</p>
                <p className="text-xs text-muted-foreground">
                  Por: {log.user}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
