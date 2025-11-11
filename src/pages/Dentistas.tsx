import { useState } from 'react';
import { useDentistasStore } from '@/modules/dentistas/hooks/useDentistasStore';
import { DentistasList } from '@/modules/dentistas/components/DentistasList';
import { DentistaForm } from '@/modules/dentistas/components/DentistaForm';
import { DentistaDetails } from '@/modules/dentistas/components/DentistaDetails';
import { Dentista } from '@/modules/dentistas/types/dentista.types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Stethoscope } from 'lucide-react';

type ViewMode = 'list' | 'form' | 'details';

export default function Dentistas() {
  const { dentistas, loading, addDentista, updateDentista, deleteDentista } = useDentistasStore();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedDentista, setSelectedDentista] = useState<Dentista | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAdd = () => {
    setSelectedDentista(undefined);
    setViewMode('form');
    setDialogOpen(true);
  };

  const handleEdit = (dentista: Dentista) => {
    setSelectedDentista(dentista);
    setViewMode('form');
    setDialogOpen(true);
  };

  const handleView = (dentista: Dentista) => {
    setSelectedDentista(dentista);
    setViewMode('details');
    setDialogOpen(true);
  };

  const handleSubmit = (data: Dentista) => {
    if (selectedDentista?.id) {
      updateDentista(selectedDentista.id, data);
    } else {
      addDentista(data);
    }
    setDialogOpen(false);
    setSelectedDentista(undefined);
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setSelectedDentista(undefined);
  };

  const handleDelete = (id: string) => {
    deleteDentista(id);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <p className="text-muted-foreground">Carregando dentistas...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-primary/10">
          <Stethoscope className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dentistas</h1>
          <p className="text-muted-foreground mt-1">
            Gerenciamento completo de dentistas
          </p>
        </div>
      </div>

      {/* List View */}
      <DentistasList
        dentistas={dentistas}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
      />

      {/* Dialog for Form and Details */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {viewMode === 'form'
                ? selectedDentista
                  ? 'Editar Dentista'
                  : 'Novo Dentista'
                : 'Detalhes do Dentista'}
            </DialogTitle>
          </DialogHeader>

          {viewMode === 'form' && (
            <DentistaForm
              dentista={selectedDentista}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          )}

          {viewMode === 'details' && selectedDentista && (
            <DentistaDetails
              dentista={selectedDentista}
              onEdit={() => setViewMode('form')}
              onClose={handleCancel}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
