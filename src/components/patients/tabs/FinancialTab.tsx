import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FinancialTabProps {
  patientId: string;
}

export function FinancialTab({ patientId }: FinancialTabProps) {
  const { data: patient } = useQuery({
    queryKey: ['patient-financial', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('total_debt, total_paid, payment_status')
        .eq('id', patientId)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: budgets } = useQuery({
    queryKey: ['patient-budgets', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      em_dia: { label: 'Em Dia', variant: 'default' },
      pendente: { label: 'Pendente', variant: 'secondary' },
      atrasado: { label: 'Atrasado', variant: 'destructive' }
    };
    const config = statusConfig[status] || statusConfig.pendente;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getBudgetStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      aprovado: { label: 'Aprovado', variant: 'default' },
      pendente: { label: 'Pendente', variant: 'secondary' },
      rejeitado: { label: 'Rejeitado', variant: 'destructive' },
      rascunho: { label: 'Rascunho', variant: 'outline' }
    };
    const config = statusConfig[status] || statusConfig.pendente;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Situação Financeira</h2>
        <p className="text-muted-foreground">Resumo de contas e orçamentos do paciente</p>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total em Aberto</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {(patient?.total_debt || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pago</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {(patient?.total_paid || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status de Pagamento</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patient && getPaymentStatusBadge(patient.payment_status || 'pendente')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orçamentos */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Orçamentos</h3>
        {budgets && budgets.length > 0 ? (
          <div className="space-y-4">
            {budgets.map((budget) => (
              <Card key={budget.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{budget.titulo}</CardTitle>
                      <CardDescription>
                        Nº {budget.numero_orcamento} • {format(new Date(budget.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </CardDescription>
                    </div>
                    {getBudgetStatusBadge(budget.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold">Valor Total:</span>{' '}
                      R$ {budget.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div>
                      <span className="font-semibold">Tipo de Plano:</span>{' '}
                      {budget.tipo_plano}
                    </div>
                    {budget.data_expiracao && (
                      <div>
                        <span className="font-semibold">Validade:</span>{' '}
                        {format(new Date(budget.data_expiracao), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                    )}
                  </div>
                  {budget.descricao && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">{budget.descricao}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <DollarSign className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">Nenhum orçamento encontrado</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
