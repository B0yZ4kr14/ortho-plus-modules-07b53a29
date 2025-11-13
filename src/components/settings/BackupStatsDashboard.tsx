import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database, HardDrive, Clock, CheckCircle2 } from 'lucide-react';
import { StatCard } from '@/components/StatCard';

export function BackupStatsDashboard() {
  const [stats, setStats] = useState({
    totalBackups: 0,
    totalSize: 0,
    lastBackup: null as string | null,
    successRate: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data: backups } = await supabase
      .from('backup_history')
      .select('*')
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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
  );
}