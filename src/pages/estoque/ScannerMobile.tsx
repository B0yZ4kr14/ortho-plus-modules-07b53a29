import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scan, Camera } from 'lucide-react';

export default function ScannerMobile() {
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Scanner Mobile</h1>
        <p className="text-muted-foreground">Leitura rápida de códigos de barras para gestão de estoque</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Câmera para Código de Barras
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
            <Scan className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Clique no botão abaixo para ativar a câmera</p>
            <Button>
              <Camera className="h-4 w-4 mr-2" />
              Ativar Câmera
            </Button>
          </div>
          
          {scannedCode && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">Código Escaneado:</p>
              <p className="text-lg font-mono">{scannedCode}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
