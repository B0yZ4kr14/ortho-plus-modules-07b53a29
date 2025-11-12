import { useState } from 'react';
import { Plus, Video, Calendar, Clock, User, FileText } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Teleodontologia() {
  const [activeTab, setActiveTab] = useState('agendadas');

  // Mock data - em produção viria do hook useTeleo dontologiaSupabase
  const teleconsultas = [
    {
      id: '1',
      titulo: 'Consulta de Retorno - Implante',
      patient_name: 'João Silva',
      tipo: 'VIDEO',
      status: 'AGENDADA',
      data_agendada: new Date().toISOString(),
      motivo: 'Acompanhamento pós-cirúrgico',
    },
  ];

  const getStatusVariant = (status: string) => {
    const variants: Record<string, any> = {
      AGENDADA: 'default',
      EM_ANDAMENTO: 'warning',
      CONCLUIDA: 'success',
      CANCELADA: 'destructive',
      NAO_COMPARECEU: 'destructive',
    };
    return variants[status] || 'default';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          icon={Video}
          title="Teleodontologia"
          description="Atendimento remoto via videochamada, áudio ou chat"
        />
        <Button variant="elevated">
          <Plus className="h-4 w-4 mr-2" />
          Agendar Teleconsulta
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">5</div>
              <div className="text-sm text-muted-foreground">Agendadas Hoje</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warning/10 rounded-lg">
              <Video className="h-6 w-6 text-warning" />
            </div>
            <div>
              <div className="text-2xl font-bold">2</div>
              <div className="text-sm text-muted-foreground">Em Andamento</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success/10 rounded-lg">
              <FileText className="h-6 w-6 text-success" />
            </div>
            <div>
              <div className="text-2xl font-bold">23</div>
              <div className="text-sm text-muted-foreground">Concluídas no Mês</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-lg">
              <Clock className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold">35min</div>
              <div className="text-sm text-muted-foreground">Duração Média</div>
            </div>
          </div>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="agendadas">Agendadas</TabsTrigger>
          <TabsTrigger value="andamento">Em Andamento</TabsTrigger>
          <TabsTrigger value="concluidas">Concluídas</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="agendadas">
          <Card className="p-6">
            <div className="space-y-4">
              {teleconsultas.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma teleconsulta agendada</p>
                </div>
              ) : (
                teleconsultas.map((consulta) => (
                  <div
                    key={consulta.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{consulta.titulo}</h3>
                        <Badge variant={getStatusVariant(consulta.status)}>Agendada</Badge>
                        <Badge variant="outline">{consulta.tipo === 'VIDEO' ? 'Vídeo' : consulta.tipo}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          {consulta.patient_name}
                        </p>
                        <p className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {new Date(consulta.data_agendada).toLocaleString('pt-BR')}
                        </p>
                        <p className="text-xs">{consulta.motivo}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="elevated">
                        <Video className="h-4 w-4 mr-2" />
                        Iniciar Consulta
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="andamento">
          <Card className="p-6">
            <div className="text-center py-12 text-muted-foreground">
              <Video className="h-12 w-12 mx-auto mb-4 opacity-50 animate-pulse" />
              <p>Nenhuma consulta em andamento no momento</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="concluidas">
          <Card className="p-6">
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Funcionalidade em desenvolvimento</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="historico">
          <Card className="p-6">
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Histórico completo em desenvolvimento</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
