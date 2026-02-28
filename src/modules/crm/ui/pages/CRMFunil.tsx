import { useState } from 'react';
import { Plus, UserCog, TrendingUp, Users, Target, DollarSign } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CRMFunil() {
  const [formOpen, setFormOpen] = useState(false);
  // Mock data
  const leads = [
    { id: '1', nome: 'Ana Costa', status_funil: 'NOVO', score_qualidade: 85, temperatura: 'QUENTE', valor_estimado: 5000 },
    { id: '2', nome: 'Carlos Mendes', status_funil: 'AVALIACAO', score_qualidade: 70, temperatura: 'MORNO', valor_estimado: 3500 },
    { id: '3', nome: 'Beatriz Lima', status_funil: 'ORCAMENTO_ENVIADO', score_qualidade: 90, temperatura: 'QUENTE', valor_estimado: 8000 },
  ];

  const funil = {
    NOVO: 15,
    CONTATO_INICIAL: 8,
    AGENDAMENTO: 5,
    AVALIACAO: 3,
    ORCAMENTO_ENVIADO: 6,
    NEGOCIACAO: 2,
    GANHO: 12,
    PERDIDO: 4,
  };

  const taxaConversao = ((funil.GANHO / (funil.GANHO + funil.PERDIDO)) * 100).toFixed(1);

  const getTemperaturaColor = (temp: string) => {
    const colors: Record<string, string> = {
      FRIO: 'bg-blue-500',
      MORNO: 'bg-yellow-500',
      QUENTE: 'bg-red-500',
    };
    return colors[temp] || 'bg-gray-500';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          icon={UserCog}
          title="CRM + Funil de Vendas"
          description="Gestão de leads e conversão de pacientes"
        />
        <Button variant="elevated">
          <Plus className="h-4 w-4 mr-2" />
          Novo Lead
        </Button>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{Object.values(funil).reduce((a, b) => a + b, 0)}</div>
              <div className="text-sm text-muted-foreground">Total de Leads</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warning/10 rounded-lg">
              <Target className="h-6 w-6 text-warning" />
            </div>
            <div>
              <div className="text-2xl font-bold">{leads.filter(l => l.temperatura === 'QUENTE').length}</div>
              <div className="text-sm text-muted-foreground">Leads Quentes</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
            <div>
              <div className="text-2xl font-bold">{taxaConversao}%</div>
              <div className="text-sm text-muted-foreground">Taxa de Conversão</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                R$ {(leads.reduce((sum, l) => sum + l.valor_estimado, 0) / 1000).toFixed(1)}k
              </div>
              <div className="text-sm text-muted-foreground">Pipeline Total</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Visualização do Funil */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-6">Funil de Conversão</h2>
        <div className="space-y-3">
          {Object.entries(funil).map(([stage, count], idx) => {
            const total = Object.values(funil).reduce((a, b) => a + b, 0);
            const percentage = (count / total) * 100;
            const labels: Record<string, string> = {
              NOVO: 'Novo Lead',
              CONTATO_INICIAL: 'Contato Inicial',
              AGENDAMENTO: 'Agendamento',
              AVALIACAO: 'Avaliação',
              ORCAMENTO_ENVIADO: 'Orçamento Enviado',
              NEGOCIACAO: 'Negociação',
              GANHO: '✅ Ganho',
              PERDIDO: '❌ Perdido',
            };
            
            return (
              <div key={stage} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{labels[stage]}</span>
                  <span className="text-muted-foreground">{count} leads ({percentage.toFixed(1)}%)</span>
                </div>
                <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 ${
                      stage === 'GANHO' ? 'bg-gradient-to-r from-success to-success/70' :
                      stage === 'PERDIDO' ? 'bg-gradient-to-r from-destructive to-destructive/70' :
                      'bg-gradient-to-r from-primary to-primary/70'
                    } transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                  <div className="relative flex items-center justify-center h-full text-sm font-semibold text-primary-foreground">
                    {count > 0 && count}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Lista de Leads */}
      <Tabs defaultValue="todos" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="quentes">Quentes</TabsTrigger>
          <TabsTrigger value="followup">Follow-up Hoje</TabsTrigger>
          <TabsTrigger value="convertidos">Convertidos</TabsTrigger>
        </TabsList>

        <TabsContent value="todos">
          <Card className="p-6">
            <div className="space-y-4">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{lead.nome}</h3>
                      <div className={`w-2 h-2 rounded-full ${getTemperaturaColor(lead.temperatura)}`} />
                      <Badge variant="outline">{lead.status_funil.replace('_', ' ')}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Score: {lead.score_qualidade}/100</span>
                      <span>Pipeline: R$ {lead.valor_estimado.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Ver Detalhes
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="quentes">
          <Card className="p-6">
            <div className="text-center py-12 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Leads quentes em desenvolvimento</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="followup">
          <Card className="p-6">
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Follow-ups pendentes em desenvolvimento</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="convertidos">
          <Card className="p-6">
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Leads convertidos em desenvolvimento</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
