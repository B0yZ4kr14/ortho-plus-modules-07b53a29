import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Settings, Trash2 } from 'lucide-react';

export function BackupRetentionTab() {
  const { clinicId } = useAuth();
  const queryClient = useQueryClient();
  const [retentionDays, setRetentionDays] = useState(30);
  const [autoCleanup, setAutoCleanup] = useState(true);

  const { data: config } = useQuery({
    queryKey: ['backup-retention-config', clinicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clinics')
        .select('backup_retention_days, auto_cleanup_enabled')
        .eq('id', clinicId)
        .single();

      if (error) throw error;
      
      setRetentionDays(data.backup_retention_days || 30);
      setAutoCleanup(data.auto_cleanup_enabled || false);
      
      return data;
    },
    enabled: !!clinicId
  });

  const updateConfigMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('clinics')
        .update({
          backup_retention_days: retentionDays,
          auto_cleanup_enabled: autoCleanup
        })
        .eq('id', clinicId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Configuração atualizada com sucesso');
      queryClient.invalidateQueries({ queryKey: ['backup-retention-config'] });
    },
    onError: () => {
      toast.error('Erro ao atualizar configuração');
    }
  });

  const cleanupMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .rpc('cleanup_old_backups', { p_clinic_id: clinicId });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data && data.length > 0) {
        const result = data[0];
        toast.success(`${result.deleted_count} backups removidos (${(result.freed_bytes / 1024 / 1024 / 1024).toFixed(2)} GB liberados)`);
      }
      queryClient.invalidateQueries({ queryKey: ['backup-timeline'] });
    },
    onError: () => {
      toast.error('Erro ao executar limpeza');
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuração de Retenção
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="retention">Período de Retenção (dias)</Label>
            <Input
              id="retention"
              type="number"
              min="7"
              max="365"
              value={retentionDays}
              onChange={(e) => setRetentionDays(parseInt(e.target.value))}
            />
            <p className="text-sm text-muted-foreground">
              Backups mais antigos que {retentionDays} dias serão automaticamente removidos.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Limpeza Automática</Label>
              <p className="text-sm text-muted-foreground">
                Ativar remoção automática de backups antigos
              </p>
            </div>
            <Switch
              checked={autoCleanup}
              onCheckedChange={setAutoCleanup}
            />
          </div>

          <Button 
            onClick={() => updateConfigMutation.mutate()}
            disabled={updateConfigMutation.isPending}
          >
            Salvar Configurações
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Limpeza Manual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Execute a limpeza manual de backups antigos baseado nas configurações atuais.
          </p>
          <Button
            variant="destructive"
            onClick={() => cleanupMutation.mutate()}
            disabled={cleanupMutation.isPending}
          >
            Executar Limpeza Agora
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
