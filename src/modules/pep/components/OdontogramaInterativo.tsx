import { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Rect, Text, Circle } from 'fabric';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOdontogramaStore } from '../hooks/useOdontogramaStore';
import { StatusDente } from '../types/pep.types';

interface OdontogramaInterativoProps {
  prontuarioId: string;
}

const DENTE_SIZE = 40;
const DENTE_SPACING = 10;
const COLORS: Record<StatusDente, string> = {
  NORMAL: '#ffffff',
  CARIADO: '#ef4444',
  RESTAURADO: '#3b82f6',
  AUSENTE: '#6b7280',
  IMPLANTE: '#8b5cf6',
  PROTESE: '#ec4899',
  TRATAMENTO_CANAL: '#f59e0b',
  FRATURADO: '#dc2626',
  EM_TRATAMENTO: '#eab308',
};

const LABELS: Record<StatusDente, string> = {
  NORMAL: 'Normal',
  CARIADO: 'Cariado',
  RESTAURADO: 'Restaurado',
  AUSENTE: 'Ausente',
  IMPLANTE: 'Implante',
  PROTESE: 'Prótese',
  TRATAMENTO_CANAL: 'Tratamento Canal',
  FRATURADO: 'Fraturado',
  EM_TRATAMENTO: 'Em Tratamento',
};

export function OdontogramaInterativo({ prontuarioId }: OdontogramaInterativoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [selectedDente, setSelectedDente] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<StatusDente>('NORMAL');
  const { odontograma, fetchOdontograma, updateDente, getStatusDente } = useOdontogramaStore();

  useEffect(() => {
    fetchOdontograma(prontuarioId);
  }, [prontuarioId, fetchOdontograma]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 900,
      height: 500,
      backgroundColor: '#f8f9fa',
      selection: false,
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.clear();
    fabricCanvas.backgroundColor = '#f8f9fa';

    // Draw superior arch
    drawArch(fabricCanvas, 'superior', 50);
    // Draw inferior arch
    drawArch(fabricCanvas, 'inferior', 280);

    fabricCanvas.renderAll();
  }, [fabricCanvas, odontograma]);

  const drawArch = (canvas: FabricCanvas, type: 'superior' | 'inferior', startY: number) => {
    const quadrants = type === 'superior' ? ['11', '12', '13', '14', '15', '16', '17', '18',
                                               '21', '22', '23', '24', '25', '26', '27', '28']
                                            : ['41', '42', '43', '44', '45', '46', '47', '48',
                                               '31', '32', '33', '34', '35', '36', '37', '38'];

    const startX = 50;

    quadrants.forEach((denteCodigo, index) => {
      const x = startX + (index * (DENTE_SIZE + DENTE_SPACING));
      const y = startY;
      const status = getStatusDente(denteCodigo);

      // Draw tooth
      const tooth = new Rect({
        left: x,
        top: y,
        width: DENTE_SIZE,
        height: DENTE_SIZE,
        fill: COLORS[status],
        stroke: '#000',
        strokeWidth: 2,
        rx: 5,
        ry: 5,
        selectable: false,
        hoverCursor: 'pointer',
      });

      // Add tooth number
      const label = new Text(denteCodigo, {
        left: x + DENTE_SIZE / 2,
        top: y + DENTE_SIZE / 2,
        fontSize: 14,
        fontFamily: 'Arial',
        fill: status === 'AUSENTE' ? '#fff' : '#000',
        originX: 'center',
        originY: 'center',
        selectable: false,
      });

      // Click handler
      tooth.on('mousedown', () => {
        setSelectedDente(denteCodigo);
      });

      canvas.add(tooth, label);
    });

    // Add quadrant labels
    const labelY = type === 'superior' ? startY - 30 : startY + DENTE_SIZE + 30;
    const labels = [
      { text: 'Quadrante 1', x: startX + (DENTE_SIZE * 4), y: labelY },
      { text: 'Quadrante 2', x: startX + (DENTE_SIZE * 12), y: labelY },
    ];

    labels.forEach(({ text, x, y }) => {
      canvas.add(new Text(text, {
        left: x,
        top: y,
        fontSize: 16,
        fontFamily: 'Arial',
        fill: '#666',
        originX: 'center',
        selectable: false,
      }));
    });
  };

  const handleStatusSelect = async (status: StatusDente) => {
    if (!selectedDente) return;
    await updateDente(prontuarioId, selectedDente, status);
    setSelectedStatus(status);
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Odontograma Interativo
          </h3>
          <p className="text-sm text-muted-foreground">
            Clique em um dente para alterar seu status
          </p>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <canvas ref={canvasRef} />
        </div>

        {selectedDente && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Dente selecionado</p>
                <p className="text-lg font-semibold text-foreground">{selectedDente}</p>
              </div>
              <Button variant="outline" onClick={() => setSelectedDente(null)}>
                Cancelar
              </Button>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground mb-3">
                Selecione o status do dente:
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(Object.entries(LABELS) as [StatusDente, string][]).map(([status, label]) => (
                  <Button
                    key={status}
                    variant={selectedStatus === status ? 'default' : 'outline'}
                    onClick={() => handleStatusSelect(status)}
                    className="justify-start gap-2"
                  >
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: COLORS[status] }}
                    />
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-foreground mb-3">Legenda:</p>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(LABELS) as [StatusDente, string][]).map(([status, label]) => (
              <Badge key={status} variant="outline" className="gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: COLORS[status] }}
                />
                {label}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
