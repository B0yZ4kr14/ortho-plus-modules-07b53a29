import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Database, Activity, AlertTriangle, TrendingUp, Zap } from "lucide-react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))']

export function PostgreSQLDashboard() {
  const { data: healthData, isLoading } = useQuery({
    queryKey: ['database-health'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('analyze-database-health')
      
      if (error) throw error
      return data
    },
    refetchInterval: 60000 // Atualizar a cada 1 minuto
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const metrics = healthData?.metrics
  const alerts = healthData?.alerts || []

  const criticalAlerts = alerts.filter((a: any) => a.severity === 'critical')
  const warningAlerts = alerts.filter((a: any) => a.severity === 'warning')

  return (
    <div className="space-y-6">
      {/* Alertas críticos */}
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

      {/* KPIs Principais */}
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
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.cache_hit_ratio?.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.cache_hit_ratio >= 95 ? '✓ Excelente' : metrics?.cache_hit_ratio >= 90 ? '⚠️ Bom' : '❌ Baixo'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deadlocks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.deadlocks_count || 0}</div>
            <p className="text-xs text-muted-foreground">Últimas 24h</p>
          </CardContent>
        </Card>
      </div>

      {/* Bloat de Tabelas */}
      {metrics?.table_bloat && metrics.table_bloat.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tabelas com Bloat (Top 10)
            </CardTitle>
            <CardDescription>
              Espaço desperdiçado que pode ser recuperado com VACUUM
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.table_bloat}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="table_name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))' 
                  }} 
                />
                <Bar dataKey="wasted_mb" fill="hsl(var(--destructive))" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4">
              <Badge variant="outline" className="mr-2">
                Total desperdiçado: {metrics.table_bloat.reduce((sum: number, t: any) => sum + t.wasted_mb, 0).toFixed(0)} MB
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">
                Recomendação: Execute VACUUM FULL nas tabelas críticas durante janela de manutenção
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Índices não utilizados */}
      {metrics?.unused_indexes && metrics.unused_indexes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Índices Não Utilizados</CardTitle>
            <CardDescription>
              Índices que nunca foram usados e podem ser removidos para economizar espaço
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {metrics.unused_indexes.map((idx: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-mono text-sm">{idx.index_name}</p>
                      <p className="text-xs text-muted-foreground">{idx.table_name}</p>
                    </div>
                    <Badge variant="outline">{idx.size_mb.toFixed(2)} MB</Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <p className="text-xs text-muted-foreground mt-4">
              Total recuperável: {metrics.unused_indexes.reduce((sum: number, i: any) => sum + i.size_mb, 0).toFixed(2)} MB
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tabelas com Sequential Scans altos (missing indexes) */}
      {metrics?.missing_indexes && metrics.missing_indexes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Possíveis Índices Faltantes</CardTitle>
            <CardDescription>
              Tabelas com muitos sequential scans podem se beneficiar de índices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {metrics.missing_indexes.map((table: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-mono text-sm">{table.table_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {table.rows_scanned.toLocaleString()} linhas escaneadas
                      </p>
                    </div>
                    <Badge variant="secondary">{table.seq_scans.toLocaleString()} scans</Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
