import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, RefreshCw } from 'lucide-react';

export default function Conciliacao() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Conciliação Bancária</h1>
          <p className="text-muted-foreground">Importação OFX/CNAB e match automático de transações</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Importar OFX
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Transações Conciliadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">0</div>
            <p className="text-sm text-muted-foreground">Match automático</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Divergências</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">0</div>
            <p className="text-sm text-muted-foreground">Requerem análise</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Não Conciliadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">0</div>
            <p className="text-sm text-muted-foreground">Sem correspondência</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Transações Bancárias vs Sistema</CardTitle>
          <CardDescription>
            Match automático e resolução de divergências
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Tabela de conciliação será exibida aqui</p>
        </CardContent>
      </Card>
    </div>
  );
}
