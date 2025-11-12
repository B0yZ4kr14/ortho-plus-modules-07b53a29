import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Eraser, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface AssinaturaDigitalProps {
  onSave: (signatureBase64: string) => void;
  onCancel?: () => void;
  existingSignature?: string;
}

export const AssinaturaDigital = ({ onSave, onCancel, existingSignature }: AssinaturaDigitalProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar canvas
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Se existe assinatura, carregar
    if (existingSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setHasSignature(true);
      };
      img.src = existingSignature;
    }
  }, [existingSignature]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    toast.info('Assinatura limpa');
  };

  const saveSignature = () => {
    if (!hasSignature) {
      toast.error('Por favor, assine antes de salvar');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Converter canvas para base64
    const signatureBase64 = canvas.toDataURL('image/png');
    onSave(signatureBase64);
    toast.success('Assinatura salva com sucesso');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assinatura Digital</CardTitle>
        <CardDescription>
          Assine usando mouse ou toque na tela
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Área de Assinatura</Label>
          <div className="border-2 border-border rounded-lg overflow-hidden bg-background">
            <canvas
              ref={canvasRef}
              width={600}
              height={200}
              className="w-full cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={clearSignature}
            className="flex-1"
          >
            <Eraser className="h-4 w-4 mr-2" />
            Limpar
          </Button>
          <Button
            variant="default"
            onClick={saveSignature}
            disabled={!hasSignature}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Assinatura
          </Button>
          {onCancel && (
            <Button
              variant="ghost"
              onClick={onCancel}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {existingSignature && (
          <div className="space-y-2">
            <Label>Assinatura Atual</Label>
            <div className="border rounded-lg p-4 bg-muted">
              <img 
                src={existingSignature} 
                alt="Assinatura Atual" 
                className="max-h-24 mx-auto"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
