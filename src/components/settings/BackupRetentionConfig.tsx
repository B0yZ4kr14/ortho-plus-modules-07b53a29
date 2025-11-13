import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calendar, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface RetentionPolicy {
  backup_type: string;
  retention_days: number;
  auto_cleanup_enabled: boolean;
}

const BACKUP_TYPES = [
  { value: "full", label: "Backup Completo", color: "bg-blue-500" },
  { value: "incremental", label: "Backup Incremental", color: "bg-green-500" },
  { value: "scheduled", label: "Backup Agendado", color: "bg-purple-500" },
  { value: "manual", label: "Backup Manual", color: "bg-orange-500" },
];

export function BackupRetentionConfig() {
  const { clinicId } = useAuth();
  const queryClient = useQueryClient();
  const [policies, setPolicies] = useState<Record<string, RetentionPolicy>>({});

  const { data: clinicConfig } = useQuery({
    queryKey: ["clinic-backup-config", clinicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clinics")
        .select("backup_retention_days, auto_cleanup_enabled")
        .eq("id", clinicId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!clinicId,
  });

  const saveMutation = useMutation({
    mutationFn: async (newPolicies: Record<string, RetentionPolicy>) => {
      // Salvar políticas de retenção (pode ser expandido para uma tabela dedicada)
      const { error } = await supabase
        .from("clinics")
        .update({
          backup_retention_days: Object.values(newPolicies)[0]?.retention_days || 90,
          auto_cleanup_enabled: Object.values(newPolicies)[0]?.auto_cleanup_enabled ?? true,
        })
        .eq("id", clinicId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinic-backup-config"] });
      toast.success("Políticas de retenção salvas com sucesso");
    },
    onError: () => {
      toast.error("Erro ao salvar políticas de retenção");
    },
  });

  const handlePolicyChange = (
    backupType: string,
    field: keyof RetentionPolicy,
    value: any
  ) => {
    setPolicies((prev) => ({
      ...prev,
      [backupType]: {
        ...prev[backupType],
        backup_type: backupType,
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    saveMutation.mutate(policies);
  };

  const getRetentionDays = (backupType: string) => {
    return policies[backupType]?.retention_days || clinicConfig?.backup_retention_days || 90;
  };

  const getAutoCleanup = (backupType: string) => {
    return policies[backupType]?.auto_cleanup_enabled ?? clinicConfig?.auto_cleanup_enabled ?? true;
  };

  return (
    <Card className="p-6 space-y-6" depth="normal">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Configuração de Retenção por Tipo
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Configure políticas de retenção individuais para cada tipo de backup
          </p>
        </div>
        <Button onClick={handleSave} className="gap-2" disabled={saveMutation.isPending}>
          <Save className="h-4 w-4" />
          Salvar Políticas
        </Button>
      </div>

      <div className="grid gap-4">
        {BACKUP_TYPES.map((type) => (
          <Card key={type.value} className="p-4" depth="subtle">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-3 h-3 rounded-full ${type.color}`} />
                  <h4 className="font-medium">{type.label}</h4>
                  <Badge variant="outline">{type.value}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`retention-${type.value}`}>
                      Retenção (dias)
                    </Label>
                    <Input
                      id={`retention-${type.value}`}
                      type="number"
                      min="1"
                      max="365"
                      value={getRetentionDays(type.value)}
                      onChange={(e) =>
                        handlePolicyChange(
                          type.value,
                          "retention_days",
                          parseInt(e.target.value)
                        )
                      }
                      className="max-w-[150px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      Backups mais antigos serão deletados automaticamente
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`cleanup-${type.value}`}>
                      Limpeza Automática
                    </Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Switch
                        id={`cleanup-${type.value}`}
                        checked={getAutoCleanup(type.value)}
                        onCheckedChange={(checked) =>
                          handlePolicyChange(type.value, "auto_cleanup_enabled", checked)
                        }
                      />
                      <span className="text-sm text-muted-foreground">
                        {getAutoCleanup(type.value) ? "Ativada" : "Desativada"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const updatedPolicies = { ...policies };
                  delete updatedPolicies[type.value];
                  setPolicies(updatedPolicies);
                  toast.success("Política resetada para padrão");
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">💡 Dicas de Retenção:</h4>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>
            <strong>Backups Completos:</strong> Recomendado 90-180 dias para restauração de
            longo prazo
          </li>
          <li>
            <strong>Backups Incrementais:</strong> 30-60 dias, pois dependem do backup base
          </li>
          <li>
            <strong>Backups Agendados:</strong> 60-90 dias para histórico automatizado
          </li>
          <li>
            <strong>Backups Manuais:</strong> 365 dias ou mais para pontos críticos
          </li>
        </ul>
      </div>
    </Card>
  );
}
