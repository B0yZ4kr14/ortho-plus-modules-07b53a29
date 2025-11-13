import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Minus, Edit, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BackupDiffViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DiffResult {
  added: any[];
  modified: any[];
  removed: any[];
}

interface DiffSummary {
  patients: DiffResult;
  appointments: DiffResult;
  clinical_history: DiffResult;
  financial: DiffResult;
}

export function BackupDiffViewer({ open, onOpenChange }: BackupDiffViewerProps) {
  const [backup1, setBackup1] = useState<string>("");
  const [backup2, setBackup2] = useState<string>("");
  const [diffResult, setDiffResult] = useState<DiffSummary | null>(null);

  const { data: backups } = useQuery({
    queryKey: ["backup-history-for-diff"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("backup_history")
        .select("*")
        .eq("status", "success")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const compareMutation = async () => {
    if (!backup1 || !backup2) return;

    try {
      // Buscar dados dos dois backups
      const { data: data1 } = await supabase.functions.invoke("download-backup", {
        body: { backup_id: backup1 },
      });

      const { data: data2 } = await supabase.functions.invoke("download-backup", {
        body: { backup_id: backup2 },
      });

      if (!data1?.data || !data2?.data) {
        throw new Error("Erro ao carregar dados dos backups");
      }

      const backup1Data = JSON.parse(data1.data);
      const backup2Data = JSON.parse(data2.data);

      // Comparar dados
      const diff: DiffSummary = {
        patients: compareArrays(backup1Data.patients || [], backup2Data.patients || []),
        appointments: compareArrays(
          backup1Data.appointments || [],
          backup2Data.appointments || []
        ),
        clinical_history: compareArrays(
          backup1Data.clinical_history || [],
          backup2Data.clinical_history || []
        ),
        financial: compareArrays(
          backup1Data.financial || [],
          backup2Data.financial || []
        ),
      };

      setDiffResult(diff);
    } catch (error) {
      console.error("Erro ao comparar backups:", error);
    }
  };

  const compareArrays = (arr1: any[], arr2: any[]): DiffResult => {
    const map1 = new Map(arr1.map((item) => [item.id, item]));
    const map2 = new Map(arr2.map((item) => [item.id, item]));

    const added = arr2.filter((item) => !map1.has(item.id));
    const removed = arr1.filter((item) => !map2.has(item.id));
    const modified = arr2.filter((item) => {
      if (!map1.has(item.id)) return false;
      const original = map1.get(item.id);
      return JSON.stringify(original) !== JSON.stringify(item);
    });

    return { added, modified, removed };
  };

  const getTotalChanges = (diff: DiffResult) => {
    return diff.added.length + diff.modified.length + diff.removed.length;
  };

  const renderDiffSection = (title: string, diff: DiffResult) => {
    const total = getTotalChanges(diff);

    if (total === 0) {
      return (
        <Card className="p-6 text-center text-muted-foreground" depth="subtle">
          Nenhuma alteração em {title}
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold">{title}</h3>
          <Badge variant="outline">{total} alterações</Badge>
        </div>

        {diff.added.length > 0 && (
          <Card className="p-4 border-success" depth="normal">
            <div className="flex items-center gap-2 mb-3">
              <Plus className="h-4 w-4 text-success" />
              <span className="font-medium text-success">
                {diff.added.length} Adicionado{diff.added.length > 1 ? "s" : ""}
              </span>
            </div>
            <ScrollArea className="h-40">
              <div className="space-y-2">
                {diff.added.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-success/10 rounded text-sm font-mono"
                  >
                    {JSON.stringify(item, null, 2)}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        )}

        {diff.modified.length > 0 && (
          <Card className="p-4 border-warning" depth="normal">
            <div className="flex items-center gap-2 mb-3">
              <Edit className="h-4 w-4 text-warning" />
              <span className="font-medium text-warning">
                {diff.modified.length} Modificado{diff.modified.length > 1 ? "s" : ""}
              </span>
            </div>
            <ScrollArea className="h-40">
              <div className="space-y-2">
                {diff.modified.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-warning/10 rounded text-sm font-mono"
                  >
                    {JSON.stringify(item, null, 2)}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        )}

        {diff.removed.length > 0 && (
          <Card className="p-4 border-destructive" depth="normal">
            <div className="flex items-center gap-2 mb-3">
              <Minus className="h-4 w-4 text-destructive" />
              <span className="font-medium text-destructive">
                {diff.removed.length} Removido{diff.removed.length > 1 ? "s" : ""}
              </span>
            </div>
            <ScrollArea className="h-40">
              <div className="space-y-2">
                {diff.removed.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-destructive/10 rounded text-sm font-mono"
                  >
                    {JSON.stringify(item, null, 2)}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Comparar Backups Incrementais</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Backup Mais Antigo</label>
              <Select value={backup1} onValueChange={setBackup1}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o primeiro backup" />
                </SelectTrigger>
                <SelectContent>
                  {backups?.map((backup) => (
                    <SelectItem key={backup.id} value={backup.id}>
                      {format(new Date(backup.created_at), "dd/MM/yyyy HH:mm", {
                        locale: ptBR,
                      })}{" "}
                      - {backup.backup_type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Backup Mais Recente</label>
              <Select value={backup2} onValueChange={setBackup2}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o segundo backup" />
                </SelectTrigger>
                <SelectContent>
                  {backups?.map((backup) => (
                    <SelectItem key={backup.id} value={backup.id}>
                      {format(new Date(backup.created_at), "dd/MM/yyyy HH:mm", {
                        locale: ptBR,
                      })}{" "}
                      - {backup.backup_type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={compareMutation}
            disabled={!backup1 || !backup2}
            className="w-full gap-2"
          >
            <FileText className="h-4 w-4" />
            Comparar Backups
          </Button>

          {diffResult && (
            <Tabs defaultValue="patients" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="patients">
                  Pacientes ({getTotalChanges(diffResult.patients)})
                </TabsTrigger>
                <TabsTrigger value="appointments">
                  Agendamentos ({getTotalChanges(diffResult.appointments)})
                </TabsTrigger>
                <TabsTrigger value="clinical">
                  Histórico ({getTotalChanges(diffResult.clinical_history)})
                </TabsTrigger>
                <TabsTrigger value="financial">
                  Financeiro ({getTotalChanges(diffResult.financial)})
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[500px] mt-4">
                <TabsContent value="patients">
                  {renderDiffSection("Pacientes", diffResult.patients)}
                </TabsContent>
                <TabsContent value="appointments">
                  {renderDiffSection("Agendamentos", diffResult.appointments)}
                </TabsContent>
                <TabsContent value="clinical">
                  {renderDiffSection("Histórico Clínico", diffResult.clinical_history)}
                </TabsContent>
                <TabsContent value="financial">
                  {renderDiffSection("Financeiro", diffResult.financial)}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
