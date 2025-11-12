import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowRight, Download, FileText } from 'lucide-react';
import {
  OdontogramaHistoryEntry,
  ToothData,
  TOOTH_STATUS_LABELS,
  TOOTH_SURFACE_LABELS,
  ALL_TEETH,
} from '../types/odontograma.types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

interface OdontogramaComparisonProps {
  history: OdontogramaHistoryEntry[];
  selectedIds: [string | null, string | null];
  onClearSelection: () => void;
}

export const OdontogramaComparison = ({
  history,
  selectedIds,
  onClearSelection,
}: OdontogramaComparisonProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const state1 = history.find(h => h.id === selectedIds[0]);
  const state2 = history.find(h => h.id === selectedIds[1]);

  const getChanges = () => {
    if (!state1 || !state2) return [];

    const changes: Array<{
      toothNumber: number;
      before: ToothData;
      after: ToothData;
      statusChanged: boolean;
      surfacesChanged: string[];
    }> = [];

    ALL_TEETH.forEach(num => {
      const tooth1 = state1.teeth[num];
      const tooth2 = state2.teeth[num];

      const statusChanged = tooth1.status !== tooth2.status;
      const surfacesChanged: string[] = [];

      Object.keys(tooth1.surfaces).forEach(surface => {
        if (tooth1.surfaces[surface as keyof typeof tooth1.surfaces] !== 
            tooth2.surfaces[surface as keyof typeof tooth2.surfaces]) {
          surfacesChanged.push(surface);
        }
      });

      if (statusChanged || surfacesChanged.length > 0) {
        changes.push({
          toothNumber: num,
          before: tooth1,
          after: tooth2,
          statusChanged,
          surfacesChanged,
        });
      }
    });

    return changes;
  };

  const exportToPDF = async () => {
    if (!state1 || !state2) return;

    setIsExporting(true);
    try {
      const element = document.getElementById('comparison-report');
      if (!element) throw new Error('Elemento não encontrado');

      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      pdf.save(`relatorio-comparacao-${new Date().toISOString()}.pdf`);
      toast.success('Relatório exportado com sucesso');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar relatório');
    } finally {
      setIsExporting(false);
    }
  };

  if (!state1 || !state2) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Selecione dois registros do histórico para comparar</p>
            <p className="text-sm mt-1">Use o botão "Comparar" no histórico para selecionar</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const changes = getChanges();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Comparação de Odontogramas</CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={exportToPDF}
                disabled={isExporting}
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? 'Exportando...' : 'Exportar PDF'}
              </Button>
              <Button variant="outline" onClick={onClearSelection}>
                Limpar Seleção
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-around mb-6 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Estado Anterior</p>
              <p className="font-medium">
                {new Date(state1.timestamp).toLocaleString('pt-BR')}
              </p>
            </div>
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Estado Atual</p>
              <p className="font-medium">
                {new Date(state2.timestamp).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="comparison-report">
        <CardHeader>
          <CardTitle>Alterações Detectadas ({changes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {changes.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>Nenhuma alteração detectada entre os dois estados</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {changes.map(change => (
                  <div
                    key={change.toothNumber}
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-lg">Dente {change.toothNumber}</h4>
                      <Badge variant="outline">
                        {change.statusChanged && change.surfacesChanged.length > 0
                          ? 'Status e Faces'
                          : change.statusChanged
                          ? 'Status'
                          : 'Faces'}
                      </Badge>
                    </div>

                    {change.statusChanged && (
                      <div className="mb-3 p-3 bg-muted rounded">
                        <p className="text-sm font-medium mb-2">Status Geral:</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {TOOTH_STATUS_LABELS[change.before.status]}
                          </Badge>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="default">
                            {TOOTH_STATUS_LABELS[change.after.status]}
                          </Badge>
                        </div>
                      </div>
                    )}

                    {change.surfacesChanged.length > 0 && (
                      <div className="p-3 bg-muted rounded">
                        <p className="text-sm font-medium mb-2">Faces Alteradas:</p>
                        <div className="space-y-2">
                          {change.surfacesChanged.map(surface => (
                            <div key={surface} className="flex items-center gap-2 text-sm">
                              <span className="font-medium min-w-[100px]">
                                {TOOTH_SURFACE_LABELS[surface as keyof typeof TOOTH_SURFACE_LABELS]}:
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {TOOTH_STATUS_LABELS[
                                  change.before.surfaces[surface as keyof typeof change.before.surfaces]
                                ]}
                              </Badge>
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              <Badge variant="default" className="text-xs">
                                {TOOTH_STATUS_LABELS[
                                  change.after.surfaces[surface as keyof typeof change.after.surfaces]
                                ]}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(change.before.notes || change.after.notes) && (
                      <div className="mt-3 p-3 bg-muted rounded text-sm">
                        <p className="font-medium mb-1">Observações:</p>
                        {change.before.notes && (
                          <p className="text-muted-foreground">
                            <span className="font-medium">Antes:</span> {change.before.notes}
                          </p>
                        )}
                        {change.after.notes && (
                          <p>
                            <span className="font-medium">Depois:</span> {change.after.notes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
