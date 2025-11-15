import { Transaction } from '../../domain/entities/Transaction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TransactionListProps {
  transactions: Transaction[];
  onPay?: (transactionId: string) => void;
  loading?: boolean;
}

export function TransactionList({ transactions, onPay, loading }: TransactionListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAGO':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'PENDENTE':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'ATRASADO':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'CANCELADO':
        return <Circle className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      PAGO: 'Pago',
      PENDENTE: 'Pendente',
      ATRASADO: 'Atrasado',
      CANCELADO: 'Cancelado',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'PAGO':
        return 'default';
      case 'PENDENTE':
        return 'secondary';
      case 'ATRASADO':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">Carregando transações...</p>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">Nenhuma transação encontrada.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transações</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                {getStatusIcon(transaction.status)}
                <div className="flex-1">
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">
                    Vencimento: {format(transaction.dueDate, 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className={`font-semibold ${transaction.type === 'RECEITA' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'RECEITA' ? '+' : '-'} R$ {transaction.amount.toNumber().toFixed(2)}
                  </p>
                  <Badge variant={getStatusVariant(transaction.status)}>
                    {getStatusLabel(transaction.status)}
                  </Badge>
                </div>
                {transaction.status === 'PENDENTE' && onPay && (
                  <Button
                    size="sm"
                    onClick={() => onPay(transaction.id)}
                  >
                    Pagar
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
