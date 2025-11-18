import { useState } from 'react';
import { FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';
import { ProcedimentosList } from '@/modules/procedimentos/components/ProcedimentosList';
import { ProcedimentoForm } from '@/modules/procedimentos/components/ProcedimentoForm';
import { ProcedimentoDetails } from '@/modules/procedimentos/components/ProcedimentoDetails';
import { useProcedimentosStore } from '@/modules/procedimentos/hooks/useProcedimentosStore';
import { toast } from 'sonner';

type ViewMode = 'list' | 'form' | 'details';

export default function ProcedimentosPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [procedimentoToDelete, setProcedimentoToDelete] = useState<string | undefined>();

  const { excluirProcedimento, buscarPorId } = useProcedimentosStore();

  const handleNovo = () => {
    setSelectedId(undefined);
    setViewMode('form');
  };

  const handleEditar = (id: string) => {
    setSelectedId(id);
    setViewMode('form');
  };

  const handleVisualizar = (id: string) => {
    setSelectedId(id);
    setViewMode('details');
  };

  const handleExcluir = (id: string) => {
    setProcedimentoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmarExclusao = () => {
    if (procedimentoToDelete) {
      const procedimento = buscarPorId(procedimentoToDelete);
      excluirProcedimento(procedimentoToDelete);
      toast.success(`Procedimento "${procedimento?.nome}" excluído com sucesso!`);
      setDeleteDialogOpen(false);
      setProcedimentoToDelete(undefined);
    }
  };

  const handleSuccess = () => {
    const procedimento = selectedId ? buscarPorId(selectedId) : null;
    const acao = selectedId ? 'atualizado' : 'cadastrado';
    
    toast.success(
      `Procedimento "${procedimento?.nome || 'novo'}" ${acao} com sucesso!`
    );
    setViewMode('list');
    setSelectedId(undefined);
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedId(undefined);
  };

  const handleCloseDialog = () => {
    setViewMode('list');
    setSelectedId(undefined);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        icon={FileText}
        title="Procedimentos"
        description="Gerencie o catálogo de procedimentos e tratamentos odontológicos"
      />

      {viewMode === 'list' ? (
        <ProcedimentosList
          onNovo={handleNovo}
          onEditar={handleEditar}
          onVisualizar={handleVisualizar}
          onExcluir={handleExcluir}
        />
      ) : (
        <Dialog open={viewMode === 'form' || viewMode === 'details'} onOpenChange={handleCloseDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {viewMode === 'form'
                  ? selectedId
                    ? 'Editar Procedimento'
                    : 'Novo Procedimento'
                  : 'Detalhes do Procedimento'}
              </DialogTitle>
            </DialogHeader>

            {viewMode === 'form' ? (
              <ProcedimentoForm
                procedimentoId={selectedId}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            ) : (
              selectedId && <ProcedimentoDetails procedimentoId={selectedId} />
            )}
          </DialogContent>
        </Dialog>
      )}

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmarExclusao}
        title="Confirmar exclusão do procedimento"
        description="Tem certeza que deseja excluir este procedimento? Esta ação não pode ser desfeita e pode afetar agendamentos futuros."
      />
    </div>
  );
}
