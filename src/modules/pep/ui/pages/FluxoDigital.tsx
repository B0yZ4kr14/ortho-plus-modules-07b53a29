import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Scan, Send, Package } from 'lucide-react';

export default function FluxoDigital() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Fluxo Digital (CAD/CAM)</h1>
        <p className="text-muted-foreground">Integração com scanners intraorais e laboratórios</p>
      </div>
      
      <Tabs defaultValue="scanners">
        <TabsList>
          <TabsTrigger value="scanners">
            <Scan className="h-4 w-4 mr-2" />
            Scanners
          </TabsTrigger>
          <TabsTrigger value="labs">
            <Send className="h-4 w-4 mr-2" />
            Laboratórios
          </TabsTrigger>
          <TabsTrigger value="tracking">
            <Package className="h-4 w-4 mr-2" />
            Tracking
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="scanners">
          <Card>
            <CardHeader>
              <CardTitle>Integração com Scanners Intraorais</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Gerenciamento de scanners será exibido aqui</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="labs">
          <Card>
            <CardHeader>
              <CardTitle>Envio para Laboratórios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Gestão de pedidos para laboratórios será exibida aqui</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tracking">
          <Card>
            <CardHeader>
              <CardTitle>Tracking de Próteses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Rastreamento de próteses será exibido aqui</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
