import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function BICharts() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Receita por Período</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Gráfico em desenvolvimento</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Procedimentos Mais Realizados</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Gráfico em desenvolvimento</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Taxa de Conversão</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Gráfico em desenvolvimento</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Satisfação dos Pacientes</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Gráfico em desenvolvimento</p>
        </CardContent>
      </Card>
    </div>
  );
}
