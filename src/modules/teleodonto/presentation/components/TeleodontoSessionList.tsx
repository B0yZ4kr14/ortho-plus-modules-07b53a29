import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Calendar, Clock } from "lucide-react";

export function TeleodontoSessionList() {
  const sessions = [
    {
      id: "1",
      patient: "João Silva",
      date: "2025-11-15",
      time: "14:00",
      duration: "45min",
      status: "concluida",
      type: "consulta"
    },
    {
      id: "2",
      patient: "Maria Santos",
      date: "2025-11-15",
      time: "15:00",
      duration: "30min",
      status: "agendada",
      type: "retorno"
    },
    {
      id: "3",
      patient: "Pedro Costa",
      date: "2025-11-15",
      time: "16:00",
      duration: "60min",
      status: "em_andamento",
      type: "avaliacao"
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      concluida: "default",
      agendada: "secondary",
      em_andamento: "destructive"
    };
    return variants[status] || "default";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sessões Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Video className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{session.patient}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{session.date}</span>
                    <Clock className="h-3 w-3 ml-2" />
                    <span>{session.time}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={getStatusBadge(session.status)}>
                  {session.status}
                </Badge>
                <Button size="sm" variant="outline">
                  Detalhes
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
