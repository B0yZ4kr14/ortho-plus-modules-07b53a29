import { Atividade, AtividadeTipo, AtividadeStatus } from '@/modules/crm/domain/entities/Atividade';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Mail, Calendar as CalendarIcon, MessageSquare, MapPin, FileText, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AtividadesListProps {
  atividades: Atividade[];
  onAtividadeClick?: (atividade: Atividade) => void;
  onConcluir?: (atividade: Atividade) => void;
  onCancelar?: (atividade: Atividade) => void;
}

const getIconForTipo = (tipo: AtividadeTipo) => {
  const icons: Record<AtividadeTipo, any> = {
    LIGACAO: Phone,
    EMAIL: Mail,
    REUNIAO: CalendarIcon,
    WHATSAPP: MessageSquare,
    VISITA: MapPin,
    OUTRO: FileText,
  };
  return icons[tipo] || FileText;
};

const getTipoLabel = (tipo: AtividadeTipo): string => {
  const labels: Record<AtividadeTipo, string> = {
    LIGACAO: 'Ligação',
    EMAIL: 'E-mail',
    REUNIAO: 'Reunião',
    WHATSAPP: 'WhatsApp',
    VISITA: 'Visita',
    OUTRO: 'Outro',
  };
  return labels[tipo];
};

const getStatusBadge = (status: AtividadeStatus) => {
  const variants: Record<AtividadeStatus, { variant: any; icon: any }> = {
    AGENDADA: { variant: 'default', icon: Clock },
    CONCLUIDA: { variant: 'default', icon: CheckCircle2 },
    CANCELADA: { variant: 'destructive', icon: XCircle },
  };
  return variants[status] || variants.AGENDADA;
};

export const AtividadesList = ({ 
  atividades, 
  onAtividadeClick,
  onConcluir,
  onCancelar 
}: AtividadesListProps) => {
  if (atividades.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhuma atividade registrada</p>
      </div>
    );
  }

  const sortedAtividades = [...atividades].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-3">
      {sortedAtividades.map((atividade) => {
        const Icon = getIconForTipo(atividade.tipo);
        const { variant, icon: StatusIcon } = getStatusBadge(atividade.status);
        const isAgendada = atividade.status === 'AGENDADA';

        return (
          <Card 
            key={atividade.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onAtividadeClick?.(atividade)}
          >
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-foreground">
                          {getTipoLabel(atividade.tipo)}
                        </h4>
                        <Badge variant={variant as any} className="flex items-center gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {atividade.status === 'AGENDADA' && 'Agendada'}
                          {atividade.status === 'CONCLUIDA' && 'Concluída'}
                          {atividade.status === 'CANCELADA' && 'Cancelada'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {atividade.descricao}
                      </p>
                    </div>
                  </div>

                  {atividade.dataAgendada && (
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        <span>
                          {format(new Date(atividade.dataAgendada), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  )}

                  {atividade.resultado && (
                    <div className="mb-3 p-2 bg-muted/50 rounded text-sm">
                      <span className="text-muted-foreground">Resultado: </span>
                      <span className="text-foreground">{atividade.resultado}</span>
                    </div>
                  )}

                  {isAgendada && (onConcluir || onCancelar) && (
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      {onConcluir && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onConcluir(atividade)}
                          className="flex items-center gap-1"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Concluir
                        </Button>
                      )}
                      {onCancelar && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onCancelar(atividade)}
                          className="flex items-center gap-1"
                        >
                          <XCircle className="h-3 w-3" />
                          Cancelar
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
