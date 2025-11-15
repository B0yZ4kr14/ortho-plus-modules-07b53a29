import { Atividade, AtividadeTipo, AtividadeStatus } from '@/modules/crm/domain/entities/Atividade';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Phone, Mail, Calendar, MessageSquare, MapPin, CheckCircle2 } from 'lucide-react';

interface AtividadeListProps {
  atividades: Atividade[];
  onConcluir: (atividadeId: string, resultado?: string) => void;
}

const tipoIcons: Record<AtividadeTipo, React.ReactNode> = {
  LIGACAO: <Phone className="h-4 w-4" />,
  EMAIL: <Mail className="h-4 w-4" />,
  REUNIAO: <Calendar className="h-4 w-4" />,
  WHATSAPP: <MessageSquare className="h-4 w-4" />,
  VISITA: <MapPin className="h-4 w-4" />,
  OUTRO: <Calendar className="h-4 w-4" />,
};

const statusLabels: Record<AtividadeStatus, string> = {
  AGENDADA: 'Agendada',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
};

const statusColors: Record<AtividadeStatus, string> = {
  AGENDADA: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  CONCLUIDA: 'bg-green-500/10 text-green-500 border-green-500/20',
  CANCELADA: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export function AtividadeList({ atividades, onConcluir }: AtividadeListProps) {
  if (atividades.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhuma atividade registrada
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {atividades.map((atividade) => (
        <Card key={atividade.id} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                {tipoIcons[atividade.tipo]}
                <h4 className="font-semibold">{atividade.titulo}</h4>
                <Badge className={statusColors[atividade.status]} variant="outline">
                  {statusLabels[atividade.status]}
                </Badge>
              </div>

              {atividade.descricao && (
                <p className="text-sm text-muted-foreground">{atividade.descricao}</p>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {atividade.dataAgendada && (
                  <span>
                    Agendada: {format(atividade.dataAgendada, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                )}
                {atividade.dataConclusao && (
                  <span>
                    Concluída: {format(atividade.dataConclusao, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                )}
              </div>

              {atividade.resultado && (
                <div className="mt-2 p-2 bg-muted rounded text-sm">
                  <strong>Resultado:</strong> {atividade.resultado}
                </div>
              )}
            </div>

            {atividade.status === 'AGENDADA' && (
              <Button
                size="sm"
                onClick={() => onConcluir(atividade.id)}
                className="flex-shrink-0"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Concluir
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
