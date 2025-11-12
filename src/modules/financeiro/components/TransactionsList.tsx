import { useState } from 'react';
import { Eye, Printer, Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '../types/financeiro.types';
import { ActionButtons } from '@/components/shared/ActionButtons';
import { TransactionDetails } from './TransactionDetails';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface TransactionsListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionsList({ transactions, onEdit, onDelete }: TransactionsListProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CONCLUIDO':
        return 'Concluído';
      case 'PENDENTE':
        return 'Pendente';
      case 'CANCELADO':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDetailsOpen(true);
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Transações Recentes</h3>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">
                          {transaction.patientName?.substring(0, 2).toUpperCase() || 'XX'}
                        </span>
                      </div>
                      <span className="font-medium">
                        {transaction.patientName || 'N/A'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-sm">
                      #{transaction.id.substring(0, 8)}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(transaction.date)}</TableCell>
                  <TableCell>
                    <span className={transaction.type === 'RECEITA' ? 'text-green-600' : 'text-red-600'}>
                      {transaction.description}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`font-semibold ${transaction.type === 'RECEITA' ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(transaction.amount)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(transaction.status)}>
                      {getStatusLabel(transaction.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(transaction)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          {selectedTransaction && (
            <TransactionDetails
              transaction={selectedTransaction}
              onEdit={() => {
                setDetailsOpen(false);
                onEdit(selectedTransaction);
              }}
              onDelete={() => {
                setDetailsOpen(false);
                onDelete(selectedTransaction.id);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
