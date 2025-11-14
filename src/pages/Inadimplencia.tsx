import { useState } from 'react';
import { AlertTriangle, Phone, Mail, MessageSquare, TrendingDown } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * Página do Módulo INADIMPLENCIA
 * Seguindo o Golden Pattern estabelecido pelo módulo PEP
 * 
 * Funcionalidades:
 * - Controle de contas em atraso
 * - Ações de cobrança automatizadas
 * - Negociações de pagamento
 * - Dashboard de inadimplência
 */
export default function Inadimplencia() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <PageHeader
          icon={AlertTriangle}
          title="Controle de Inadimplência"
          description="Gestão inteligente de cobranças e recuperação de crédito"
        />
        <Button variant="elevated">
          <MessageSquare className="h-4 w-4 mr-2" />
          Nova Cobrança
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Contas em Atraso</div>
          <div className="text-3xl font-bold mt-2 text-destructive">8</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Valor Total</div>
          <div className="text-3xl font-bold mt-2 text-destructive">R$ 15.240</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Em Negociação</div>
          <div className="text-3xl font-bold mt-2 text-warning">3</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Taxa de Recuperação</div>
          <div className="text-3xl font-bold mt-2 text-success">78%</div>
        </Card>
      </div>

      {/* Tabs */}
      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="atraso">Contas em Atraso</TabsTrigger>
            <TabsTrigger value="acoes">Ações de Cobrança</TabsTrigger>
            <TabsTrigger value="negociacoes">Negociações</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Níveis de Risco */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Contas por Nível de Risco</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-sm">Baixo Risco</span>
                    </div>
                    <Badge variant="outline">3 contas</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <span className="text-sm">Médio Risco</span>
                    </div>
                    <Badge variant="outline">2 contas</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500" />
                      <span className="text-sm">Alto Risco</span>
                    </div>
                    <Badge variant="outline">2 contas</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="text-sm">Crítico</span>
                    </div>
                    <Badge variant="outline">1 conta</Badge>
                  </div>
                </div>
              </Card>

              {/* Tempo Médio de Atraso */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Tempo Médio de Atraso</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">0-30 dias</span>
                    <Badge variant="outline">4 contas</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">31-60 dias</span>
                    <Badge variant="outline">2 contas</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">61-90 dias</span>
                    <Badge variant="outline">1 conta</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Mais de 90 dias</span>
                    <Badge variant="outline">1 conta</Badge>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="atraso" className="space-y-4 mt-6">
            <div className="text-center py-12 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma conta em atraso no momento</p>
              <p className="text-sm mt-2">Ótimo trabalho! Todas as contas estão em dia</p>
            </div>
          </TabsContent>

          <TabsContent value="acoes" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">E-mail</div>
                    <div className="text-sm text-muted-foreground">12 enviados</div>
                  </div>
                </div>
              </Card>
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">WhatsApp</div>
                    <div className="text-sm text-muted-foreground">8 enviados</div>
                  </div>
                </div>
              </Card>
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Ligação</div>
                    <div className="text-sm text-muted-foreground">5 realizadas</div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="negociacoes" className="space-y-4 mt-6">
            <div className="text-center py-12 text-muted-foreground">
              <TrendingDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma negociação em andamento</p>
              <p className="text-sm mt-2">Negociações ativas aparecerão aqui</p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Info Box */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">Cobrança Automatizada Inteligente</h3>
            <p className="text-sm text-muted-foreground">
              Configure fluxos automáticos de cobrança por e-mail, WhatsApp e SMS. O sistema identifica o melhor momento e canal 
              para cada cobrança, aumentando a taxa de recuperação e mantendo um bom relacionamento com os pacientes.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
