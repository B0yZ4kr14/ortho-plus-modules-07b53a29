import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Webhook, Activity, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface GitHubEvent {
  id: string;
  clinic_id: string;
  event_type: string;
  event_data: any;
  triggered_by: string;
  created_at: string;
}

export function WebhookManager() {
  const { selectedClinic } = useAuth();
  const [events, setEvents] = useState<GitHubEvent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWebhookEvents();
  }, [selectedClinic]);

  const loadWebhookEvents = async () => {
    if (!selectedClinic) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('github_events')
        .select('*')
        .eq('clinic_id', typeof selectedClinic === 'string' ? selectedClinic : selectedClinic.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      toast.error('Erro ao carregar eventos de webhook');
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType: string) => {
    if (eventType.includes('push')) return <Activity className="h-4 w-4 text-blue-500" />;
    if (eventType.includes('pull_request')) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (eventType.includes('error')) return <XCircle className="h-4 w-4 text-destructive" />;
    return <Clock className="h-4 w-4 text-muted-foreground" />;
  };

  const getEventBadgeVariant = (eventType: string): "default" | "secondary" | "destructive" | "outline" => {
    if (eventType.includes('push')) return 'default';
    if (eventType.includes('pull_request')) return 'secondary';
    if (eventType.includes('error')) return 'destructive';
    return 'outline';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                <CardTitle>Webhooks do GitHub</CardTitle>
              </div>
              <CardDescription>Eventos recebidos do repositório GitHub</CardDescription>
            </div>
            <Button onClick={loadWebhookEvents} disabled={loading}>
              {loading ? 'Carregando...' : 'Atualizar'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Carregando eventos...</p>
          ) : events.length === 0 ? (
            <div className="text-center py-8">
              <Webhook className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum evento de webhook registrado</p>
              <p className="text-sm text-muted-foreground mt-2">
                Configure webhooks no repositório GitHub para receber notificações automáticas
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <Card key={event.id} className="p-4">
                  <div className="flex items-start gap-3">
                    {getEventIcon(event.event_type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getEventBadgeVariant(event.event_type)}>
                          {event.event_type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(event.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      
                      {event.event_data && (
                        <div className="mt-2">
                          {event.event_data.commits && (
                            <p className="text-sm">
                              <span className="font-medium">{event.event_data.commits.length}</span> commit(s) recebido(s)
                            </p>
                          )}
                          {event.event_data.pull_requests && (
                            <p className="text-sm">
                              PR #{event.event_data.pull_requests[0]?.number}: {event.event_data.pull_requests[0]?.title}
                            </p>
                          )}
                          {event.event_data.workflows && (
                            <p className="text-sm">
                              Workflow: {event.event_data.workflows[0]?.name} - Status: {event.event_data.workflows[0]?.status}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuração de Webhooks</CardTitle>
          <CardDescription>
            Configure webhooks no seu repositório GitHub para receber notificações em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">URL do Webhook</h4>
            <code className="block bg-muted p-3 rounded text-sm">
              {import.meta.env.VITE_SUPABASE_URL}/functions/v1/github-webhook
            </code>
            <p className="text-xs text-muted-foreground">
              Adicione esta URL nas configurações de Webhooks do repositório GitHub
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Eventos Recomendados</h4>
            <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
              <li>Push events (commits)</li>
              <li>Pull request events</li>
              <li>Workflow run events</li>
              <li>Release events</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Content Type</h4>
            <p className="text-sm text-muted-foreground">
              Selecione: <code className="bg-muted px-2 py-1 rounded">application/json</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
