import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Users, Target } from 'lucide-react';
import { useMarketingROI } from '@/hooks/useMarketingROI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function DashboardComercial() {
  const { data: metrics, isLoading } = useMarketingROI();

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div>Carregando métricas de marketing...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Análise Comercial e ROI de Marketing</h1>
        <p className="text-muted-foreground">Métricas de performance e retorno sobre investimento</p>
      </div>
      
      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card data-testid="kpi-cac">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Total de Aquisição</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {metrics?.cac.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </div>
            <p className="text-xs text-muted-foreground">CAC médio por paciente</p>
          </CardContent>
        </Card>
        
        <Card data-testid="kpi-roi">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI Geral</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.roi.toFixed(1) || '0'}%</div>
            <p className="text-xs text-muted-foreground">Retorno sobre investimento</p>
          </CardContent>
        </Card>
        
        <Card data-testid="kpi-converted">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Convertidos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.convertedPatients || 0}</div>
            <p className="text-xs text-muted-foreground">
              De {metrics?.totalPatients || 0} pacientes totais
            </p>
          </CardContent>
        </Card>
        
        <Card data-testid="kpi-conversion-rate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.conversionRate.toFixed(1) || '0'}%
            </div>
            <p className="text-xs text-muted-foreground">Leads → Pacientes</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Gráfico de ROI por Campanha */}
      <Card data-testid="chart-campaign-roi">
        <CardHeader>
          <CardTitle>ROI por Campanha</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics && metrics.campaignROI && metrics.campaignROI.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.campaignROI}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="campaign" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="conversionRate" fill="hsl(var(--primary))" name="Taxa de Conversão %" />
                <Bar dataKey="cac" fill="hsl(var(--secondary))" name="CAC (R$)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Nenhuma campanha com dados ainda</p>
              <p className="text-sm mt-2">
                Cadastre pacientes com dados de marketing para visualizar o ROI
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Tabela de Performance por Origem */}
      <Card data-testid="table-source-performance">
        <CardHeader>
          <CardTitle>Performance por Origem</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics && metrics.sourcePerformance && metrics.sourcePerformance.length > 0 ? (
            <div className="space-y-4">
              {metrics.sourcePerformance.map((source) => (
                <div key={source.source} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">{source.source}</div>
                    <div className="text-sm text-muted-foreground">
                      {source.converted} de {source.total} convertidos
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {source.conversionRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Taxa de conversão
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Nenhuma origem com dados ainda</p>
              <p className="text-sm mt-2">
                Preencha o campo "Origem" nos cadastros de pacientes
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
