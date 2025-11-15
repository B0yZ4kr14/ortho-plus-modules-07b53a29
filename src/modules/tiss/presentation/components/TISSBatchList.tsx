import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function TISSBatchList() {
  const batches = [
    {
      id: "1",
      number: "202511001",
      insurance: "Unimed",
      guides: 45,
      value: "R$ 18.750,00",
      status: "enviado",
      date: "2025-11-10"
    },
    {
      id: "2",
      number: "202511002",
      insurance: "Bradesco Saúde",
      guides: 32,
      value: "R$ 14.200,00",
      status: "processando",
      date: "2025-11-12"
    },
    {
      id: "3",
      number: "202511003",
      insurance: "Amil",
      guides: 28,
      value: "R$ 12.450,00",
      status: "pendente",
      date: "2025-11-15"
    }
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, "default" | "secondary" | "destructive"> = {
      enviado: "default",
      processando: "secondary",
      pendente: "destructive"
    };
    return colors[status] || "default";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lotes TISS</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {batches.map((batch) => (
            <div
              key={batch.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <p className="font-medium">Lote {batch.number}</p>
                <p className="text-sm text-muted-foreground">
                  {batch.insurance} • {batch.guides} guias
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-bold">{batch.value}</p>
                  <Badge variant={getStatusColor(batch.status)}>
                    {batch.status}
                  </Badge>
                </div>
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
