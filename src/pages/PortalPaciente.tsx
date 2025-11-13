import { useAuth } from '@/contexts/AuthContext';
import { Bell, Calendar, FileText, User, FileHeart, DollarSign, MessageCircle } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { usePatientPortalSupabase } from '@/modules/portal-paciente/hooks/usePatientPortalSupabase';
import { notificationTypeLabels } from '@/modules/portal-paciente/types/patient-portal.types';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function PortalPaciente() {
  const { user, isPatient } = useAuth();
  
  // Se não for paciente, mostrar mensagem
  if (!isPatient || !user) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Acesso restrito ao Portal do Paciente. Faça login com uma conta de paciente.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const patientId = 'id' in user ? user.id : '';
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
        icon={User}
        title="Portal do Paciente"
        description={`Bem-vindo(a), ${user.email}`}
      />

      {/* Cards de Acesso Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-primary">
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

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <FileHeart className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">12</div>
              <div className="text-sm text-muted-foreground">Exames/Documentos</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-amber-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">R$ 450</div>
              <div className="text-sm text-muted-foreground">Saldo Devedor</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer relative border-l-4 border-l-green-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <MessageCircle className="h-6 w-6 text-green-500" />
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

      <Tabs defaultValue="consultas" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-5">
          <TabsTrigger value="consultas">
            <Calendar className="h-4 w-4 mr-2" />
            Consultas
          </TabsTrigger>
          <TabsTrigger value="prontuario">
            <FileHeart className="h-4 w-4 mr-2" />
            Prontuário
          </TabsTrigger>
          <TabsTrigger value="documentos">
            <FileText className="h-4 w-4 mr-2" />
            Documentos
          </TabsTrigger>
          <TabsTrigger value="financeiro">
            <DollarSign className="h-4 w-4 mr-2" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="notificacoes" className="relative">
            <Bell className="h-4 w-4 mr-2" />
            Notificações
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="consultas" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Próximas Consultas</CardTitle>
              <CardDescription>Suas consultas agendadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Calendar className="h-4 w-4" />
                  <AlertDescription>
                    <strong>15/11/2024 às 14:00</strong> - Consulta de Retorno<br />
                    Dra. Ana Silva - Ortodontia
                  </AlertDescription>
                </Alert>
                <Alert>
                  <Calendar className="h-4 w-4" />
                  <AlertDescription>
                    <strong>22/11/2024 às 10:30</strong> - Limpeza Dental<br />
                    Dr. Carlos Souza - Periodontia
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prontuario" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Meu Prontuário</CardTitle>
              <CardDescription>Histórico de tratamentos e procedimentos</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <FileHeart className="h-4 w-4" />
                <AlertDescription>
                  Seu prontuário contém informações sobre seus tratamentos, alergias e histórico médico.
                  Entre em contato com a clínica para mais detalhes.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentos" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Documentos e Exames</CardTitle>
              <CardDescription>Arquivos e resultados de exames</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  Seus documentos e exames estarão disponíveis aqui após serem carregados pela clínica.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financeiro" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Financeiras</CardTitle>
              <CardDescription>Pagamentos e orçamentos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold">Saldo Devedor</p>
                    <p className="text-sm text-muted-foreground">Valor total pendente</p>
                  </div>
                  <p className="text-2xl font-bold text-destructive">R$ 450,00</p>
                </div>
                <Button className="w-full">Realizar Pagamento</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Suas Notificações</CardTitle>
                  <CardDescription>Mantenha-se atualizado sobre sua saúde bucal</CardDescription>
                </div>
                {unreadCount > 0 && (
                  <Button variant="outline" size="sm" onClick={markAllAsRead}>
                    Marcar todas como lidas
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
