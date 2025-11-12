import { useState } from 'react';
import { Plus, Wallet } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useFinanceiroStore } from '@/modules/financeiro/hooks/useFinanceiroStore';
import { FinancialStats } from '@/modules/financeiro/components/FinancialStats';
import { RevenueExpenseChart } from '@/modules/financeiro/components/RevenueExpenseChart';
import { RevenueDistributionChart } from '@/modules/financeiro/components/RevenueDistributionChart';
import { TransactionsList } from '@/modules/financeiro/components/TransactionsList';
import { TransactionForm } from '@/modules/financeiro/components/TransactionForm';
import { Transaction } from '@/modules/financeiro/types/financeiro.types';
import { toast } from 'sonner';

export default function Financeiro() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();

  const {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getFinancialSummary,
    getMonthlyData,
    getCategoryDistribution,
  } = useFinanceiroStore();

  const summary = getFinancialSummary();
  const monthlyData = getMonthlyData();
  const categoryData = getCategoryDistribution();

  const handleAdd = () => {
    setEditingTransaction(undefined);
    setFormOpen(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormOpen(true);
  };

  const handleSubmit = (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, data);
      toast.success('Transação atualizada com sucesso!');
    } else {
      addTransaction(data);
      toast.success('Transação adicionada com sucesso!');
    }
    setFormOpen(false);
    setEditingTransaction(undefined);
  };

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    toast.success('Transação excluída com sucesso!');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          icon={Wallet}
          title="Financeiro"
          description="Gestão financeira completa da clínica"
        />
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Transação
        </Button>
      </div>

      <FinancialStats summary={summary} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueExpenseChart data={monthlyData} />
        <RevenueDistributionChart data={categoryData} />
      </div>

      <TransactionsList
        transactions={transactions}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
            </DialogTitle>
          </DialogHeader>
          <TransactionForm
            transaction={editingTransaction}
            onSubmit={handleSubmit}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
