import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  ToothData,
  ToothStatus,
  ToothSurface,
  TOOTH_STATUS_COLORS,
  TOOTH_STATUS_LABELS,
  TOOTH_SURFACE_LABELS,
} from '../types/odontograma.types';

interface ToothDetailDialogProps {
  tooth: ToothData | null;
  open: boolean;
  onClose: () => void;
  onUpdateStatus: (status: ToothStatus) => void;
  onUpdateSurface: (surface: ToothSurface, status: ToothStatus) => void;
  onUpdateNotes: (notes: string) => void;
}

export const ToothDetailDialog = ({
  tooth,
  open,
  onClose,
  onUpdateStatus,
  onUpdateSurface,
  onUpdateNotes,
}: ToothDetailDialogProps) => {
  const [notes, setNotes] = useState(tooth?.notes || '');
  const [selectedSurface, setSelectedSurface] = useState<ToothSurface | null>(null);

  if (!tooth) return null;

  const handleSaveNotes = () => {
    onUpdateNotes(notes);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Dente {tooth.number}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Geral */}
          <div>
            <Label className="text-base font-semibold mb-2 block">Status Geral</Label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(TOOTH_STATUS_COLORS) as ToothStatus[]).map(status => (
                <Button
                  key={status}
                  variant={tooth.status === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onUpdateStatus(status)}
                  className="flex items-center gap-2"
                >
                  <div
                    className="w-3 h-3 rounded border border-border"
                    style={{ backgroundColor: TOOTH_STATUS_COLORS[status] }}
                  />
                  {TOOTH_STATUS_LABELS[status]}
                </Button>
              ))}
            </div>
          </div>

          {/* Faces do Dente */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Faces do Dente</Label>
            <div className="space-y-3">
              {(Object.keys(TOOTH_SURFACE_LABELS) as ToothSurface[]).map(surface => (
                <div
                  key={surface}
                  className="border border-border rounded-lg p-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{TOOTH_SURFACE_LABELS[surface]}</span>
                      <Badge
                        variant="outline"
                        style={{
                          backgroundColor: TOOTH_STATUS_COLORS[tooth.surfaces[surface]],
                          color: tooth.surfaces[surface] === 'extraido' ? '#ffffff' : '#000000',
                        }}
                      >
                        {TOOTH_STATUS_LABELS[tooth.surfaces[surface]]}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedSurface(selectedSurface === surface ? null : surface)}
                    >
                      {selectedSurface === surface ? 'Ocultar' : 'Editar'}
                    </Button>
                  </div>

                  {selectedSurface === surface && (
                    <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-border">
                      {(Object.keys(TOOTH_STATUS_COLORS) as ToothStatus[]).map(status => (
                        <Button
                          key={status}
                          variant={tooth.surfaces[surface] === status ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            onUpdateSurface(surface, status);
                            setSelectedSurface(null);
                          }}
                          className="flex items-center gap-1"
                        >
                          <div
                            className="w-2 h-2 rounded"
                            style={{ backgroundColor: TOOTH_STATUS_COLORS[status] }}
                          />
                          {TOOTH_STATUS_LABELS[status]}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div>
            <Label htmlFor="notes" className="text-base font-semibold mb-2 block">
              Observações
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações sobre este dente..."
              rows={4}
            />
          </div>

          {/* Última Atualização */}
          <div className="text-sm text-muted-foreground">
            Última atualização: {new Date(tooth.updatedAt).toLocaleString('pt-BR')}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button onClick={handleSaveNotes}>
            Salvar Observações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
