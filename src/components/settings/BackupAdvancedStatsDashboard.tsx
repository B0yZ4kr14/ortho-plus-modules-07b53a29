import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Database,
  CheckCircle2,
  XCircle,
  Clock,
  HardDrive,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORS = ["#22c55e", "#ef4444", "#f59e0b", "#3b82f6"];

export function BackupAdvancedStatsDashboard() {
  const { clinicId } = useAuth();

  const { data: backupStats } = useQuery({
    queryKey: ["backup-advanced-stats", clinicId],
    queryFn: async () => {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

      // Buscar backups dos últimos 30 dias
      const { data: backups, error } = await supabase
        .from("backup_history")
        .select("*")
        .eq("clinic_id", clinicId)
        .gte("created_at", thirtyDaysAgo)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Calcular estatísticas
      const totalBackups = backups?.length || 0;
      const successBackups = backups?.filter((b) => b.status === "success").length || 0;
      const failedBackups = backups?.filter((b) => b.status === "failed").length || 0;
      const successRate = totalBackups > 0 ? (successBackups / totalBackups) * 100 : 0;

      const totalSize = backups?.reduce((sum, b) => sum + (b.file_size_bytes || 0), 0) || 0;
      const avgSize = totalBackups > 0 ? totalSize / totalBackups : 0;

      // Calcular tempo médio de conclusão
      const completedBackups = backups?.filter(
        (b) => b.completed_at && b.created_at
      ) || [];
      const avgDuration =
        completedBackups.length > 0
          ? completedBackups.reduce((sum, b) => {
              const duration =
                new Date(b.completed_at!).getTime() -
                new Date(b.created_at).getTime();
              return sum + duration;
            }, 0) / completedBackups.length
          : 0;

      // Agrupar por dia para gráfico de tendência
      const dailyStats = backups?.reduce((acc: any[], backup) => {
        const date = format(new Date(backup.created_at), "dd/MM", { locale: ptBR });
        const existing = acc.find((d) => d.date === date);

        if (existing) {
          existing.total += 1;
          existing.success += backup.status === "success" ? 1 : 0;
          existing.failed += backup.status === "failed" ? 1 : 0;
          existing.size += backup.file_size_bytes || 0;
        } else {
          acc.push({
            date,
            total: 1,
            success: backup.status === "success" ? 1 : 0,
            failed: backup.status === "failed" ? 1 : 0,
            size: backup.file_size_bytes || 0,
          });
        }
        return acc;
      }, []);

      // Distribuição por tipo
      const typeDistribution = backups?.reduce((acc: any[], backup) => {
        const existing = acc.find((t) => t.name === backup.backup_type);
        if (existing) {
          existing.value += 1;
        } else {
          acc.push({ name: backup.backup_type, value: 1 });
        }
        return acc;
      }, []);

      return {
        totalBackups,
        successBackups,
        failedBackups,
        successRate,
        totalSize,
        avgSize,
        avgDuration,
        dailyStats: dailyStats || [],
        typeDistribution: typeDistribution || [],
      };
    },
    enabled: !!clinicId,
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6" depth="normal">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Backups</p>
              <p className="text-3xl font-bold mt-2">{backupStats?.totalBackups || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Últimos 30 dias</p>
            </div>
            <Database className="h-12 w-12 text-primary opacity-50" />
          </div>
        </Card>

        <Card className="p-6" depth="normal">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
              <p className="text-3xl font-bold mt-2">
                {backupStats?.successRate.toFixed(1) || 0}%
              </p>
              <div className="flex items-center gap-2 mt-1">
                {(backupStats?.successRate || 0) >= 95 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-success" />
                    <span className="text-xs text-success">Excelente</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-destructive" />
                    <span className="text-xs text-destructive">Atenção</span>
                  </>
                )}
              </div>
            </div>
            <CheckCircle2 className="h-12 w-12 text-success opacity-50" />
          </div>
        </Card>

        <Card className="p-6" depth="normal">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Espaço Ocupado</p>
              <p className="text-3xl font-bold mt-2">
                {formatBytes(backupStats?.totalSize || 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Média: {formatBytes(backupStats?.avgSize || 0)}
              </p>
            </div>
            <HardDrive className="h-12 w-12 text-warning opacity-50" />
          </div>
        </Card>

        <Card className="p-6" depth="normal">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tempo Médio</p>
              <p className="text-3xl font-bold mt-2">
                {formatDuration(backupStats?.avgDuration || 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Por backup</p>
            </div>
            <Clock className="h-12 w-12 text-info opacity-50" />
          </div>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendência de Backups */}
        <Card className="p-6" depth="normal">
          <h3 className="font-semibold mb-4">Tendência de Backups (30 dias)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={backupStats?.dailyStats || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="success"
                stroke="#22c55e"
                name="Sucesso"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="failed"
                stroke="#ef4444"
                name="Falhas"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Tamanho por Dia */}
        <Card className="p-6" depth="normal">
          <h3 className="font-semibold mb-4">Tamanho dos Backups (30 dias)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={backupStats?.dailyStats || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => formatBytes(value)} />
              <Tooltip formatter={(value: any) => formatBytes(value)} />
              <Bar dataKey="size" fill="#3b82f6" name="Tamanho" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Distribuição por Tipo */}
        <Card className="p-6" depth="normal">
          <h3 className="font-semibold mb-4">Distribuição por Tipo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={backupStats?.typeDistribution || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {(backupStats?.typeDistribution || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Status Resumo */}
        <Card className="p-6" depth="normal">
          <h3 className="font-semibold mb-4">Resumo de Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-success" />
                <div>
                  <p className="font-medium">Backups Bem-Sucedidos</p>
                  <p className="text-sm text-muted-foreground">
                    {backupStats?.successBackups || 0} de {backupStats?.totalBackups || 0}
                  </p>
                </div>
              </div>
              <Badge variant="success" className="text-lg px-4 py-2">
                {backupStats?.successRate.toFixed(0) || 0}%
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-destructive/10 rounded-lg">
              <div className="flex items-center gap-3">
                <XCircle className="h-8 w-8 text-destructive" />
                <div>
                  <p className="font-medium">Falhas</p>
                  <p className="text-sm text-muted-foreground">
                    {backupStats?.failedBackups || 0} backups
                  </p>
                </div>
              </div>
              <Badge variant="destructive" className="text-lg px-4 py-2">
                {backupStats?.failedBackups || 0}
              </Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
