import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FinanceiroTabProps {
  patient: any;
}

export function FinanceiroTab({ patient }: FinanceiroTabProps) {
  const getPaymentStatusConfig = (status: string) => {
    switch (status) {
      case 'em_dia':
        return { label: 'Em Dia', variant: 'default' as const, icon: TrendingUp };
      case 'atrasado':
        return { label: 'Atrasado', variant: 'warning' as const, icon: AlertCircle };
      case 'inadimplente':
        return { label: 'Inadimplente', variant: 'destructive' as const, icon: TrendingDown };
      default:
        return { label: status, variant: 'outline' as const, icon: DollarSign };
    }
  };

  const statusConfig = getPaymentStatusConfig(patient.payment_status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-6">
      {/* Resumo Financeiro */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <span className="text-3xl font-bold text-success">
                R$ {(patient.total_paid || 0).toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total em Débito
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-destructive" />
              <span className="text-3xl font-bold text-destructive">
                R$ {(patient.total_debt || 0).toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={statusConfig.variant} className="text-base py-2 px-4 gap-2">
              <StatusIcon className="h-4 w-4" />
              {statusConfig.label}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Detalhes Financeiros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Informações Financeiras
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Método de Pagamento Preferido
            </label>
            <p className="text-lg mt-2">
              {patient.preferred_payment_method || 'Não informado'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Balanço Total
            </label>
            <p className={`text-2xl font-bold mt-2 ${
              (patient.total_debt || 0) > 0 ? 'text-destructive' : 'text-success'
            }`}>
              R$ {((patient.total_paid || 0) - (patient.total_debt || 0)).toFixed(2)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Pagamentos - Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <DollarSign className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Histórico de pagamentos em desenvolvimento</p>
            <p className="text-sm mt-2">
              Aqui serão exibidos todos os pagamentos, orçamentos e transações do paciente
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
