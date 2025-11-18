import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, FileText, MessageSquare, Stethoscope, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TimelineTabProps {
  patientId: string;
}

interface TimelineEvent {
  id: string;
  date: string;
  type: 'consulta' | 'pagamento' | 'prontuario' | 'status_change' | 'budget';
  title: string;
  description: string;
  metadata?: Record<string, any>;
}

export function TimelineTab({ patientId }: TimelineTabProps) {
  const { data: events, isLoading } = useQuery({
    queryKey: ['patient-timeline', patientId],
    queryFn: async () => {
      // Buscar dados de múltiplas tabelas e consolidar em timeline
      const [appointments, budgets, prontuarios] = await Promise.all([
        supabase
          .from('appointments')
          .select('*')
          .eq('patient_id', patientId)
          .order('start_time', { ascending: false })
          .limit(10),
        supabase
          .from('budgets')
          .select('*')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('prontuarios')
          .select('*')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      const timeline: TimelineEvent[] = [];

      // Adicionar consultas
      appointments.data?.forEach(apt => {
        timeline.push({
          id: apt.id,
          date: apt.start_time,
          type: 'consulta',
          title: 'Consulta Agendada',
          description: apt.title || 'Consulta odontológica'
        });
      });

      // Adicionar orçamentos
      budgets.data?.forEach(budget => {
        timeline.push({
          id: budget.id,
          date: budget.created_at,
          type: 'budget',
          title: `Orçamento ${budget.numero_orcamento}`,
          description: `${budget.titulo} - R$ ${budget.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        });
      });

      // Adicionar prontuários
      prontuarios.data?.forEach(pep => {
        timeline.push({
          id: pep.id,
          date: pep.created_at,
          type: 'prontuario',
          title: 'Evolução Clínica',
          description: `Registro de prontuário - Paciente: ${pep.patient_name}`
        });
      });

      // Ordenar por data (mais recente primeiro)
      return timeline.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case 'consulta':
        return <Stethoscope className="h-5 w-5" />;
      case 'pagamento':
        return <DollarSign className="h-5 w-5" />;
      case 'prontuario':
        return <FileText className="h-5 w-5" />;
      case 'status_change':
        return <Activity className="h-5 w-5" />;
      case 'budget':
        return <FileText className="h-5 w-5" />;
      default:
        return <Calendar className="h-5 w-5" />;
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case 'consulta':
        return 'text-blue-500 bg-blue-500/10';
      case 'pagamento':
        return 'text-green-500 bg-green-500/10';
      case 'prontuario':
        return 'text-purple-500 bg-purple-500/10';
      case 'status_change':
        return 'text-orange-500 bg-orange-500/10';
      case 'budget':
        return 'text-yellow-500 bg-yellow-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  if (isLoading) {
    return <div>Carregando timeline...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Timeline do Paciente</h2>
        <p className="text-muted-foreground">Histórico completo de interações e eventos</p>
      </div>

      {events && events.length > 0 ? (
        <div className="space-y-4">
          {events.map((event, index) => (
            <Card key={event.id}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getColorForType(event.type)}`}>
                      {getIconForType(event.type)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{event.title}</p>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(event.date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {event.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Nenhum evento registrado ainda.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
