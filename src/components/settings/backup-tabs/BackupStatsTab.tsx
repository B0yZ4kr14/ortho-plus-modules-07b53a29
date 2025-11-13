import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database, HardDrive, Clock, CheckCircle2 } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export function BackupStatsTab() {
  const { clinicId } = useAuth();
  const [stats, setStats] = useState({
    totalBackups: 0,
    totalSize: 0,
    lastBackup: null as string | null,
    successRate: 0
  });

  useEffect(() => {
    fetchStats();
  }, [clinicId]);

  const fetchStats = async () => {
    const { data: backups } = await supabase
      .from('backup_history')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false });

    if (backups) {
      const totalSize = backups.reduce((sum, b) => sum + (b.file_size_bytes || 0), 0);
      const successCount = backups.filter(b => b.status === 'success').length;
      
      setStats({
        totalBackups: backups.length,
        totalSize,
        lastBackup: backups[0]?.created_at || null,
        successRate: backups.length > 0 ? (successCount / backups.length) * 100 : 0
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total de Backups"
          value={stats.totalBackups.toString()}
          icon={Database}
          iconColor="text-primary"
          borderColor="border-l-primary"
        />
        <StatCard
          label="Espaço Total"
          value={`${(stats.totalSize / 1024 / 1024 / 1024).toFixed(2)} GB`}
          icon={HardDrive}
          iconColor="text-primary"
          borderColor="border-l-primary"
        />
        <StatCard
          label="Último Backup"
          value={stats.lastBackup ? new Date(stats.lastBackup).toLocaleDateString() : 'N/A'}
          icon={Clock}
          iconColor="text-primary"
          borderColor="border-l-primary"
        />
        <StatCard
          label="Taxa de Sucesso"
          value={`${stats.successRate.toFixed(1)}%`}
          icon={CheckCircle2}
          iconColor="text-primary"
          borderColor="border-l-primary"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visão Geral dos Backups</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Sistema de backup configurado e operacional. Todos os backups são criptografados e armazenados com segurança.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
