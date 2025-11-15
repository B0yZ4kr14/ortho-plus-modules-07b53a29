import { Lead, LeadStatus } from '@/modules/crm/domain/entities/Lead';
import { LeadCard } from './LeadCard';
import { ScrollArea } from '@/components/ui/scroll-area';

interface KanbanBoardProps {
  leads: Lead[];
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void;
  onLeadClick: (lead: Lead) => void;
}

const columns: { status: LeadStatus; label: string; color: string }[] = [
  { status: 'NOVO', label: 'Novo', color: 'border-blue-500' },
  { status: 'CONTATO_INICIAL', label: 'Contato Inicial', color: 'border-purple-500' },
  { status: 'QUALIFICADO', label: 'Qualificado', color: 'border-cyan-500' },
  { status: 'PROPOSTA', label: 'Proposta', color: 'border-yellow-500' },
  { status: 'NEGOCIACAO', label: 'Negociação', color: 'border-orange-500' },
  { status: 'GANHO', label: 'Ganho', color: 'border-green-500' },
  { status: 'PERDIDO', label: 'Perdido', color: 'border-red-500' },
];

export function KanbanBoard({ leads, onStatusChange, onLeadClick }: KanbanBoardProps) {
  const getLeadsByStatus = (status: LeadStatus) => {
    return leads.filter((lead) => lead.status === status);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => {
        const columnLeads = getLeadsByStatus(column.status);
        
        return (
          <div key={column.status} className="flex-shrink-0 w-80">
            <div className={`border-t-4 ${column.color} bg-card rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{column.label}</h3>
                <span className="text-sm text-muted-foreground">
                  {columnLeads.length}
                </span>
              </div>

              <ScrollArea className="h-[calc(100vh-16rem)]">
                <div className="space-y-3">
                  {columnLeads.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onStatusChange={onStatusChange}
                      onClick={() => onLeadClick(lead)}
                    />
                  ))}
                  
                  {columnLeads.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Nenhum lead nesta etapa
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        );
      })}
    </div>
  );
}
