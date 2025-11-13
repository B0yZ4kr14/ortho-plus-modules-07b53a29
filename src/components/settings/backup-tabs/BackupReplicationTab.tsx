import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/shared/LoadingState';
import { Globe, CheckCircle, XCircle, Clock, Database } from 'lucide-react';

export function BackupReplicationTab() {
  const { clinicId } = useAuth();

  const { data: replications, isLoading } = useQuery({
    queryKey: ['backup-replications', clinicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('backup_replications')
        .select('*')
        .or(`source_clinic_id.eq.${clinicId},target_clinic_id.eq.${clinicId}`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
    enabled: !!clinicId
  });

  const stats = {
    total: replications?.length || 0,
    completed: replications?.filter(r => r.replication_status === 'COMPLETED').length || 0,
    failed: replications?.filter(r => r.replication_status === 'FAILED').length || 0,
    pending: replications?.filter(r => r.replication_status === 'PENDING').length || 0
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'COMPLETED': { variant: 'success', icon: CheckCircle, label: 'Completo' },
      'FAILED': { variant: 'destructive', icon: XCircle, label: 'Falhou' },
      'PENDING': { variant: 'warning', icon: Clock, label: 'Pendente' },
      'IN_PROGRESS': { variant: 'default', icon: Globe, label: 'Em Progresso' }
    };

    const config = variants[status] || variants.PENDING;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Replicações</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completos</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-warning/10">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-destructive/10">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Falhas</p>
              <p className="text-2xl font-bold">{stats.failed}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Histórico de Replicações</h3>
        <div className="space-y-3">
          {replications?.slice(0, 10).map((replication) => (
            <div key={replication.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{replication.region}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(replication.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
              {getStatusBadge(replication.replication_status)}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
