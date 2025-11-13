import { useState } from 'react';
import { usePatientsSupabase } from '@/modules/pacientes/hooks/usePatientsSupabase';
import { PatientsList } from '@/modules/pacientes/components/PatientsList';
import { PatientForm } from '@/modules/pacientes/components/PatientForm';
import { PatientDetails } from '@/modules/pacientes/components/PatientDetails';
import { Patient } from '@/modules/pacientes/types/patient.types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Users } from 'lucide-react';

type ViewMode = 'list' | 'form' | 'details';

export default function Pacientes() {
  const { patients, loading, addPatient, updatePatient, deletePatient, getPatient } = usePatientsSupabase();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPatient, setSelectedPatient] = useState<Patient | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAdd = () => {
    setSelectedPatient(undefined);
    setViewMode('form');
    setDialogOpen(true);
  };

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setViewMode('form');
    setDialogOpen(true);
  };

  const handleView = (patient: Patient) => {
    setSelectedPatient(patient);
    setViewMode('details');
    setDialogOpen(true);
  };

  const handleSubmit = (data: Patient) => {
    if (selectedPatient?.id) {
      updatePatient(selectedPatient.id, data);
    } else {
      addPatient(data);
    }
    setDialogOpen(false);
    setSelectedPatient(undefined);
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setSelectedPatient(undefined);
  };

  const handleDelete = (id: string) => {
    deletePatient(id);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <p className="text-muted-foreground">Carregando pacientes...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-primary/10">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pacientes</h1>
          <p className="text-muted-foreground mt-1">
            Gerenciamento completo de pacientes
          </p>
        </div>
      </div>

      {/* List View */}
      <PatientsList
        patients={patients}
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
                ? selectedPatient
                  ? 'Editar Paciente'
                  : 'Novo Paciente'
                : 'Detalhes do Paciente'}
            </DialogTitle>
          </DialogHeader>

          {viewMode === 'form' && (
            <PatientForm
              patient={selectedPatient}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          )}

          {viewMode === 'details' && selectedPatient && (
            <PatientDetails
              patient={selectedPatient}
              onEdit={() => setViewMode('form')}
              onClose={handleCancel}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
