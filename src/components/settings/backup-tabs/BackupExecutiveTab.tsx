import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Database, TrendingUp, Clock, HardDrive } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function BackupExecutiveTab() {
  const { clinicId } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['backup-executive-stats', clinicId],
    queryFn: async () => {
      const { data: backups, error } = await supabase
        .from('backup_history')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const now = new Date();
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const recent = backups.filter(b => new Date(b.created_at) >= last30Days);

      const totalBackups = recent.length;
      const successfulBackups = recent.filter(b => b.status === 'success').length;
      const successRate = totalBackups > 0 ? (successfulBackups / totalBackups) * 100 : 0;

      const totalSize = recent.reduce((sum, b) => sum + (b.file_size_bytes || 0), 0);
      const avgSize = totalBackups > 0 ? totalSize / totalBackups : 0;

      const trendData = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const dayBackups = recent.filter(b => b.created_at.split('T')[0] === dateStr);
        const daySuccess = dayBackups.filter(b => b.status === 'success').length;
        const dayFailed = dayBackups.filter(b => b.status === 'failed').length;

        trendData.push({
          date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          success: daySuccess,
          failed: dayFailed
        });
      }

      return { totalBackups, successfulBackups, successRate, avgSize, totalSize, trendData };
    },
    enabled: !!clinicId
  });

  if (isLoading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Backups</p>
              <p className="text-2xl font-bold">{stats?.totalBackups || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
              <p className="text-2xl font-bold">{stats?.successRate.toFixed(1)}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-warning/10">
              <HardDrive className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Espaço Usado</p>
              <p className="text-2xl font-bold">
                {((stats?.totalSize || 0) / 1024 / 1024 / 1024).toFixed(2)} GB
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-info/10">
              <Clock className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tamanho Médio</p>
              <p className="text-2xl font-bold">
                {((stats?.avgSize || 0) / 1024 / 1024).toFixed(0)} MB
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Tendência de Backups (30 dias)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats?.trendData || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="success" fill="hsl(var(--success))" name="Sucesso" />
            <Bar dataKey="failed" fill="hsl(var(--destructive))" name="Falha" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
