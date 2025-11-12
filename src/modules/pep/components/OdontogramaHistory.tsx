import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, RotateCcw, Download } from 'lucide-react';
import { OdontogramaHistoryEntry } from '../types/odontograma.types';
import { toast } from 'sonner';

interface OdontogramaHistoryProps {
  history: OdontogramaHistoryEntry[];
  onRestore: (historyId: string) => void;
  onCompare: (historyId: string) => void;
  selectedForComparison: string | null;
}

export const OdontogramaHistory = ({
  history,
  onRestore,
  onCompare,
  selectedForComparison,
}: OdontogramaHistoryProps) => {
  const handleRestore = (entry: OdontogramaHistoryEntry) => {
    if (confirm(`Deseja restaurar o odontograma para ${new Date(entry.timestamp).toLocaleString('pt-BR')}?`)) {
      onRestore(entry.id);
      toast.success('Odontograma restaurado com sucesso');
    }
  };

  const handleExport = (entry: OdontogramaHistoryEntry) => {
    const dataStr = JSON.stringify(entry, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `odontograma-${new Date(entry.timestamp).toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Histórico exportado');
  };

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma alteração registrada ainda</p>
            <p className="text-sm mt-1">As alterações no odontograma serão registradas automaticamente</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Alterações</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {history.map((entry, index) => (
              <div
                key={entry.id}
                className={`border rounded-lg p-4 hover:bg-accent/50 transition-colors ${
                  selectedForComparison === entry.id ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {new Date(entry.timestamp).toLocaleString('pt-BR', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </span>
                      {index === 0 && (
                        <Badge variant="default">Mais Recente</Badge>
                      )}
                    </div>
                    {entry.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {entry.description}
                      </p>
                    )}
                  </div>
                </div>

                {entry.changedTeeth.length > 0 && (
                  <div className="mb-3">
                    <span className="text-sm font-medium">Dentes alterados: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {entry.changedTeeth.map(num => (
                        <Badge key={num} variant="outline" className="text-xs">
                          {num}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestore(entry)}
                    disabled={index === 0}
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Restaurar
                  </Button>
                  <Button
                    variant={selectedForComparison === entry.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onCompare(entry.id)}
                  >
                    {selectedForComparison === entry.id ? 'Selecionado' : 'Comparar'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleExport(entry)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Exportar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
