import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Database, Calendar, CheckCircle, XCircle, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface BackupStats {
  totalBackups: number;
  successRate: number;
  totalSize: number;
  averageSize: number;
  manualCount: number;
  automaticCount: number;
  failedCount: number;
}

interface TimeSeriesData {
  date: string;
  size: number;
  count: number;
}

interface TypeDistribution {
  name: string;
  value: number;
}

export function BackupStatsDashboard() {
  const { clinicId } = useAuth();
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [typeDistribution, setTypeDistribution] = useState<TypeDistribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (clinicId) {
      fetchBackupStats();
    }
  }, [clinicId, period]);

  const fetchBackupStats = async () => {
    if (!clinicId) return;

    setIsLoading(true);
    try {
      // Calcular data de início baseado no período
      const daysMap = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysMap[period]);

      // Buscar todos os backups do período
      const { data: backups, error } = await supabase
        .from('backup_history')
        .select('*')
        .eq('clinic_id', clinicId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Calcular estatísticas gerais
      const totalBackups = backups?.length || 0;
      const successCount = backups?.filter(b => b.status === 'success').length || 0;
      const successRate = totalBackups > 0 ? (successCount / totalBackups) * 100 : 0;
      const totalSize = backups?.reduce((sum, b) => sum + (b.file_size_bytes || 0), 0) || 0;
      const averageSize = totalBackups > 0 ? totalSize / totalBackups : 0;
      const manualCount = backups?.filter(b => b.backup_type === 'manual').length || 0;
      const automaticCount = backups?.filter(b => b.backup_type === 'automatic').length || 0;
      const failedCount = backups?.filter(b => b.status === 'failed').length || 0;

      setStats({
        totalBackups,
        successRate,
        totalSize,
        averageSize,
        manualCount,
        automaticCount,
        failedCount
      });

      // Processar dados para gráfico de linha (evolução do espaço)
      const timeSeriesMap = new Map<string, { size: number; count: number }>();
      
      backups?.forEach(backup => {
        const date = new Date(backup.created_at).toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit' 
        });
        
        const existing = timeSeriesMap.get(date) || { size: 0, count: 0 };
        timeSeriesMap.set(date, {
          size: existing.size + (backup.file_size_bytes || 0),
          count: existing.count + 1
        });
      });

      const timeSeriesArray = Array.from(timeSeriesMap.entries()).map(([date, data]) => ({
        date,
        size: Math.round(data.size / (1024 * 1024)), // Converter para MB
        count: data.count
      }));

      setTimeSeriesData(timeSeriesArray);

      // Distribuição por tipo
      setTypeDistribution([
        { name: 'Manuais', value: manualCount },
        { name: 'Automáticos', value: automaticCount },
        { name: 'Falhos', value: failedCount }
      ]);

    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const calculateGrowthTrend = () => {
    if (timeSeriesData.length < 2) return 0;
    
    const firstWeek = timeSeriesData.slice(0, Math.floor(timeSeriesData.length / 2));
    const secondWeek = timeSeriesData.slice(Math.floor(timeSeriesData.length / 2));
    
    const firstAvg = firstWeek.reduce((sum, d) => sum + d.size, 0) / firstWeek.length;
    const secondAvg = secondWeek.reduce((sum, d) => sum + d.size, 0) / secondWeek.length;
    
    return ((secondAvg - firstAvg) / firstAvg) * 100;
  };

  const predictNextMonthSize = () => {
    if (!stats) return 0;
    const growthTrend = calculateGrowthTrend();
    const currentAverage = stats.averageSize;
    return currentAverage * (1 + (growthTrend / 100));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FF8042'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Activity className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const growthTrend = calculateGrowthTrend();
  const predictedSize = predictNextMonthSize();

  return (
    <div className="space-y-6">
      {/* Filtro de Período */}
      <div className="flex justify-end">
        <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="90d">Últimos 90 dias</SelectItem>
            <SelectItem value="1y">Último ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Backups</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBackups || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.manualCount || 0} manuais • {stats?.automaticCount || 0} automáticos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats?.failedCount || 0} falhas registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Espaço Total</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(stats?.totalSize || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Média: {formatBytes(stats?.averageSize || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tendência de Crescimento</CardTitle>
            {growthTrend >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {growthTrend >= 0 ? '+' : ''}{growthTrend.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Previsão próximo mês: {formatBytes(predictedSize)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Evolução do Espaço */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução do Espaço Utilizado</CardTitle>
            <CardDescription>
              Tamanho total dos backups ao longo do tempo (MB)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="size" 
                  stroke="#8884d8" 
                  name="Tamanho (MB)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Frequência */}
        <Card>
          <CardHeader>
            <CardTitle>Frequência de Backups</CardTitle>
            <CardDescription>
              Quantidade de backups realizados por dia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d" name="Quantidade" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Distribuição por Tipo */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Tipo</CardTitle>
            <CardDescription>
              Proporção entre backups manuais, automáticos e falhos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Previsão de Crescimento */}
        <Card>
          <CardHeader>
            <CardTitle>Previsão de Crescimento</CardTitle>
            <CardDescription>
              Estimativa de armazenamento necessário
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium mb-2">Próximos 30 dias:</div>
              <div className="text-2xl font-bold text-primary">
                {formatBytes(predictedSize * 30)}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium mb-2">Próximos 90 dias:</div>
              <div className="text-2xl font-bold text-primary">
                {formatBytes(predictedSize * 90)}
              </div>
            </div>
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                * Previsão baseada na tendência de crescimento atual ({growthTrend >= 0 ? '+' : ''}{growthTrend.toFixed(1)}%)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
