import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lead, LeadStatus } from '@/modules/crm/domain/entities/Lead';
import { Mail, Phone, Calendar, User, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LeadCardProps {
  lead: Lead;
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void;
  onClick?: () => void;
}

const statusLabels: Record<LeadStatus, string> = {
  NOVO: 'Novo',
  CONTATO_INICIAL: 'Contato Inicial',
  QUALIFICADO: 'Qualificado',
  PROPOSTA: 'Proposta',
  NEGOCIACAO: 'Negociação',
  GANHO: 'Ganho',
  PERDIDO: 'Perdido',
};

const statusColors: Record<LeadStatus, string> = {
  NOVO: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  CONTATO_INICIAL: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  QUALIFICADO: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  PROPOSTA: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  NEGOCIACAO: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  GANHO: 'bg-green-500/10 text-green-500 border-green-500/20',
  PERDIDO: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export function LeadCard({ lead, onStatusChange, onClick }: LeadCardProps) {
  return (
    <Card 
      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{lead.nome}</h3>
            <Badge className={statusColors[lead.status]} variant="outline">
              {statusLabels[lead.status]}
            </Badge>
          </div>
          {lead.valorEstimado && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>R$ {lead.valorEstimado.toLocaleString('pt-BR')}</span>
            </div>
          )}
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          {lead.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>{lead.email}</span>
            </div>
          )}
          
          {lead.telefone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>{lead.telefone}</span>
            </div>
          )}

          {lead.proximoContato && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                Próximo contato: {format(lead.proximoContato, 'dd/MM/yyyy', { locale: ptBR })}
              </span>
            </div>
          )}

          {lead.responsavelId && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Responsável: {lead.responsavelId}</span>
            </div>
          )}
        </div>

        {lead.tags && lead.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {lead.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
