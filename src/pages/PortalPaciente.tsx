import { useState, useEffect } from 'react';
import { Bell, Calendar, FileText, CreditCard, MessageCircle, Settings } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { usePatientPortalSupabase } from '@/modules/portal-paciente/hooks/usePatientPortalSupabase';
import { notificationTypeLabels } from '@/modules/portal-paciente/types/patient-portal.types';

export default function PortalPaciente() {
  // Mock patient ID - em produção, pegar do contexto de autenticação do paciente
  const [patientId] = useState('00000000-0000-0000-0000-000000000000');
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = usePatientPortalSupabase(patientId);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Carregando portal...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        icon={Bell}
        title="Portal do Paciente"
        description="Acesse suas informações, consultas e mensagens"
      />

      {/* Cards de Acesso Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">3</div>
              <div className="text-sm text-muted-foreground">Próximas Consultas</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warning/10 rounded-lg">
              <FileText className="h-6 w-6 text-warning" />
            </div>
            <div>
              <div className="text-2xl font-bold">2</div>
              <div className="text-sm text-muted-foreground">Orçamentos Pendentes</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-destructive/10 rounded-lg">
              <CreditCard className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <div className="text-2xl font-bold">1</div>
              <div className="text-sm text-muted-foreground">Pagamento Pendente</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer relative">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success/10 rounded-lg">
              <MessageCircle className="h-6 w-6 text-success" />
            </div>
            <div>
              <div className="text-2xl font-bold">5</div>
              <div className="text-sm text-muted-foreground">Mensagens</div>
            </div>
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute top-2 right-2">
              {unreadCount}
            </Badge>
          )}
        </Card>
      </div>

      <Tabs defaultValue="notificacoes" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="notificacoes" className="relative">
            Notificações
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="consultas">Consultas</TabsTrigger>
          <TabsTrigger value="orcamentos">Orçamentos</TabsTrigger>
          <TabsTrigger value="mensagens">Mensagens</TabsTrigger>
        </TabsList>

        <TabsContent value="notificacoes">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Suas Notificações</h2>
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  Marcar todas como lidas
                </Button>
              )}
            </div>
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma notificação no momento</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      notification.lida ? 'bg-muted/30' : 'bg-accent/50 hover:bg-accent'
                    }`}
                    onClick={() => !notification.lida && markAsRead(notification.id!)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{notification.titulo}</h3>
                          {!notification.lida && (
                            <Badge variant="default" className="h-2 w-2 p-0 rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{notification.mensagem}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {notificationTypeLabels[notification.tipo]}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Agora
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="consultas">
          <Card className="p-6">
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Visualização de consultas em desenvolvimento</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="orcamentos">
          <Card className="p-6">
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Visualização de orçamentos em desenvolvimento</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="mensagens">
          <Card className="p-6">
            <div className="text-center py-12 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Chat com a clínica em desenvolvimento</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
