import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Database, Activity, AlertTriangle } from "lucide-react";

export function BackupPostgreSQLTab() {
  const { data: healthData, isLoading } = useQuery({
    queryKey: ['database-health'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('analyze-database-health');
      if (error) throw error;
      return data;
    },
    refetchInterval: 60000
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const metrics = healthData?.metrics;
  const alerts = healthData?.alerts || [];
  const criticalAlerts = alerts.filter((a: any) => a.severity === 'critical');
  const warningAlerts = alerts.filter((a: any) => a.severity === 'warning');

  return (
    <div className="space-y-6">
      {criticalAlerts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Alertas Críticos:</strong>
            <ul className="mt-2 space-y-1">
              {criticalAlerts.map((alert: any, idx: number) => (
                <li key={idx}>• {alert.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {warningAlerts.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Avisos:</strong>
            <ul className="mt-2 space-y-1">
              {warningAlerts.map((alert: any, idx: number) => (
                <li key={idx}>• {alert.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tamanho do Banco</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.total_size_mb?.toFixed(0) || 0} MB</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.total_size_mb > 8000 ? '⚠️ Próximo ao limite' : '✓ Capacidade OK'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conexões Ativas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.connections_active || 0}/{metrics?.connections_max || 100}
            </div>
            <p className="text-xs text-muted-foreground">
              {((metrics?.connections_active / metrics?.connections_max) * 100).toFixed(0)}% utilização
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Ratio</CardTitle>
            <Badge variant="outline">{metrics?.cache_hit_ratio?.toFixed(1) || 0}%</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.cache_hit_ratio > 90 ? '✓ Excelente' : metrics?.cache_hit_ratio > 70 ? '⚠️ Bom' : '⚠️ Baixo'}
            </div>
            <p className="text-xs text-muted-foreground">Performance do cache</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tabelas Maiores</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {metrics?.largest_tables?.slice(0, 3).map((table: any) => (
                <div key={table.table_name} className="flex justify-between py-1">
                  <span className="truncate">{table.table_name}</span>
                  <span className="text-muted-foreground">{table.size_mb}MB</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
