import { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Rect, Text } from 'fabric';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useOdontogramaSupabase } from '../hooks/useOdontogramaSupabase';
import {
  ToothStatus,
  TOOTH_STATUS_COLORS,
  TOOTH_STATUS_LABELS,
  UPPER_RIGHT_TEETH,
  UPPER_LEFT_TEETH,
  LOWER_LEFT_TEETH,
  LOWER_RIGHT_TEETH,
} from '../types/odontograma.types';
import { Loader2 } from 'lucide-react';

interface Odontograma2DProps {
  prontuarioId: string;
}

export const Odontograma2D = ({ prontuarioId }: Odontograma2DProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ToothStatus>('higido');
  
  const {
    teethData,
    isLoading,
    updateToothStatus,
    resetOdontograma,
    getStatusCount,
  } = useOdontogramaSupabase(prontuarioId);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 900,
      height: 500,
      backgroundColor: '#f8fafc',
      selection: false,
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!fabricCanvas || isLoading) return;

    fabricCanvas.clear();
    fabricCanvas.backgroundColor = '#f8fafc';

    const toothWidth = 40;
    const toothHeight = 60;
    const spacing = 10;
    const startX = 100;
    const upperY = 80;
    const lowerY = 300;

    // Função para desenhar um dente
    const drawTooth = (toothNumber: number, x: number, y: number) => {
      const data = teethData[toothNumber] || { number: toothNumber, status: 'higido' };
      
      const tooth = new Rect({
        left: x,
        top: y,
        width: toothWidth,
        height: toothHeight,
        fill: TOOTH_STATUS_COLORS[data.status],
        stroke: '#334155',
        strokeWidth: 2,
        rx: 5,
        ry: 5,
        selectable: false,
        hoverCursor: 'pointer',
      });

      const label = new Text(String(toothNumber), {
        left: x + toothWidth / 2,
        top: y + toothHeight / 2,
        fontSize: 14,
        fontWeight: 'bold',
        fill: data.status === 'extraido' ? '#ffffff' : '#1e293b',
        selectable: false,
        originX: 'center',
        originY: 'center',
      });

      // Event handler para clique
      tooth.on('mousedown', () => {
        handleToothClick(toothNumber);
      });

      fabricCanvas.add(tooth, label);
    };

    // Desenhar arcada superior direita
    UPPER_RIGHT_TEETH.forEach((num, idx) => {
      drawTooth(num, startX + idx * (toothWidth + spacing), upperY);
    });

    // Desenhar arcada superior esquerda
    UPPER_LEFT_TEETH.forEach((num, idx) => {
      drawTooth(num, startX + 8 * (toothWidth + spacing) + 30 + idx * (toothWidth + spacing), upperY);
    });

    // Linha divisória central
    const centerX = startX + 8 * (toothWidth + spacing) + 15;
    const divider = new Rect({
      left: centerX,
      top: 60,
      width: 2,
      height: 380,
      fill: '#cbd5e1',
      selectable: false,
    });
    fabricCanvas.add(divider);

    // Desenhar arcada inferior esquerda
    LOWER_LEFT_TEETH.forEach((num, idx) => {
      drawTooth(num, startX + 8 * (toothWidth + spacing) + 30 + idx * (toothWidth + spacing), lowerY);
    });

    // Desenhar arcada inferior direita
    LOWER_RIGHT_TEETH.forEach((num, idx) => {
      drawTooth(num, startX + idx * (toothWidth + spacing), lowerY);
    });

    // Labels das arcadas
    const addLabel = (text: string, x: number, y: number) => {
      const label = new Text(text, {
        left: x,
        top: y,
        fontSize: 12,
        fill: '#64748b',
        selectable: false,
        fontWeight: 'bold',
      });
      fabricCanvas.add(label);
    };

    addLabel('Superior Direito', startX, 50);
    addLabel('Superior Esquerdo', startX + 450, 50);
    addLabel('Inferior Esquerdo', startX + 450, 270);
    addLabel('Inferior Direito', startX, 270);

    fabricCanvas.renderAll();
  }, [fabricCanvas, teethData, isLoading]);

  const handleToothClick = (toothNumber: number) => {
    updateToothStatus(toothNumber, selectedStatus);
    toast.success(`Dente ${toothNumber} marcado como ${TOOTH_STATUS_LABELS[selectedStatus]}`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p>Carregando odontograma...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Selecione o Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(TOOTH_STATUS_COLORS) as ToothStatus[]).map(status => (
              <Button
                key={status}
                variant={selectedStatus === status ? 'default' : 'outline'}
                onClick={() => setSelectedStatus(status)}
                className="flex items-center gap-2"
              >
                <div
                  className="w-4 h-4 rounded border border-border"
                  style={{ backgroundColor: TOOTH_STATUS_COLORS[status] }}
                />
                {TOOTH_STATUS_LABELS[status]}
              </Button>
            ))}
            <Button variant="destructive" onClick={resetOdontograma}>
              Resetar Odontograma
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Odontograma 2D - Sistema FDI</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <canvas ref={canvasRef} className="border border-border rounded-lg" />
          </div>
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Clique nos dentes para marcar o status selecionado
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estatísticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {(Object.keys(TOOTH_STATUS_COLORS) as ToothStatus[]).map(status => (
              <div key={status} className="text-center">
                <Badge variant="outline" className="w-full justify-center mb-2">
                  {TOOTH_STATUS_LABELS[status]}
                </Badge>
                <p className="text-2xl font-bold">{getStatusCount(status)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
