import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Calendar, Clock, Edit, Pause, Play, Trash2, Plus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { ScheduledBackupWizard } from "@/components/settings/ScheduledBackupWizard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ScheduledBackupsManagement() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [backupToDelete, setBackupToDelete] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: scheduledBackups, isLoading } = useQuery({
    queryKey: ["scheduled-backups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scheduled_backups" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as any[];
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from("scheduled_backups" as any)
        .update({ enabled })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-backups"] });
      toast.success("Status do backup atualizado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao atualizar status do backup");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("scheduled_backups" as any)
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-backups"] });
      toast.success("Backup agendado removido com sucesso");
      setDeleteDialogOpen(false);
      setBackupToDelete(null);
    },
    onError: () => {
      toast.error("Erro ao remover backup agendado");
    },
  });

  const handleToggle = (id: string, currentEnabled: boolean) => {
    toggleMutation.mutate({ id, enabled: !currentEnabled });
  };

  const handleEdit = (backup: any) => {
    // TODO: Implementar edição de backup existente
    setWizardOpen(true);
  };

  const handleDelete = (id: string) => {
    setBackupToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (backupToDelete) {
      deleteMutation.mutate(backupToDelete);
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      daily: "Diário",
      weekly: "Semanal",
      monthly: "Mensal",
    };
    return labels[frequency] || frequency;
  };

  const getStatusBadge = (backup: any) => {
    if (!backup.enabled) {
      return <Badge variant="secondary">Pausado</Badge>;
    }

    const nextRun = new Date(backup.next_run_at);
    const now = new Date();
    const diffHours = (nextRun.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < 0) {
      return <Badge variant="destructive">Atrasado</Badge>;
    } else if (diffHours < 24) {
      return <Badge variant="default">Próximo</Badge>;
    } else {
      return <Badge variant="success">Ativo</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gerenciamento de Backups Agendados</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie todos os backups automáticos configurados para sua clínica
        </p>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setWizardOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Backup Agendado
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          Carregando backups agendados...
        </div>
      ) : scheduledBackups && scheduledBackups.length > 0 ? (
        <div className="grid gap-4">
          {scheduledBackups.map((backup) => (
            <Card key={backup.id} className="p-6" depth="normal">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{backup.name}</h3>
                    {getStatusBadge(backup)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Frequência: {getFrequencyLabel(backup.frequency)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        Próxima execução:{" "}
                        {format(new Date(backup.next_run_at), "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </span>
                    </div>

                    {backup.last_run_at && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          Última execução:{" "}
                          {format(new Date(backup.last_run_at), "dd/MM/yyyy 'às' HH:mm", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {backup.include_patients && (
                      <Badge variant="outline">Pacientes</Badge>
                    )}
                    {backup.include_clinical_history && (
                      <Badge variant="outline">Histórico Clínico</Badge>
                    )}
                    {backup.include_appointments && (
                      <Badge variant="outline">Agendamentos</Badge>
                    )}
                    {backup.include_financial && (
                      <Badge variant="outline">Financeiro</Badge>
                    )}
                    {backup.compression_enabled && (
                      <Badge variant="outline">Compressão</Badge>
                    )}
                    {backup.encryption_enabled && (
                      <Badge variant="outline">Criptografia</Badge>
                    )}
                    {backup.cloud_upload_enabled && (
                      <Badge variant="outline">Upload Cloud</Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    {backup.enabled ? (
                      <Play className="h-4 w-4 text-success" />
                    ) : (
                      <Pause className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Switch
                      checked={backup.enabled}
                      onCheckedChange={() => handleToggle(backup.id, backup.enabled)}
                    />
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(backup)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(backup.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center" depth="subtle">
          <p className="text-muted-foreground mb-4">
            Nenhum backup agendado configurado
          </p>
          <Button onClick={() => setWizardOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Criar Primeiro Backup
          </Button>
        </Card>
      )}

      <ScheduledBackupWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este backup agendado? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
