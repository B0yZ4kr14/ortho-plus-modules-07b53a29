import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLeads } from '@/modules/crm/presentation/hooks/useLeads';
import { useAtividades } from '@/modules/crm/presentation/hooks/useAtividades';
import { Lead, LeadStatus } from '@/modules/crm/domain/entities/Lead';
import { KanbanBoard } from '@/components/crm/KanbanBoard';
import { LeadForm } from '@/components/crm/LeadForm';
import { AtividadeForm } from '@/components/crm/AtividadeForm';
import { AtividadeList } from '@/components/crm/AtividadeList';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Activity } from 'lucide-react';

export default function CRM() {
  const { clinicId, user } = useAuth();
  
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus>('NOVO');
  const { leads, isLoading, updateStatus, createLead } = useLeads(clinicId || '', selectedStatus);
  
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const { atividades, createAtividade, concluirAtividade } = useAtividades(selectedLead?.id);
  
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [isAtividadeFormOpen, setIsAtividadeFormOpen] = useState(false);

  // Buscar todos os leads para o Kanban
  const allStatuses: LeadStatus[] = ['NOVO', 'CONTATO_INICIAL', 'QUALIFICADO', 'PROPOSTA', 'NEGOCIACAO', 'GANHO', 'PERDIDO'];
  const [allLeads, setAllLeads] = useState<Lead[]>([]);

  // Simular carregamento de todos os leads (em produção, criar um hook específico)
  useState(() => {
    setAllLeads(leads);
  });

  const handleCreateLead = (data: any) => {
    createLead({
      nome: data.nome,
      email: data.email,
      telefone: data.telefone,
      origem: data.origem,
      interesseDescricao: data.interesseDescricao,
      valorEstimado: data.valorEstimado ? parseFloat(data.valorEstimado) : undefined,
    });
    setIsLeadFormOpen(false);
  };

  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    updateStatus({ leadId, newStatus });
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
  };

  const handleCreateAtividade = (data: any) => {
    if (!selectedLead || !user || !clinicId) return;

    createAtividade({
      leadId: selectedLead.id,
      clinicId,
      tipo: data.tipo,
      titulo: data.titulo,
      descricao: data.descricao,
      dataAgendada: data.dataAgendada ? new Date(data.dataAgendada) : undefined,
      responsavelId: user.id,
    });
    setIsAtividadeFormOpen(false);
  };

  const handleConcluirAtividade = (atividadeId: string) => {
    concluirAtividade({ atividadeId });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CRM - Funil de Vendas</h1>
          <p className="text-muted-foreground">Gerencie seus leads e oportunidades</p>
        </div>
        <Button onClick={() => setIsLeadFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Lead
        </Button>
      </div>

      <Tabs defaultValue="kanban" className="w-full">
        <TabsList>
          <TabsTrigger value="kanban">Pipeline (Kanban)</TabsTrigger>
          <TabsTrigger value="list">Lista</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="mt-6">
          <KanbanBoard
            leads={leads}
            onStatusChange={handleStatusChange}
            onLeadClick={handleLeadClick}
          />
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <div className="grid gap-4">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="p-4 border rounded-lg cursor-pointer hover:bg-accent"
                onClick={() => handleLeadClick(lead)}
              >
                <h3 className="font-semibold">{lead.nome}</h3>
                <p className="text-sm text-muted-foreground">{lead.email}</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog para criar lead */}
      <Dialog open={isLeadFormOpen} onOpenChange={setIsLeadFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo Lead</DialogTitle>
          </DialogHeader>
          <LeadForm
            onSubmit={handleCreateLead}
            onCancel={() => setIsLeadFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Sheet para detalhes do lead e atividades */}
      <Sheet open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedLead && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedLead.nome}</SheetTitle>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Informações</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>E-mail:</strong> {selectedLead.email}</p>
                    <p><strong>Telefone:</strong> {selectedLead.telefone}</p>
                    <p><strong>Status:</strong> {selectedLead.status}</p>
                    {selectedLead.valorEstimado && (
                      <p><strong>Valor Estimado:</strong> R$ {selectedLead.valorEstimado.toLocaleString('pt-BR')}</p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Atividades
                    </h3>
                    <Button
                      size="sm"
                      onClick={() => setIsAtividadeFormOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Atividade
                    </Button>
                  </div>
                  
                  <AtividadeList
                    atividades={atividades}
                    onConcluir={handleConcluirAtividade}
                  />
                </div>
              </div>

              {/* Dialog para criar atividade */}
              <Dialog open={isAtividadeFormOpen} onOpenChange={setIsAtividadeFormOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nova Atividade</DialogTitle>
                  </DialogHeader>
                  <AtividadeForm
                    onSubmit={handleCreateAtividade}
                    onCancel={() => setIsAtividadeFormOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
