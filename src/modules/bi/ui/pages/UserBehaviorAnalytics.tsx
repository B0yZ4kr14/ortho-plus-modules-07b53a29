import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Clock, TrendingUp, Users, Zap, AlertCircle, CheckCircle2, Download, Activity } from "lucide-react";
import { useState } from "react";

// Mock data para análise comportamental
const hourlyUsageData = [
  { hour: '00h', acessos: 5 },
  { hour: '01h', acessos: 3 },
  { hour: '02h', acessos: 2 },
  { hour: '03h', acessos: 1 },
  { hour: '04h', acessos: 2 },
  { hour: '05h', acessos: 4 },
  { hour: '06h', acessos: 8 },
  { hour: '07h', acessos: 15 },
  { hour: '08h', acessos: 45 },
  { hour: '09h', acessos: 78 },
  { hour: '10h', acessos: 92 },
  { hour: '11h', acessos: 85 },
  { hour: '12h', acessos: 35 },
  { hour: '13h', acessos: 40 },
  { hour: '14h', acessos: 88 },
  { hour: '15h', acessos: 95 },
  { hour: '16h', acessos: 82 },
  { hour: '17h', acessos: 65 },
  { hour: '18h', acessos: 42 },
  { hour: '19h', acessos: 28 },
  { hour: '20h', acessos: 18 },
  { hour: '21h', acessos: 12 },
  { hour: '22h', acessos: 8 },
  { hour: '23h', acessos: 6 },
];

const moduleAccessData = [
  { modulo: 'PEP', acessos: 1245, tempo_medio: '8m 32s', cor: '#10b981' },
  { modulo: 'Agenda', acessos: 1089, tempo_medio: '5m 12s', cor: '#3b82f6' },
  { modulo: 'Pacientes', acessos: 987, tempo_medio: '4m 45s', cor: '#8b5cf6' },
  { modulo: 'Financeiro', acessos: 765, tempo_medio: '6m 28s', cor: '#f59e0b' },
  { modulo: 'Procedimentos', acessos: 654, tempo_medio: '3m 15s', cor: '#ec4899' },
  { modulo: 'BI', acessos: 432, tempo_medio: '7m 50s', cor: '#06b6d4' },
  { modulo: 'Relatórios', acessos: 321, tempo_medio: '5m 38s', cor: '#84cc16' },
  { modulo: 'Configurações', acessos: 198, tempo_medio: '4m 02s', cor: '#6366f1' },
];

const userActivityTrend = [
  { data: '01/11', usuarios_ativos: 45, sessoes: 125 },
  { data: '02/11', usuarios_ativos: 48, sessoes: 132 },
  { data: '03/11', usuarios_ativos: 42, sessoes: 118 },
  { data: '04/11', usuarios_ativos: 52, sessoes: 145 },
  { data: '05/11', usuarios_ativos: 55, sessoes: 158 },
  { data: '06/11', usuarios_ativos: 51, sessoes: 142 },
  { data: '07/11', usuarios_ativos: 58, sessoes: 168 },
  { data: '08/11', usuarios_ativos: 62, sessoes: 175 },
  { data: '09/11', usuarios_ativos: 59, sessoes: 165 },
  { data: '10/11', usuarios_ativos: 65, sessoes: 182 },
  { data: '11/11', usuarios_ativos: 68, sessoes: 195 },
  { data: '12/11', usuarios_ativos: 70, sessoes: 205 },
];

const workflowOptimizations = [
  {
    id: 1,
    titulo: 'Alta utilização do PEP fora do horário de pico',
    descricao: 'Detectamos que 35% dos acessos ao PEP ocorrem entre 12h-13h (horário de almoço). Considere implementar lembretes para preenchimento durante consultas.',
    impacto: 'high',
    economia_tempo: '2.5h/dia',
    usuarios_afetados: 12
  },
  {
    id: 2,
    titulo: 'Módulo de Agenda subutilizado',
    descricao: 'Apenas 45% das consultas são agendadas através do módulo. Usuários ainda utilizam anotações manuais.',
    impacto: 'medium',
    economia_tempo: '1.8h/dia',
    usuarios_afetados: 8
  },
  {
    id: 3,
    titulo: 'Relatórios sendo gerados repetidamente',
    descricao: '3 usuários geram os mesmos relatórios diariamente. Configure templates automáticos para economizar tempo.',
    impacto: 'low',
    economia_tempo: '0.5h/dia',
    usuarios_afetados: 3
  },
  {
    id: 4,
    titulo: 'Fluxo de cadastro de pacientes pode ser otimizado',
    descricao: 'Usuários gastam em média 8 minutos cadastrando pacientes. Implemente auto-preenchimento de dados a partir de documentos.',
    impacto: 'high',
    economia_tempo: '3.2h/dia',
    usuarios_afetados: 15
  }
];

const userEngagementData = [
  { categoria: 'Muito Ativo (>4h/dia)', valor: 15, cor: '#10b981' },
  { categoria: 'Ativo (2-4h/dia)', valor: 32, cor: '#3b82f6' },
  { categoria: 'Moderado (1-2h/dia)', valor: 28, cor: '#f59e0b' },
  { categoria: 'Baixo (<1h/dia)', valor: 18, cor: '#ef4444' },
  { categoria: 'Inativo', valor: 7, cor: '#6b7280' },
];

export default function UserBehaviorAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('last-30-days');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          icon={Activity}
          title="Análise Comportamental"
          description="Padrões de uso, horários de pico e otimização de workflow"
        />
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-7-days">Últimos 7 dias</SelectItem>
              <SelectItem value="last-30-days">Últimos 30 dias</SelectItem>
              <SelectItem value="last-90-days">Últimos 90 dias</SelectItem>
              <SelectItem value="custom">Período customizado</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar Análise
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">70</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+8%</span> vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horário de Pico</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15h - 16h</div>
            <p className="text-xs text-muted-foreground">
              95 acessos simultâneos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio de Sessão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45min</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+12%</span> de engajamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Otimizações Disponíveis</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              Economia de <span className="text-success">8h/dia</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="patterns" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="patterns">Padrões de Uso</TabsTrigger>
          <TabsTrigger value="modules">Módulos Acessados</TabsTrigger>
          <TabsTrigger value="engagement">Engajamento</TabsTrigger>
          <TabsTrigger value="optimizations">Otimizações</TabsTrigger>
        </TabsList>

        {/* Padrões de Uso */}
        <TabsContent value="patterns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Horários de Pico - Acessos por Hora</CardTitle>
              <CardDescription>
                Análise de volume de acessos ao longo do dia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hourlyUsageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="acessos" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tendência de Atividade de Usuários</CardTitle>
              <CardDescription>
                Evolução de usuários ativos e sessões nos últimos 12 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userActivityTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="usuarios_ativos" stroke="hsl(var(--primary))" strokeWidth={2} name="Usuários Ativos" />
                  <Line type="monotone" dataKey="sessoes" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Sessões" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Módulos Acessados */}
        <TabsContent value="modules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Módulos Mais Acessados</CardTitle>
              <CardDescription>
                Ranking de módulos por volume de acessos e tempo médio de uso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {moduleAccessData.map((modulo, index) => (
                  <div key={modulo.modulo} className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{modulo.modulo}</span>
                        <span className="text-sm text-muted-foreground">{modulo.acessos} acessos</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${(modulo.acessos / 1245) * 100}%`,
                            backgroundColor: modulo.cor
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">Tempo médio: {modulo.tempo_medio}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Engajamento */}
        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Engajamento</CardTitle>
                <CardDescription>
                  Classificação de usuários por tempo de uso diário
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={userEngagementData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ categoria, valor }) => `${valor}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="valor"
                    >
                      {userEngagementData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.cor} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {userEngagementData.map((entry) => (
                    <div key={entry.categoria} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.cor }} />
                      <span className="text-sm">{entry.categoria}</span>
                      <span className="text-sm text-muted-foreground ml-auto">{entry.valor}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Retenção</CardTitle>
                <CardDescription>
                  Indicadores de retorno e engajamento de usuários
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Taxa de Retorno (7 dias)</span>
                    <span className="text-sm font-bold">87%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-success h-2 rounded-full" style={{ width: '87%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Taxa de Retorno (30 dias)</span>
                    <span className="text-sm font-bold">92%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-success h-2 rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Usuários Diários Ativos</span>
                    <span className="text-sm font-bold">68%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '68%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Satisfação do Usuário (NPS)</span>
                    <span className="text-sm font-bold">8.5/10</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-chart-2 h-2 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Otimizações */}
        <TabsContent value="optimizations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sugestões de Otimização de Workflow</CardTitle>
              <CardDescription>
                Recomendações baseadas em análise de padrões comportamentais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflowOptimizations.map((opt) => (
                  <div
                    key={opt.id}
                    className="border rounded-lg p-4 space-y-3 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {opt.impacto === 'high' && <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />}
                        {opt.impacto === 'medium' && <AlertCircle className="h-5 w-5 text-warning mt-0.5" />}
                        {opt.impacto === 'low' && <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />}
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{opt.titulo}</h4>
                          <p className="text-sm text-muted-foreground mb-3">{opt.descricao}</p>
                          <div className="flex items-center gap-4">
                            <Badge variant={opt.impacto === 'high' ? 'destructive' : opt.impacto === 'medium' ? 'default' : 'secondary'}>
                              Impacto {opt.impacto === 'high' ? 'Alto' : opt.impacto === 'medium' ? 'Médio' : 'Baixo'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Economia: <span className="font-medium text-success">{opt.economia_tempo}</span>
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {opt.usuarios_afetados} usuários afetados
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Implementar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
