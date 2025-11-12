import { Transaction } from '../types/financeiro.types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ActionButtons } from '@/components/shared/ActionButtons';

interface TransactionDetailsProps {
  transaction: Transaction;
  onEdit: () => void;
  onDelete: () => void;
}

export function TransactionDetails({ transaction, onEdit, onDelete }: TransactionDetailsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'CONCLUIDO':
        return 'default' as const;
      case 'PENDENTE':
        return 'secondary' as const;
      case 'CANCELADO':
        return 'destructive' as const;
      default:
        return 'outline' as const;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Detalhes da Transação
        </h2>
        <Badge variant={getStatusVariant(transaction.status)}>
          {transaction.status}
        </Badge>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Tipo</label>
          <p className="text-lg font-semibold text-foreground mt-1">
            {transaction.type === 'RECEITA' ? 'Receita' : 'Despesa'}
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground">Categoria</label>
          <p className="text-lg font-semibold text-foreground mt-1">
            {transaction.category}
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground">Valor</label>
          <p className={`text-lg font-semibold mt-1 ${transaction.type === 'RECEITA' ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(transaction.amount)}
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground">Data</label>
          <p className="text-lg font-semibold text-foreground mt-1">
            {formatDate(transaction.date)}
          </p>
        </div>

        {transaction.patientName && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Paciente</label>
            <p className="text-lg font-semibold text-foreground mt-1">
              {transaction.patientName}
            </p>
          </div>
        )}

        {transaction.paymentMethod && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Forma de Pagamento</label>
            <p className="text-lg font-semibold text-foreground mt-1">
              {transaction.paymentMethod.replace('_', ' ')}
            </p>
          </div>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-muted-foreground">Descrição</label>
        <p className="text-base text-foreground mt-1">
          {transaction.description}
        </p>
      </div>

      {transaction.notes && (
        <div>
          <label className="text-sm font-medium text-muted-foreground">Observações</label>
          <p className="text-base text-foreground mt-1">
            {transaction.notes}
          </p>
        </div>
      )}

      <Separator />

      <ActionButtons
        onEdit={onEdit}
        onDelete={onDelete}
        showView={false}
      />
    </div>
  );
}
