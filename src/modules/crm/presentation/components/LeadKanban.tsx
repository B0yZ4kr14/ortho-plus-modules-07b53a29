import { useLeads } from '@/hooks/useLeads';
import { Lead, LeadStatus } from '@/modules/crm/domain/entities/Lead';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Mail, Calendar, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface KanbanColumnProps {
  title: string;
  status: LeadStatus;
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  color: string;
}

const KanbanColumn = ({ title, status, leads, onLeadClick, color }: KanbanColumnProps) => {
  const columnLeads = leads.filter(lead => lead.status === status);
  const totalValue = columnLeads.reduce((sum, lead) => sum + (lead.valorEstimado || 0), 0);

  return (
    <div className="flex-1 min-w-[280px]">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <Badge variant="secondary">{columnLeads.length}</Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
      </div>
      
      <div className="space-y-3">
        {columnLeads.map(lead => (
          <Card 
            key={lead.id} 
            className={`p-4 cursor-pointer hover:shadow-md transition-shadow border-l-4`}
            style={{ borderLeftColor: color }}
            onClick={() => onLeadClick(lead)}
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground mb-1">{lead.nome}</h4>
                </div>
                <Badge variant="outline">
                  {lead.origem}
                </Badge>
              </div>

              <div className="space-y-1">
                {lead.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{lead.email}</span>
                  </div>
                )}
                {lead.telefone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{lead.telefone}</span>
                  </div>
                )}
              </div>

              {lead.valorEstimado && (
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <TrendingUp className="h-3 w-3" />
                  <span>R$ {lead.valorEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(lead.createdAt), "dd 'de' MMM", { locale: ptBR })}</span>
                {lead.proximoContato && (
                  <span className="ml-auto">
                    Próximo: {format(new Date(lead.proximoContato), "dd/MM", { locale: ptBR })}
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}

        {columnLeads.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-8 border-2 border-dashed rounded-lg">
            Nenhum lead
          </div>
        )}
      </div>
    </div>
  );
};

interface LeadKanbanProps {
  onLeadClick?: (lead: Lead) => void;
}

export const LeadKanban = ({ onLeadClick }: LeadKanbanProps) => {
  const { leads, loading } = useLeads();

  const columns = [
    { title: 'Novos', status: 'NOVO' as LeadStatus, color: 'hsl(var(--primary))' },
    { title: 'Contato Inicial', status: 'CONTATO_INICIAL' as LeadStatus, color: 'hsl(var(--secondary))' },
    { title: 'Qualificado', status: 'QUALIFICADO' as LeadStatus, color: 'hsl(var(--accent))' },
    { title: 'Proposta', status: 'PROPOSTA' as LeadStatus, color: 'hsl(220, 90%, 56%)' },
    { title: 'Negociação', status: 'NEGOCIACAO' as LeadStatus, color: 'hsl(45, 100%, 51%)' },
    { title: 'Ganho', status: 'GANHO' as LeadStatus, color: 'hsl(142, 76%, 36%)' },
    { title: 'Perdido', status: 'PERDIDO' as LeadStatus, color: 'hsl(0, 84%, 60%)' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando pipeline...</div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map(column => (
        <KanbanColumn
          key={column.status}
          title={column.title}
          status={column.status}
          leads={leads}
          onLeadClick={onLeadClick || (() => {})}
          color={column.color}
        />
      ))}
    </div>
  );
};
