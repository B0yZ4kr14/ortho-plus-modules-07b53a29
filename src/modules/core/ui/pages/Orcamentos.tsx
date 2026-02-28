import { useState } from 'react';
import { Plus, FileText, Send, CheckCircle } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOrcamentosSupabase } from '@/modules/orcamentos/hooks/useOrcamentosSupabase';
import { formatCurrency } from '@/lib/utils/validation.utils';
import { statusLabels, tipoPlanoLabels } from '@/modules/orcamentos/types/orcamento.types';
import type { OrcamentoComplete } from '@/modules/orcamentos/types/orcamento.types';
import { OrcamentoForm } from '@/components/financeiro/OrcamentoForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function Orcamentos() {
  const { orcamentos, loading, sendOrcamento, approveOrcamento, convertToTreatmentPlan } = useOrcamentosSupabase();
  const [selectedOrcamento, setSelectedOrcamento] = useState<OrcamentoComplete | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const getStatusVariant = (status: string) => {
    const variants: Record<string, any> = {
      RASCUNHO: 'default',
      ENVIADO: 'default',
      VISUALIZADO: 'secondary',
      APROVADO: 'success',
      REJEITADO: 'destructive',
      EXPIRADO: 'destructive',
      CONVERTIDO: 'success',
    };
    return variants[status] || 'default';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Carregando orçamentos...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          icon={FileText}
          title="Orçamentos"
          description="Gestão completa de orçamentos e propostas comerciais"
        />
        <Button variant="elevated" onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Orçamento
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Total de Orçamentos</div>
          <div className="text-3xl font-bold mt-2">{orcamentos.length}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Aguardando Aprovação</div>
          <div className="text-3xl font-bold mt-2 text-warning">
            {orcamentos.filter(o => o.status === 'ENVIADO' || o.status === 'VISUALIZADO').length}
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Aprovados</div>
          <div className="text-3xl font-bold mt-2 text-success">
            {orcamentos.filter(o => o.status === 'APROVADO').length}
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Valor Total</div>
          <div className="text-3xl font-bold mt-2">
            {formatCurrency(orcamentos.reduce((sum, o) => sum + o.valor_final, 0))}
          </div>
        </Card>
      </div>

      {/* Lista de Orçamentos */}
      <Card className="p-6">
        <div className="space-y-4">
          {orcamentos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum orçamento encontrado</p>
              <p className="text-sm mt-2">Crie seu primeiro orçamento para começar</p>
            </div>
          ) : (
            orcamentos.map((orcamento) => (
              <div
                key={orcamento.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => setSelectedOrcamento(orcamento)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{orcamento.titulo}</h3>
                    <Badge variant={getStatusVariant(orcamento.status)}>
                      {statusLabels[orcamento.status]}
                    </Badge>
                    <Badge variant="outline">{tipoPlanoLabels[orcamento.tipo_plano]}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Número: {orcamento.numero_orcamento}</p>
                    <p>Paciente: {orcamento.patient_name || 'N/A'}</p>
                    <p>Validade: {new Date(orcamento.data_validade).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div>
                    <div className="text-2xl font-bold">{formatCurrency(orcamento.valor_final)}</div>
                    {orcamento.desconto_valor > 0 && (
                      <div className="text-sm text-muted-foreground line-through">
                        {formatCurrency(orcamento.valor_total)}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {orcamento.status === 'RASCUNHO' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          sendOrcamento(orcamento.id!, '');
                        }}
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Enviar
                      </Button>
                    )}
                    {(orcamento.status === 'ENVIADO' || orcamento.status === 'VISUALIZADO') && (
                      <Button
                        size="sm"
                        variant="elevated"
                        onClick={(e) => {
                          e.stopPropagation();
                          approveOrcamento(orcamento.id!);
                        }}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Aprovar
                      </Button>
                    )}
                    {orcamento.status === 'APROVADO' && (
                      <Button
                        size="sm"
                        variant="elevated-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          convertToTreatmentPlan(orcamento.id!);
                        }}
                      >
                        Converter em Tratamento
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Orçamento</DialogTitle>
          </DialogHeader>
          <OrcamentoForm
            onSubmit={(data) => {
              console.log('Orçamento criado:', data);
              toast.success('Orçamento criado com sucesso!');
              setFormOpen(false);
            }}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
