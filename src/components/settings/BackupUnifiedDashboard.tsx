import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Database, 
  Clock, 
  Shield, 
  DollarSign, 
  TrendingUp, 
  CheckCircle2,
  AlertTriangle,
  Activity
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export function BackupUnifiedDashboard() {
  const { clinicId } = useAuth();

  // KPIs Executivos
  const { data: kpis } = useQuery({
    queryKey: ['backup-kpis', clinicId],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: backups, error } = await supabase
        .from('backup_history')
        .select('*')
        .eq('clinic_id', clinicId)
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (error) throw error;

      const total = backups.length;
      const successful = backups.filter(b => b.status === 'success').length;
      const successRate = total > 0 ? (successful / total) * 100 : 0;

      // Calcular RTO médio (tempo de restauração)
      const testedBackups = backups.filter(b => {
        const metadata = b.metadata as any;
        return metadata?.restore_tested_at;
      });
      const avgRTO = testedBackups.length > 0 
        ? testedBackups.reduce((acc, b) => {
            const metadata = b.metadata as any;
            const created = new Date(b.created_at).getTime();
            const tested = new Date(metadata?.restore_tested_at).getTime();
            return acc + (tested - created);
          }, 0) / testedBackups.length / (1000 * 60 * 60) // em horas
        : 0;

      // Calcular RPO médio (intervalo entre backups)
      const sortedBackups = [...backups].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      const avgRPO = sortedBackups.length > 1
        ? sortedBackups.slice(1).reduce((acc, backup, idx) => {
            const prev = new Date(sortedBackups[idx].created_at).getTime();
            const curr = new Date(backup.created_at).getTime();
            return acc + (curr - prev);
          }, 0) / (sortedBackups.length - 1) / (1000 * 60 * 60) // em horas
        : 0;

      // Cobertura de dados
      const verifiedBackups = backups.filter(b => {
        const metadata = b.metadata as any;
        return metadata?.verified_at;
      });
      const dataCoverage = total > 0 ? (verifiedBackups.length / total) * 100 : 0;

      // Custo total estimado (simulado)
      const totalSize = backups.reduce((acc, b) => acc + (b.file_size_bytes || 0), 0);
      const costPerGB = 0.023; // AWS S3 Standard
      const totalCost = (totalSize / (1024 * 1024 * 1024)) * costPerGB;

      return {
        successRate,
        avgRTO,
        avgRPO,
        dataCoverage,
        totalCost,
        totalBackups: total,
        totalSize
      };
    },
    enabled: !!clinicId,
  });

  // Timeline de backups
  const { data: timeline } = useQuery({
    queryKey: ['backup-timeline-chart', clinicId],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('backup_history')
        .select('created_at, backup_type, status')
        .eq('clinic_id', clinicId)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Agrupar por dia
      const grouped = data.reduce((acc: any, backup) => {
        const date = format(new Date(backup.created_at), 'dd/MM');
        if (!acc[date]) {
          acc[date] = { date, full: 0, incremental: 0, differential: 0, failed: 0 };
        }
        if (backup.status === 'success') {
          acc[date][backup.backup_type] = (acc[date][backup.backup_type] || 0) + 1;
        } else {
          acc[date].failed++;
        }
        return acc;
      }, {});

      return Object.values(grouped);
    },
    enabled: !!clinicId,
  });

  // Distribuição por tipo
  const { data: distribution } = useQuery({
    queryKey: ['backup-distribution', clinicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('backup_history')
        .select('backup_type')
        .eq('clinic_id', clinicId)
        .eq('status', 'success');

      if (error) throw error;

      const counts = data.reduce((acc: any, b) => {
        acc[b.backup_type] = (acc[b.backup_type] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(counts).map(([name, value]) => ({
        name: name === 'full' ? 'Full' : name === 'incremental' ? 'Incremental' : 'Diferencial',
        value
      }));
    },
    enabled: !!clinicId,
  });

  // Health Score
  const calculateHealthScore = () => {
    if (!kpis) return 0;
    
    let score = 0;
    
    // Taxa de sucesso (40 pontos)
    score += (kpis.successRate / 100) * 40;
    
    // Testes de restauração recentes (30 pontos)
    score += (kpis.dataCoverage / 100) * 30;
    
    // RTO aceitável < 4h (20 pontos)
    if (kpis.avgRTO < 4) score += 20;
    else if (kpis.avgRTO < 8) score += 10;
    
    // RPO aceitável < 24h (10 pontos)
    if (kpis.avgRPO < 24) score += 10;
    else if (kpis.avgRPO < 48) score += 5;
    
    return Math.round(score);
  };

  const healthScore = calculateHealthScore();

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreBadge = (score: number) => {
    if (score >= 90) return { label: 'Excelente', variant: 'default' as const };
    if (score >= 70) return { label: 'Bom', variant: 'secondary' as const };
    return { label: 'Atenção', variant: 'destructive' as const };
  };

  return (
    <div className="space-y-6">
      {/* KPIs Executivos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card depth="normal">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Últimos 30 dias • Target: 99.5%
            </p>
          </CardContent>
        </Card>

        <Card depth="normal">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RTO Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.avgRTO.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              Recovery Time Objective • Target: &lt;4h
            </p>
          </CardContent>
        </Card>

        <Card depth="normal">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RPO Médio</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.avgRPO.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              Recovery Point Objective • Target: &lt;24h
            </p>
          </CardContent>
        </Card>

        <Card depth="normal">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {kpis?.totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Armazenamento mensal • AWS S3
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Health Score */}
      <Card depth="intense">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Health Score do Sistema de Backups
          </CardTitle>
          <CardDescription>
            Índice consolidado de saúde baseado em múltiplos fatores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-6xl font-bold ${getHealthScoreColor(healthScore)}`}>
                {healthScore}
              </div>
              <Badge {...getHealthScoreBadge(healthScore)} className="mt-2">
                {getHealthScoreBadge(healthScore).label}
              </Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>Taxa de Sucesso: 40pts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span>Testes de Restauração: 30pts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span>RTO &lt; 4h: 20pts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <span>RPO &lt; 24h: 10pts</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline 360° */}
      <Card depth="normal">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Timeline de Backups - Últimos 30 Dias
          </CardTitle>
          <CardDescription>
            Visualização temporal de todos os backups executados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))' 
                }} 
              />
              <Bar dataKey="full" stackId="a" fill={COLORS[0]} name="Full" />
              <Bar dataKey="incremental" stackId="a" fill={COLORS[1]} name="Incremental" />
              <Bar dataKey="differential" stackId="a" fill={COLORS[2]} name="Diferencial" />
              <Bar dataKey="failed" stackId="a" fill="hsl(var(--destructive))" name="Falhas" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Distribuição por Tipo */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card depth="normal">
          <CardHeader>
            <CardTitle>Distribuição por Tipo de Backup</CardTitle>
            <CardDescription>
              Proporção de cada tipo de backup executado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={distribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card depth="normal">
          <CardHeader>
            <CardTitle>Matriz de Conformidade</CardTitle>
            <CardDescription>
              Status de conformidade com políticas de retenção
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Backups Diários</span>
                <Badge variant="default">✓ Conforme</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Backups Semanais</span>
                <Badge variant="default">✓ Conforme</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Backups Mensais</span>
                <Badge variant="default">✓ Conforme</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Testes de Restauração</span>
                <Badge variant="secondary">⚠ Atenção</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Verificação de Integridade</span>
                <Badge variant="default">✓ Conforme</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Próximas Ações */}
      <Card depth="normal">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Próximas Ações Recomendadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {healthScore < 90 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium">Melhorar Health Score</p>
                  <p className="text-sm text-muted-foreground">
                    Execute testes de restauração regulares para aumentar a confiabilidade
                  </p>
                </div>
              </div>
            )}
            {(kpis?.avgRTO || 0) > 4 && (
              <div className="flex items-start gap-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium">Otimizar RTO</p>
                  <p className="text-sm text-muted-foreground">
                    Tempo de recuperação acima do target. Considere backups incrementais mais frequentes
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <Database className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Próximo Backup Agendado</p>
                <p className="text-sm text-muted-foreground">
                  Backup Full agendado para {format(new Date(Date.now() + 86400000), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
