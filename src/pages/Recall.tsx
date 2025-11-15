import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Bell, CheckCircle, Clock, XCircle, MessageSquare } from 'lucide-react';
import { format, addDays, isAfter, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface Recall {
  id: string;
  patient_id: string;
  tipo_recall: string;
  data_prevista: string;
  status: string;
  notificacao_enviada: boolean;
  metodo_notificacao: string | null;
}

export default function RecallPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar recalls
  const { data: recalls = [], isLoading } = useQuery({
    queryKey: ['recalls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recalls')
        .select('*')
        .order('data_prevista', { ascending: true });
      
      if (error) throw error;
      return data as Recall[];
    },
  });

  // Enviar notificação
  const sendNotification = useMutation({
    mutationFn: async (recallId: string) => {
      const { error } = await supabase
        .from('recalls')
        .update({ 
          notificacao_enviada: true,
          metodo_notificacao: 'WHATSAPP'
        })
        .eq('id', recallId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recalls'] });
      toast({
        title: 'Notificação enviada',
        description: 'O paciente foi notificado com sucesso.',
      });
    },
  });

  // Filtrar recalls por data selecionada
  const recallsOnDate = recalls.filter(r => 
    format(new Date(r.data_prevista), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  );

  // Recalls próximos (7 dias)
  const upcomingRecalls = recalls.filter(r => {
    const recallDate = new Date(r.data_prevista);
    const today = new Date();
    const inSevenDays = addDays(today, 7);
    return isAfter(recallDate, today) && isBefore(recallDate, inSevenDays) && r.status === 'PENDENTE';
  });

  // Recalls atrasados
  const overdueRecalls = recalls.filter(r => {
    const recallDate = new Date(r.data_prevista);
    return isBefore(recallDate, new Date()) && r.status === 'PENDENTE';
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, any> = {
      PENDENTE: { variant: 'secondary', icon: Clock, label: 'Pendente' },
      AGENDADO: { variant: 'default', icon: Calendar, label: 'Agendado' },
      CONFIRMADO: { variant: 'default', icon: CheckCircle, label: 'Confirmado' },
      REALIZADO: { variant: 'outline', icon: CheckCircle, label: 'Realizado' },
      CANCELADO: { variant: 'destructive', icon: XCircle, label: 'Cancelado' },
    };

    const { variant, icon: Icon, label } = config[status] || config.PENDENTE;

    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bell className="h-8 w-8" />
          Sistema de Recall Automático
        </h1>
        <p className="text-muted-foreground mt-2">
          Gerencie notificações de retorno para pacientes
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Recalls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recalls.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Próximos 7 dias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{upcomingRecalls.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Atrasados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueRecalls.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Notificações Enviadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {recalls.filter(r => r.notificacao_enviada).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Layout: Calendar + Lista */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Calendário de Recalls</CardTitle>
            <CardDescription>Selecione uma data para ver os recalls</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
              locale={ptBR}
            />
          </CardContent>
        </Card>

        {/* Lista de Recalls */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              Recalls para {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </CardTitle>
            <CardDescription>
              {recallsOnDate.length} recall(s) agendado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : recallsOnDate.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum recall para esta data
              </div>
            ) : (
              <div className="space-y-3">
                {recallsOnDate.map((recall) => (
                  <div
                    key={recall.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold">Paciente ID: {recall.patient_id.substring(0, 8)}...</h4>
                      <p className="text-sm text-muted-foreground">
                        Tipo: {recall.tipo_recall.replace('_', ' ')}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(recall.status)}
                      
                      {!recall.notificacao_enviada && recall.status === 'PENDENTE' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => sendNotification.mutate(recall.id)}
                          disabled={sendNotification.isPending}
                        >
                          <MessageSquare className="h-4 w-4" />
                          Notificar
                        </Button>
                      )}

                      {recall.notificacao_enviada && (
                        <Badge variant="outline" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Notificado
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recalls Atrasados */}
      {overdueRecalls.length > 0 && (
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Recalls Atrasados ({overdueRecalls.length})
            </CardTitle>
            <CardDescription>Estes recalls já passaram da data prevista</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overdueRecalls.slice(0, 5).map((recall) => (
                <div key={recall.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <div>
                    <p className="font-medium">ID: {recall.patient_id.substring(0, 8)}...</p>
                    <p className="text-sm text-muted-foreground">
                      Previsto: {format(new Date(recall.data_prevista), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  <Button size="sm" variant="destructive" className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Notificar Urgente
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
