import { useState, useEffect } from 'react';
import { Activity, Cpu, HardDrive, Zap, Clock, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  threshold: number;
}

export default function MonitoringPage() {
  const [metrics, setMetrics] = useState<SystemMetric[]>([
    { name: 'CPU Usage', value: 45, unit: '%', status: 'healthy', threshold: 80 },
    { name: 'Memory Usage', value: 62, unit: '%', status: 'healthy', threshold: 85 },
    { name: 'Disk Usage', value: 38, unit: '%', status: 'healthy', threshold: 90 },
    { name: 'API Response Time', value: 156, unit: 'ms', status: 'healthy', threshold: 500 },
    { name: 'Database Connections', value: 12, unit: 'conn', status: 'healthy', threshold: 100 },
    { name: 'Error Rate', value: 0.3, unit: '%', status: 'healthy', threshold: 5 }
  ]);

  const [uptime, setUptime] = useState('99.98%');
  const [lastIncident, setLastIncident] = useState('2025-01-10 14:32');

  useEffect(() => {
    // Simular atualização de métricas
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.value + (Math.random() - 0.5) * 5,
        status: metric.value > metric.threshold * 0.9 ? 'critical' :
                metric.value > metric.threshold * 0.7 ? 'warning' : 'healthy'
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: SystemMetric['status']) => {
    const variants = {
      healthy: { variant: 'default' as const, label: 'Healthy' },
      warning: { variant: 'secondary' as const, label: 'Warning' },
      critical: { variant: 'destructive' as const, label: 'Critical' }
    };

    return <Badge variant={variants[status].variant}>{variants[status].label}</Badge>;
  };

  const getStatusColor = (status: SystemMetric['status']) => {
    return {
      healthy: 'text-green-500',
      warning: 'text-yellow-500',
      critical: 'text-red-500'
    }[status];
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="System Monitoring"
        description="Monitoramento em tempo real da saúde do sistema"
        icon={Activity}
      />

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Uptime (30 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{uptime}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Target: 99.9%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-2xl font-bold">Operational</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Todos os sistemas funcionando
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Último Incidente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lastIncident}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Manutenção programada
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{metric.name}</CardTitle>
                {getStatusBadge(metric.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end justify-between">
                <span className={`text-4xl font-bold ${getStatusColor(metric.status)}`}>
                  {metric.value.toFixed(metric.unit === 'ms' ? 0 : 1)}
                </span>
                <span className="text-lg text-muted-foreground">{metric.unit}</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Threshold</span>
                  <span>{metric.threshold}{metric.unit}</span>
                </div>
                <Progress
                  value={(metric.value / metric.threshold) * 100}
                  className="h-2"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Atualizado há 3 segundos</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas Recentes
          </CardTitle>
          <CardDescription>
            Últimos alertas e notificações do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
              <div className="flex-1">
                <p className="font-medium">Sistema operacional</p>
                <p className="text-sm text-muted-foreground">
                  Todas as métricas dentro dos limites esperados
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date().toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2" />
              <div className="flex-1">
                <p className="font-medium">Backup automático iniciado</p>
                <p className="text-sm text-muted-foreground">
                  Backup incremental em andamento - 2.3GB
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  15 minutos atrás
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
