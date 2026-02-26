import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, X, Loader2 } from 'lucide-react';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';
import { cn } from '@/lib/utils';

interface BarcodeScannerProps {
  onScan: (code: string, format?: string) => void;
  onCancel?: () => void;
  className?: string;
}

export function BarcodeScanner({ onScan, onCancel, className }: BarcodeScannerProps) {
  const { isScanning, startScan, stopScan } = useBarcodeScanner();
  const [showInstructions, setShowInstructions] = useState(true);

  const handleStartScan = async () => {
    setShowInstructions(false);
    const result = await startScan();
    
    if (result?.hasContent) {
      onScan(result.content, result.format);
    }
  };

  const handleCancel = useCallback(async () => {
    await stopScan();
    setShowInstructions(true);
    onCancel?.();
  }, [stopScan, onCancel]);

  useEffect(() => {
    // Cleanup ao desmontar
    return () => {
      stopScan();
    };
  }, [stopScan]);

  return (
    <div className={cn('relative', className)}>
      {showInstructions && !isScanning ? (
        <Card className="p-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-primary/10">
              <Camera className="h-12 w-12 text-primary" />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Scanner de Código de Barras/QR Code
            </h3>
            <p className="text-sm text-muted-foreground">
              Posicione o código dentro da área de leitura da câmera
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-xs text-muted-foreground space-y-2">
            <p>📱 Certifique-se de que o código esteja bem iluminado</p>
            <p>📏 Mantenha o dispositivo estável a 15-30cm de distância</p>
            <p>✨ A leitura será automática quando o código for detectado</p>
          </div>

          <div className="flex gap-2 justify-center">
            <Button onClick={handleStartScan} size="lg" className="gap-2">
              <Camera className="h-5 w-5" />
              Iniciar Scanner
            </Button>
            
            {onCancel && (
              <Button onClick={onCancel} variant="outline" size="lg">
                Cancelar
              </Button>
            )}
          </div>
        </Card>
      ) : isScanning ? (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-between p-6">
          {/* Área de visualização do scanner */}
          <div className="flex-1 flex items-center justify-center w-full">
            <div className="relative w-full max-w-md aspect-square">
              {/* Frame de leitura */}
              <div className="absolute inset-0 border-4 border-primary rounded-lg shadow-2xl">
                {/* Cantos destacados */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
                
                {/* Linha de scan animada */}
                <div className="absolute inset-x-0 top-0 h-1 bg-primary animate-pulse" 
                     style={{ animation: 'scan 2s ease-in-out infinite' }} />
              </div>
            </div>
          </div>

          {/* Instruções e botões */}
          <div className="w-full max-w-md space-y-4 text-center">
            <div className="flex items-center justify-center gap-2 text-white">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p className="text-lg font-medium">
                Escaneando código...
              </p>
            </div>
            
            <p className="text-sm text-white/70">
              Posicione o código dentro da área destacada
            </p>

            <Button
              onClick={handleCancel}
              variant="destructive"
              size="lg"
              className="w-full gap-2"
            >
              <X className="h-5 w-5" />
              Cancelar Scanner
            </Button>
          </div>
        </div>
      ) : null}

      {/* Estilos globais para o scanner */}
      <style>{`
        .scanner-active {
          background: transparent !important;
        }
        
        @keyframes scan {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(100%);
          }
        }
      `}</style>
    </div>
  );
}
