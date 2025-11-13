import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Clock,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Calendar,
  Database,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { BackupRestoreDialog } from "./BackupRestoreDialog";

interface TimelineItem {
  id: string;
  created_at: string;
  backup_type: string;
  status: string;
  file_size_bytes: number;
  metadata: any;
}

export function BackupVersionTimeline() {
  const { clinicId } = useAuth();
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: backups, isLoading } = useQuery({
    queryKey: ["backup-timeline", clinicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("backup_history")
        .select("*")
        .eq("clinic_id", clinicId)
        .eq("status", "success")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as TimelineItem[];
    },
    enabled: !!clinicId,
  });

  // Agrupar backups por data
  const groupedBackups = backups?.reduce((acc: Record<string, TimelineItem[]>, backup) => {
    const date = format(new Date(backup.created_at), "yyyy-MM-dd");
    if (!acc[date]) acc[date] = [];
    acc[date].push(backup);
    return acc;
  }, {});

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getBackupTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      full: "bg-blue-500",
      incremental: "bg-green-500",
      scheduled: "bg-purple-500",
      manual: "bg-orange-500",
    };
    return colors[type] || "bg-gray-500";
  };

  const handleRestoreClick = (backupId: string) => {
    setSelectedBackup(backupId);
    setRestoreDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card className="p-6" depth="normal">
        <p className="text-center text-muted-foreground">Carregando timeline...</p>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6" depth="normal">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Timeline de Versionamento
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Navegue pelos pontos de restauração disponíveis
            </p>
          </div>
          <Badge variant="outline">
            {Object.keys(groupedBackups || {}).length} dias com backups
          </Badge>
        </div>

        <ScrollArea className="h-[600px] pr-4">
          <div className="relative">
            {/* Linha vertical da timeline */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

            <div className="space-y-8">
              {Object.entries(groupedBackups || {}).map(([date, dayBackups]) => (
                <div key={date} className="relative">
                  {/* Marcador de data */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-lg">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold">
                        {format(new Date(date), "dd 'de' MMMM 'de' yyyy", {
                          locale: ptBR,
                        })}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {dayBackups.length} backup{dayBackups.length > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {/* Backups do dia */}
                  <div className="ml-24 space-y-3">
                    {dayBackups.map((backup) => (
                      <Card key={backup.id} className="p-4" depth="subtle">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div
                                className={`w-3 h-3 rounded-full ${getBackupTypeColor(
                                  backup.backup_type
                                )}`}
                              />
                              <span className="font-medium">
                                {format(new Date(backup.created_at), "HH:mm:ss", {
                                  locale: ptBR,
                                })}
                              </span>
                              <Badge variant="outline">{backup.backup_type}</Badge>
                              <Badge
                                variant={
                                  backup.status === "success" ? "success" : "destructive"
                                }
                              >
                                {backup.status === "success" ? (
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                ) : (
                                  <XCircle className="h-3 w-3 mr-1" />
                                )}
                                {backup.status}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Database className="h-3 w-3" />
                                {formatBytes(backup.file_size_bytes)}
                              </span>
                              {backup.metadata?.incremental_since && (
                                <span>
                                  Incremental desde{" "}
                                  {format(
                                    new Date(backup.metadata.incremental_since),
                                    "dd/MM HH:mm"
                                  )}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRestoreClick(backup.id)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">💡 Dicas de Restauração:</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Backups completos permitem restauração independente</li>
            <li>Backups incrementais requerem o backup base mais recente</li>
            <li>Sempre valide a integridade antes de restaurar</li>
            <li>Teste a restauração em ambiente isolado quando possível</li>
          </ul>
        </div>
      </Card>

      {selectedBackup && (
        <BackupRestoreDialog
          open={restoreDialogOpen}
          onClose={() => {
            setRestoreDialogOpen(false);
            setSelectedBackup(null);
          }}
        />
      )}
    </>
  );
}
