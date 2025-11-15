import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function SplitHistory() {
  const splits = [
    {
      id: "1",
      date: "2025-11-15",
      professional: "Dr. João Silva",
      value: "R$ 850,00",
      percentage: "65%",
      status: "processado"
    },
    {
      id: "2",
      date: "2025-11-15",
      professional: "Dra. Maria Santos",
      value: "R$ 1.200,00",
      percentage: "70%",
      status: "processado"
    },
    {
      id: "3",
      date: "2025-11-14",
      professional: "Dr. Pedro Costa",
      value: "R$ 650,00",
      percentage: "60%",
      status: "pendente"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Splits</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {splits.map((split) => (
            <div
              key={split.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <p className="font-medium">{split.professional}</p>
                <p className="text-sm text-muted-foreground">{split.date}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{split.value}</p>
                <p className="text-sm text-muted-foreground">{split.percentage}</p>
              </div>
              <Badge variant={split.status === "processado" ? "default" : "secondary"}>
                {split.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
